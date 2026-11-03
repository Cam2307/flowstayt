// End-to-end test: loads the extension unpacked in Chrome for Testing (via Puppeteer) and checks real behaviour.
// Run: cd tests && npm install && xvfb-run -a npm test   (on a desktop, just `npm test`)
const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const EXT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
async function test(name, fn) {
  try { await fn(); results.push([name, 'PASS']); console.log('PASS', name); }
  catch (e) { results.push([name, 'FAIL']); console.log('FAIL', name, '-', e.message); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

(async () => {
  // Local web server; *.test hostnames are mapped to it so no internet is needed.
  const server = http.createServer((q, r) => r.end('<h1>REAL SITE</h1>')).listen(0);
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: false, args: [
    `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`,
    `--host-resolver-rules=MAP *.test 127.0.0.1:${port}`, '--no-sandbox'] });
  const swT = await browser.waitForTarget(t => t.type() === 'service_worker');
  const sw = await swT.worker();
  const id = new URL(swT.url()).host;
  const ev = (fn, ...a) => sw.evaluate(fn, ...a);
  const page = await browser.newPage();
  page.on('dialog', d => d.accept());
  // Test-only Lemon Squeezy mock: replaces fetch in extension pages before any script runs.
  // Scenario comes from localStorage 'lsMock' (set by the test). Real users never get this code.
  await page.evaluateOnNewDocument(() => {
    const real = window.fetch;
    window.fetch = async (u, o) => {
      if (!String(u).startsWith('https://api.lemonsqueezy.com/')) return real(u, o);
      const m = localStorage.getItem('lsMock') || 'invalid';
      const act = String(u).split('/').pop();
      (window.__lsCalls = window.__lsCalls || []).push(act);
      const meta = { store_id: 513390, product_id: m === 'wrongproduct' ? 999 : m === 'yearly' ? 1497359 : 1497337 };
      let body, status = 200;
      if (act === 'activate') body = m === 'invalid' ? (status = 404, { activated: false, error: 'license_key not found.' })
        : { activated: true, instance: { id: 'inst-1' }, license_key: { status: 'active' }, meta };
      else if (act === 'deactivate') body = { deactivated: true, meta };
      else body = { valid: true, license_key: { status: 'active' }, meta };
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    };
  });
  const visit = async host => { await page.goto(`http://${host}:${port}/`).catch(() => {}); await sleep(400); return page.url(); };
  const opts = async () => { await page.goto(`chrome-extension://${id}/options.html`); await sleep(300); };
  const apply = async () => { await sleep(100); await ev(() => self.applyRules()); }; // resolves once queued rule updates finish

  await test('Adding a site blocks it (redirect to blocked.html)', async () => {
    await opts(); await page.type('#site', 'distract.test'); await page.click('#add'); await sleep(500);
    const u = await visit('distract.test');
    assert(u.includes('/blocked.html'), 'landed on ' + u);
    assert(!(await visit('fine.test')).includes('blocked'), 'unrelated site was blocked');
  });
  await test('Blocked-attempt stats count goes up', async () => {
    const before = await ev(async () => { const { stats = {} } = await chrome.storage.local.get('stats'); return Object.values(stats).reduce((a, b) => a + b, 0); });
    await visit('distract.test'); await sleep(500);
    const after = await ev(async () => { const { stats = {} } = await chrome.storage.local.get('stats'); return Object.values(stats).reduce((a, b) => a + b, 0); });
    assert(after === before + 1, `before ${before}, after ${after}`);
  });
  await test('Removing a site unblocks it', async () => {
    await opts(); await page.click('#list li button'); await sleep(500);
    const u = await visit('distract.test');
    assert(!u.includes('blocked'), 'still blocked: ' + u);
  });
  await test('Focus session starts (25 min, alarm set)', async () => {
    await page.goto(`chrome-extension://${id}/popup.html`); await sleep(300);
    await page.click('[data-min="25"]'); await sleep(500);
    const r = await ev(async () => ({ s: await chrome.storage.local.get('focusUntil'), a: await chrome.alarms.get('focusEnd') }));
    const mins = (r.s.focusUntil - Date.now()) / 60000;
    assert(mins > 24 && mins <= 25 && r.a, 'focusUntil/alarm wrong');
    assert((await page.$eval('#focus', e => e.textContent)).includes('Focusing until'), 'popup did not show session');
    await ev(async () => { await chrome.storage.local.set({ focusUntil: 0 }); await chrome.alarms.clear('focusEnd'); });
  });
  await test('Pro: password lock gates settings', async () => {
    await ev(() => chrome.storage.local.set({ license: { key: 'TEST', instanceId: 'i', valid: true, status: 'active', lastOk: Date.now() } }));
    await opts(); await page.type('#newPw', 'secret1'); await page.click('#setPw'); await sleep(400);
    await opts();
    assert(await page.$eval('#main', e => e.hidden), 'settings not hidden');
    await page.type('#pw', 'wrong'); await page.click('#unlock'); await sleep(300);
    assert(await page.$eval('#main', e => e.hidden), 'wrong password unlocked');
    await page.$eval('#pw', e => e.value = ''); await page.type('#pw', 'secret1'); await page.click('#unlock'); await sleep(300);
    assert(!(await page.$eval('#main', e => e.hidden)), 'right password did not unlock');
    await ev(() => chrome.storage.local.set({ passwordHash: '' }));
  });
  await test('Pro: schedule blocks only inside set hours', async () => {
    await ev(() => chrome.storage.local.set({ blocklist: ['distract.test'] }));
    const hhmm = d => d.toTimeString().slice(0, 5), now = new Date();
    const all = [0, 1, 2, 3, 4, 5, 6];
    await ev(s => chrome.storage.local.set({ schedule: s }), { enabled: true, days: all, start: hhmm(new Date(+now + 2 * 3600e3)), end: hhmm(new Date(+now + 3 * 3600e3)) });
    await apply();
    assert(!(await visit('distract.test')).includes('blocked'), 'blocked outside schedule');
    await ev(s => chrome.storage.local.set({ schedule: s }), { enabled: true, days: all, start: hhmm(new Date(+now - 3600e3)), end: hhmm(new Date(+now + 3600e3)) });
    await apply();
    assert((await visit('distract.test')).includes('blocked'), 'not blocked inside schedule');
    await ev(() => chrome.storage.local.set({ schedule: { enabled: false, days: [1,2,3,4,5], start: '09:00', end: '17:00' } })); await apply();
  });
  await test('Pro: allowlist-only mode', async () => {
    await opts(); await page.type('#alSite', 'work.test'); await page.click('#alAdd'); await sleep(300);
    await page.click('#alOn'); await sleep(500); await apply();
    assert(!(await visit('work.test')).includes('blocked'), 'allowlisted site blocked');
    assert((await visit('random.test')).includes('blocked'), 'non-allowlisted site not blocked');
    await ev(() => chrome.storage.local.set({ allowlistMode: false })); await apply();
    assert(!(await visit('random.test')).includes('blocked'), 'still blocking after turning off');
  });
  await test('Pro: settings sync via chrome.storage.sync (both ways)', async () => {
    await ev(() => chrome.storage.local.set({ blocklist: ['distract.test', 'news.test'] })); await sleep(500);
    const remote = await ev(() => chrome.storage.sync.get('blocklist'));
    assert(JSON.stringify(remote.blocklist) === '["distract.test","news.test"]', 'not pushed: ' + JSON.stringify(remote));
    await ev(() => chrome.storage.sync.set({ blocklist: ['fromotherdevice.test'] })); await sleep(500);
    const local = await ev(() => chrome.storage.local.get('blocklist'));
    assert(local.blocklist[0] === 'fromotherdevice.test', 'not pulled: ' + JSON.stringify(local));
  });
  await test('Free users do not sync', async () => {
    await ev(() => chrome.storage.local.remove('license')); await sleep(200);
    await ev(() => chrome.storage.local.set({ blocklist: ['freeonly.test'] })); await sleep(500);
    const remote = await ev(() => chrome.storage.sync.get('blocklist'));
    assert(!remote.blocklist.includes('freeonly.test'), 'free user synced');
  });

  const lic = () => ev(async () => (await chrome.storage.local.get('license')).license || null);
  const mock = async m => { await opts(); await page.evaluate(m => localStorage.setItem('lsMock', m), m); await opts(); };
  await test('Licence: free user is gated (Pro box locked, upsell shown)', async () => {
    await ev(() => chrome.storage.local.remove('license')); await opts();
    assert(await page.$eval('#proBox', e => e.classList.contains('locked')), 'pro box not locked');
    assert(!(await page.$eval('#upsell', e => e.hidden)), 'upsell hidden');
    assert(await page.$eval('#buyMonthly', e => !e.hidden), 'no monthly upgrade button');
    await page.goto(`chrome-extension://${id}/popup.html`); await sleep(300);
    assert(!(await page.$eval('#upgrade', e => e.hidden)), 'popup upgrade link hidden');
  });
  await test('Licence: invalid key shows an error and stays free', async () => {
    await mock('invalid'); await page.type('#licKey', 'BAD-KEY'); await page.click('#activate'); await sleep(600);
    assert((await page.$eval('#licStatus', e => e.textContent)).includes('not found'), 'no error shown');
    assert(!(await lic()), 'licence stored');
  });
  await test('Licence: key for another product is rejected', async () => {
    await mock('wrongproduct'); await page.type('#licKey', 'OTHER-KEY'); await page.click('#activate'); await sleep(600);
    assert((await page.$eval('#licStatus', e => e.textContent)).includes('not for Focus Blocker Pro'), 'no wrong-product error');
    assert(!(await lic()), 'licence stored');
    assert((await page.evaluate(() => window.__lsCalls)).includes('deactivate'), 'did not release the activation');
  });
  await test('Licence: valid key activates and unlocks Pro', async () => {
    await mock('ok'); await page.type('#licKey', 'GOOD-KEY-1234'); await page.click('#activate'); await sleep(600);
    const l = await lic();
    assert(l && l.valid && l.instanceId === 'inst-1', 'licence not stored: ' + JSON.stringify(l));
    assert(!(await page.$eval('#proBox', e => e.classList.contains('locked'))), 'pro box still locked');
    assert((await page.$eval('#licStatus', e => e.textContent)).includes('Pro active'), 'status text wrong');
  });
  await test('Licence: deactivate returns to free', async () => {
    await page.click('#deactivate'); await sleep(600);
    assert(!(await lic()), 'licence still stored');
    assert(await page.$eval('#proBox', e => e.classList.contains('locked')), 'pro box not locked');
  });
  await test('Licence: yearly product key (1497359) unlocks Pro', async () => {
    await mock('yearly'); await page.type('#licKey', 'YEARLY-KEY-9999'); await page.click('#activate'); await sleep(600);
    const l = await lic();
    assert(l && l.valid, 'yearly licence not stored');
    assert(!(await page.$eval('#proBox', e => e.classList.contains('locked'))), 'pro box still locked');
    await page.click('#deactivate'); await sleep(600);
    assert(!(await lic()), 'not deactivated');
  });
  await test('Licence: yearly Upgrade button is shown', async () => {
    await opts(); assert(await page.$eval('#buyYearly', e => !e.hidden), 'yearly button hidden');
  });
  await test('Licence: offline grace expires after 7 days', async () => {
    await ev(() => chrome.storage.local.set({ license: { key: 'K', instanceId: 'i', valid: true, status: 'active', lastOk: Date.now() - 8 * 864e5 } }));
    await opts();
    assert(await page.$eval('#proBox', e => e.classList.contains('locked')), 'still Pro after grace');
    await ev(() => chrome.storage.local.remove('license'));
  });

  await browser.close(); server.close();
  const failed = results.filter(r => r[1] === 'FAIL').length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();
