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
  url?: string; // Add post URL for easier linking
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
 * HTML processing utilities for Kit emails
 */
const HtmlUtils = {
  /**
   * Convert a relative URL to absolute
   */
  toAbsoluteUrl(url: string, baseUrl: string = SITE_CONFIG.baseUrl): string {
    if (!url || url.startsWith('http') || url.startsWith('data:') || url.startsWith('#')) {
      return url;
    }
    
    const formattedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const formattedPath = url.startsWith('/') ? url : `/${url}`;
    
    return `${formattedBase}${formattedPath}`;
  },

  /**
   * Fix HTML issues that would cause problems in Kit emails
   * and ensure images and embedded content render correctly
   */
  fixForKit(html: string, baseUrl: string = SITE_CONFIG.baseUrl): string {
    if (!html) return '';
    
    // Process the HTML using more efficient replacements
    let processedHtml = html
      // Fix empty href attributes in links
      .replace(/<a\s+href=['"]?(?:['"]|\s+|\>)/gi, '<a href="#"')
      
      // Convert relative URLs in links to absolute
      .replace(
        /<a\s+(?:[^>]*?\s+)?href=['"](?!\s*(?:https?:|mailto:|tel:|#))([^'"]+)['"]/gi,
        (match, relativeUrl) => match.replace(relativeUrl, this.toAbsoluteUrl(relativeUrl, baseUrl))
      )
      
      // Convert relative image URLs to absolute
      .replace(
        /<img(?:\s+[^>]*?)?(?:\s+src=['"](?!\s*(?:https?:|data:))([^'"]+)['"])/gi,
        (match, relativeUrl) => match.replace(relativeUrl, this.toAbsoluteUrl(relativeUrl, baseUrl))
      );
    
    // Handle YouTube embeds separately
    processedHtml = processedHtml.replace(
      /<iframe\s+[^>]*?src=['"](?:\/\/|https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([^'"?]+)(?:[^'"]*?)['"][^>]*?><\/iframe>/gi,
      (match, videoId) => {
        return `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0" frameborder="0" allowfullscreen style="max-width:100%; width:100%; aspect-ratio:16/9; margin:20px auto; display:block;"></iframe>`;
      }
    );
    
    // Add responsive styling to images without existing style
    processedHtml = processedHtml.replace(
      /<img((?:\s+[^>]*)?)>/gi,
      (match, attrs) => {
        if (!/\sstyle\s*=/.test(attrs)) {
          return `<img${attrs} style="max-width:100%; height:auto; display:block; margin:20px auto;">`;
        }
        return match;
      }
    );
    
    // Add a wrapper class to code blocks to ensure proper display in emails
    processedHtml = processedHtml.replace(
      /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
      '<div class="code-block" style="background:#1e1e1e; color:#d4d4d4; padding:15px; margin:20px 0; overflow-x:auto; border-radius:5px; font-family:monospace;"><pre><code$1>$2</code></pre></div>'
    );
    
    return processedHtml;
  },

  /**
   * Extract image from HTML content with fallbacks
   */
  extractFirstImage(html: string, baseUrl: string = SITE_CONFIG.baseUrl): string | null {
    if (!html) return null;
    
    // Try to find image with proper attributes first (better quality images)
    const strategies = [
      // Look for images with specific classes that might indicate featured images
      /<img[^>]+class=["'](?:[^"']*\b(?:featured|hero|cover|thumbnail)\b[^"']*)["'][^>]+src=["']([^"']+)["'][^>]*>/i,
      // Look for the first image with specified width/height (likely to be intentional)
      /<img[^>]+(?:width|height)=["'][^"']+["'][^>]+src=["']([^"']+)["'][^>]*>/i,
      // Fall back to any image
      /<img[^>]+src=["']([^"']+)["'][^>]*>/i
    ];
    
    for (const regex of strategies) {
      const match = regex.exec(html);
      if (match && match[1]) {
        return this.toAbsoluteUrl(match[1], baseUrl);
      }
    }
    
    return null;
  },

  /**
   * Extract all images from the HTML content and return as array
   */
  extractAllImages(html: string, baseUrl: string = SITE_CONFIG.baseUrl): string[] {
    if (!html) return [];
    
    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) {
        images.push(this.toAbsoluteUrl(match[1], baseUrl));
      }
    }
    
    return images;
  },

  /**
   * Extract main content from HTML page
   */
  extractMainContent(fullHtml: string): string {
    if (!fullHtml) return '';
    
    // Try to extract content from article tag first
    const articleMatch = fullHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch && articleMatch[1]) {
      return articleMatch[1];
    }
    
    // Fall back to main tag if article not found
    const mainMatch = fullHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch && mainMatch[1]) {
      return mainMatch[1];
    }
    
    // Last resort: try to find content div
    const contentMatch = fullHtml.match(/<div[^>]*(?:id|class)=["'](?:content|post-content|entry-content)["'][^>]*>([\s\S]*?)<\/div>/i);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1];
    }
    
    return fullHtml;
  }
};

