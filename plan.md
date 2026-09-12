# Astro migration and Orthodox cross animation

## Goal

Rebuild alec.wantoch.com with Astro while retaining the current design, content,
URLs, metadata, integrations, and background animation colors and timing. Replace
the repeating circles with Orthodox crosses: a vertical stem, short upper bar,
long central bar, and slanted lower footrest.

## Baseline and constraints

- Current stack: Next.js 15, React 19, Tailwind CSS 4, MDX, Vercel.
- GitHub currently uses `master`; create `main` from its current commit and make
  sure the production deployment follows `main`.
- Preserve the existing untracked `app/journal/posts/pendulum.mdx` draft locally;
  it is outside the migration and must not be included in a deployment.
- Keep `/`, `/portfolio`, `/journal`, journal articles and email renderings,
  `/rss`, `/sitemap.xml`, `/robots.txt`, `/og`, `/cal/*`, and Kit API routes.
- Do not trigger newsletter broadcasts or create real subscriptions during tests.

## Implementation with subagents

1. **Baseline and deployment (primary agent)**
   - Inspect the existing production site and Vercel/GitHub configuration.
   - Record desktop/mobile appearance and route behavior.
   - Establish Astro, MDX, Tailwind, and the Vercel adapter.
2. **Pages and components (subagent)**
   - Port layout, navigation, homepage, portfolio, journal, MDX rendering,
     subscription form, sharing, metadata, and analytics to native Astro.
   - Keep the published content and design intact, with small browser scripts
     for interactions instead of a React application runtime.
3. **Orthodox cross animation (subagent)**
   - Port the canvas to Astro and replace circle geometry with repeated Orthodox
     crosses while preserving the hue, breathing, swirl, opacity, and backdrop.
   - Handle resizing, high density displays, reduced motion, and cleanup.
4. **Endpoints and content (subagent)**
   - Migrate published MDX content, content helpers, Kit endpoints, RSS, sitemap,
     robots, and social preview generation to Astro-compatible modules.
   - Preserve API contracts and the cron schedule.
5. **Integration and local verification (primary agent)**
   - Remove obsolete Next.js code/dependencies after parity is established.
   - Run type checking, production build, targeted API tests, and browser checks.
   - Verify navigation, article rendering, subscription validation, sharing,
     cross visibility/motion, responsive layouts, redirects, and metadata.
6. **Release and production verification (primary agent)**
   - Commit reviewable changes and push `main` after local checks pass.
   - Monitor the Vercel deployment and verify the deployed commit.
   - Repeat production route and browser smoke checks, fixing and redeploying
     any regressions discovered.
   - Record actual test results and release details below.

## Progress and verification

- [x] Inspect repository, current stack, branch state, and local changes.
- [x] Capture production baseline and inspect deployment settings.
- [x] Complete Astro migration with subagents.
- [x] Complete Orthodox cross animation.
- [x] Pass local validation.
- [x] Push `main` and deploy.
- [x] Pass production validation.

### Local results

- Astro 7.3.2 production build succeeds with the Vercel adapter.
- Astro check: 82 files, zero errors, warnings, or hints.
- 16 automated tests pass for animation geometry/lifecycle, Kit subscription and
  sync contracts, feed escaping, and dates across time zones. Kit is mocked.
- 14 HTTP smoke checks pass against the local Astro server, including 1200×630
  social previews, calendar redirects, unauthorized cron and invalid input.
- Browser checks cover desktop and 390px mobile layouts, journal navigation,
  intact 6,934-character prompt copying, and share-link copying. No horizontal
  overflow at the mobile viewport.
- Cross glyphs were reduced to 65% of their initial geometry so neighboring
  crosses remain distinct while keeping the original 50px hex spacing.
- The local `.env` contains an old localhost URL; validation builds explicitly
  set `PUBLIC_BASE_URL=https://alec.wantoch.com` without changing that file.
- Next.js/React packages and tracked `app` source have been removed. The existing
  untracked journal draft remains at its original path.

### First production pass

- Migration commit `bf92973` deployed successfully on Vercel as
  `dpl_Hdp9d8PhteRt8LLspdVZrTJXWKMo`.
- GitHub default branch and Vercel production branch are both `main`; Vercel now
  uses the Astro framework preset.
- Production smoke testing passed 14 of 15 checks. It caught the extensionless
  `/rss` being served as `application/octet-stream`; an explicit Vercel RSS
  content-type header is included in the follow-up fix.
- Production desktop browser confirms Astro metadata, distinct animated Orthodox
  crosses, and no console errors.
- The follow-up build and all 15 local smoke checks pass. `pnpm start` now aliases
  `astro dev`, since the Vercel adapter does not support `astro preview`.

### Production validation and final dependency patch

- Follow-up commit `ad65663` automatically deployed from `main` as
  `dpl_A7eXDrdpD6Nb3YKx6LASdHae3HMo`; all 15 production smoke checks pass.
- Live 390px mobile layout has no horizontal overflow. Browser checks confirm
  native invalid-email feedback, journal navigation, complete prompt copying
  (6,934 characters), and working share-link copying. No console errors.
- A final GitHub dependency alert identified Vercel's transitive
  `path-to-regexp@6.1.0`. A scoped override upgrades it to patched `6.3.0`.
  Subagent comparison found identical route matching for 11 relevant patterns,
  three option sets, and 15 paths. The final production build passes, and the generated Vercel routing
  configuration is byte-for-byte identical after the override. The production
  dependency audit reports no known vulnerabilities. The final commit is checked
  against the production deployment and the same 15 route checks.
- No real subscriptions, broadcasts, or authorized cron syncs were performed.
