# Progress log

## 2 Nov 2026 (SAST)
Built v0.1.0: full free tier (blocklist, redirect blocking, focus timer, stats), Pro gating via `isPro()`, working Pro password lock and schedules, placeholder icons and all docs. Manifest validated as JSON and JS syntax-checked. Not yet tested in a real Chrome browser.

**Exact next step:** load unpacked in Chrome stable and run every step of README "How to test"; log results here.

## 2 Nov 2026, 14:30 SAST
- Added Pro allowlist-only mode (catch-all redirect rule + higher-priority allow rules) with options UI.
- Added Pro sync: blocklist, schedule, allowlist mode/list mirrored to chrome.storage.sync both ways; free users never sync.
- Added `tests/e2e.js` (Puppeteer, Chrome for Testing, headful under xvfb). Result: 9/9 PASS. No bugs found in v0.1 features.

**Exact next step:** payments. Once Cameron creates an ExtensionPay (or Lemon Squeezy) account, implement the real check in `src/licensing.js`, wire the Upgrade button in `src/options.js`, and remove the Simulate Pro toggle.

## 2 Nov 2026, 14:30 SAST: flaky test fixed
- Cause (extension bug, not test timing): `applyRules()` could run twice at once (storage change listener + another trigger). Both read the old rules, then both tried to add rule id 1, and Chrome rejected it with "Rule with id 1 does not have a unique ID". Found on run 4 of 10 in "Pro: schedule blocks only inside set hours".
- Fix: `applyRules()` in `src/background.js` now queues calls so they run one at a time. The test helper `apply()` now waits for that queue instead of a fixed 300 ms sleep.
- Verified: 5 consecutive runs, 9/9 passed each time.

**Exact next step:** unchanged. Payments, once Cameron creates an ExtensionPay or Lemon Squeezy account.

## 3 Nov 2026, 11:30 SAST: real Lemon Squeezy licensing
- Lemon Squeezy (read via API): store "Focus Blocker" id **513390**, currency **USD**, https://focus-blocker.lemonsqueezy.com. Product "Focus Blocker Pro" id **1497337**, status published. Only ONE variant exists: id **2332239**, $3.99/month subscription, licence keys ON. Checkout: https://focus-blocker.lemonsqueezy.com/checkout/buy/88e0d077-9b7a-4962-a080-2c511aefc942. **No $19.99/year variant yet.**
- `src/licensing.js`: public License API (no secret). Activate checks meta.store_id/product_id (wrong product is released and refused). Stores `{key, instanceId, valid, status, lastOk}` in chrome.storage.local `license`. Daily `license` alarm revalidates; network errors keep Pro for 7 days since last good check; invalid/expired/disabled revokes.
- Options: licence field, Activate/Deactivate, status text, Upgrade buttons (yearly hidden until URL set). Popup: upgrade link for free users. Simulate Pro removed.
- Tests: Lemon Squeezy mocked by stubbing `fetch` via Puppeteer `evaluateOnNewDocument` (no user-reachable override). 15/15 passed, 3 runs in a row.
- The Lemon Squeezy API key lives only in Cameron's Lemon Squeezy dashboard (Settings > API); it is never in this repo or the extension, and the extension does not need it.

**Exact next step:** Cameron adds the yearly variant; set `LS.checkout.yearly`. Then real icons, store screenshots, manual run in regular Chrome with a test-mode key, Chrome Web Store submission once Google verifies him.

## 3 Nov 2026, 11:10 SAST: yearly plan
- Yearly is a SEPARATE product: product **1497359**, variant **2332267**, $19.99/year subscription, licence keys on. Checkout: https://focus-blocker.lemonsqueezy.com/checkout/buy/235bf292-34a0-496f-ac58-987410512230
- Monthly unchanged: product 1497337 / variant 2332239, $3.99/month.
- `LS.productIds` accepts both; store 513390 still required. Yearly Upgrade button now shown. Prices changed $29 -> $19.99/year everywhere. Tests: 17/17, 3 runs.

## 3 Nov 2026, 11:20 SAST: landing site redesign (local only, NOT yet pushed)
- Full copy of the site lives in `site/` (index.html, privacy.html, terms.html, site.css, assets/). To publish, copy these files to the repo root of Cam2307/focus-blocker (GitHub Pages serves main, /).
- Dark, restrained theme, one accent (#8b7cff; buttons #6a58e8, white text 5.0:1, muted text 8.4:1). Sections: hero with framed real screenshots, how it works, Free vs Pro table, pricing cards (Free / $3.99 month / $19.99 year with real Lemon Squeezy checkouts), privacy band, FAQ, footer. Chrome Web Store button still "Coming soon" (no link). No testimonials/counts.
- Privacy/terms restyled; only legal text change is the price $29 -> $19.99/year in terms.html.
- Checked at 1280px and 390px (no horizontal overflow). Screenshots: /workspace/focus-blocker-site-shots/.
- Blocker: the cursor-github connector has no file-write/commit tool, so neither the site nor the extension/ licensing code has been pushed. Push manually (git or GitHub web upload).
