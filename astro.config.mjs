import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alec.wantoch.com',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [mdx()],
  markdown: { syntaxHighlight: false },
  vite: { plugins: [tailwindcss()] },
  redirects: {
    '/rss/feed.xml': '/rss',
  },
});
