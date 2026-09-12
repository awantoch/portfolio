import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleSubscribe, handleSync } from '../src/lib/kit-routes';
import { createRssFeed, createSitemap } from '../src/lib/feeds';
import { KIT_FORM_ID } from '../src/lib/constants';
import { formatDate } from '../src/lib/utils';
import type { Post } from '../src/lib/kit';

const post: Post = {
  slug: 'diligencebot',
  metadata: { title: 'Prompt: DiligenceBot', publishedAt: '2025-05-12', summary: 'An acquisition advisor.' },
  content: 'Published journal content',
};
const broadcast = { id: 123, subject: post.metadata.title, created_at: '2025-05-12T12:00:00Z' };
const jsonRequest = (body: unknown, headers: HeadersInit = {}) => new Request('https://example.com/api/kit/subscribe', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});
const syncRequest = (query = '', token = 'test-secret') => new Request(`https://example.com/api/kit/sync${query}`, {
  headers: { Authorization: `Bearer ${token}` },
});

type FetchCall = { url: string; init?: RequestInit };
async function withMockedKit(
  respond: (call: FetchCall) => Response | Promise<Response>,
  run: (calls: FetchCall[]) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.KIT_API_KEY;
  const calls: FetchCall[] = [];
  process.env.KIT_API_KEY = 'test-api-key';
  globalThis.fetch = async (input, init) => {
    const call = { url: String(input), init };
    calls.push(call);
    return respond(call);
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.KIT_API_KEY;
    else process.env.KIT_API_KEY = originalToken;
  }
}

test('subscription rejects missing, malformed, and invalid addresses before calling Kit', async () => {
  await withMockedKit(() => { throw new Error('Invalid input must never contact Kit'); }, async (calls) => {
    for (const body of [{}, null, [], { email_address: 123 }, { email_address: 'invalid' }]) {
      const response = await handleSubscribe(jsonRequest(body));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).success, false);
    }
    const malformed = new Request('https://example.com/api/kit/subscribe', { method: 'POST', body: '{' });
    assert.equal((await handleSubscribe(malformed)).status, 400);
    assert.equal(calls.length, 0);
  });
});

test('subscription preserves the subscriber upsert, default form, and referral attribution', async () => {
  const subscriber = { id: 456, email_address: 'reader@example.com', created_at: '2026-09-11', fields: {} };
  await withMockedKit(() => Response.json({ subscriber }), async (calls) => {
    const response = await handleSubscribe(jsonRequest({ email_address: ' reader@example.com ', referrer: 'https://example.com/journal/diligencebot' }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, message: 'Successfully subscribed! 😊', subscriber });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, 'https://api.kit.com/v4/subscribers');
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { email_address: 'reader@example.com', state: 'active', fields: {} });
    assert.equal(calls[1].url, `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers`);
    assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { email_address: 'reader@example.com', referrer: 'https://example.com/journal/diligencebot' });
    assert.equal(new Headers(calls[0].init?.headers).get('X-Kit-Api-Key'), 'test-api-key');
  });
});

test('subscription accepts the form override and falls back to the HTTP referrer', async () => {
  await withMockedKit(() => Response.json({ subscriber: { id: 456 } }), async (calls) => {
    const response = await handleSubscribe(jsonRequest({ email_address: 'reader@example.com', form_id: 99 }, { referer: 'https://example.com/portfolio' }));
    assert.equal(response.status, 200);
    assert.equal(calls[1].url, 'https://api.kit.com/v4/forms/99/subscribers');
    assert.equal(JSON.parse(String(calls[1].init?.body)).referrer, 'https://example.com/portfolio');
  });
});

test('subscription keeps the API failure response and does not add a form subscriber after a failed upsert', async () => {
  await withMockedKit(() => Response.json({ errors: ['Invalid email address'] }, { status: 422 }), async (calls) => {
    const response = await handleSubscribe(jsonRequest({ email_address: 'reader@example.com' }));
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { success: false, error: 'Kit API error: 422 - Invalid email address' });
    assert.equal(calls.length, 1);
  });
});

test('cron authorization runs before reading posts or contacting Kit', async () => {
  await withMockedKit(() => { throw new Error('Unauthorized request must never contact Kit'); }, async (calls) => {
    const getPosts = async (): Promise<Post[]> => { throw new Error('Unauthorized request must not read content'); };
    const response = await handleSync(syncRequest('', 'wrong'), getPosts, undefined, 'test-secret');
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'Unauthorized' });
    assert.equal((await handleSync(syncRequest(), getPosts, undefined, '')).status, 401);
    assert.equal(calls.length, 0);
  });
});

