# Contributing to Kodingu

Thanks for helping. Kodingu is a static learning site: plain HTML, CSS, and ES modules, with no build step and no runtime dependencies. Keep it that way.

## Before you start

- For a bug, open an issue with the page URL and what you expected.
- For a security problem, do not open a public issue. Follow [SECURITY.md](SECURITY.md).
- For a lesson correction, include the lesson ID and the sentence, quiz answer, or check that is wrong.

## Local setup

Node.js 22 or newer is required.

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). The dev server applies `_headers`, so the CSP and sandboxed editor behave like production.

## Checks

Run these before opening a pull request:

```bash
npm run lint
npm run verify
npm run audit:ui
npm run audit:deps
```

`npm run verify` drives Chromium through every lesson, challenge, project, and page. It is the main check. If it fails, fix the cause instead of loosening the check.

## Content changes

Lesson content lives in `assets/js/data/`. Do not edit `assets/js/data/course-index.js`, `assets/js/data/lessons/`, or `lessons/` by hand.

After changing lesson text, titles, minutes, XP, or checks:

```bash
npm run course-index
npm run pages
npm run sitemap
```

After changing the shell (HTML, CSS, JavaScript, fonts, or icons), bump `CACHE` in `sw.js`.

## Pull requests

- Keep the change focused and explain why it is needed.
- Include the checks you ran and any check you could not run.
- Commit generated files with their source change.
- Do not add a framework, bundler, build step, or runtime dependency.
- Keep progress storage compatible with `kodingu.progress.v1`; add a migration for schema changes.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are licensed under the project's MIT license.
