import { NextRequest, NextResponse } from 'next/server';
import { 
  createKitBroadcast, 
  isPostSynced, 
  getSyncedPosts,
  getPosts,
  type Post
} from '../utils';

// Set to edge runtime for better performance
export const runtime = 'edge';

// Custom error types for better error handling
type SyncError = {
  slug: string;
  title: string;
  error: string;
  success: false;
};

type SyncSuccess = {
  slug: string;
  title: string;
  kitId?: number;
  message?: string;
  success: true;
};

type SyncResult = SyncError | SyncSuccess;

/**
 * Verify CRON_SECRET for cron jobs
 */
function isAuthorized(request: NextRequest): boolean {
  const secretKey = process.env.CRON_SECRET;
  if (!secretKey) return false; // Require secret to be set
  
  const authHeader = request.headers.get('Authorization');
  return authHeader === `Bearer ${secretKey}`;
}

/**
 * Filter posts to sync based on slug parameter and already synced posts
 */
async function getPostsToSync(posts: Post[], slug: string | null, forceSync: boolean): Promise<{
  postsToSync: Post[],
  syncedPostsInfo: { slug: string; kitId: number; syncedAt: string; }[]
}> {
  // Filter posts by slug if provided
  const filteredPosts = slug 
    ? posts.filter(post => post.slug === slug)
    : posts;
  
  if (filteredPosts.length === 0) {
    throw new Error(slug ? `Post "${slug}" not found` : 'No posts available');
  }
  
  // Get already synced posts
  const syncedPostsInfo = await getSyncedPosts(posts);
  const syncedSlugs = new Set(syncedPostsInfo.map(post => post.slug));
  
  // Determine which posts need syncing
  const postsToSync = forceSync
    ? filteredPosts
    : filteredPosts.filter(post => !syncedSlugs.has(post.slug));
    
  return { postsToSync, syncedPostsInfo };
}

/**
 * Sync a single post to Kit
 */
async function syncPost(post: Post, forceSync: boolean): Promise<SyncResult> {
  try {
    // Double-check sync status for safety
    if (!forceSync && await isPostSynced(post)) {
      return {
        slug: post.slug,
        title: post.metadata.title,
        message: 'Post already synced',
        success: true
      };
    }
    
    // Create broadcast on Kit
    const result = await createKitBroadcast(post);
    
    return {
      slug: post.slug,
      title: post.metadata.title,
      kitId: result.broadcast.id,
      success: true
    };
  } catch (error) {
    console.error(`Error syncing post ${post.slug}:`, error);
    return {
      slug: post.slug,
      title: post.metadata.title,
      error: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}

/**
 * Handle the sync request
 */
export async function GET(request: NextRequest) {
  try {
    // Parse request parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const forceSync = searchParams.get('force') === 'true';
    
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Fetch posts
      const posts = await getPosts();
      
      // Determine which posts to sync
      const { postsToSync, syncedPostsInfo } = await getPostsToSync(posts, slug, forceSync);
      
      // If no posts need syncing, return early with success
      if (postsToSync.length === 0) {
        return NextResponse.json(
          { 
            success: true,
            message: 'No new posts to sync',
            synced: syncedPostsInfo
          },
          { status: 200 }
        );
      }

      // Sync posts to Kit in parallel
      const syncResults = await Promise.all(
        postsToSync.map(post => syncPost(post, forceSync))
      );

      // Get final sync status
      const updatedSyncedPosts = await getSyncedPosts(posts);

      // Return results grouped by success/failure
      return NextResponse.json(
        { 
          success: true,
          synced: syncResults.filter((result): result is SyncSuccess => result.success),
          failed: syncResults.filter((result): result is SyncError => !result.success),
          allSynced: updatedSyncedPosts
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in sync process:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
      );
    }
  } catch (error) {
    console.error('Error in Kit sync API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 