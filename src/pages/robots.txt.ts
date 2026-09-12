import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../lib/constants';

export const prerender = true;

export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_CONFIG.baseUrl}/sitemap.xml\n`, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
