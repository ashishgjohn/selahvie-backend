// Extension Regression Check: calls a RUNNING server and verifies the
// Chrome extension's contract still holds.
// Usage: npm run erc -- <baseUrl> [--strict-cors]
// Each run adds one untagged `share` event and one JPG (deleted after 2h).
const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) {
  console.log('Usage: npm run erc -- <baseUrl> [--strict-cors]'); process.exit(2);
}
const EXT = 'chrome-extension://pfhbgcocdbpplkacchpekhcdempaphlj';
const JSON_HDR = { Accept: 'application/json' };
const origin = new URL(base).origin;
// Strict CORS is the default for any non-local host (dev servers are permissive on purpose).
const strictCors = process.argv.includes('--strict-cors') || !['localhost', '127.0.0.1'].includes(new URL(base).hostname);
let failed = 0;

// The one fetch wrapper: every call has a timeout and never follows redirects.
const f = (url, o = {}) => fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'manual', ...o });
const get = (path, headers = JSON_HDR) => f(base + path, { headers });
const post = (body) => f(base + '/api/events',
  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
// Run one check; a thrown error means FAIL with that message as the reason.
async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

// ERC 1 + 2: verses for each mood score, background image
let imageUrl;
for (const s of [-7, 0, 10]) {
  await check(`1 verses/${s}`, async () => {
    const res = await get(`/api/verses/${s}?aid=erc-check`);
    ok(res.status === 200, `status ${res.status}`);
    const body = await res.json();
    ok(body.status === 'success', `status field is ${body.status}`);
    const verses = body.data?.verses;
    ok(Array.isArray(verses) && verses.length > 0, 'data.verses is not a non-empty array');
    ok(verses.every(v => typeof v.verse === 'string' && typeof v.reference === 'string' && typeof v.score === 'number'),
      'a verse item is missing verse/reference/score of the right type');
    ok(verses.every(v => Math.abs(v.score - s) <= 2), `a verse score is outside ${s - 2}..${s + 2}`);
    const name = body.data.images?.[0]?.name;
    ok(/^https?:\/\/.+\/imgs\/bgs\/img\d+\.jpg$/.test(name), `bad image url: ${name}`);
    ok(new URL(name).origin === origin, `image url origin differs from base: ${name}`);
    imageUrl = name;
  });
}

await check('2 background image loads', async () => {
  ok(imageUrl, 'no image url from check 1');
  const res = await f(imageUrl);
  ok(res.status === 200, `status ${res.status}`);
  ok((res.headers.get('content-type') ?? '').includes('image/jpeg'), `content-type ${res.headers.get('content-type')}`);
  const corp = res.headers.get('cross-origin-resource-policy');
  ok(corp === null || corp === 'cross-origin', `cross-origin-resource-policy is ${corp}`);
});

// ERC 3: share image render (Puppeteer, slow)
const [verse, reference] = ['The Lord is my shepherd', 'Psalm 23:1'];
let shareUrl;
await check('3 share image render', async () => {
  ok(imageUrl, 'no image url from check 1');
  const q = new URLSearchParams({ format: 'image', verse, reference, bgImage: imageUrl.split('/').pop() });
  const res = await get(`/api/share?${q}`);
  ok(res.status === 200, `status ${res.status}`);
  const body = await res.json();
  ok(body.status === 'success' && typeof body.imageUrl === 'string', 'no success/imageUrl in response');
  ok(new URL(body.imageUrl).origin === origin, `imageUrl origin differs from base: ${body.imageUrl}`);
  shareUrl = body.imageUrl;
  const img = await f(shareUrl);
  ok(img.status === 200, `imageUrl status ${img.status}`);
  ok((img.headers.get('content-type') ?? '').includes('image/jpeg'), `imageUrl content-type ${img.headers.get('content-type')}`);
});

// ERC 4: share page (HTML for social crawlers) and bare redirect
await check('4 share page + redirect', async () => {
  ok(shareUrl, 'no imageUrl from check 3');
  const res = await get(`/api/share?${new URLSearchParams({ verse, reference, imageUrl: shareUrl })}`, {});
  ok(res.status === 200, `status ${res.status}`);
  ok((await res.text()).includes(`content="${shareUrl}"`), 'html has no og:image content matching imageUrl');
  const bare = await get('/api/share', {});
  ok(bare.status === 302, `bare status ${bare.status}`);
  ok(bare.headers.get('location') === 'https://selahvie.life', `location ${bare.headers.get('location')}`);
});

// ERC 5: analytics events
await check('5 events accepted/rejected', async () => {
  for (const type of ['sidebar_opened', 'onboarding_viewed', 'extension_pinned', 'onboarding_cta', 'reminder_set']) {
    const res = await post({ type, anonymousId: 'erc-check' });
    ok(res.status === 202, `${type} -> ${res.status}`);
  }
  const bad = await post({ type: 'not_a_real_type', anonymousId: 'erc-check' });
  ok(bad.status === 400, `not_a_real_type -> ${bad.status}`);
});

// ERC 6: CORS
await check('6a CORS preflight for extension', async () => {
  const res = await f(base + '/api/events', {
    method: 'OPTIONS',
    headers: { Origin: EXT, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  });
  ok(res.status === 204, `status ${res.status}`);
  ok(res.headers.get('access-control-allow-origin') === EXT, `allow-origin ${res.headers.get('access-control-allow-origin')}`);
  ok((res.headers.get('access-control-allow-methods') ?? '').includes('POST'), 'allow-methods lacks POST');
});
await check('6b CORS GET for extension', async () => {
  const res = await get('/api/verses/0?aid=erc-check', { ...JSON_HDR, Origin: EXT });
  ok(res.headers.get('access-control-allow-origin') === EXT, `allow-origin ${res.headers.get('access-control-allow-origin')}`);
});
if (strictCors) {
  await check('6c junk origin is not allowed', async () => {
    const res = await get('/api/verses/0?aid=erc-check', { ...JSON_HDR, Origin: 'https://evil.example.com' });
    const allow = res.headers.get('access-control-allow-origin');
    ok(allow === null, `junk origin got allow-origin ${allow}`);
  });
}

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
