# Kodingu

Kodingu is a static learning site for HTML, CSS, and JavaScript. It has no framework, no build step, and no server. Progress is stored in the browser with `localStorage`.

- Repository: https://github.com/eiaiproject/Kodingu
- SonarQube Cloud: https://sonarcloud.io/project/overview?id=eiaiproject_Kodingu

## Current state

Phase 1 through Phase 5 are complete. The current build includes:

- 20 HTML lessons, 12 CSS lessons, and 8 JavaScript lessons.
- 4 guided projects with a single-file workspace, preview, download, and manual self-check list.
- 6 extra challenges with automated checks outside the courses.
- Local XP, tokens, a weekly league, daily missions, streak freezes, history, and printable certificates.
- Light and dark themes, responsive layouts, keyboard controls, reduced-motion support, and CSP headers.
- Cloudflare Pages configuration with clean URLs and a static 404 page.

The course data totals 1,045 XP. Projects add 430 XP and 80 tokens. Extra challenges add 185 XP and 60 tokens. The site has no account, server sync, paywall, or AI tutor.

Phase 5 closes the current build plan. Further work is product work, not another numbered phase.

## Working rules

- Read `DESIGN.md` before changing UI or copy.
- Follow the antislop core and the relevant skill for UI, copy, accessibility, mobile layout, and code comments.
- All icons come from Reicon (MIT). Add new icons in `scripts/fetch-icons.mjs`, then run it.
- Do not add AI features. The product is deliberately without an AI tutor.
- Do not invent statistics, testimonials, users, or course content.
- Keep the site static. A new dependency or a build step needs a clear reason.
- Use Conventional Commits for changes.

## Structure

```text
.
├── index.html               Landing page
├── catalog.html             Course catalog
├── course.html              Course detail, driven by ?course=
├── lesson.html              Lesson player, driven by ?course= and ?lesson=
├── projects.html            Project library
├── project.html             Project workspace, driven by ?project=
├── practice.html            Extra challenge list
├── challenge.html           Challenge workspace, driven by ?challenge=
├── progress.html            Local progress, rewards, missions, certificates
├── certificate.html         Printable course certificate
├── 404.html                 Not found page
├── assets/
│   ├── css/base.css         Tokens, reset, typography, utilities
│   ├── css/app.css          Components and page layouts
│   └── js/
│       ├── app.js           Shared header, footer, progress, icons, previews
│       ├── data.js          Courses and the first HTML module
│       ├── data-helpers.js  Shared HTML, CSS, and text test helpers
│       ├── data-html-2.js   HTML modules 2 to 4
│       ├── data-css.js      CSS foundations
│       ├── data-css-layout.js CSS layout
│       ├── data-js.js       JavaScript lessons
│       ├── data-projects.js Project definitions
│       ├── data-challenges.js Extra challenge definitions and tests
│       ├── js-runner.js     JavaScript lesson and challenge runner
│       ├── home.js          Landing interactions
│       ├── catalog.js       Catalog rendering
│       ├── course.js        Course rendering
│       ├── lesson.js        Lesson player, editor, checks
│       ├── projects.js      Project library
│       ├── project.js       Project workspace, checklist, download
│       ├── practice.js      Extra challenge list
│       ├── challenge.js     Challenge workspace and checks
│       ├── gamification.js  Tokens, leagues, missions, weekly XP
│       ├── progress.js      Progress page
│       ├── certificate.js   Certificate page and print layout
│       ├── icons.js         Generated Reicon SVG paths
│       └── theme-init.js    Theme before first paint
├── scripts/
│   ├── fetch-icons.mjs      Regenerate icons.js from Reicon
│   └── make-favicon.mjs     Regenerate favicon.svg from the Code icon
├── _headers                 Cloudflare Pages headers
├── .gitignore               Local state and generated test artifacts
├── AGENTS.md                Agent instructions and antislop pointer
├── DESIGN.md                Visual direction and decision log
├── PHASE4.md                Rewards and certificate notes
├── PHASE5.md                Projects, practice, and deploy notes
└── favicon.svg
```

## Local development

ES modules need an HTTP server. From the project root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

The site has no package manager, no install step, and no build command. To test the Cloudflare Pages behavior, run:

```bash
npx wrangler pages dev . --port 4177
```

Cloudflare redirects `.html` requests to clean URLs. Test `/projects`, `/practice`, `/project?project=project-recipe`, and `/challenge?challenge=extra-js-02` as well as the `.html` forms.

## Verification

Check every JavaScript module for syntax errors:

```bash
for f in assets/js/*.js; do
  node --input-type=module --check < "$f" || exit 1
done
```

The browser checks are documented in `PHASE5.md`. The current pass covered:

- All 6 challenge solutions pass their 34 checks, and every starter fails at least one check.
- All 4 project starters render without a script error.
- 24 page checks at 390px and 1126px: no horizontal overflow, one `h1` per page, no duplicate IDs, no console errors, and no CSP violations.
- Controls on the 390px pass are at least 44px tall.
- Contrast across 11 pages in light and dark mode: no text below WCAG AA.
- Cloudflare Pages clean URLs return 200, `.html` URLs return 308, and `_headers` applies the CSP.
- Project download, challenge completion, project completion, and every workspace reset were exercised through the UI.

