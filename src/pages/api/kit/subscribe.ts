import type { APIRoute } from 'astro';
import { handleSubscribe } from '../../../lib/kit-routes';

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleSubscribe(request);
