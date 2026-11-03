# Launch checklist

> Naming: the product is now **FlowStayt**. The GitHub repo is now `Cam2307/flowstayt` (site: https://cam2307.github.io/flowstayt/). The local folder, zip name and Lemon Squeezy subdomain (focus-blocker.lemonsqueezy.com) intentionally stay `focus-blocker` for now; checkout links and licence checks are unchanged.

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
- [x] Automated e2e test (`tests/e2e.js`), now 17/17 passing (3 consecutive runs) in Chrome for Testing
- [x] Fixed race in rule updates (duplicate rule ID); 5/5 consecutive runs pass 9/9

## To do
- [ ] Cameron: rename the Lemon Squeezy store "Focus Blocker" and products "Focus Blocker Pro" (1497337, 1497359) to FlowStayt / FlowStayt Pro in the dashboard (IDs and checkout links stay the same)
- [ ] Trademark/name check for "FlowStayt"
- [ ] Quick manual check in branded Chrome stable (README "How to test"); automated tests already pass in Chrome for Testing
- [x] Payments: Lemon Squeezy licensing (monthly $3.99 product 1497337, yearly $19.99 product 1497359), licence UI + Upgrade buttons in options, upgrade link in popup
- [ ] Real purchase test with a Lemon Squeezy test-mode key in regular Chrome (steps: docs/TEST-PURCHASE.md)
- [ ] Push `site/` (dark redesign) to repo root and the extension code to `extension/`
- [x] Removed the "Simulate Pro" developer toggle
- [x] Sync: chunking under chrome.storage.sync quotas + local fallback notice (tests added, 19/19)
- [x] Real icons (16/32/48/128, dark theme)
- [ ] Branding/name check for trademark clashes
- [x] Store listing text (`store/listing.md`), 440x280 and 1400x560 promo tiles
- [x] Screenshots (1280x800) x5 in `store/`
- [x] Landing page with privacy policy URL and pricing (`index.html` at the repository root; https://cam2307.github.io/flowstayt/ once Pages is enabled)
- [x] Privacy policy (`privacy.html`, effective 2 November 2026)
- [x] Terms (`terms.html`, effective 2 November 2026)
- [ ] Chrome Web Store developer account ($5) and submission
- [ ] Launch per docs/DISTRIBUTION.md

## Submission checklist (when Google verification completes)
1. Test purchase per docs/TEST-PURCHASE.md passes in regular Chrome.
2. Upload v0.2.0 changes to the GitHub repo (see PROGRESS.md 3 Nov 14:10).
3. Developer Dashboard → New item → upload `focus-blocker.zip` (v0.2.2).
4. Store listing tab: paste from `store/listing.md`; upload icon128, 5 screenshots, small + marquee tiles; category Productivity.
5. Privacy tab: single purpose, permission justifications, data disclosures and privacy URL from `store/listing.md`; certify.
6. Distribution: Public, all regions, free. Submit for review (usually a few days; <all_urls> may add time).
7. After approval: replace the site's "Coming soon" button with the store link; start docs/DISTRIBUTION.md launch plan.
