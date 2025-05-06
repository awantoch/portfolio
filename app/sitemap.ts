import { getJournalPosts } from 'app/journal/utils'
import { SITE_CONFIG } from './constants'

export const baseUrl = SITE_CONFIG.baseUrl

export default async function sitemap() {
  let entries = getJournalPosts().map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/journal'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...entries]
}