test('sync reports an unknown slug without contacting Kit', async () => {
  await withMockedKit(() => { throw new Error('Unknown slug must never contact Kit'); }, async (calls) => {
    const response = await handleSync(syncRequest('?slug=missing'), async () => [post], undefined, 'test-secret');
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { success: false, error: 'Post "missing" not found' });
    assert.equal(calls.length, 0);
  });
});

test('sync skips already published broadcasts', async () => {
  await withMockedKit(() => Response.json({ broadcasts: [broadcast] }), async (calls) => {
    const response = await handleSync(syncRequest(), async () => [post], undefined, 'test-secret');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      message: 'No new posts to sync',
      synced: [{ slug: post.slug, kitId: 123, syncedAt: broadcast.created_at }],
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].init?.method, undefined);
  });
});

test('sync extracts the email article and creates a public broadcast without scheduling an email send', async () => {
  let created = false;
  await withMockedKit(({ url, init }) => {
    if (url.endsWith('/email')) return new Response('<html><header>Navigation</header><article><h1>Journal content</h1></article><footer>Links</footer></html>');
    if (init?.method === 'POST') {
      created = true;
      return Response.json({ broadcast });
    }
    return Response.json({ broadcasts: created ? [broadcast] : [] });
  }, async (calls) => {
    const response = await handleSync(syncRequest(), async () => [post], undefined, 'test-secret');
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.message, 'Successfully synced 1 posts, 0 failed');
    assert.deepEqual(result.synced, [{ slug: post.slug, title: post.metadata.title, success: true, kitId: 123 }]);
    const creation = calls.find((call) => call.init?.method === 'POST');
    assert.ok(creation);
    assert.equal(creation.url, 'https://api.kit.com/v4/broadcasts');
    const body = JSON.parse(String(creation.init?.body));
    assert.equal(body.content, '<article><h1>Journal content</h1></article>');
    assert.equal(body.public, true);
    assert.equal(body.send_at, null);
    assert.equal(body.subject, post.metadata.title);
    assert.equal(body.published_at, '2025-05-12T00:00:00.000Z');
    assert.equal(calls.filter((call) => call.init?.method === 'POST').length, 1);
  });
});

test('a failed broadcast lookup aborts sync without creating duplicates', async () => {
  await withMockedKit(() => Response.json({ errors: ['Upstream unavailable'] }, { status: 503 }), async (calls) => {
    const response = await handleSync(syncRequest(), async () => [post], undefined, 'test-secret');
    assert.equal(response.status, 500);
    assert.equal((await response.json()).success, false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].init?.method, undefined);
  });
});

test('a failed email rendering is reported without creating a broadcast', async () => {
  await withMockedKit(({ url }) => url.endsWith('/email')
    ? new Response('Not found', { status: 404 })
    : Response.json({ broadcasts: [] }), async (calls) => {
    const response = await handleSync(syncRequest(), async () => [post], undefined, 'test-secret');
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.failed.length, 1);
    assert.match(result.failed[0].error, /Failed to fetch email-only HTML/);
    assert.equal(calls.filter((call) => call.init?.method === 'POST').length, 0);
  });
});

test('RSS escapes content and URLs, keeps dates, and sorts newest first', () => {
  const feed = createRssFeed([
    post,
    { slug: 'newer', metadata: { title: 'One & two <three>', summary: 'A "quoted" summary', publishedAt: '2026-09-11' } },
  ], 'https://example.com');
  assert.match(feed, /<title>One &amp; two &lt;three&gt;<\/title>/);
  assert.match(feed, /A &quot;quoted&quot; summary/);
  assert.match(feed, /<pubDate>Mon, 12 May 2025 00:00:00 GMT<\/pubDate>/);
  assert.ok(feed.indexOf('/journal/newer') < feed.indexOf('/journal/diligencebot'));
  assert.match(feed, /<guid isPermaLink="true">https:\/\/example.com\/journal\/diligencebot<\/guid>/);
});

test('sitemap contains canonical HTML pages with stable modification dates', () => {
  const sitemap = createSitemap([post], 'https://example.com', '2026-09-11');
  for (const path of ['/', '/journal', '/portfolio', '/journal/diligencebot']) {
    assert.ok(sitemap.includes(`<loc>https://example.com${path}</loc>`));
  }
  assert.ok(!sitemap.includes('/email'));
  assert.ok(!sitemap.includes('<loc>https://example.com/rss</loc>'));
  assert.ok(!sitemap.includes('/rss/feed.xml'));
  assert.match(sitemap, /<lastmod>2026-09-11<\/lastmod>/);
  assert.match(sitemap, /<lastmod>2025-05-12<\/lastmod>/);
});

test('journal calendar dates remain the same in America/Los_Angeles', () => {
  const originalTimezone = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  try {
    assert.equal(formatDate('2025-05-12'), 'May 12, 2025');
    assert.match(formatDate('2025-05-12', true), /^May 12, 2025 \(/);
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
