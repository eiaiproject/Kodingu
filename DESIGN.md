# Kodingu design direction

## What this is

Kodingu is a small, quiet learning workspace for the web. It teaches HTML, CSS, and JavaScript through short lessons that are read, written, and checked in the browser. There is no account, no paywall, and no AI tutor.

The current release opens all three courses: 32 HTML lessons, 19 CSS lessons, and 19 JavaScript lessons.

Design Read: a beginner coding school for quiet learners, in a Zen minimal Japanese-print style, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

## Audience

Beginners who want structure without noise. They may be learning on a phone between other tasks, or on a laptop after work. They need clear language, honest status, and a page that does not perform at them.

## Personality

Patient, precise, calm, and direct. Encouraging without cheerleading. The product should feel like a well-made workbook, not a game show.

## Visual language

Zen minimal with a Japanese accent. The accent is a vermilion seal, not a theme park. No torii gates, cherry blossoms, kanji decoration, or faux-Japanese typography. The restraint is the reference.

- **Paper:** `#F3EFE6` for the page, `#FAF7F0` for raised surfaces, `#EAE4D8` for sunken bands.
- **Sumi ink:** `#1F1D1A` for primary text, `#4A463F` for secondary text, `#6B655B` for meta text.
- **Vermilion seal:** `#B23A2F` for the single accent. It marks the brand, the active lesson, and the primary action. It does not color every icon, border, and heading.
- **Lines:** `#D6CFC2` for quiet rules, `#B9B0A1` for stronger borders.
- **Support colors:** `#2F6B4F` for passed checks, `#8A5A1F` for in-progress labels. Both are used only when they carry state.

Dark mode is a sumi inversion: `#191817` paper, `#F0EBE1` ink, `#E0604F` accent. It is a working theme, not a filter.

All contrast pairs were checked against WCAG AA before shipping. Normal text is at least 4.5:1; large text and UI boundaries are at least 3:1.

## Typography

- **Display: Shippori Mincho.** A Japanese Mincho face with Latin support. It gives headings the calm, printed quality of a workbook. It is not used for body text because long reading in a serif at UI sizes is slower here.
- **Body: Public Sans.** A neutral, highly legible sans with a plain voice. It keeps instructions and controls out of the way.
- **Code: IBM Plex Mono.** Distinct glyphs for `0/O`, `1/l/I`, and punctuation. Code is the subject, so the mono face is functional, not decorative.

No large monospace headings. No uppercase labels with wide tracking. Labels are sentence case.

## Layout

- Desktop uses a 12-column grid with an asymmetric hero: 6 columns of copy, 6 columns of product demo.
- Tablet collapses to a single column with the demo after the copy.
- Mobile uses one column, a compact header, and a collapsible lesson index. The editor and preview stack.
- Section spacing varies: the method band is tight and sunken, the catalog is open, the progress section is split. The rhythm is not one repeated centered stack.
- The lesson demo in the hero is the only content surface that lifts. It carries a shadow because it is the product proof, not decoration. The open mobile menu is an overlay, so it may also carry a shadow while it sits above the page.

## Motion

Dial: **ENERGY 1 / RHYTHM 2 / MOTION 1**.

Hover, focus, and state transitions only. 120 to 180ms. No scroll reveals, no parallax, no looping pulses. The product is a reading and writing surface, so motion stays out of the way.

## Iconography

All icons come from [Reicon](https://reicon.dev), MIT licensed. The set is used at 16 to 20px, outline weight. Icons appear only where they carry meaning: course, lesson, run, preview, hint, streak, XP, certificate, warning, and state.

The brand mark is the Reicon `Code` glyph in a vermilion square. It is a placeholder until the owner supplies a final logo. The favicon uses the same glyph.

No emoji. No hand-drawn SVG icons. No sparkle, star, magic, lightning, robot, or orb icons.

## Voice

Plain English. Short sentences. Address the learner as "you". Name the action and the result. Avoid em dashes, exclamation marks, and marketing vocabulary. No invented statistics, testimonials, customers, or claims.

Examples:

- "Start the HTML course" instead of "Get started".
- "Your progress stays in this browser" instead of "Sync everywhere".
- "The preview shows the page after your script runs" instead of "Live coding magic".

## What this design avoids

- Blue-purple gradients, glow, glass, and neon.
- Bento grids, three identical feature cards, three-step "How it works" sections, and fake terminal windows.
- Pill-shaped buttons, inputs, and cards. Radius is 2px for controls and 4px for surfaces.
- Decorative left stripes, status dots without state, and arrows on every button.
- Fake social proof, fake metrics, and fake people.
- AI vocabulary and AI features.

## Decision log

- **Paper and ink palette:** it supports long reading and gives the vermilion accent a quiet field to land on.
- **One accent:** the seal marks action and current state, so it stays meaningful.
- **Shippori Mincho for display:** it carries the Japanese print influence without turning the UI into costume.
- **Public Sans for body:** it keeps instructions plain and legible at small sizes.
- **Asymmetric hero:** the copy and the working lesson demo are different jobs, so they get different widths.
- **One content shadow:** the demo is the only content surface that needs to sit above the page. The mobile menu is an overlay and may lift while open.
- **No motif pattern:** the chosen direction is Zen minimal, so texture would add noise without meaning.
- **Working light and dark themes:** the product is content-first, so the reader gets the choice.
- **44px controls on mobile:** the audience may be learning on a phone between other tasks, so the primary controls need a comfortable target.
- **Empty and error states:** progress can be empty and a URL can be wrong, so both are designed instead of leaving a blank panel.
- **HTML before CSS:** a complete HTML course is more useful than three empty catalogs, so HTML opened first.
- **CSS foundations before layout:** selectors, the cascade, color, type, and the box model are the base for flexbox and responsive work, so they come first.
- **JavaScript runs in a sandboxed frame:** the learner's code can change a page and be checked without touching the site UI, and the main page never evaluates learner code.
- **A local league, not a leaderboard:** with no accounts, a leaderboard would have to invent other learners, so the league measures the reader's own week.
- **Deterministic freeze chest:** the chest always gives one freeze, so there are no odds, near-misses, or pressure to spend.
- **Certificates are local records:** the page prints a real record of finished work and says plainly that Kodingu does not verify it.
- **Projects use one file:** a project should be openable after download without a build step, so the workspace and the saved file stay the same HTML document.
- **Project checks are manual:** a finished page has copy, layout, and behavior that a selector test cannot judge, so the learner opens the preview and checks each requirement.
- **Extra challenges stay outside the courses:** optional practice should add XP and tokens without inflating course completion or certificate eligibility.
- **One workspace, three languages:** projects and challenges reuse the lesson editor, checks, and draft behavior, so the site has one interaction model to learn and maintain.
