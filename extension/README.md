# Focus Blocker (Chrome extension, Manifest V3)

Author: Cameron Reece Allcock

This folder is `extension/` in the repository. The public site (landing page, privacy policy, terms) is the repository root and is published at https://cam2307.github.io/focus-blocker/ .

A freemium website blocker for focused work. The free tier is a full blocker; Pro adds the features competitors paywall (password lock, schedules, allowlist mode, sync). Plain JS/HTML/CSS: no build step, no dependencies. No data leaves the device.

## Load it unpacked
1. Open `chrome://extensions` and switch on **Developer mode** (top right).
2. Click **Load unpacked** and select this folder. In a clone of the repository, that is `extension/` (the folder with `manifest.json`).
3. Pin the extension from the puzzle-piece menu.
After editing code, click the reload icon on the extension card.

## How to test (manual)
1. Popup: type `example.com`, click **Block**, then visit https://example.com. You should land on the "Stay focused" page.
2. Popup "Blocked today" goes up by 1 per blocked visit. Options shows the last 7 days.
3. Options: remove the site; the page loads again.
4. Focus session: click **25 min**; the popup shows "Focusing until ...". (During a session, blocking is forced on even outside a Pro schedule.)
5. Pro: in Options > Developer tick **Simulate Pro**. Set a schedule that excludes the current time and save: blocked sites load. Change it to include now: they are blocked again within a minute.
6. Pro password: set a password, reopen Options: it asks for the password. Blank password removes it.
7. Debugging: on `chrome://extensions` click "service worker" on the card for background logs; `chrome.declarativeNetRequest.getDynamicRules()` in that console shows the live rules.

## Automated end-to-end test
Requires Node 18+. Puppeteer downloads its own Chrome for Testing (branded Chrome 137+ ignores `--load-extension`).
From the repository root:

```
cd extension/tests
npm install
npm test                 # on a machine with a display
xvfb-run -a npm test     # on a headless Linux server
```
It loads the extension unpacked, serves fake `*.test` sites locally (no internet needed) and checks: block + redirect, stats, unblock, focus session, Pro password lock, schedule, allowlist-only mode, sync (and that free users don't sync). Exit code 0 = all passed.

## File map
| Path | Purpose |
|---|---|
| `manifest.json` | MV3 manifest. Permissions: storage, declarativeNetRequest, alarms; host access is needed for redirect rules. |
| `src/background.js` | Service worker. Builds block rules, focus timer alarms, schedule checks every minute, counts stats. |
| `src/licensing.js` | **Only** place deciding Pro (`isPro()`). Payment TODO lives here. |
| `src/common.js` | Shared defaults, domain normalising, schedule check, SHA-256 helper. |
| `popup.html`, `src/popup.js` | Toolbar popup: add sites, block current site, focus timer, today's count. |
| `options.html`, `src/options.js` | Full settings: blocklist, stats, Pro schedule, password lock, dev Pro toggle. |
| `blocked.html`, `src/blocked.js` | Page shown instead of a blocked site; logs the attempt. |
| `tests/e2e.js`, `tests/package.json` | Automated Puppeteer test (dev only; do not ship `tests/` in the store zip). |
| `styles.css` | Shared styles. |
| `icons/` | Placeholder icons 16/48/128 (replace before launch). |
| `docs/` | SPEC, TASKS (launch checklist), PROGRESS (log + next step), DISTRIBUTION. |

## Publish to the Chrome Web Store
1. Register at https://chrome.google.com/webstore/devconsole (one-off US$5 developer fee; verify the email and, if asked, identity/trader status).
2. Remove the "Simulate Pro" developer toggle (see docs/TASKS.md) and bump `version` in `manifest.json`.
3. Zip the folder contents excluding `tests/`, `docs/` and `.gitignore` (manifest.json at the zip root) and upload as a new item.
4. Listing assets: 128x128 icon, at least one 1280x800 (or 640x400) screenshot, a 440x280 small promo tile, short + full description, category Productivity.
5. Privacy tab: single-purpose statement ("Blocks websites the user chooses to help them focus"); justify each permission (storage = save settings; declarativeNetRequest = block/redirect sites; alarms = focus timer and schedules; host permissions = required to redirect any user-chosen site); data usage: declare that no user data is collected or transmitted; privacy policy URL: https://cam2307.github.io/focus-blocker/privacy.html (source: `privacy.html` at the repository root).
6. Submit for review (usually a few days; broad host access can lengthen it).

## Privacy note
Focus Blocker stores your blocklist, settings and daily counts only in your browser (chrome.storage). It does not collect, sell, or transmit browsing data. Pro sync uses your own Google account's Chrome sync for the blocklist, schedule, and allowlist. The public policy is https://cam2307.github.io/focus-blocker/privacy.html .
