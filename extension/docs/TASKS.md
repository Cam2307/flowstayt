# Launch checklist

## Done
- [x] MV3 project skeleton, no build step
- [x] Blocklist (popup + options) with domain validation
- [x] declarativeNetRequest redirect to blocked page
- [x] Focus sessions 25/50 min
- [x] Daily stats
- [x] `isPro()` licensing module
- [x] Pro: password lock
- [x] Pro: schedules
- [x] Placeholder icons
- [x] Handoff docs
- [x] Pro: allowlist-only mode
- [x] Pro: sync via `chrome.storage.sync`
- [x] Automated e2e test (`tests/e2e.js`), 9/9 passing in Chrome for Testing
- [x] Fixed race in rule updates (duplicate rule ID); 5/5 consecutive runs pass 9/9

## To do
- [ ] Quick manual check in branded Chrome stable (README "How to test"); automated tests already pass in Chrome for Testing
- [ ] Payments (needs Cameron to create an ExtensionPay or Lemon Squeezy account): pick ExtensionPay or Lemon Squeezy, implement in `src/licensing.js` and the Upgrade button in `src/options.js`
- [ ] Remove the "Simulate Pro" developer toggle (options.html/options.js) or hide it behind a dev build
- [ ] Sync: handle quota errors gracefully (chrome.storage.sync ~100KB total, 8KB per item)
- [ ] Real icons (16/48/128) and branding/name check for trademark clashes
- [ ] Store listing: descriptions, keywords, 440x280 promo tile
- [ ] Screenshots (1280x800): popup, blocked page, options, schedule
- [x] Landing page with privacy policy URL and pricing (`index.html` at the repository root; https://cam2307.github.io/focus-blocker/ once Pages is enabled)
- [x] Privacy policy (`privacy.html`, effective 2 November 2026)
- [x] Terms (`terms.html`, effective 2 November 2026)
- [ ] Chrome Web Store developer account ($5) and submission
- [ ] Launch per docs/DISTRIBUTION.md
