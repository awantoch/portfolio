import { METADATA_CONFIG, SITE_CONFIG } from './constants';
import type { JournalMetadata } from './journal';

type FeedPost = { slug: string; metadata: JournalMetadata };

export function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]!);
}

export function createRssFeed(posts: FeedPost[], baseUrl = SITE_CONFIG.baseUrl): string {
  const items = [...posts]
    .sort((a, b) => Date.parse(b.metadata.publishedAt) - Date.parse(a.metadata.publishedAt))
    .map((post) => {
      const url = escapeXml(`${baseUrl}/journal/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.metadata.summary)}</description>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_CONFIG.title} — Journal`)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <atom:link href="${escapeXml(`${baseUrl}/rss`)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(METADATA_CONFIG.descriptions.journal)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;
}

export function createSitemap(posts: FeedPost[], baseUrl = SITE_CONFIG.baseUrl, siteLastModified = '2026-09-11'): string {
  const origin = baseUrl.replace(/\/$/, '');
  const entries = [
    ...['/', '/journal', '/portfolio'].map((route) => ({
      url: `${origin}${route}`,
      lastModified: siteLastModified,
    })),
    ...posts.map((post) => ({
      url: `${origin}/journal/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ url, lastModified }) => `  <url><loc>${escapeXml(url)}</loc><lastmod>${escapeXml(lastModified)}</lastmod></url>`).join('\n')}
</urlset>`;
}
