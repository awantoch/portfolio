import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = ({ url }) => {
  const suffix = url.pathname.slice('/cal'.length);
  return new Response(null, {
    status: 308,
    headers: { Location: `https://cal.com/alecw${suffix}${url.search}` },
  });
};
