# Product spec

> Naming: the product is now **FlowStayt**. The GitHub repo is now `Cam2307/flowstayt` (site: https://cam2307.github.io/flowstayt/). The local folder, zip name and Lemon Squeezy subdomain (focus-blocker.lemonsqueezy.com) intentionally stay `focus-blocker` for now; checkout links and licence checks are unchanged.

## Free (built and working)
- Blocklist: add from popup (typed or current tab), add/remove in options.
- Blocking via `chrome.declarativeNetRequest` dynamic rules, redirecting to `blocked.html` with a motivational message.
- Focus sessions: 25 or 50 minutes (`chrome.alarms`).
- Daily blocked-attempt stats (last 7 days) in `chrome.storage.local`.

## Pro (gated by `isPro()` in `src/licensing.js`)
| Feature | Status |
|---|---|
| Password lock on settings (SHA-256 hash stored locally) | Working |
| Schedules: block only on chosen days/times (overnight ranges OK) | Working |
| Allowlist-only mode: block every site except listed ones | Working |
| Sync of blocklist, schedule, allowlist via `chrome.storage.sync` (stats/password stay local; last write wins) | Working |
| Payment / license check | Working: Lemon Squeezy License API (store 513390; products 1497337 monthly, 1497359 yearly), daily revalidation, 7-day offline grace |

Note: the password lock protects the options page; the popup can only add sites, not remove them, so it cannot be used to bypass the lock. Disabling the extension in chrome://extensions remains possible (a Chrome limitation; same for competitors).

## Pricing (ASSUMPTION, unvalidated)
Pro: $3.99/month or $19.99/year via Lemon Squeezy (merchant of record). Positioned below BlockSite.

## Competitor context (from earlier research, Nov 2026)
- BlockSite and StayFocusd: about 1.7M users combined.
- BlockSite charges about $4-15/month and paywalls basics like the password lock; this is a common complaint.
- Our gap: fair price, generous free tier, privacy (no data leaves the device), no nagging.
