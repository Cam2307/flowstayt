# Test purchase: confirm Pro unlocks (about 5 minutes)

> Naming: the product is now **FlowStayt**. The GitHub repo is now `Cam2307/flowstayt` (site: https://cam2307.github.io/flowstayt/). The local folder, zip name and Lemon Squeezy subdomain (focus-blocker.lemonsqueezy.com) intentionally stay `focus-blocker` for now; checkout links and licence checks are unchanged.

Checked by API on 3 Nov 2026: the store's API key is in **test mode** and there are **no test licence keys or orders yet**. Lemon Squeezy cannot create a licence key directly by API; keys are only created by an order, so this needs one test checkout. Test mode never charges a real card.

1. Log in at https://app.lemonsqueezy.com and switch the **Test mode** toggle on (bottom left of the dashboard). Leave store settings as they are.
2. Open the test checkout. Easiest is Products → Focus Blocker Pro (or FlowStayt Pro once renamed) (monthly) → Share → copy the test-mode checkout link. (The live links in src/licensing.js may refuse test cards while the store is not activated.)
3. Pay with test card **4242 4242 4242 4242**, any future expiry (e.g. 12/34), any CVC (123), any name, your real email.
4. The receipt email (and Dashboard → Orders → the order → License keys) shows the licence key.
5. In your normal Chrome: `chrome://extensions` → Developer mode → Load unpacked → the unzipped focus-blocker folder (or reload it).
6. Right-click the icon → Options → paste the key → **Activate**. Expect "Pro active (key ending XXXX)" and the Schedule / Password / Allowlist section unlocked.
7. Click **Deactivate**: Pro locks again and the activation is released in Lemon Squeezy.
8. Optional: repeat with the yearly product (1497359).

If activation says "This key is not for FlowStayt Pro", the key's store/product IDs don't match 513390 / 1497337 / 1497359 in `src/licensing.js`.

Note: test-mode keys work against the same public License API, so this proves the real flow. Test orders don't appear in live mode.