/**
 * Email template generation utilities
 */
const EmailTemplates = {
  /**
   * Create email header with title and optional featured image
   */
  createHeader(title: string, postUrl: string, thumbnailUrl: string | null): string {
    return `
      <div style="margin-bottom:30px;">
        <h1 style="font-size:24px; font-weight:600; line-height:1.2; margin:0 0 15px 0;">
          ${title}
        </h1>
        <div style="text-align:left; margin-bottom:20px;">
          <a href="${postUrl}" style="font-size:12px; color:#666; text-decoration:none;">
            View in browser →
          </a>
        </div>
        ${thumbnailUrl ? `
        <div style="margin:25px 0;">
          <img src="${thumbnailUrl}" alt="${title}" style="max-width:100%; width:100%; height:auto; display:block; border-radius:5px;">
        </div>
        ` : ''}
      </div>
    `;
  },
  
  /**
   * Create email footer with attribution link
   */
  createFooter(postUrl: string): string {
    return `
      <div style="margin-top:30px; padding-top:20px; border-top:1px solid #e5e5e5;">
        <p style="font-size:14px; color:#666;">
          Originally published at <a href="${postUrl}" style="color:#333; text-decoration:underline;">${SITE_CONFIG.title}</a>
        </p>
      </div>
    `;
  },
  
  /**
   * Create complete email content from post data
   */
  createEmailContent(post: Post): { content: string, thumbnailUrl: string | null } {
    const { title, summary } = post.metadata;
    const postUrl = post.url || `${SITE_CONFIG.baseUrl}/journal/${post.slug}`;
    
    // Get thumbnail - use specified image or extract from content
    const thumbnailUrl = post.metadata.image || HtmlUtils.extractFirstImage(post.content);
    
    // Fix HTML for email clients
    const fixedContent = HtmlUtils.fixForKit(post.content);
    
    // Combine header, content and footer
    const emailContent = `
      ${EmailTemplates.createHeader(title, postUrl, thumbnailUrl)}
      ${fixedContent}
      ${EmailTemplates.createFooter(postUrl)}
    `;
    
    return { content: emailContent, thumbnailUrl };
  }
};

/**
 * Fetches posts from the RSS feed and their full content
 */
export async function getPosts(): Promise<Post[]> {
  try {
    // Fetch the RSS feed
    const response = await fetch(`${SITE_CONFIG.baseUrl}/rss`, {
      headers: { 'Cache-Control': 'no-cache' } // Ensure fresh content
    });
    
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
      
      // Try to extract image from RSS description
      const imageFromRSS = HtmlUtils.extractFirstImage(description);
      
      if (!title || !link) continue;
      
      // Extract slug from link
      const slugMatch = link.match(/\/journal\/([^\/]+)$/);
      const slug = slugMatch ? slugMatch[1] : `post-${posts.length}`;
      
      try {
        // Fetch the full post content
        const postResponse = await fetch(link, {
          headers: { 'Cache-Control': 'no-cache' } // Ensure fresh content
        });
        
        if (!postResponse.ok) {
          throw new Error(`Failed to fetch post content: ${postResponse.status}`);
        }
        
        const content = await postResponse.text();
        
        // Extract article content from the HTML
        const articleContent = HtmlUtils.extractMainContent(content);
        
        // Process content for Kit - this preserves all images and formatting
        const fixedContent = HtmlUtils.fixForKit(articleContent);
        
        // Extract first image from article content for thumbnail
        const featuredImage = HtmlUtils.extractFirstImage(articleContent);
        
        posts.push({
          metadata: {
            title,
            publishedAt,
            summary: description,
            image: featuredImage || undefined,
          },
          slug,
          content: fixedContent,
          url: link
        });
      } catch (error) {
        console.error(`Error fetching content for post "${title}":`, error);
        // Fall back to description if we can't get the full content
        posts.push({
          metadata: {
            title,
            publishedAt,
            summary: description,
            image: imageFromRSS || undefined,
          },
          slug,
          content: HtmlUtils.fixForKit(description),
          url: link
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
  
  // Format the content for Kit using our template utilities
  const { content: emailContent, thumbnailUrl } = EmailTemplates.createEmailContent(post);
  
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
      content: emailContent,
      description: post.metadata.summary,
      public: true,
      published_at: new Date(post.metadata.publishedAt).toISOString(),
      send_at: null,
      thumbnail_alt: post.metadata.title,
      thumbnail_url: thumbnailUrl,
      preview_text: post.metadata.summary,
      subject: post.metadata.title,
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