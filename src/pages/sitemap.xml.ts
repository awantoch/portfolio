import type { APIRoute } from 'astro';
import { createSitemap } from '../lib/feeds';
import { getJournalPosts } from '../lib/journal';

export const prerender = true;

export const GET: APIRoute = async () => new Response(createSitemap(await getJournalPosts()), {
  headers: { 'Content-Type': 'application/xml; charset=utf-8' },
});
