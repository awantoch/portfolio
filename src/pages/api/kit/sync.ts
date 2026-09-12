import type { APIRoute } from 'astro';
import { handleSync } from '../../../lib/kit-routes';
import { getJournalPosts } from '../../../lib/journal';

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleSync(request, getJournalPosts);
