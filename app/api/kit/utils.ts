import { formatDate } from 'app/utils';
import { SITE_CONFIG } from 'app/constants';

// Types for Kit API
type KitBroadcast = {
  id: number;
  created_at: string;
  subject: string;
  preview_text: string;
  description: string;
  content: string;
  public: boolean;
  published_at: string;
  send_at: string | null;
  thumbnail_alt: string | null;
  thumbnail_url: string | null;
  email_address: string | null;
  email_template: {
    id: number;
    name: string;
  };
  subscriber_filter: Array<{
    all?: Array<{
      type: 'segment' | 'tag' | 'all_subscribers';
      ids?: number[];
    }> | null;
    any?: Array<{
      type: 'segment' | 'tag';
      ids: number[];
    }> | null;
    none?: Array<{
      type: 'segment' | 'tag';
      ids: number[];
    }> | null;
  }>;
  publication_id: number;
};

type KitBroadcastResponse = {
  broadcast: KitBroadcast;
};

type KitBroadcastsListResponse = {
  broadcasts: KitBroadcast[];
  pagination: {
    has_previous_page: boolean;
    has_next_page: boolean;
    start_cursor: string;
    end_cursor: string;
    per_page: number;
  };
};

export type KitSyncStatus = {
  slug: string;
  kitId: number;
  syncedAt: string;
};

// For Edge compatibility, define Post type
export type Post = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
  slug: string;
  content: string;
};

// Kit API configuration
export const KIT_CONFIG = {
  baseUrl: 'https://api.kit.com',
  apiVersion: 'v4',
  templateId: 4311751,
  tokenKey: 'KIT_API_KEY',
  perPage: 1000, // Maximum allowed by Kit API
};

/**
 * Fix HTML issues that would cause problems in Kit emails
 */
function fixHtmlForKit(html: string, baseUrl: string = SITE_CONFIG.baseUrl): string {
  if (!html) return '';
  
  return html
    // Fix empty href attributes
    .replace(/<a\s+href=['"]?(?:['"]|\s+|\>)/gi, '<a href="#"')
    
    // Convert relative URLs to absolute
    .replace(
      /<a\s+(?:[^>]*?\s+)?href=['"](?!\s*(?:https?:|mailto:|tel:|#))([^'"]+)['"]/gi,
      (match, relativeUrl) => {
        const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const formattedRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
        return match.replace(relativeUrl, `${formattedBaseUrl}${formattedRelativeUrl}`);
      }
    );
}

/**
 * Fetches posts from the RSS feed and their full content
 */
export async function getPosts(): Promise<Post[]> {
  try {
    // Fetch the RSS feed
    const response = await fetch(`${SITE_CONFIG.baseUrl}/rss`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts from RSS feed: ${response.status} ${response.statusText}`);
    }

    const rssText = await response.text();
    
    // Parse the RSS feed to extract posts
    const posts: Post[] = [];
    
    // Extract items from RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(rssText)) !== null) {
      const itemContent = match[1];
      
      // Extract post metadata with simplified approach
      const extract = (regex: RegExp): string => {
        const match = regex.exec(itemContent);
        return match ? match[1] : '';
      };
      
      const title = extract(/<title>([\s\S]*?)<\/title>/);
      const link = extract(/<link>([\s\S]*?)<\/link>/);
      const description = extract(/<description>([\s\S]*?)<\/description>/);
      const publishedAt = extract(/<pubDate>([\s\S]*?)<\/pubDate>/) || new Date().toISOString();
      
      if (!title || !link) continue;
      
      // Extract slug from link
      const slugMatch = link.match(/\/journal\/([^\/]+)$/);
      const slug = slugMatch ? slugMatch[1] : `post-${posts.length}`;
      
      try {
        // Fetch the full post content
        const postResponse = await fetch(link);
        const content = await postResponse.text();
        
        // Extract article content and fix HTML issues
        const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/);
        const articleContent = articleMatch ? articleMatch[1] : description;
        const fixedContent = fixHtmlForKit(articleContent);
        
        posts.push({
          metadata: {
            title,
            publishedAt,
            summary: description,
          },
          slug,
          content: fixedContent,
        });
      } catch (error) {
        console.error(`Error fetching content for post "${title}":`, error);
        // Fall back to description if we can't get the full content
        posts.push({
          metadata: {
            title,
            publishedAt,
            summary: description,
          },
          slug,
          content: fixHtmlForKit(description),
        });
      }
    }
    
    if (posts.length === 0) {
      throw new Error('No posts found in RSS feed');
    }
    
    return posts;
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
}

/**
 * Get the Kit API token from environment variables
 */
export function getKitToken(): string {
  const token = process.env[KIT_CONFIG.tokenKey];
  if (!token) {
    throw new Error(`${KIT_CONFIG.tokenKey} environment variable is not set`);
  }
  return token;
}

/**
 * Get all broadcasts from Kit API
 */
export async function getKitBroadcasts(): Promise<KitBroadcast[]> {
  const token = getKitToken();
  const url = `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/broadcasts?per_page=${KIT_CONFIG.perPage}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Kit-Api-Key': token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kit API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as KitBroadcastsListResponse;
  return data.broadcasts;
}

/**
 * Create a new broadcast in Kit
 */
export async function createKitBroadcast(post: Post): Promise<KitBroadcastResponse> {
  const token = getKitToken();
  const url = `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/broadcasts`;
  
  // Format the content for Kit
  const { title, publishedAt, summary } = post.metadata;
  
  // Apply HTML fixes one more time before sending to Kit
  const fixedContent = fixHtmlForKit(post.content);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Kit-Api-Key': token,
    },
    body: JSON.stringify({
      email_template_id: KIT_CONFIG.templateId,
      email_address: null,
      content: fixedContent,
      description: summary,
      public: true,
      published_at: new Date(publishedAt).toISOString(),
      send_at: null,
      thumbnail_alt: null,
      thumbnail_url: null,
      preview_text: summary,
      subject: title,
      subscriber_filter: null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kit API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Check if a post has been synced to Kit by checking if a broadcast with the same title exists
 */
export async function isPostSynced(post: Post): Promise<boolean> {
  try {
    const broadcasts = await getKitBroadcasts();
    // Match by title which is more reliable
    return broadcasts.some(broadcast => broadcast.subject.trim() === post.metadata.title.trim());
  } catch (error) {
    console.error('Error checking if post is synced:', error);
    return false;
  }
}

/**
 * Find broadcasts in Kit that match the given posts
 */
export async function getSyncedPosts(posts: Post[]): Promise<KitSyncStatus[]> {
  try {
    const broadcasts = await getKitBroadcasts();
    
    return posts
      .map(post => {
        const matchingBroadcast = broadcasts.find(broadcast => 
          broadcast.subject.trim() === post.metadata.title.trim()
        );
        
        return matchingBroadcast ? {
          slug: post.slug,
          kitId: matchingBroadcast.id,
          syncedAt: matchingBroadcast.created_at,
        } : null;
      })
      .filter((item): item is KitSyncStatus => item !== null);
      
  } catch (error) {
    console.error('Error getting synced posts:', error);
    return [];
  }
} 