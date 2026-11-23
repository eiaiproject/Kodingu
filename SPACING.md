# Spacing

Kodingu uses one spacing system on interactive pages and generated reading pages. Spacing should come from a token, not from a value invented inside a component. The tokens live at the top of `assets/css/base.css`; this file explains how to use them.

## Base scale

The scale is 4px-based. Every step except `--space-2` is a multiple of 4px.

| Token | rem | px | Use |
| --- | --- | --- | --- |
| `--space-1` | 0.25rem | 4 | Hairline gap, icon offset |
| `--space-2` | 0.375rem | 6 | Tight inline, metadata, compact control padding |
| `--space-3` | 0.5rem | 8 | Inline gap, small padding |
| `--space-4` | 0.75rem | 12 | Compact padding, control gap |
| `--space-5` | 1rem | 16 | Default component padding and gap |
| `--space-6` | 1.25rem | 20 | Card and panel padding |
| `--space-7` | 1.5rem | 24 | Block gap, list row gap |
| `--space-8` | 2rem | 32 | Section inner space, group gap |
| `--space-9` | 2.5rem | 40 | Large block |
| `--space-10` | 3rem | 48 | Section tier |
| `--space-11` | 4rem | 64 | Hero and large panel |
| `--space-12` | 5rem | 80 | Page tier |

All steps use `rem`, so they follow the reader's text-size setting.

## Layout rhythm

These tokens are the only fluid spacing values. Use them instead of adding a new `clamp()` in a component.

| Token | Range | Use |
| --- | --- | --- |
| `--gutter` | 20–40px | Horizontal page gutter |
| `--section-space-sm` | 32–48px | Footer, module, progress section, compact band |
| `--section-space` | 40–72px | Page head, course hero, method band, reading page |
| `--section-space-lg` | 56–104px | Hero bottom, closing, major page band |
| `--grid-gap-sm` | 16–40px | Dense rows, catalog, footer columns |
| `--grid-gap` | 24–64px | Twelve-column hero |
| `--grid-gap-lg` | 32–80px | Editorial split, course hero, lesson layout |
| `--header-height` | 64px | Sticky header and sidebar offsets |

The ranges are min/max at the responsive breakpoints, not fixed values at every width.

## Rules

1. Use tokens for `margin`, `padding`, `gap`, `inset`, and their logical variants. Do not add raw `px`, `rem`, or `em` spacing in component rules.
2. Fluid spacing belongs in the layout tokens. A component may use `clamp()` only when every bound is a token, as in `clamp(var(--space-6), 3vw, var(--space-8))`.
3. Use `gap` between siblings, `margin` for flow between blocks or centering, and `padding` for a component's internal space. Do not use margins to simulate a grid gap.
4. A page section uses one of the three section tiers. Do not create a fourth tier for one page; change the tier token if the rhythm is wrong.
5. Component defaults: padding `--space-5` or `--space-6`, stack gap `--space-5` or `--space-7`, inline gap `--space-2` or `--space-3`.
6. Values below 4px are optical corrections, not layout spacing. They are allowed only for icon/text baseline alignment or a tight label stack, and the rule should say why.
7. A negative offset that extends a hit area must net to zero with its padding, as in the catalog title.
8. Keep at least a 20px page gutter, 32px section padding, and 44px touch targets at 1024px and below or on coarse pointers.
9. Use logical properties (`margin-inline`, `padding-block`, `inset-inline`) for new rules.
10. Physical units are reserved for print (`16mm` page margin). Percentages used for positioning (`50%`, `100%`) are layout, not spacing.

## Component recipes

- Page shell: `.shell` applies `--gutter` and `--shell`.
- Major band: `.section` uses `--section-space-lg`.
- Page head: `.page-head` uses `--section-space` above and `--section-space-sm` below.
- Hero: `--section-space` above, `--section-space-lg` below, `--grid-gap` between columns.
- Editorial split: `--grid-gap-lg`.
- Dense row: `--grid-gap-sm`; vertical padding uses a token-bounded clamp.
- Card or panel: padding `--space-5` or `--space-6`, internal gap `--space-5`.
- List row: vertical padding `--space-5`, gap `--space-5`, border between rows.
- Inline icon and label: gap `--space-2` or `--space-3`.
- Sticky sidebar: `top: calc(var(--header-height) + var(--space-7))`; subtract the same total from `max-height`.

## Exceptions

These are the only raw spacing values in the stylesheets:

| Value | Where | Why |
| --- | --- | --- |
| `-1px` | `.sr-only` | Clipping technique, not layout |
| `0.1rem` | Sidebar and check icons | Text baseline alignment |
| `0.15rem` | Feedback icon, certificate meta, project step number | Optical alignment |
| `0.2rem` | Lesson nav, project steps, challenge index | Tight label stack |
| `16mm` | `@page` | Print margin |
| `50%`, `100%` | Toast, mobile nav | Positioning, not spacing |

Do not add to this table for a new layout. Use a token instead.

## Checking

`npm run audit:ui` checks overflow, asymmetric shells, grid gaps, line length, touch targets, contrast, and focus. There is no separate spacing linter, so review the source as well:

```bash
rg -n 'clamp\(' assets/css
rg -n '(margin|padding|gap|inset)[^:]*:\s*[0-9]' assets/css
```

The second command will show the documented exceptions above. Any other result is a spacing bug.
