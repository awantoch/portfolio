import { getJournalPosts } from 'app/journal/utils'
import { SITE_CONFIG } from './constants'

export const baseUrl = SITE_CONFIG.baseUrl

export default async function sitemap() {
  // Journal posts
  let entries = getJournalPosts().map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  // Static routes
  let routes = [
    '',
    '/journal',
    '/portfolio',
    '/rss',
    '/rss/feed.xml',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...entries]
}
