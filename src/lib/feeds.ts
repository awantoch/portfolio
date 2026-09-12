import { SITE_CONFIG } from './constants';
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
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>This is my journal RSS feed</description>
${items}
  </channel>
</rss>`;
}

export function createSitemap(posts: FeedPost[], baseUrl = SITE_CONFIG.baseUrl): string {
  const today = new Date().toISOString().split('T')[0];
  const entries = [
    ...['', '/journal', '/portfolio', '/rss'].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: today,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/journal/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ url, lastModified }) => `  <url><loc>${escapeXml(url)}</loc><lastmod>${escapeXml(lastModified)}</lastmod></url>`).join('\n')}
</urlset>`;
}
