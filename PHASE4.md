# Phase 4: rewards, league, and certificates

This document is the handoff for the Phase 4 gamification work. It covers what shipped, how the local economy works, where the data lives, and how to verify or extend it.

## What shipped

- Weekly local league based on XP earned since Monday.
- Tokens earned from lessons and daily missions.
- A freeze chest that trades 40 tokens for one streak freeze.
- Three daily missions with claimable token rewards.
- Automatic streak freeze use when exactly one day is missed.
- History cards for finished lessons and chest purchases.
- A printable certificate page for each completed course.
- A certificate link on completed course pages and on the progress page.

All of this is local to the browser. There is no account, server, leaderboard, or invented learner data.

## File map

| File | Job |
|---|---|
| `assets/js/gamification.js` | Pure rules: token values, league tiers, weekly XP, missions, mission progress. |
| `assets/js/app.js` | Progress schema, token awards, streak and freeze logic, mission claims, chest purchase, activity log. |
| `assets/js/progress.js` | Renders league, wallet, missions, courses, certificates, and history cards. |
| `assets/js/certificate.js` | Loads one course, checks completion, renders the certificate, saves the name, prints. |
| `certificate.html` | Certificate page shell. |
| `progress.html` | Section mounts for rewards, missions, certificates, and history. |
| `assets/css/app.css` | Reward cards, missions, history cards, certificate layout, and print rules. |

## Progress schema

The storage key is still `kodingu.progress.v1`. Phase 4 adds these fields:

| Field | Shape | Meaning |
|---|---|---|
| `tokens` | number | Spendable balance. |
| `streakFreezes` | number | Banked freezes, capped at 3 when buying a chest. |
| `chestsOpened` | number | Number of freeze chests opened. |
| `missions` | object | Claims keyed by local day, for example `{ "2026-10-31": { "claimed": ["visit-two"] } }`. |
| `activity` | array | Recent `visit` and `check` events, capped at 200. Used by missions. |

`completed[id]` entries now also store `tokens` earned for that lesson. Older entries without it still render because the lesson completion panel falls back to `TOKENS_PER_LESSON`.

### Migration

A progress file from Phase 3 has no token fields. On load, `getProgress()` gives the learner 10 tokens for every completed lesson already in `completed`. Once the progress object is saved, that computed balance becomes explicit. A stored `tokens: 0` is respected, so spending tokens does not trigger the migration again.

## Token economy

- Lesson completion: 10 tokens plus the lesson XP.
- Daily missions: 10, 10, and 15 tokens, for 35 tokens on a full day.
- Freeze chest: 40 tokens for one streak freeze.
- Freeze cap: 3.

The chest is deterministic. It always gives one freeze and never uses odds. If the balance is below 40 or all freeze slots are full, the button is disabled and the card explains why.

There is no token purchase, no real money, and no assumption that tokens have value outside this browser.

## Weekly league

`getWeeklyXp(history)` sums lesson XP from Monday 00:00 local time through now. `getLeague(xp)` maps it to:

| League | Weekly XP |
|---|---:|
| Paper | 0 |
| Cedar | 50 |
| Indigo | 120 |
| Vermilion | 250 |

The progress page shows the current league, weekly XP, and XP to the next league. It explicitly says the league measures the learner's own week, not other people. Do not add fake competitors to make it look social.

## Daily missions

`getDailyMissions(hasUnfinishedLessons)` returns three missions:

1. Open two different lessons today. Metric: unique `visit` activity for today.
2. Run the checks in two different lessons today. Metric: unique `check` activity for today.
3. Finish one lesson today, or, when every lesson is complete, run checks in three different lessons.

Each mission has a target and a token reward. Progress is computed from real `history` and `activity` entries. A claim is stored under the current local day key. Missions reset when the local date changes.

`recordActivity(type, lessonId)` deduplicates by type, lesson, and day. Opening the same lesson repeatedly does not inflate the mission count.

### Adding a mission

1. Add a definition in `getDailyMissions` with an `id`, `target`, `reward`, and `metric`.
2. If the metric is new, record it through `recordActivity` and add a branch in `getMissionProgress`.
3. Add a test that proves the solution can reach the target and that the claim only pays once.

## Streak freezes

A freeze covers exactly one missed day.

- If the previous lesson was yesterday, the streak grows by one.
- If the previous lesson was two days ago and a freeze is banked, one freeze is consumed and the streak grows by one.
- If more than one day was missed, the streak resets to one.
- `currentStreak` keeps showing the streak for a two-day gap while a freeze is available, so the learner can see that the freeze can still save it.

Freezes do not add days by themselves. They only prevent a reset at the next completion.

## Certificates

A certificate is available when `getCourseStats(course).percent === 100`.

The page:

- Rejects an unknown course with an empty state.
- Shows a locked state with progress and a continue link when the course is unfinished.
- Renders the course name, lesson count, XP total, and the latest completion date.
- Stores the learner's name under `kodingu.certificate.name`.
- Disables printing until a name is entered.
- Uses `window.print()` so the browser can print or save a PDF.
- Labels the result as a local record that Kodingu does not verify.

The certificate is not an accredited credential and has no verification code. Do not add a fake issuer, signature, or claim of verification.

## UI map

- Progress page: stats, weekly league, token wallet, freeze chest, daily missions, course progress, certificates, history cards.
- Course page: an `Open certificate` button appears at 100 percent.
- Lesson completion panel: shows XP and tokens, plus a certificate link when the whole course is complete.
- Header: XP, streak, and token count. The header stats hide below 1080px.
- Certificate page: name field, print button, certificate article, print styles.

## Verification

Static checks:

```bash
for f in assets/js/*.js; do node --input-type=module --check < "$f"; done
```

Pure rule checks can run with Node:

```bash
node --input-type=module -e "import('./assets/js/gamification.js').then((m) => console.log(m.getLeague(120)))"
```

Browser checks:

1. Clear `localStorage`.
2. Complete one lesson. Confirm +25 XP, +10 tokens, and a history card.
3. Open two lessons and run checks in two lessons. Claim both missions. Confirm the token balance rises once per claim.
4. Open the chest with a balance of at least 40. Confirm 40 tokens leave, one freeze is added, and a reward card appears in history.
5. Set `lastLessonDay` to two days ago and give the progress one freeze. Complete a lesson. Confirm the freeze is consumed and the streak does not reset.
6. Finish every lesson in one course and open `certificate.html?course=html`. Add a name. Confirm the print button enables.
7. Check the certificate at 390px and above, in light and dark mode.

## Known limits

- Everything is local. There is no cross-device sync.
- The league is a personal weekly measure, not a social leaderboard.
- Tokens cannot be purchased or transferred.
- The certificate is a local record, not a verified credential.
- Missions reset by the browser's local date, not a server time zone.
- Clearing site data removes progress, tokens, freezes, and the certificate name.

## Phase 5 handoff

Phase 5 is the projects, premium challenges, final accessibility pass, and deploy pass. The rewards engine is ready to attach project completion to XP and tokens, but do not add a new currency or a leaderboard without a real data source.
