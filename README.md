# Focus Blocker

Chrome extension that blocks distracting websites, and the public website for it.

## Repository layout

- The site is the repository root: `index.html` (landing page), `privacy.html`, `terms.html`, and `site.css`. It is plain HTML and CSS, with no build step. `.nojekyll` is there so GitHub Pages serves the files as they are.
- The extension is in `extension/`: Manifest V3 source, `extension/README.md`, `extension/docs/` (SPEC, TASKS, PROGRESS, DISTRIBUTION), and Puppeteer tests in `extension/tests/`.

## Load the extension unpacked

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder (the one with `manifest.json`).
3. Pin Focus Blocker from the extensions menu.
4. After you change the code, click the reload icon on the extension card.

Manual checks are listed in `extension/README.md`.

## Run the tests

Requires Node 18+. Puppeteer downloads its own Chrome for Testing.

```bash
cd extension/tests
npm install
npm test                 # on a machine with a display
xvfb-run -a npm test     # on a headless Linux server
```

`extension/.gitignore` excludes `node_modules/`. Do not ship `extension/tests/` in a Chrome Web Store zip.

## Website

The site is published at https://cam2307.github.io/focus-blocker/ once GitHub Pages is enabled (Settings > Pages > Deploy from a branch > main, / (root)).

Privacy policy: https://cam2307.github.io/focus-blocker/privacy.html

Terms: https://cam2307.github.io/focus-blocker/terms.html
