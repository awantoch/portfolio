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
 * Get the Kit API token from environment variables
 */
export function getKitToken(): string {
  const token = process.env.KIT_API_KEY;
  if (!token) {
    throw new Error('KIT_API_KEY environment variable is not set');
  }
  return token;
}

// Helper to simplify Kit API calls, adds auth and error handling
async function kitFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getKitToken();
  const response = await fetch(
    `${KIT_CONFIG.baseUrl}/${KIT_CONFIG.apiVersion}/${path}`,
    {
      ...init,
      headers: {
        Accept: 'application/json',
        'X-Kit-Api-Key': token,
        ...(init?.headers || {}),
      },
    }
  );
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = (data as any)?.errors?.[0] || response.statusText;
    throw new Error(`Kit API error: ${response.status} - ${errorMsg}`);
  }
  return data;
}

/**
 * Get all broadcasts from Kit API
 */
export async function getKitBroadcasts(): Promise<KitBroadcast[]> {
  const { broadcasts } = await kitFetch<KitBroadcastsListResponse>(
    `broadcasts?limit=${KIT_CONFIG.perPage}`
  );
  return broadcasts;
}

/**
 * Create a new broadcast in Kit
 */
export async function createKitBroadcast(post: Post): Promise<KitBroadcastResponse> {
  // Fetch email-only route HTML for a minimal layout
  const postUrl = post.url || `${SITE_CONFIG.baseUrl}/journal/${post.slug}`;
  const thumbnailUrl = post.metadata.image || null;
  const emailPageUrl = `${postUrl}/email`;
  const emailResponse = await fetch(emailPageUrl, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!emailResponse.ok) {
    throw new Error(`Failed to fetch email-only HTML for ${post.slug}: ${emailResponse.status} ${emailResponse.statusText} at ${emailPageUrl}`);
  }
  // Only take the <article>…</article> block for the email body
  const fullHtml = await emailResponse.text();
  const articleMatch = fullHtml.match(/<article[\s\S]*?<\/article>/i);
  const emailContent = articleMatch ? articleMatch[0] : fullHtml;
  
  return kitFetch<KitBroadcastResponse>(`broadcasts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const subscribeData: SubscribeData = typeof data === 'string' ? { email_address: data } : data;
  if (!subscribeData.email_address) throw new Error('Email address is required');
  const fields: Record<string, string> = {};
  if (subscribeData.referrer) fields['Referrer'] = subscribeData.referrer;
  if (subscribeData.http_referrer) fields['HTTP Referrer'] = subscribeData.http_referrer;
  if (subscribeData.utm_source) fields['UTM Source'] = subscribeData.utm_source;
  if (subscribeData.utm_medium) fields['UTM Medium'] = subscribeData.utm_medium;
  if (subscribeData.utm_campaign) fields['UTM Campaign'] = subscribeData.utm_campaign;
  if (subscribeData.utm_content) fields['UTM Content'] = subscribeData.utm_content;
  else if (subscribeData.entry_title) fields['UTM Content'] = subscribeData.entry_title;
  if (subscribeData.utm_term) fields['UTM Term'] = subscribeData.utm_term;
  return kitFetch<KitSubscriberResponse>(`subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_address: subscribeData.email_address, state: 'active', fields }),
  });
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
  const { subscriber } = await kitFetch<KitFormSubscriberResponse>(
    `forms/${formId}/subscribers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return subscriber;
} 