# Phase 5: projects, extra practice, and deploy

This document is the handoff for the Phase 5 work. It covers the project library, the extra challenge set, how both use local progress, and the final checks before deployment.

## What shipped

- A project library with four guided builds and one single-file workspace per project.
- A project page with build steps, a live preview, a download button, and a manual self-check list.
- Six extra challenges, two per language, with the same editor and automated checks used by lessons.
- Extra practice pages that show real completion counts and XP, not promotional totals.
- Project and challenge progress stored inside the existing local progress object.
- Project and challenge completions added to history, weekly league XP, tokens, and the header stats.
- Landing and catalog links into the project library and the practice set.
- Phase 5 checks for responsive layout, contrast, keyboard use, CSP, and Cloudflare clean URLs.

Projects and extra challenges do not change course progress or certificates. They are practice that adds XP and tokens.

## Pages and files

| File | Job |
|---|---|
| `projects.html` | Project library page shell. |
| `assets/js/projects.js` | Project list, status, and self-check progress. |
| `project.html` | One project workspace, driven by `?project=`. |
| `assets/js/project.js` | Project brief, workspace, download, checklist, and completion. |
| `practice.html` | Extra challenge list page shell. |
| `assets/js/practice.js` | Challenge groups, completion status, and summary. |
| `challenge.html` | One challenge workspace, driven by `?challenge=`. |
| `assets/js/challenge.js` | Challenge brief, editor, preview, checks, and completion. |
| `assets/js/data-projects.js` | Four project definitions and `getProject`. |
| `assets/js/data-challenges.js` | Six challenge definitions, tests, and `getChallenge`. |
| `assets/js/app.js` | Shared progress writes, project checks, preview builders, history labels. |
| `assets/js/progress.js` | History cards and links for lessons, projects, and challenges. |
| `assets/css/app.css` | Project rows, practice rows, checklist, workspace layout, and responsive rules. |

## Project data

A project is one complete HTML file. The learner edits the file in the browser and checks the result by hand.

```js
{
  id: 'project-recipe',
  title: 'A recipe page',
  language: 'HTML',
  level: 'Beginner',
  minutes: 45,
  xp: 80,
  tokens: 20,
  summary: 'One sentence for the library row.',
  description: 'A short brief shown on the project page.',
  outcomes: ['What the learner will practice.'],
  steps: [{ title: 'Step title', body: 'What to do.' }],
  requirements: ['A manual self-check item.'],
  related: [{ course: 'html', lesson: 'html-01', label: 'A page is a tree' }],
  starter: '<!DOCTYPE html>...'
}
```

The four projects are:

| Project | Language | XP | Tokens |
|---|---|---:|---:|
| A recipe page | HTML | 80 | 20 |
| A reading room | CSS | 100 | 20 |
| A field notes counter | JavaScript | 100 | 20 |
| A small studio page | HTML, CSS, and JavaScript | 150 | 20 |

### Why project checks are manual

A finished project is more than a passing selector test. It has copy, a layout that holds at a phone width, and behavior that needs a click. Kodingu cannot inspect a downloaded file, so the page asks the learner to open the preview and check each requirement. The completion button stays disabled until every box is checked.

The checklist is stored as indexes in `projectChecks[projectId]`. Checking a box saves immediately. A project is complete when every index from `0` to `requirements.length - 1` is present and the learner presses Finish.

## Extra challenge data

A challenge uses the same test contract as a lesson.

```js
{
  id: 'extra-html-01',
  language: 'html', // html, css, or js
  title: 'A session card',
  minutes: 12,
  xp: 30,
  tokens: 10,
  summary: 'One sentence for the practice row.',
  objective: 'What the learner should be able to do.',
  prompt: 'The brief.',
  requirements: ['A visible requirement.'],
  preview: '<article>...</article>', // CSS and JavaScript only
  starter: '<!-- starter code -->',
  solution: '<!-- one passing answer -->',
  hint: 'One useful nudge.',
  tests: [
    {
      label: 'What the check proves.',
      run: ({ doc, raw, css }) => true // return a boolean
    }
  ]
}
```

The six challenges are:

| Challenge | Language | XP | Checks |
|---|---|---:|---:|
| A session card | HTML | 30 | 6 |
| A data table | HTML | 30 | 6 |
| A ticket stub | CSS | 30 | 5 |
| A responsive quote | CSS | 30 | 6 |
| A tab switcher | JavaScript | 35 | 5 |
| A word count | JavaScript | 30 | 6 |

HTML checks receive a parsed `doc` and the `raw` source. CSS checks also receive `css`. JavaScript checks receive a fresh `doc` after the script runs, the first runtime `error`, and the `raw` source. A JavaScript challenge that changes the page runs against a new document for every check, so clicks do not leak between checks.

## Workspace behavior

All three workspaces share the same editor shape:

- Run builds the preview. `Ctrl+Enter` or `Cmd+Enter` also runs it.
- Check runs every requirement. `Ctrl+Shift+Enter` or `Cmd+Shift+Enter` also runs checks.
- Reset restores the starter and clears that draft.
- The editor saves a draft after 400ms of inactivity.

Storage keys:

