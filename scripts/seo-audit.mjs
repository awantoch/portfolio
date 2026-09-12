import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
const canonicalBase = 'https://alec.wantoch.com';
const homeBio = 'Orthodox Christian, entrepreneur, product leader, and computer scientist building to create real-world impact.';
const homeDescription = `CEO & Founder of BeemFlow. ${homeBio}`;

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)]
    .map(([, name, value]) => [name, decodeHtml(value)]));
}

function findElement(html, tagName, attribute, value) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [];
  return tags.map(attributes).find((attrs) => attrs[attribute] === value);
}

function visibleText(html) {
  return decodeHtml(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, value]) => JSON.parse(decodeHtml(value)));
}

async function get(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response.text();
}

const pages = [
  { path: '/', title: 'Alec M. Wantoch | CEO & Founder of BeemFlow', description: homeDescription },
  { path: '/portfolio', title: 'Portfolio | Alec M. Wantoch', description: 'Explore my track record founding startups, scaling product, architecting infrastructure, and delivering results.' },
  { path: '/journal', title: 'Journal | Alec M. Wantoch', description: 'Insights on product strategy, security, business acquisitions, and startup lifestyle.' },
  { path: '/journal/diligencebot', title: 'Prompt: DiligenceBot | Alec M. Wantoch', description: 'System prompt for young entrepreneurs buying cash-flowing businesses from retiring owners.' },
];

for (const page of pages) {
  const html = await get(page.path);
  const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const canonical = findElement(html, 'link', 'rel', 'canonical');
  const description = findElement(html, 'meta', 'name', 'description');
  const ogTitle = findElement(html, 'meta', 'property', 'og:title');
  const ogDescription = findElement(html, 'meta', 'property', 'og:description');
  const ogUrl = findElement(html, 'meta', 'property', 'og:url');
  const ogImage = findElement(html, 'meta', 'property', 'og:image');
  const ogImageSecure = findElement(html, 'meta', 'property', 'og:image:secure_url');
  const ogImageType = findElement(html, 'meta', 'property', 'og:image:type');
  const ogImageAlt = findElement(html, 'meta', 'property', 'og:image:alt');
  const twitterTitle = findElement(html, 'meta', 'name', 'twitter:title');
  const twitterDescription = findElement(html, 'meta', 'name', 'twitter:description');
  const twitterImage = findElement(html, 'meta', 'name', 'twitter:image');
  const twitterImageAlt = findElement(html, 'meta', 'name', 'twitter:image:alt');
  const rss = findElement(html, 'link', 'type', 'application/rss+xml');

  assert.equal(title, page.title, `${page.path} title`);
  assert.equal(description?.content, page.description, `${page.path} description`);
  assert.ok(page.description.length >= 50 && page.description.length <= 160, `${page.path} description length`);
  assert.equal(canonical?.href, `${canonicalBase}${page.path === '/' ? '/' : page.path}`, `${page.path} canonical`);
  assert.equal(ogTitle?.content, page.path.startsWith('/journal/diligencebot') ? page.title.split(' | ')[0] : page.title);
  assert.equal(ogDescription?.content, page.description);
  assert.equal(ogUrl?.content, canonical?.href);
  assert.ok(ogImage?.content.startsWith(`${canonicalBase}/`));
  assert.equal(ogImageSecure?.content, ogImage?.content);
  assert.match(ogImageType?.content || '', /^image\/(png|jpeg|webp)$/);
  assert.ok(ogImageAlt?.content);
  assert.equal(twitterTitle?.content, ogTitle?.content);
  assert.equal(twitterDescription?.content, page.description);
  assert.equal(twitterImage?.content, ogImage?.content);
  assert.equal(twitterImageAlt?.content, ogImageAlt?.content);
  assert.equal(rss?.href, `${canonicalBase}/rss`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page.path} must have one h1`);
  assert.equal(findElement(html, 'meta', 'name', 'keywords'), undefined, 'legacy keyword metadata should be absent');
  console.log(`PASS metadata and headings ${page.path}`);
}

const home = await get('/');
const homeText = visibleText(home);
assert.ok(homeText.includes('CEO & Founder of BeemFlow'));
assert.ok(homeText.includes(homeBio));
assert.equal(findElement(home, 'meta', 'property', 'og:type')?.content, 'profile');
assert.ok(home.includes('alt="Alec M. Wantoch, CEO &amp; Founder of BeemFlow"'));
const profile = jsonLd(home).find((entry) => entry['@type'] === 'ProfilePage');
assert.equal(profile?.mainEntity?.['@type'], 'Person');
assert.equal(profile?.mainEntity?.name, 'Alec M. Wantoch');
assert.equal(profile?.mainEntity?.jobTitle, 'CEO & Founder');
assert.equal(profile?.mainEntity?.worksFor?.name, 'BeemFlow');
assert.equal(profile?.mainEntity?.worksFor?.url, 'https://beemflow.com');
assert.ok(profile?.mainEntity?.sameAs?.includes('https://linkedin.com/in/awantoch'));
assert.equal(profile?.description, homeDescription);
console.log('PASS ProfilePage and Person structured data');

const articleHtml = await get('/journal/diligencebot');
const article = jsonLd(articleHtml).find((entry) => entry['@type'] === 'Article');
assert.equal(article?.mainEntityOfPage?.['@id'], `${canonicalBase}/journal/diligencebot`);
assert.equal(article?.author?.['@id'], `${canonicalBase}/#person`);
assert.equal(article?.author?.name, 'Alec M. Wantoch');
assert.equal(article?.datePublished, '2025-05-12');
console.log('PASS Article structured data and author identity');

const email = await get('/journal/diligencebot/email');
assert.match(findElement(email, 'meta', 'name', 'robots')?.content || '', /noindex/);
console.log('PASS email rendering is excluded from search');

const sitemap = await get('/sitemap.xml');
assert.ok(sitemap.includes(`<loc>${canonicalBase}/</loc>`));
assert.ok(sitemap.includes(`<loc>${canonicalBase}/journal/diligencebot</loc>`));
assert.ok(!sitemap.includes('<loc>https://alec.wantoch.com/rss</loc>'));
assert.ok(!sitemap.includes('/email</loc>'));
console.log('PASS sitemap contains canonical HTML pages only');

const robots = await get('/robots.txt');
assert.ok(robots.includes('User-agent: *\nAllow: /'));
assert.ok(robots.includes(`Sitemap: ${canonicalBase}/sitemap.xml`));
console.log(`\nSEO audit passed against ${base}`);