There is no automated test runner in the repository. The checks above use a headless browser against a local server. Do not describe Sonar analysis as a replacement for those UI checks.

## SonarQube Cloud

SonarQube Cloud Automatic Analysis is enabled for the `eiaiproject_Kodingu` project. The Sonar GitHub integration analyzes every push without a repository workflow, build step, or `SONAR_TOKEN` secret. The first analysis covers commit `3554cbb`.

The analysis reads the HTML, CSS, and JavaScript in the repository. It does not run the browser checks or upload coverage.

Do not add a CI scan while Automatic Analysis is enabled. Sonar rejects a CI scan with exit code 3 in that state. Change the analysis method in Sonar first, then add a workflow.

A SonarQube Cloud run does not prove that a lesson, project, or challenge works in a browser. Keep the browser checks for changes to lesson content, the editor, or progress.

## Deploy to Cloudflare Pages

The site is plain static files, so there is no build command.

1. In Cloudflare, open Workers & Pages, then Create, then Pages, then Connect to Git.
2. Pick the repository at https://github.com/eiaiproject/Kodingu.
3. Leave the build command empty.
4. Set the build output directory to `/` (the repository root).
5. Deploy.

For a direct upload, use the Pages dashboard or:

```bash
npx wrangler pages deploy . --project-name kodingu
```

`_headers` is applied automatically by Cloudflare Pages. The `404.html` file is served for unknown paths.

## Adding lessons

Lessons live in `assets/js/data.js` for the first HTML module, `assets/js/data-html-2.js` for the rest of HTML, `assets/js/data-css.js` for CSS foundations, `assets/js/data-css-layout.js` for CSS layout, and `assets/js/data-js.js` for JavaScript. A lesson has:

- `id`, `title`, `minutes`, `xp`
- `objective`
- `theory` blocks: `p`, `h3`, `code`, `note`, `list`
- `quiz` with options, answer index, and explanation
- `challenge` with prompt, requirements, starter, solution, hint, and tests

CSS lessons set `language: 'css'` and a `preview` HTML string. JavaScript lessons set `language: 'js'` and a `preview` document. The course can set the lesson language instead of repeating it.

Tests receive `{ doc, raw, css }`. For HTML, `doc` is a `DOMParser` document built from the learner's HTML and `raw` is the source string. For CSS, `raw` and `css` hold the learner's stylesheet, and `doc` is the preview document with those styles applied. CSS helpers accept an optional media query, so layout tests can check rules inside `@media` separately from the base rules.

For JavaScript, `doc` is the preview after the script runs, `error` holds the first runtime error, and `logs` holds console output. Each JavaScript check runs against a fresh copy of the document, so a click in one test does not leak into the next. The runner executes learner code with `new Function`, which is why `_headers` allows `'unsafe-eval'` in `script-src`. Code runs only in the browser, and preview iframes stay sandboxed.

Return `true` when the check passes.

## Progress and rewards

The key is `kodingu.progress.v1`. It stores XP, tokens, streak, freezes, completed lessons, completed projects, completed challenges, quiz results, project checks, history, daily mission claims, and recent activity. Clearing site data resets progress. There is no account and no server sync.

Tokens are earned from lessons, extra challenges, projects, and daily missions. A freeze chest costs 40 tokens and always gives one streak freeze, capped at three. The weekly league measures the learner's own XP since Monday; it is not a leaderboard and does not invent other learners.

A certificate opens when every lesson in a course is complete. It is a local, printable record, not a verified credential. The name on the certificate is stored under `kodingu.certificate.name`.

See `PHASE4.md` for the schema, token values, missions, and extension notes.

## Projects and extra practice

`projects.html` lists four guided builds. Each project opens one complete HTML file in a workspace, runs it in a sandboxed preview, and asks the learner to check a manual list. A project counts as finished only when every box is checked. The workspace can download the file, and drafts stay under `kodingu.projectDraft.<id>`.

`practice.html` lists six extra challenges. They use the same `{ doc, raw, css }` test contract as lessons, but live outside the courses. Challenge drafts stay under `kodingu.challengeDraft.<id>`.

Project and challenge completions add XP and tokens to the same local balance, appear in history, and count toward the weekly league. They do not change course progress or certificates. See `PHASE5.md` for data shapes, workspace behavior, and the extension guide.

## Phase plan

- Phase 1: foundation, landing, catalog, HTML module 1, lesson player, progress, XP, streak.
- Phase 2: HTML course complete, CSS foundations open.
- Phase 3: CSS layout complete, JavaScript course and test harness.
- Phase 4: local leagues, tokens, freeze chests, daily missions, streak freezes, certificates.
- Phase 5: four projects, six extra challenges, rewards integration, accessibility pass, and deploy pass. Complete.
