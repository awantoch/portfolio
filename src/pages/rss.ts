import type { APIRoute } from 'astro';
import { createRssFeed } from '../lib/feeds';
import { getJournalPosts } from '../lib/journal';

export const prerender = true;

export const GET: APIRoute = async () => new Response(createRssFeed(await getJournalPosts()), {
  headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
});
