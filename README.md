# Kodingu

Kodingu is a free, static learning site for HTML, CSS, and JavaScript. Each lesson explains one idea, then asks you to write code in the browser, run it, and pass a set of checks.

**Live site:** [https://kodingu.pages.dev/](https://kodingu.pages.dev/)

There is no account, backend, or AI tutor. Progress, drafts, and preferences stay in `localStorage` on the current browser. No code is uploaded.

## Contents

- **3 open courses:** HTML, CSS, and JavaScript.
- **40 lessons:** 20 HTML, 12 CSS, and 8 JavaScript.
- **1,045 lesson XP:** 515 HTML, 315 CSS, and 215 JavaScript.
- **4 guided projects:** a recipe page, a reading room, a field notes counter, and a small studio page.
- **6 extra challenges:** two HTML, two CSS, and two JavaScript.
- **615 practice XP:** 430 from guided projects and 185 from extra challenges.
- **In-browser editor:** live preview, run controls, automated checks, hints, and solutions.
- **Progress and rewards:** XP, tokens, daily missions, streak freezes, freeze chests, weekly league, history, and course certificates.
- **Light and dark themes:** responsive layouts, keyboard controls, and reduced-motion support.

## Stack

Plain HTML, CSS, and JavaScript with ES modules. No framework, package manager, or build step. Icons are generated from Reicon, and the three fonts load from Google Fonts.

## Courses

| Course | Modules | Lessons | Lesson XP | What it covers |
| --- | ---: | ---: | ---: | --- |
| HTML | 4 | 20 | 515 | Document structure, headings, paragraphs, links, lists, images, quotations, code, figures, semantic sections, forms, tables, ids, classes, comments, and a capstone page. |
| CSS | 2 | 12 | 315 | Rules, selectors, the cascade, color and contrast, typography, the box model, flexbox, grid, and responsive layout. |
| JavaScript | 2 | 8 | 215 | Values, variables, functions, conditions, loops, DOM updates, events, and a small interactive page. |

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
├── favicon.svg                Brand mark and favicon
├── DESIGN.md                  Visual direction and design log
├── AGENTS.md                  Notes for coding agents
├── assets/
│   ├── css/
│   │   ├── base.css           Tokens, reset, typography, utilities
│   │   └── app.css            Components and page layouts
│   └── js/
│       ├── app.js             Shared chrome, storage, progress helpers
│       ├── data.js            Course definitions and the first HTML module
│       ├── data-html-2.js     HTML modules 2 to 4
│       ├── data-css.js        CSS foundations
│       ├── data-css-layout.js CSS layout lessons
│       ├── data-js.js         JavaScript lessons
│       ├── data-projects.js   Guided projects
│       ├── data-challenges.js Extra challenges
│       ├── data-helpers.js    Shared test helpers
│       ├── gamification.js    Tokens, missions, league, freezes
│       ├── js-runner.js       JavaScript test runner
│       ├── runner-frame.js    Sandboxed runner frame
│       ├── icons.js           Generated Reicon icons
│       └── ...                Page scripts
├── scripts/
│   ├── fetch-icons.mjs        Regenerate icons.js from Reicon
│   └── make-favicon.mjs       Regenerate favicon.svg
└── anti-slop/                 Design audit notes
```

## Run locally

ES modules need an HTTP server. From the project root:

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173/](http://localhost:4173/).

Any static server works. There is no package installation, build command, or test runner to start.

## Deploy

The live site is deployed on Cloudflare Pages at [https://kodingu.pages.dev/](https://kodingu.pages.dev/).

To deploy the same static site:

1. Connect the repository to Cloudflare Pages.
2. Leave the build command empty. There is no build step.
3. Use the repository root as the output directory.
4. Deploy.

`_headers` adds security headers, and `404.html` provides the custom not found page.

## Development workflow

1. Clone the repository and start the local server.
2. Create a branch for the change.
3. Edit the files and test the affected pages in the browser.
4. Commit and push the branch.
5. Merge to `main`. A connected Cloudflare Pages project deploys `main` automatically.

There is no separate build, lint, or test command. The in-app checks are part of the lesson content.

## Adding or editing content

Course and lesson data live in `assets/js/data*.js`:

- `data.js`: course definitions and the first HTML module.
- `data-html-2.js`: HTML modules 2 to 4.
- `data-css.js`: CSS foundations.
- `data-css-layout.js`: CSS layout lessons.
- `data-js.js`: JavaScript lessons.
- `data-projects.js`: guided projects.
- `data-challenges.js`: extra challenges.

A lesson has an `id`, title, estimated minutes, XP, objective, theory blocks, quiz, and challenge. Challenge tests receive `{ doc, raw, css }`:

- HTML lessons receive a parsed document and the source string.
- CSS lessons receive the stylesheet in `raw` and `css`, plus a preview document.
- JavaScript lessons run in a sandboxed runner frame.

After editing content, start the local server and open the affected lesson or project. The browser is the test environment.

To regenerate the icon set from Reicon, run `node scripts/fetch-icons.mjs`. To rebuild the favicon from the Code icon, run `node scripts/make-favicon.mjs`. Both scripts need Node 18 or newer.

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

## Credits

- Icons: [Reicon](https://reicon.dev) (MIT).
- Fonts: Shippori Mincho, Public Sans, and IBM Plex Mono, loaded from Google Fonts.
- Source: [eiaiproject/Kodingu](https://github.com/eiaiproject/Kodingu).
