# Kodingu

Kodingu is a learning site for HTML, CSS, and JavaScript. Lessons explain one idea, then ask you to write code in the browser, run it, and pass a set of checks. There is no video and no separate setup.

The site is free, has no account, no backend, and no AI tutor. Progress stays in the browser.

## Courses

All three courses are open.

- **HTML**: 20 lessons in four modules. Start with the shape of a page, then work through content, forms, tables, and page structure.
- **CSS**: 12 lessons in two modules. Learn selectors, the cascade, color, typography, the box model, flexbox, grid, and responsive layout.
- **JavaScript**: 8 lessons in two modules. Work with values, functions, conditions, loops, DOM updates, and events.

Every lesson ends with a quiz and a code challenge. A lesson is complete when the quiz is correct and every check passes. A certificate opens when all lessons in a course are complete.

## Practice

There are four guided projects: a recipe page, a reading room, a field notes counter, and a small studio page. Each project opens in a single-file workspace with a preview, a download button, and a manual checklist.

Six extra challenges sit outside the courses: two HTML, two CSS, and two JavaScript. They use the same editor and checks as lessons and add XP without changing course progress.

## Progress and rewards

XP, tokens, daily missions, streak freezes, recent history, and the weekly league are stored locally. The league measures your own XP since Monday; it is not a public leaderboard. Certificates are printable local records, not verified credentials.

Clearing site data removes progress and drafts. There is no account and no server sync.

## Stack

Plain HTML, CSS, and JavaScript with ES modules. No framework, no package manager, and no build step. Icons come from [Reicon](https://reicon.dev) (MIT). The interface has light and dark themes, responsive layouts, keyboard controls, and reduced-motion support.

## Run locally

ES modules need an HTTP server. From the project root:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/`.

## Deploy

Kodingu is a static site and can be hosted on Cloudflare Pages without a build command. Use the repository root as the output directory. Security headers and a custom 404 page are included.

Source: https://github.com/eiaiproject/Kodingu
