import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
let checks = 0;
async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    signal: AbortSignal.timeout(30000),
  });
  return response;
}
async function check(name, run) {
  await run();
  checks += 1;
  console.log(`PASS ${name}`);
}

for (const [path, heading] of [
  ['/', 'Alec M. Wantoch'],
  ['/portfolio', 'Portfolio'],
  ['/journal', 'Journal'],
  ['/journal/diligencebot', 'Prompt: DiligenceBot'],
]) {
  await check(path, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /name="generator" content="Astro/);
    assert.match(html, /<h1[\s>]/);
    assert.ok(html.includes(heading));
    assert.ok(html.includes('<orthodox-crosses'));
    assert.ok(!html.includes('/_next/'));
    assert.ok(!html.includes('/journal/pendulum'));
    assert.match(html, /name="viewport"/);
    assert.ok(html.includes(`rel="canonical" href="https://alec.wantoch.com${path === '/' ? '' : path}`));
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^\"]+)"/g)]
      .map((match) => match[1]).filter((url) => url.startsWith('/_astro/'));
    for (const script of scripts) {
      assert.equal((await request(script)).status, 200, `Script ${script}`);
    }
  });
}
await check('article email rendering', async () => {
  const response = await request('/journal/diligencebot/email');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('DiligenceBot'));
  const article = html.match(/<article[\s\S]*?<\/article>/)?.[0];
  assert.ok(article?.includes('DiligenceBot CLI'));
  assert.ok(article?.includes('font-family'));
  assert.ok(!article?.includes('<button'));
  assert.ok(!article?.includes('<script'));
});
await check('RSS', async () => {
  const response = await request('/rss');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /xml/);
  const xml = await response.text();
  assert.ok(xml.includes('https://alec.wantoch.com/journal/diligencebot'));
  assert.ok(xml.includes('<rss'));
  assert.ok(!xml.includes('pendulum'));
});
await check('sitemap', async () => {
  const response = await request('/sitemap.xml');
  assert.equal(response.status, 200);
  const xml = await response.text();
  assert.ok(xml.includes('https://alec.wantoch.com/journal/diligencebot'));
  assert.ok(!xml.includes('pendulum'));
});
await check('robots', async () => {
  const response = await request('/robots.txt');
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes('Sitemap: https://alec.wantoch.com/sitemap.xml'));
});
await check('unknown article returns 404', async () => {
  const response = await request('/journal/missing-smoke-test');
  assert.equal(response.status, 404);
});
for (const [path, destination] of [
  ['/cal', 'https://cal.com/alecw'],
  ['/cal/intro?source=portfolio', 'https://cal.com/alecw/intro'],
]) {
  await check(`calendar redirect ${path}`, async () => {
    const response = await request(path, { redirect: 'manual' });
    assert.ok([301, 308].includes(response.status), `${response.status}`);
    assert.ok(response.headers.get('location')?.startsWith(destination));
  });
}
await check('social preview PNG', async () => {
  const response = await request('/og?title=Portfolio%20smoke%20test&description=Astro%20migration&bg=dark&path=/journal/diligencebot');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /image\/png/);
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
await check('subscription rejects empty input without subscribing', async () => {
  const response = await request('/api/kit/subscribe', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).success, false);
});
await check('cron rejects unauthorized requests without syncing', async () => {
  const response = await request('/api/kit/sync');
  assert.equal(response.status, 401);
});
console.log(`\n${checks} smoke checks passed against ${base}`);
