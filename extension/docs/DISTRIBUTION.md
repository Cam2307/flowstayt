# Launch plan (short)

> Naming: the product is now **FlowStayt**. The GitHub repo, local folders, zip name, site URL (cam2307.github.io/focus-blocker) and Lemon Squeezy subdomain (focus-blocker.lemonsqueezy.com) intentionally stay `focus-blocker` for now; checkout links and licence checks are unchanged.
1. **Store listing SEO:** name/description keywords: "website blocker", "block sites", "focus", "productivity", "pomodoro", "StayFocusd alternative", "BlockSite alternative", "password protect". Ask happy users for reviews early.
2. **Reddit:** r/productivity, r/getdisciplined, r/nosurf, r/ADHD, r/chrome_extensions. Read each sub's rules first; many ban self-promotion or allow it only in set threads. Lead with value (how you beat doomscrolling), disclose you're the maker.
3. **Product Hunt:** launch once listing and landing page are polished; Tuesday-Thursday, prep a gallery and maker comment.
4. **SEO landing page:** one page plus posts like "Best free BlockSite alternative" and "How to block websites on Chrome with a password"; host the privacy policy there.
5. **Feedback loop:** in-extension feedback link; use it to validate pricing.

## Payments (Lemon Squeezy)
- Store: Focus Blocker (to be renamed FlowStayt), id 513390, USD, https://focus-blocker.lemonsqueezy.com (owner: Cameron Reece Allcock).
- Product: Focus Blocker Pro (to be renamed FlowStayt Pro), id 1497337 (published). Variant 2332239: $3.99/month, licence keys on.
- Monthly checkout: https://focus-blocker.lemonsqueezy.com/checkout/buy/88e0d077-9b7a-4962-a080-2c511aefc942
- Yearly is a separate product: id 1497359, variant 2332267, $19.99/year, licence keys on. Checkout: https://focus-blocker.lemonsqueezy.com/checkout/buy/235bf292-34a0-496f-ac58-987410512230
- The extension uses only the public License API. The Lemon Squeezy API key is only in Cameron's dashboard (Settings > API) and must never be committed or shipped.
- If the product is ever recreated, update `LS.storeId` / `LS.productIds` in `src/licensing.js` or every key will be rejected.

## Store submission kit (ready 3 Nov 2026)
- Listing text, permissions, privacy answers: `store/listing.md`. Images: `store/*.png`, icon `icons/icon128.png`.
- Package: `focus-blocker.zip` v0.2.0 (extension files only). Full checklist: docs/TASKS.md "Submission checklist".
- Before submitting: do the test purchase in docs/TEST-PURCHASE.md.
