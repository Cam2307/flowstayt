// Generates Chrome Web Store screenshots + promo tiles from the real extension UI. Run: xvfb-run -a node store-shots.js
const puppeteer = require('puppeteer'); const path = require('path'); const fs = require('fs');
const EXT = path.resolve(__dirname, '..'), OUT = path.join(EXT, 'store'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const ICON = 'data:image/png;base64,' + fs.readFileSync(path.join(EXT, 'icons/icon128.png')).toString('base64');
(async () => {
  const browser = await puppeteer.launch({ headless: false, args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-sandbox'] });
  const swT = await browser.waitForTarget(t => t.type() === 'service_worker'); const sw = await swT.worker();
  const id = new URL(swT.url()).host; const ev = (fn, ...a) => sw.evaluate(fn, ...a);
  const page = await browser.newPage();
  const today = new Date(); const stats = {}; for (let i = 0; i < 7; i++) stats[new Date(+today - i * 864e5).toISOString().slice(0, 10)] = [14, 9, 22, 6, 11, 17, 8][i];
  await ev((st) => chrome.storage.local.set({ blocklist: ['youtube.com', 'instagram.com', 'reddit.com', 'x.com', 'tiktok.com', 'news.ycombinator.com'], stats: st, focusUntil: 0 }), stats);
  const shot = async (url, w, h, setup) => { await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 }); await page.goto(url); await sleep(500); if (setup) await setup(); await sleep(300);
    return 'data:image/png;base64,' + await page.screenshot({ encoding: 'base64' }); };
  const E = p => `chrome-extension://${id}/${p}`;
  const popup = await shot(E('popup.html'), 340, 470);
  const blocked = await shot(E('blocked.html?d=youtube.com'), 1000, 620);
  const optsFree = await shot(E('options.html'), 760, 700);
  await ev(() => chrome.storage.local.set({ license: { key: 'DEMO-0000', instanceId: 'i', valid: true, status: 'active', lastOk: Date.now() }, schedule: { enabled: true, days: [1,2,3,4,5], start: '09:00', end: '17:00' }, allowlist: ['docs.google.com', 'github.com'] }));
  const optsPro = await shot(E('options.html'), 760, 700, () => page.evaluate(() => document.getElementById('proBox').scrollIntoView()));
  await ev(() => chrome.storage.local.set({ focusUntil: Date.now() + 25 * 60000 }));
  const popupFocus = await shot(E('popup.html'), 340, 470);
  await ev(() => chrome.storage.local.set({ focusUntil: 0 }));
  const css = `*{margin:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:radial-gradient(1200px 600px at 80% -10%,#2a2160 0%,#0a0d18 55%);color:#e6e8f2;overflow:hidden}
  .k{color:#a3abc2}.g{background:linear-gradient(90deg,#8b7cff,#c084fc);-webkit-background-clip:text;color:transparent}
  .shot{border-radius:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08);background:#0a0d18}`;
  const frame = (title, sub, img, w) => `<style>${css}</style><div style="width:1280px;height:800px;display:flex;align-items:center;gap:56px;padding:0 72px">
   <div style="flex:0 0 380px"><img src="${ICON}" width="56" style="margin-bottom:28px"><h1 style="font-size:44px;line-height:1.1;font-weight:700;letter-spacing:-.02em">${title}</h1><p class="k" style="font-size:20px;line-height:1.5;margin-top:18px">${sub}</p></div>
   <div style="flex:1;display:flex;justify-content:center"><img class="shot" src="${img}" style="width:${w}px"></div></div>`;
  const render = async (html, w, h, file) => { await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await page.setContent(html); await sleep(400); await page.screenshot({ path: path.join(OUT, file) }); };
  await render(frame('Block distractions <span class="g">in one click</span>', 'Add any site from the popup. Start a 25 or 50 minute focus session.', popup, 340), 1280, 800, 'screenshot-1-popup.png');
  await render(frame('A calm <span class="g">nudge back</span> to work', 'Blocked sites show a quiet reminder instead of the feed.', blocked, 700), 1280, 800, 'screenshot-2-blocked.png');
  await render(frame('Your list, <span class="g">your stats</span>', 'Manage blocked sites and see how many distractions you skipped each day.', optsFree, 640), 1280, 800, 'screenshot-3-options.png');
  await render(frame('Pro: schedules, <span class="g">lock & sync</span>', 'Block only during work hours, lock settings with a password, allowlist-only mode, and sync across devices.', optsPro, 640), 1280, 800, 'screenshot-4-pro.png');
  await render(frame('Stay in <span class="g">flow</span>', 'Focus sessions keep blocking on until the timer ends. Private: nothing leaves your device.', popupFocus, 340), 1280, 800, 'screenshot-5-focus.png');
  const tile = (w, h, big) => `<style>${css}</style><div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;gap:${big ? 48 : 22}px">
   <img src="${ICON}" width="${big ? 200 : 96}"><div><div style="font-size:${big ? 76 : 38}px;font-weight:700;letter-spacing:-.02em">Flow<span class="g">Stayt</span></div>
   <div class="k" style="font-size:${big ? 30 : 16}px;margin-top:${big ? 14 : 6}px">Website blocker for deep work.</div></div></div>`;
  await render(tile(440, 280, false), 440, 280, 'promo-small-440x280.png');
  await render(tile(1400, 560, true), 1400, 560, 'promo-marquee-1400x560.png');
  // Site screenshots (site/assets) + OG image
  const SITE = path.join(EXT, 'site/assets');
  await ev(() => chrome.storage.local.remove('license'));
  const raw = async (url, w, h, file) => { await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 }); await page.goto(url); await sleep(500); await page.screenshot({ path: path.join(SITE, file) }); };
  await raw(E('popup.html'), 360, 385, 'popup.png');
  await raw(E('blocked.html?d=youtube.com'), 640, 408, 'blocked.png');
  await raw(E('options.html'), 668, 1091, 'options.png');
  await render(tile(1200, 630, true), 1200, 630, 'og-tmp.png'); fs.renameSync(path.join(OUT, 'og-tmp.png'), path.join(SITE, 'og.png'));
  await browser.close();
})();
