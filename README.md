# Kodingu

Kodingu is a free, static learning site for HTML, CSS, and JavaScript. Each lesson explains one idea, then asks you to write code in the browser, run it, and pass a set of checks.

**Live site:** [https://kodingu.pages.dev/](https://kodingu.pages.dev/)

There is no account, backend, or AI tutor. Progress, drafts, and preferences stay in `localStorage` on the current browser. No code is uploaded.

## Contents

- **3 open courses:** HTML, CSS, and JavaScript.
- **66 lessons:** 32 HTML, 19 CSS, and 15 JavaScript.
- **1,695 lesson XP:** 815 HTML, 490 CSS, and 390 JavaScript.
- **4 guided projects:** a recipe page, a reading room, a field notes counter, and a small studio page.
- **6 extra challenges:** two HTML, two CSS, and two JavaScript.
- **615 practice XP:** 430 from guided projects and 185 from extra challenges.
- **In-browser editor:** live preview, run controls, automated checks, hints, and solutions.
- **Progress and rewards:** XP, tokens, daily missions, streak freezes, freeze chests, weekly league, history, and course certificates.
- **Light and dark themes:** responsive layouts, keyboard controls, and reduced-motion support.
- **Offline after the first visit:** a service worker caches the pages, styles, and scripts.

## Stack

Plain HTML, CSS, and JavaScript with ES modules. No framework, build step, or runtime dependency ships with the site. Icons are generated from Reicon, and the three fonts load from Google Fonts. `package.json` exists only for local verification tooling.

The site runs in modern browsers with ES modules and service workers. Without a service worker it still works online; offline support is the extra layer.

## How it works

Kodingu keeps the learning loop in the browser:

1. A page shell loads `core/app.js`, the page controller, and the course data.
2. The controller reads the query string, finds the lesson, challenge, or project, and renders it.
3. The editor writes a preview into a sandboxed iframe. HTML checks parse the markup, CSS checks read the stylesheet and preview, and JavaScript checks run in a separate sandboxed frame.
4. A lesson is finished when its quiz is correct and every check passes. A challenge needs every check, and a project needs its self-check list.
5. Progress is written to `localStorage`. Learner data is not sent to a server.

`assets/js/data/course-index.js` is generated from the lesson data so list pages do not import every lesson module. Run `npm run course-index` after changing titles, minutes, or XP. The source of truth remains the files under `assets/js/data/`.

## Courses

| Course | Modules | Lessons | Lesson XP | What it covers |
| --- | ---: | ---: | ---: | --- |
| HTML | 8 | 32 | 815 | Document structure, headings, paragraphs, links, lists, images, quotations, code, figures, semantic sections, forms and native validation, tables, ids, classes, comments, metadata and search, Open Graph, JSON-LD, responsive images, video and captions, landmarks, iframes, canvas, SVG, characters and file paths, and a capstone page. |
| CSS | 4 | 19 | 490 | Rules, selectors, the cascade, color and contrast, typography, the box model, flexbox, grid, responsive layout, custom properties, positioning, motion, borders and shadows, interaction states, box sizing, overflow, object-fit, and fluid type. |
| JavaScript | 4 | 15 | 390 | Values, variables, functions, conditions, loops, DOM updates, events, objects, array methods, error handling, types and strict equality, closures, classes, JSON, async, and a small interactive page. |

Every course lesson has a quiz and a code challenge. A lesson is complete when the quiz is correct and every challenge check passes.

## Practice

### Guided projects

There are four projects. Each one opens in a single-file workspace with a preview, a download button, build steps, and a manual self-check list.

| Project | Language | Focus |
| --- | --- | --- |
| A recipe page | HTML | Semantic structure, lists, an aside, and a same-page link. |
| A reading room | CSS | Measure, line height, quotation styling, and a narrow-screen step. |
| A field notes counter | JavaScript | State, event handlers, plural labels, and an honest reset. |
| A small studio page | HTML, CSS, and JavaScript | A responsive page with a skip link, focus styles, and one interaction. |

Projects are practice, not a course requirement. They add XP and tokens, and the checks are manual because a finished page is more than a passing test.

### Extra challenges

Six short challenges sit outside the courses:

- HTML: a session card and a data table.
- CSS: a ticket stub and a responsive quote.
- JavaScript: a tab switcher and a word count.

Challenges use the same editor and checks as lessons. They add XP and tokens without changing course progress or certificates.

## Progress and rewards

A lesson or challenge adds 10 tokens; a project adds 20. Daily missions award more tokens. Forty tokens buy a streak freeze, which covers one missed day, and up to three freezes can be held.

The weekly league measures your own XP since Monday against fixed thresholds. It is not a public leaderboard. Certificates are printable local records, not verified credentials.

## Using the site

1. Open the live site or run it locally.
2. Open the catalog and choose a course. HTML is the recommended starting point.
3. Read the lesson, answer the quiz, then write your code in the editor.
4. Use **Run** to refresh the preview and **Check** to test your work.
5. Finish the lesson when the quiz is correct and every check passes.
6. Open the progress page to see XP, tokens, missions, streak, league, history, and certificates.
7. Use the projects and extra challenges when you want a larger or different exercise.

The interface is in English. Nothing on the site requires an account, payment, or external editor.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page and working demo. |
| `catalog.html` | Course catalog. |
| `course.html` | Course detail, driven by `?course=`. |
| `lesson.html` | Lesson player, driven by `?course=` and `?lesson=`. |
| `practice.html` | List of extra challenges. |
| `challenge.html` | Challenge workspace, driven by `?challenge=`. |
| `projects.html` | List of guided projects. |
| `project.html` | Project workspace, driven by `?project=`. |
| `progress.html` | XP, streak, tokens, missions, league, history, and certificates. |
| `certificate.html` | Printable course certificate, driven by `?course=`. |
| `404.html` | Custom not found page. |

On Cloudflare Pages, page URLs are served without the `.html` extension. For example:

- `/course?course=css`
- `/lesson?course=html&lesson=html-01`
- `/project?project=project-recipe`
- `/challenge?challenge=extra-js-01`
- `/certificate?course=html`

## Project structure

```text
.
├── .editorconfig
├── .sonarcloud.properties     SonarCloud scope for course-data duplication
├── .gitignore
├── README.md                  Project overview and development guide
├── index.html                 Landing page
├── catalog.html               Course catalog
├── course.html                Course detail
├── lesson.html                Lesson player
├── practice.html              Extra challenge list
├── challenge.html             Challenge workspace
├── projects.html              Guided project list
├── project.html               Project workspace
├── progress.html              Progress, rewards, certificates
├── certificate.html           Printable certificate
├── 404.html                   Not found page
├── _headers                   Cloudflare Pages security headers
├── sw.js                      Offline cache worker
├── robots.txt                 Crawler rules and sitemap pointer
├── sitemap.xml                Generated list of public URLs
├── favicon.svg                Brand mark and favicon
├── assets/
│   ├── og-image.png           Generated 1200x630 share image
│   ├── css/
│   │   ├── base.css           Tokens, reset, typography, utilities
│   │   └── app.css            Components and page layouts
│   └── js/
│       ├── core/              Shared chrome, storage, progress, gamification, icons
│       ├── data/              Courses, projects, challenges, test helpers
│       ├── editor/            Editor workspace and sandbox runner
│       └── pages/             One controller per HTML page
├── scripts/
│   ├── dev-server.mjs         Local server that applies _headers
│   ├── verify.mjs             Data and browser verification harness
│   ├── audit-ui.mjs           Layout, contrast, and focus audit
│   ├── fetch-icons.mjs        Regenerate core/icons.js from Reicon
│   ├── make-favicon.mjs       Regenerate favicon.svg
│   ├── make-og-image.mjs      Regenerate the share image
│   ├── make-sitemap.mjs       Regenerate sitemap.xml from the course data
│   ├── make-course-index.mjs  Regenerate data/course-index.js from lesson data
│   └── series.mjs             Shared sequential task helper
├── docs/audits/               Historical design audit notes
├── DESIGN.md                  Visual direction and design log
├── AGENTS.md                  Notes for coding agents
├── package.json               Dev tooling only; the site ships no dependencies
└── package-lock.json          Locked tooling versions
```

The audit notes under `docs/audits/` are historical. Paths inside them describe the repository at the time of each audit.

## Run locally

ES modules and the security headers need an HTTP server. From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:4173/](http://localhost:4173/).

The dev server reads `_headers`, so the browser runs the same CSP as production, and it resolves `/lesson` to `lesson.html` the way Cloudflare Pages does. `PORT` and `HOST` override the defaults.

`python3 -m http.server 4173` also works for a quick look, but it ignores `_headers` and the extensionless URLs, so the security policy and the script runner cannot be tested that way.

## Verify

```bash
npm install
npx playwright install chromium
npm run verify
```

The harness starts the dev server, checks the content data (unique IDs, XP totals, quiz answers, check functions, previews) and the generated course index, then drives Chromium through every lesson, challenge, and project. It writes each documented solution into the editor, runs the checks, answers the quiz, finishes the work, and asserts the totals on the progress page. It also checks the CSP headers, the extensionless URLs, the offline worker, and the home demo.

`node scripts/verify.mjs --only=data` runs a single group. Groups: `data`, `headers`, `seo`, `unit`, `lessons`, `challenges`, `projects`, `pages`, `totals`, `offline`.

`npm run audit` runs a separate Chromium pass for layout, contrast, focus, and compact-control findings.

SonarCloud runs automatic analysis for pull requests. `.sonarcloud.properties` keeps course data and the generated index out of copy-paste detection because they share a deliberate schema; runtime code remains in the duplication metric.

Chromium needs system libraries. If it cannot start, run `npx playwright install-deps chromium` with an account that can install packages.

## Search and sharing

Every page carries a description, a canonical URL, Open Graph and Twitter tags, and a robots rule. The home page and catalog also carry JSON-LD (WebSite and an ItemList of Course). Course, lesson, project, challenge, and certificate pages rewrite the canonical URL, title, and description at runtime from the page path and the canonical origin.

- `assets/og-image.png` is the 1200x630 share image. Rebuild it with `npm run og-image`.
- `sitemap.xml` lists every public course, lesson, project, and challenge. Rebuild it with `npm run sitemap` after adding content.
- `robots.txt` points crawlers at the sitemap, and `404.html` is marked noindex.

Lessons are rendered in the browser, so a crawler that does not run JavaScript sees only the page shell. The metadata above lives in the HTML for that reason. Prerendering is the next step if search traffic matters more than the zero-build constraint.

## Deploy

The live site is deployed on Cloudflare Pages at [https://kodingu.pages.dev/](https://kodingu.pages.dev/).

To deploy the same static site, connect the repository to Cloudflare Pages with these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | Leave empty |
| Output directory | Repository root |

`_headers` adds the security policy. `sw.js` registers on HTTPS or localhost and provides the offline shell.

## Development workflow

1. Clone the repository and start the local server.
2. Create a branch for the change.
3. Edit the files and test the affected pages in the browser.
4. Commit and push the branch.
5. Merge to `main`. A connected Cloudflare Pages project deploys `main` automatically.

`npm run verify` is the main automated check. `npm run audit` adds a browser layout, contrast, and focus pass. Build, lint, and formatting steps do not exist.

## Adding or editing content

Course and lesson data live in `assets/js/data/`:

- `data.js`: course definitions and the first HTML module.
- `data-html-2.js`: HTML modules 2 to 4.
- `data-html-3.js`: HTML metadata, media, and landmarks.
- `data-html-4.js`: form groups, validation, iframes, canvas, SVG, and characters with paths.
- `data-css.js`: CSS foundations.
- `data-css-layout.js`: CSS layout lessons.
- `data-css-modern.js`: custom properties, positioning, and motion.
- `data-css-components.js`: borders, shadows, states, sizing, and fluid type.
- `data-js.js`: JavaScript lessons.
- `data-js-data.js`: objects, array methods, and error handling.
- `data-js-modern.js`: types, strict equality, closures, classes, JSON, and async.
- `data-projects.js`: guided projects.
- `data-challenges.js`: extra challenges.

A lesson has an `id`, title, estimated minutes, XP, objective, theory blocks, quiz, and challenge. Challenge tests receive `{ doc, raw, css }`:

- HTML lessons receive a parsed document and the source string.
- CSS lessons receive the stylesheet in `raw` and `css`, plus a preview document.
- JavaScript lessons run in a sandboxed runner frame.

After editing content, run `npm run course-index` so the catalog and progress pages see the new titles, minutes, and XP. Then start the local server and open the affected lesson or project. The browser is the test environment.

To regenerate the icon set from Reicon, run `npm run icons`. To rebuild the favicon from the Code icon, run `npm run favicon`. The scripts need Node 18 or newer.

## Local data

Kodingu stores these keys in `localStorage`:

- `kodingu.progress.v1`: XP, tokens, streak, missions, league, history, and completed work.
- `kodingu.theme`: the selected light or dark theme.
- `kodingu.draft.<lessonId>`: the current lesson draft.
- `kodingu.challengeDraft.<challengeId>`: the current challenge draft.
- `kodingu.projectDraft.<projectId>`: the current project draft.
- `kodingu.certificate.name`: the name used on a certificate.

Clear site data in the browser to remove progress, drafts, the theme, and the certificate name. **Reset progress** on the progress page clears XP, tokens, streak, missions, and completed work, but keeps drafts and the theme. There is no server copy to restore.

If the browser blocks local storage, progress stays in memory for the current page and is lost on reload.

## Accessibility

The site uses semantic landmarks, a skip link, visible focus styles, keyboard-operable controls, 44px mobile targets for primary controls, WCAG AA contrast checks, light and dark themes, and reduced-motion support.

## Credits and references

- Icons: [Reicon](https://reicon.dev) (MIT).
- Fonts: Shippori Mincho, Public Sans, and IBM Plex Mono, loaded from Google Fonts.
- Source: [eiaiproject/Kodingu](https://github.com/eiaiproject/Kodingu).
- Syllabus references: [MDN Web Docs](https://developer.mozilla.org/en-US/), [W3Schools](https://www.w3schools.com/).
- Design and copy rules: [anti-slop](https://github.com/miqdadbadjuber/anti-slop).
