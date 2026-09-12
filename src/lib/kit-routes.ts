import { KIT_FORM_ID } from './constants';
import * as kit from './kit';
import type { Post } from './kit';

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

type SubscribeServices = Pick<typeof kit, 'createKitSubscriber' | 'addSubscriberToForm'>;

export async function handleSubscribe(request: Request, services: SubscribeServices = kit): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return Response.json({ success: false, error: 'A JSON object is required' }, { status: 400 });
    }
    body = payload as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const email = typeof body.email_address === 'string' ? body.email_address.trim() : '';
  if (!email) {
    return Response.json({ success: false, error: 'Email address is required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
  }

  const formId = typeof body.form_id === 'number' && Number.isSafeInteger(body.form_id) && body.form_id > 0
    ? body.form_id : KIT_FORM_ID;
  const referrer = typeof body.referrer === 'string' ? body.referrer : '';

  try {
    await services.createKitSubscriber(email);
    const subscriber = await services.addSubscriberToForm(formId, {
      email_address: email,
      referrer: referrer || request.headers.get('referer') || '',
    });
    return Response.json({ success: true, message: 'Successfully subscribed! 😊', subscriber });
  } catch (error) {
    return Response.json({ success: false, error: errorMessage(error, 'Failed to subscribe') }, { status: 422 });
  }
}

type SyncServices = Pick<typeof kit, 'createKitBroadcast' | 'isPostSynced' | 'getSyncedPosts'>;
type SyncResult = {
  slug: string;
  title: string;
  success: boolean;
  kitId?: number;
  message?: string;
  error?: string;
};

export async function handleSync(
  request: Request,
  getPosts: () => Promise<Post[]>,
  services: SyncServices = kit,
  secret = process.env.CRON_SECRET || import.meta.env?.CRON_SECRET,
): Promise<Response> {
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const force = searchParams.get('force') === 'true';

  try {
    const posts = await getPosts();
    const filteredPosts = slug ? posts.filter((post) => post.slug === slug) : posts;
    if (!filteredPosts.length) {
      return Response.json({ success: false, error: slug ? `Post "${slug}" not found` : 'No posts available' }, {
        status: slug ? 404 : 500,
      });
    }

    const syncedPostsInfo = await services.getSyncedPosts(posts);
    const syncedSlugs = new Set(syncedPostsInfo.map((post) => post.slug));
    const postsToSync = force ? filteredPosts : filteredPosts.filter((post) => !syncedSlugs.has(post.slug));

    if (!postsToSync.length) {
      return Response.json({ success: true, message: 'No new posts to sync', synced: syncedPostsInfo });
    }

    const results: SyncResult[] = await Promise.all(postsToSync.map(async (post) => {
      const identity = { slug: post.slug, title: post.metadata.title };
      try {
        if (!force && await services.isPostSynced(post)) {
          return { ...identity, success: true, message: 'Post already synced' };
        }
        const result = await services.createKitBroadcast(post);
        return { ...identity, success: true, kitId: result.broadcast.id };
      } catch (error) {
        return { ...identity, success: false, error: errorMessage(error, 'Failed to sync post') };
      }
    }));
    const allSynced = await services.getSyncedPosts(posts);
    const synced = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    return Response.json({
      success: true,
      message: `Successfully synced ${synced.length} posts, ${failed.length} failed`,
      synced,
      failed,
      allSynced,
    });
  } catch (error) {
    return Response.json({ success: false, error: errorMessage(error, 'Failed to sync posts') }, { status: 500 });
  }
}
