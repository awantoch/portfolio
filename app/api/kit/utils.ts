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
    
    // Process the HTML using efficient regex-based replacements
    // Fix empty href attributes in links
    let processedHtml = html.replace(/<a\s+href=['"]?(?:['"]|\s+|\>)/gi, '<a href="#"');
    
    // Convert relative URLs in links to absolute
    processedHtml = processedHtml.replace(
      /<a\s+(?:[^>]*?\s+)?href=['"](?!\s*(?:https?:|mailto:|tel:|#))([^'"]+)['"]/gi,
      (match, relativeUrl) => match.replace(relativeUrl, this.toAbsoluteUrl(relativeUrl, baseUrl))
    );
    
    // Convert relative image URLs to absolute
    processedHtml = processedHtml.replace(
      /<img(?:\s+[^>]*?)?(?:\s+src=['"](?!\s*(?:https?:|data:))([^'"]+)['"])/gi,
      (match, relativeUrl) => match.replace(relativeUrl, this.toAbsoluteUrl(relativeUrl, baseUrl))
    );
    
    // Handle YouTube embeds
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
          return `<img${attrs} style="max-width:100%; height:auto; display:block; margin:25px auto; border-radius:4px;">`;
        }
        return match;
      }
    );
    
    // Add a wrapper class to code blocks to ensure proper display in emails
    processedHtml = processedHtml.replace(
      /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
      '<div class="code-block" style="background:#1e1e1e; color:#d4d4d4; padding:15px; margin:25px 0; overflow-x:auto; border-radius:5px; font-family:monospace; font-size:14px; line-height:1.5;"><pre style="margin:0;"><code$1>$2</code></pre></div>'
    );
    
    return processedHtml;
  },

  /**
   * Extract image from HTML content with fallbacks
   */
  extractFirstImage(html: string, baseUrl: string = SITE_CONFIG.baseUrl): string | null {
    if (!html) return null;
    
    // Single prioritized regex for finding images
    // First tries to find featured/hero images, then falls back to any image
    const imgRegex = /<img[^>]+(class=["'][^"']*(?:featured|hero|cover|thumbnail)[^"']*["'][^>]+|(?:width|height)=["'][^"']+["'][^>]+)?src=["']([^"']+)["'][^>]*>/i;
    const match = imgRegex.exec(html);
    
    if (match && match[2]) {
      return this.toAbsoluteUrl(match[2], baseUrl);
    }
    
    // If no match found with the prioritized approach, try simple image match
    const simpleMatch = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(html);
    return simpleMatch && simpleMatch[1] ? this.toAbsoluteUrl(simpleMatch[1], baseUrl) : null;
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
    
    try {
      // Your MDX content is always rendered in <article class="prose"> tags
      // This is the most direct target for extraction
      const articleRegex = /<article[^>]*class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/article>/i;
      const articleMatch = articleRegex.exec(fullHtml);
      if (articleMatch && articleMatch[1]) {
        return articleMatch[1];
      }
      
      // Fallback to any article tag if the prose class isn't found
      const simpleArticleRegex = /<article[^>]*>([\s\S]*?)<\/article>/i;
      const simpleArticleMatch = simpleArticleRegex.exec(fullHtml);
      if (simpleArticleMatch && simpleArticleMatch[1]) {
        return simpleArticleMatch[1];
      }
      
      // Fix broken images in content
      const fixImages = (content: string): string => {
        if (!content) return '';
        return content.replace(
          /<img[^>]+src=["'](?!\s*(?:https?:|data:))([^'"]+)['"]/gi,
          (match, relativeUrl) => match.replace(relativeUrl, this.toAbsoluteUrl(relativeUrl))
        );
      };
      
      // If we can't find article tags, return empty string to avoid sending the whole page
      // This is safer than returning potentially unrelated content
      return '';
    } catch (error) {
      console.error('Error extracting article content:', error);
      return '';
    }
  },
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
      <h1 style="font-size:26px; font-weight:600; line-height:1.3; margin:0 0 15px 0;">
        ${title}
      </h1>
      <a href="${postUrl}" style="font-size:13px; color:#666; text-decoration:none; display:block; margin-bottom:20px;">
        View in browser →
      </a>
      ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${title}" style="max-width:100%; width:100%; height:auto; display:block; border-radius:5px; margin-bottom:25px;">` : ''}
    `;
  },
  
  /**
   * Create email footer with attribution link
   */
  createFooter(postUrl: string): string {
    return `
      <hr style="border:none; height:1px; background-color:#e5e5e5; margin:25px 0 15px 0;">
      <p style="font-size:14px; color:#666; margin:0;">
        Originally published at <a href="${postUrl}" style="color:#333; text-decoration:underline;">${SITE_CONFIG.title}</a>
      </p>
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
    
    // Combine header, content and footer with clean structure
    const emailContent = `
      <div style="max-width:600px; margin:0 auto; padding:20px 0; font-size:16px; line-height:1.6;">
        ${EmailTemplates.createHeader(title, postUrl, thumbnailUrl)}
        ${fixedContent}
        ${EmailTemplates.createFooter(postUrl)}
      </div>
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