| Key | Value |
|---|---|
| `kodingu.projectDraft.<projectId>` | The full project HTML. |
| `kodingu.challengeDraft.<challengeId>` | The full challenge source. |
| `kodingu.draft.<lessonId>` | Lesson drafts, unchanged from Phase 3. |

The project workspace uses `buildProjectPreview`. It extracts inline styles and inline scripts, runs the script once against a detached document, and puts the result into a sandboxed iframe. The download button creates a Blob from the editor contents and saves it as `<projectId>.html`.

The challenge workspace uses `buildPreviewDocument` with the challenge language. CSS challenges inject the learner's stylesheet into the provided preview markup. JavaScript challenges run the learner's script against the provided preview markup.

## Progress and rewards

`kodingu.progress.v1` gains:

| Field | Shape | Meaning |
|---|---|---|
| `completedChallenges` | object | `id -> { at, xp, tokens }`. |
| `completedProjects` | object | `id -> { at, xp, tokens }`. |
| `projectChecks` | object | `projectId -> [checked indexes]`. |

`history` entries can now have `type: 'project'` or `type: 'challenge'`. The progress page labels them as Project or Extra practice and links back to the workspace. `getWeeklyXp` already includes both types, so project and challenge XP move the local weekly league. The header XP and token counts refresh through the existing `kodingu:progress` event.

Rewards:

- Completing a challenge adds its own XP and 10 tokens.
- Completing a project adds its own XP and 20 tokens.
- Completing the same item again does not pay twice.
- Extra practice does not change lesson completion, course percentages, or certificates.

## Adding a project

1. Add one object to `projects` in `assets/js/data-projects.js`.
2. Give it a unique `id`, a full `starter` HTML file, and at least four manual `requirements`.
3. Add `related` lesson links only when those lessons exist.
4. Open `projects.html` and the new project page. Check the starter preview, the download, and every checklist box.
5. Test the project at 390px and at desktop width.

Do not add automated checks to a project unless the requirement can be judged from the file alone. The current design keeps project checks manual on purpose.

## Adding a challenge

1. Add one object to `extraChallenges` in `assets/js/data-challenges.js`.
2. Add a starter that fails at least one test and a solution that passes all of them.
3. Keep test labels readable on their own. The label is the only explanation shown after a check.
4. For JavaScript, run any click or input inside the test and make sure the test works from a fresh document.
5. Run the data check in the verification section before opening the page.

## Verification

Static checks:

```bash
for f in assets/js/*.js; do node --input-type=module --check < "$f"; done
```

Data checks need a DOM for HTML and CSS tests. Run them in the browser, or use the same Playwright flow used during Phase 5. At minimum:

1. Open every challenge solution and confirm all checks pass.
2. Open every challenge starter and confirm at least one check fails.
3. Complete one challenge. Confirm XP, tokens, history, and the practice row status.
4. Check every box in one project. Confirm Finish stays disabled until the last box, then adds the project XP and 20 tokens once.
5. Download a project and confirm the file opens with its inline styles and script.
6. Reload a project and challenge page. Confirm the draft returns.
7. Reset a workspace. Confirm the starter returns and the draft is gone.
8. Open `progress.html` and confirm project and challenge history cards link to the right pages.
9. Check 390px, 720px, and 1126px. Look for horizontal overflow, a missing `h1`, duplicate IDs, and console errors.
10. Scan light and dark mode for text contrast below WCAG AA.
11. Load the site through `wrangler pages dev` and confirm clean URLs, CSP, fonts, and module imports.

## Cloudflare Pages

The site still has no build step. Use `/` as the output directory. `_headers` supplies the CSP and security headers. The CSP allows `'unsafe-eval'` because the JavaScript lesson runner uses `new Function`; learner code never leaves the browser.

Cloudflare turns `.html` URLs into clean URLs. Test `/projects`, `/project?project=project-recipe`, `/practice`, and `/challenge?challenge=extra-html-01`, not only the `.html` forms.

## Verification result

This pass recorded:

- All six challenge solutions pass their 34 checks. Every starter fails at least one check.
- All four project starters render in the workspace without a script error. One project was completed, downloaded, reopened, and reset.
- 24 page checks at 390px and 1126px: no horizontal overflow, one h1 per page, no duplicate IDs, no console errors, and no CSP violations. Controls on the 390px pass are at least 44px tall.
- Contrast scan across 11 pages in light and dark mode: no text below WCAG AA.
- Cloudflare Pages clean URLs return 200. `.html` URLs return a 308 to the clean URL. `_headers` applies the CSP and security headers.
- Lesson reset, challenge reset, and project reset clear their checks and disable Finish until the work passes again.

## Known limits

- No account, sync, or server-side progress.
- Project checks are manual. A checked box is the learner's own judgment.
- A project download is a static file. There is no build pipeline, package install, or asset bundling.
- JavaScript previews run scripts once. A page that only works after a second click needs to be tested by hand.
- Clearing site data removes drafts, project checks, XP, tokens, and history.
- Extra challenges are a fixed set. They are not generated, ranked, or timed.

## Handoff

Phase 5 closes the current build plan. The next real step is deployment, not another feature layer. If the project continues, the honest next additions are more projects, more extra challenges, or a verified account system. Do not add a leaderboard, streak pressure, paid tokens, or AI tutoring without a real data source and a matching design pass.
