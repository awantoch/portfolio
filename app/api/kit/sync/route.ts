import { NextRequest, NextResponse } from 'next/server';
import { 
  createKitBroadcast, 
  isPostSynced, 
  getSyncedPosts,
  getPosts
} from '../utils';

// Set to edge runtime for better performance
export const runtime = 'edge';

// Verify CRON_SECRET for cron jobs
function isAuthorized(request: NextRequest): boolean {
  const secretKey = process.env.CRON_SECRET;
  if (!secretKey) return true; // Allow all if no secret is set
  
  const authHeader = request.headers.get('Authorization');
  return authHeader === `Bearer ${secretKey}`;
}

// Handle the sync request
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
      
      // Filter posts by slug if provided
      const postsToSync = slug 
        ? posts.filter(post => post.slug === slug)
        : posts;
      
      if (postsToSync.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            message: slug ? `Post "${slug}" not found` : 'No posts available'
          },
          { status: 404 }
        );
      }
      
      // Get already synced posts
      const syncedPostsInfo = await getSyncedPosts(posts);
      const syncedSlugs = new Set(syncedPostsInfo.map(post => post.slug));
      
      // Determine which posts need syncing
      const unSyncedPosts = forceSync
        ? postsToSync
        : postsToSync.filter(post => !syncedSlugs.has(post.slug));
      
      if (unSyncedPosts.length === 0) {
        return NextResponse.json(
          { 
            success: true,
            message: 'No new posts to sync',
            synced: syncedPostsInfo
          },
          { status: 200 }
        );
      }

      // Sync posts to Kit
      const syncResults = await Promise.all(
        unSyncedPosts.map(async (post) => {
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
        })
      );

      // Get final sync status
      const updatedSyncedPosts = await getSyncedPosts(posts);

      // Return results
      return NextResponse.json(
        { 
          success: true,
          synced: syncResults.filter(result => result.success),
          failed: syncResults.filter(result => !result.success),
          allSynced: updatedSyncedPosts
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
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