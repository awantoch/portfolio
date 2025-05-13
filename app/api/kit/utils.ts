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

// Type for Kit subscriber
export type KitSubscriber = {
  id: number;
  first_name: string | null;
  email_address: string;
  state: string;
  created_at: string;
  fields: Record<string, string>;
};

export type KitSubscriberResponse = {
  subscriber: KitSubscriber;
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
    
    // Handle code blocks - preserve syntax highlighting but remove copy button
    processedHtml = processedHtml.replace(
      /<div class="relative group">([\s\S]*?)<\/div>/gi,
      (match, content) => {
        // Remove the copy button since it won't work in email
        return content.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');
      }
    );
    
    // Ensure tables work with the template's table styles
    processedHtml = processedHtml.replace(
      /<table>([\s\S]*?)<\/table>/gi,
      (match, content) => {
        // Just ensure the table has the basic structure, let the template handle styling
        return `<table>${content}</table>`;
      }
    );
    
    // Ensure images are responsive but don't override template styles
    processedHtml = processedHtml.replace(
      /<img((?:\s+[^>]*)?)>/gi,
      (match, attrs) => {
        if (!/\sstyle\s*=/.test(attrs)) {
          return `<img${attrs} style="max-width:100%; height:auto;">`;
        }
        return match;
      }
    );
    
    // Preserve heading anchor links but let template handle styling
    processedHtml = processedHtml.replace(
      /<h([1-6])\s+id="([^"]+)">([\s\S]*?)<\/h\1>/gi,
      (match, level, id, content) => {
        return `<h${level} id="${id}">
          <a href="#${id}" style="color:inherit; text-decoration:none;">${content}</a>
        </h${level}>`;
      }
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
  const token = process.env.KIT_API_KEY;
  if (!token) {
    throw new Error('KIT_API_KEY environment variable is not set');
  }
  return token;
}

/**
 * Get all broadcasts from Kit API
 */
export async function getKitBroadcasts(): Promise<KitBroadcast[]> {
  const token = getKitToken();
  const url = `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/broadcasts?limit=${KIT_CONFIG.perPage}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-Kit-Api-Key': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Kit API error: ${response.status} - ${response.statusText}`);
  }

  const data: KitBroadcastsListResponse = await response.json();
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

/**
 * Subscribe data interface with source tracking
 */
export interface SubscribeData {
  email_address: string;
  referrer?: string;    // Where the visitor came from in the site
  http_referrer?: string; // HTTP referrer header
  entry_title?: string; // Title of the journal entry they subscribed from (used for UTM Content)
  // Standard UTM parameters
  utm_source?: string;  // Identifies which site sent the traffic
  utm_medium?: string;  // Identifies the marketing medium
  utm_campaign?: string; // Identifies a specific campaign
  utm_content?: string; // Identifies what specifically was clicked
  utm_term?: string;    // Identifies search terms
}

/**
 * Create a new subscriber in Kit or update existing one
 * @param data The subscriber data including email address and tracking info
 * @returns The subscriber information from Kit API
 */
export async function createKitSubscriber(data: string | SubscribeData): Promise<KitSubscriberResponse> {
  console.log('KIT UTIL - createKitSubscriber called with:', JSON.stringify(data, null, 2));
  
  // Support backwards compatibility with just passing an email string
  const subscribeData: SubscribeData = typeof data === 'string' 
    ? { email_address: data }
    : data;
    
  if (!subscribeData.email_address) {
    console.error('KIT UTIL - Missing email address');
    throw new Error('Email address is required');
  }
  
  const token = getKitToken();
  const url = `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/subscribers`;
  
  // Build custom fields exactly as documented by Kit
  const fields: Record<string, string> = {};
  
  // Map fields using the exact names from Kit documentation
  if (subscribeData.referrer) {
    fields['Referrer'] = subscribeData.referrer;
  }
  
  if (subscribeData.http_referrer) {
    fields['HTTP Referrer'] = subscribeData.http_referrer;
  }
  
  // Standard UTM parameters with exact Kit field names 
  if (subscribeData.utm_source) {
    fields['UTM Source'] = subscribeData.utm_source;
  }
  
  if (subscribeData.utm_medium) {
    fields['UTM Medium'] = subscribeData.utm_medium;
  }
  
  if (subscribeData.utm_campaign) {
    fields['UTM Campaign'] = subscribeData.utm_campaign;
  }
  
  if (subscribeData.utm_content) {
    fields['UTM Content'] = subscribeData.utm_content;
  } else if (subscribeData.entry_title) {
    // For journal entries, use the entry title as UTM Content
    fields['UTM Content'] = subscribeData.entry_title;
  }
  
  if (subscribeData.utm_term) {
    fields['UTM Term'] = subscribeData.utm_term;
  }
  
  // Log EXACTLY what we're sending to Kit API
  console.log('KIT UTIL - REQUEST TO KIT API:', {
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Kit-Api-Key': 'REDACTED', // Don't log the actual token
    },
    body: {
      email_address: subscribeData.email_address,
      state: 'active',
      fields: fields,
    }
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Kit-Api-Key': token,
      },
      body: JSON.stringify({
        email_address: subscribeData.email_address,
        state: 'active',
        fields: fields,
      }),
    });
    
    const responseData = await response.json();
    
    // Log the full Kit API response
    console.log('KIT UTIL - RESPONSE FROM KIT API:', JSON.stringify(responseData, null, 2));
    
    // Error handling
    if (!response.ok) {
      console.error('KIT UTIL - ERROR FROM KIT API:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      const errorMessage = responseData.errors && responseData.errors.length > 0 
        ? responseData.errors[0] 
        : `Failed to subscribe (${response.status})`;
      throw new Error(errorMessage);
    }
    
    console.log('KIT UTIL - SUCCESSFUL SUBSCRIPTION WITH FIELDS:', 
      responseData.subscriber?.fields || 'NO FIELDS RETURNED');
    
    return responseData;
  } catch (error) {
    console.error('KIT UTIL - ERROR IN API CALL:', error);
    throw error;
  }
}

// Type for Kit form subscriber
export type KitFormSubscriber = {
  id: number;
  email_address: string;
  created_at: string;
  fields: Record<string, string>;
};

export type KitFormSubscriberResponse = {
  subscriber: KitFormSubscriber;
  errors?: string[];
};

/**
 * Add a subscriber to a Kit Form to capture referrer and UTM attribution
 */
export async function addSubscriberToForm(
  formId: number,
  data: { email_address: string; referrer: string }
): Promise<KitFormSubscriber> {
  const token = getKitToken();
  const url = `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/forms/${formId}/subscribers`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Kit-Api-Key': token,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json() as KitFormSubscriberResponse;
  if (!response.ok) {
    const msg = responseData.errors?.length ? responseData.errors.join(', ') : `Failed to add subscriber to form (${response.status})`;
    throw new Error(msg);
  }

  return responseData.subscriber;
} 