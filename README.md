# Alec M. Wantoch

Portfolio and journal at https://alec.wantoch.com, built with Astro, MDX, and
Tailwind CSS. Pages are rendered to static HTML; the Kit API and social image
endpoint run as Vercel functions. Interactive controls and the Orthodox cross
canvas use small native browser scripts.

## Development

Use Node.js 22.12+ and pnpm 10.32.1 (the version in `packageManager`).

```sh
corepack enable
pnpm install
pnpm dev
```

The dev server runs at http://localhost:4321.

```sh
pnpm check
pnpm test
pnpm build
node scripts/smoke.mjs http://localhost:4321
```

The smoke script checks public routes, generated assets, redirects, social
previews, invalid subscription input, and unauthorized cron requests. It does
not subscribe anyone or run a newsletter sync. Pass the production origin to
run the same checks after deploying.

## Content and configuration

- Published posts live in `src/content/journal/*.mdx`; set `draft: true` to exclude
  a post from pages, feeds, the sitemap, and Kit synchronization.
- Shared metadata and links live in `src/lib/constants.ts`; portfolio entries
  live in `src/data/portfolio.ts`.
- The background canvas is `src/components/OrthodoxCrosses.astro`. It retains the
  original animation colors and timing, respects reduced motion, and pauses
  while the page is hidden.
- Optional `PUBLIC_BASE_URL` and `PUBLIC_GA_ID` override the canonical origin and
  Google Analytics ID. The former `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_GA_ID`
  names remain compatible for existing Vercel configuration.
- Server-only `KIT_API_KEY` and `CRON_SECRET` support subscriptions and the
  authenticated daily Kit sync. Keep them in Vercel environment variables or an
  ignored local `.env` file.

## Deployment

The existing Vercel project is `portfolio` in `alec-m-wantochs-projects`.
`vercel.json` selects Astro, installs from the lockfile, builds the site, and
retains the daily `0 0 * * *` cron at `/api/kit/sync`. The Vercel adapter creates
static files and server functions in `.vercel/output`.

Production follows `main`. After pushing, confirm the deployment is Ready and
run:

```sh
node scripts/smoke.mjs https://alec.wantoch.com
```

See [plan.md](plan.md) for the migration plan and verification record.
