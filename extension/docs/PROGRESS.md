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

## 2 Nov 2026, 15:10 SAST
- Moved the extension into `extension/` so the repository root can serve the public site. Updated paths in `extension/README.md`, `extension/docs/DISTRIBUTION.md`, and the test run comment: load the unpacked extension from `extension/`, run tests with `cd extension/tests`, privacy policy at https://cam2307.github.io/focus-blocker/privacy.html .
- Added the static site at the repository root: `index.html` (product, screenshots of the real popup, blocked page, and settings, features, pricing, FAQ), `privacy.html`, `terms.html`, `site.css`, and empty `.nojekyll`. No build step.
- Privacy policy and terms are effective 2 November 2026. Contact is cameron@thelab.tech. Payments and refunds are described as Lemon Squeezy, the merchant of record. The store button is labelled “Coming soon to the Chrome Web Store” and does not link to a listing.
- `extension/.gitignore` ignores `node_modules/`.

**Exact next step:** enable GitHub Pages (Settings > Pages > Deploy from a branch > main, / (root)). Product work after that is still payments: once Cameron creates a Lemon Squeezy account, implement the check in `src/licensing.js` and remove the Simulate Pro toggle.
