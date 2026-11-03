# Chrome Web Store listing: FlowStayt

**Author / publisher:** Cameron Reece Allcock
**Name:** FlowStayt: Website Blocker for Deep Work  (39 chars; CWS limit 75)
**Version:** 0.2.2
**Category:** Productivity → Workflow & Planning (or "Productivity" if sub-categories are not offered)
**Language:** English
**Homepage:** https://cam2307.github.io/flowstayt/
**Privacy policy URL:** https://cam2307.github.io/flowstayt/privacy.html
**Support URL:** https://cam2307.github.io/flowstayt/

## Short description (≤132 chars)
Website blocker for deep work. Block distracting sites, run focus sessions and stay in flow. Private: nothing leaves your device.

## Full description
FlowStayt is a website blocker built for deep work. Block the sites that pull you out of flow, start a focus session, and get the important work done.

FREE
• Block any site in one click from the toolbar popup
• 25 and 50 minute focus sessions to protect deep work
• A calm "Stay in flow" page instead of the feed
• 7-day chart of the distractions you skipped
• Private by design: your lists and stats stay in Chrome storage on your device. No accounts, no tracking, no ads.

PRO ($3.99/month or $19.99/year)
• Schedules: block only during the days and hours you choose
• Password lock: protect settings from impulsive changes
• Allowlist-only mode: block everything except the sites you need
• Sync: your lists and schedule follow you through Chrome sync

Get FlowStayt Pro from the Options page and paste the license key you receive by email. Payments are handled by Lemon Squeezy; the extension only sends your license key to Lemon Squeezy to check it.

## Single purpose
FlowStayt has one purpose: helping the user avoid distracting websites by blocking sites they choose (manually, during focus sessions, or on a schedule).

## Permission justifications
- **storage:** Saves the user's block list, allowlist, schedule, focus-session end time, daily blocked counts, optional password hash and license status. Pro users' lists and schedule are mirrored to chrome.storage.sync so they follow the user across their own Chrome profiles.
- **declarativeNetRequest:** Creates dynamic rules that redirect top-level navigation to sites on the user's block list to the extension's own "blocked" page. Rules are evaluated by Chrome; the extension never reads page content or browsing history.
- **alarms:** Ends focus sessions on time, re-checks schedules every minute, and revalidates the Pro license once a day.
- **Host permissions (<all_urls>):** Needed so declarativeNetRequest redirect rules can apply to whichever sites the user chooses to block (the list is user-defined and can contain any domain), and so the blocked page can be shown on those sites. No content scripts are injected and no page data is read.
- **Remote code:** No. All code is packaged in the extension.

## Data usage disclosures (Privacy practices tab)
- Collects: **none** of the listed categories (no personally identifiable info, health, financial, authentication, personal communications, location, web history, user activity or website content is collected or transmitted to the developer).
- Note for reviewers: if a user buys Pro, the license key they enter is sent to Lemon Squeezy's License API (api.lemonsqueezy.com) to activate/validate it. No browsing data is sent.
- Certify: data is not sold to third parties; not used or transferred for purposes unrelated to the single purpose; not used for creditworthiness or lending.

## Assets (this folder)
- Icon 128x128: ../icons/icon128.png
- Screenshots 1280x800: screenshot-1-popup.png, screenshot-2-blocked.png, screenshot-3-options.png, screenshot-4-pro.png, screenshot-5-focus.png
- Small promo tile 440x280: promo-small-440x280.png
- Marquee promo tile 1400x560: promo-marquee-1400x560.png
- Regenerate: `cd tests && xvfb-run -a node store-shots.js`

## Distribution
Visibility: Public. Regions: all. Pricing in store: Free (Pro is sold outside the store via Lemon Squeezy; in-app payments through the store no longer exist).
