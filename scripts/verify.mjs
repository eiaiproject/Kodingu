import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './dev-server.mjs';
import { runSeries } from './series.mjs';
import { courses, getAllLessons } from '../assets/js/data.js';
import { projects } from '../assets/js/data-projects.js';
import { extraChallenges } from '../assets/js/data-challenges.js';

const filters = process.argv
  .slice(2)
  .filter((argument) => argument.startsWith('--only='))
  .flatMap((argument) => argument.slice('--only='.length).split(','))
  .filter(Boolean);
const only = new Set(filters);
const wants = (group) => only.size === 0 || only.has(group) || only.has('all');

let checks = 0;
let failures = 0;

function pass(message) {
  checks += 1;
  console.log(`  ok    ${message}`);
}

function fail(message, detail = '') {
  checks += 1;
  failures += 1;
  const suffix = detail ? ` :: ${detail}` : '';
  console.log(`  FAIL  ${message}${suffix}`);
}

function assert(condition, message, detail) {
  if (condition) pass(message);
  else fail(message, detail);
}

const lessons = courses.flatMap((course) =>
  getAllLessons(course).map((lesson) => ({ course, lesson }))
);
const lessonFilter = process.argv
  .filter((argument) => argument.startsWith('--lesson='))
  .flatMap((argument) => argument.slice('--lesson='.length).split(','))
  .filter(Boolean);
const selectedLessons = lessonFilter.length
  ? lessons.filter(({ lesson }) => lessonFilter.includes(lesson.id))
  : lessons;
const everything = [
  ...lessons.map((entry) => entry.lesson),
  ...projects,
  ...extraChallenges
];

const EXPECTED_TOTALS = {
  html: { lessons: 26, xp: 665 },
  css: { lessons: 15, xp: 390 },
  js: { lessons: 11, xp: 290 }
};

function checkCatalog() {
  console.log('\nData integrity');

  const seen = new Set();
  const duplicates = [];
  for (const item of everything) {
    if (seen.has(item.id)) duplicates.push(item.id);
    seen.add(item.id);
  }
  assert(!duplicates.length, 'IDs are unique across lessons, projects, and challenges', duplicates.join(', '));
  assert(lessons.length === 52, `52 lessons in the catalog (found ${lessons.length})`);
  assert(projects.length === 4, `4 guided projects (found ${projects.length})`);
  assert(extraChallenges.length === 6, `6 extra challenges (found ${extraChallenges.length})`);

  let lessonXp = 0;
  for (const course of courses) {
    const list = getAllLessons(course);
    const xp = list.reduce((sum, lesson) => sum + lesson.xp, 0);
    lessonXp += xp;
    const expected = EXPECTED_TOTALS[course.id];
    assert(
      expected && list.length === expected.lessons && xp === expected.xp,
      `${course.title}: ${list.length} lessons and ${xp} XP`,
      expected ? `expected ${expected.lessons} and ${expected.xp}` : 'no expected total'
    );
  }
  assert(lessonXp === 1345, `lesson XP totals 1345 (found ${lessonXp})`);

  const projectXp = projects.reduce((sum, project) => sum + project.xp, 0);
  const challengeXp = extraChallenges.reduce((sum, challenge) => sum + challenge.xp, 0);
  assert(projectXp === 430, `project XP totals 430 (found ${projectXp})`);
  assert(challengeXp === 185, `challenge XP totals 185 (found ${challengeXp})`);
}

function lessonShapeProblems(lesson, language) {
  const problems = [];
  if (!lesson.title) problems.push('title');
  if (!lesson.objective) problems.push('objective');
  if (!lesson.minutes) problems.push('minutes');
  if (!lesson.xp) problems.push('xp');
  if (!Array.isArray(lesson.theory) || !lesson.theory.length) problems.push('theory');
  if (!lesson.quiz || !Array.isArray(lesson.quiz.options)) problems.push('quiz');
  if (lesson.quiz && !(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length)) {
    problems.push('quiz answer out of range');
  }
  if (!lesson.quiz?.explanation) problems.push('quiz explanation');
  if ((language === 'css' || language === 'js') && !lesson.preview) problems.push('preview');
  return problems;
}

function challengeShapeProblems(challenge) {
  const problems = [];
  if (!challenge.prompt) problems.push('challenge prompt');
  if (!Array.isArray(challenge.requirements) || !challenge.requirements.length) problems.push('requirements');
  if (!challenge.starter) problems.push('starter');
  if (!challenge.solution) problems.push('solution');
  if (!challenge.hint) problems.push('hint');
  if (!Array.isArray(challenge.tests) || !challenge.tests.length) problems.push('tests');
  for (const test of challenge.tests || []) {
    if (typeof test.run !== 'function') problems.push('a test has no run function');
    if (!test.label) problems.push('a test has no label');
  }
  return problems;
}

function checkLessonContent() {
  let tests = 0;
  for (const { course, lesson } of lessons) {
    const language = lesson.language || course.language || 'html';
    const challenge = lesson.challenge || {};
    const problems = [
      ...lessonShapeProblems(lesson, language),
      ...challengeShapeProblems(challenge)
    ];
    assert(!problems.length, `${lesson.id} is complete`, problems.join(', '));
    tests += (challenge.tests || []).length;
  }
  assert(tests === 255, `255 automated checks in lesson content (found ${tests})`);
  const challengeTests = extraChallenges.reduce((sum, challenge) => sum + challenge.tests.length, 0);
  assert(tests + challengeTests === 289, `289 checks across lessons and challenges (found ${tests + challengeTests})`);
}

function checkProjects() {
  for (const project of projects) {
    const problems = [];
    if (!project.starter) problems.push('starter');
    if (!project.steps?.length) problems.push('steps');
    if (!project.outcomes?.length) problems.push('outcomes');
    if (!project.requirements?.length) problems.push('requirements');
    if (!project.related?.length) problems.push('related');
    assert(!problems.length, `${project.id} is complete`, problems.join(', '));
  }
}

function challengeProblems(challenge) {
  return [
    !challenge.summary && 'summary',
    !challenge.starter && 'starter',
    !challenge.solution && 'solution',
    !challenge.hint && 'hint',
    challenge.language !== 'html' && !challenge.preview && 'preview',
    !challenge.tests?.length && 'tests',
    !['html', 'css', 'js'].includes(challenge.language) && 'language'
  ].filter(Boolean);
}

function checkChallenges() {
  for (const challenge of extraChallenges) {
    const problems = challengeProblems(challenge);
    assert(!problems.length, `${challenge.id} is complete`, problems.join(', '));
  }
}

function checkData() {
  checkCatalog();
  checkLessonContent();
  checkProjects();
  checkChallenges();
}

function waitForSummary() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      const node = document.querySelector('#checks-summary');
      const text = node ? node.textContent.trim() : '';
      if (/passed/.test(text)) resolve(text);
      else if (Date.now() - started > 25000) reject(new Error(`timed out, summary was "${text}"`));
      else setTimeout(poll, 60);
    };
    poll();
  });
}

async function openPage(page, base, path) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
}

async function setEditor(page, selector, value) {
  await page.$eval(
    selector,
    (editor, text) => {
      editor.value = text;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    },
    value
  );
}

async function runLesson(page, base, course, lesson) {
  await openPage(page, base, `/lesson.html?course=${course.id}&lesson=${lesson.id}`);
  await page.waitForSelector('#editor-code', { timeout: 15000 });
  await setEditor(page, '#editor-code', lesson.challenge.solution);
  await page.click('#check-code');
  const summary = await page.evaluate(waitForSummary);
  const failedLabels = await page.$$eval('.check-item.is-fail', (nodes) =>
    nodes.map((node) => node.textContent.replace(/\s+/g, ' ').trim())
  );
  const expected = `All ${lesson.challenge.tests.length} passed`;
  assert(summary === expected, `${lesson.id}: solution passes every check`, failedLabels.join(' | '));

  await page.check(`input[name="quiz"][value="${lesson.quiz.answer}"]`);
  await page.click('#quiz-check');
  await page.waitForSelector('.feedback.is-pass', { timeout: 5000 });
  pass(`${lesson.id}: quiz accepts the documented answer`);

  await page.click('#finish-lesson');
  await page.waitForSelector('#finish-panel.is-complete', { timeout: 5000 });
  pass(`${lesson.id}: finishes and records progress`);

  const violations = await page.evaluate(() => window.__cspViolations || []);
  assert(!violations.length, `${lesson.id}: no CSP violations`, violations.join(' | '));
}

async function runChallenge(page, base, challenge) {
  await openPage(page, base, `/challenge.html?challenge=${challenge.id}`);
  await page.waitForSelector('#challenge-editor', { timeout: 15000 });
  await setEditor(page, '#challenge-editor', challenge.solution);
  await page.click('#check-challenge');
  const summary = await page.evaluate(waitForSummary);
  const failedLabels = await page.$$eval('.check-item.is-fail', (nodes) =>
    nodes.map((node) => node.textContent.replace(/\s+/g, ' ').trim())
  );
  const expected = `All ${challenge.tests.length} passed`;
  assert(summary === expected, `${challenge.id}: solution passes every check`, failedLabels.join(' | '));

  await page.click('#finish-challenge');
  await page.waitForSelector('#finish-panel.is-complete', { timeout: 5000 });
  pass(`${challenge.id}: finishes and records progress`);
}

async function runProject(page, base, project) {
  await openPage(page, base, `/project.html?project=${project.id}`);
  await page.waitForSelector('#project-editor', { timeout: 15000 });
  const previewLength = await page.$eval('#project-frame', (frame) => frame.srcdoc.length);
  assert(previewLength > 200, `${project.id}: preview document is built`, `srcdoc length ${previewLength}`);
  const error = await page.$eval('#project-error', (node) => (node.hidden ? '' : node.textContent));
  assert(!error, `${project.id}: starter runs without a script error`, error);

  const boxes = await page.$$('.checklist input[data-check]');
  assert(boxes.length === project.requirements.length, `${project.id}: every requirement has a self-check`);
  await runSeries(boxes, (box) => box.check());
  await page.click('#finish-project');
  await page.waitForSelector('#finish-panel.is-complete', { timeout: 5000 });
  pass(`${project.id}: finishes with every self-check ticked`);
}

async function runUnitChecks(page, base) {
  await openPage(page, base, '/index.html');
  const streak = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/app.js', window.location.origin).href);
    const keyFor = (offset) => {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const base = { streak: 5, streakFreezes: 1 };
    return {
      today: app.getStreakState({ ...base, lastLessonDay: keyFor(0) }),
      yesterday: app.getStreakState({ ...base, lastLessonDay: keyFor(1) }),
      bridged: app.getStreakState({ ...base, lastLessonDay: keyFor(2) }),
      noFreeze: app.getStreakState({ ...base, streakFreezes: 0, lastLessonDay: keyFor(2) }),
      stale: app.getStreakState({ ...base, lastLessonDay: keyFor(3) })
    };
  });
  assert(streak.today.streak === 5 && !streak.today.protectedByFreeze, 'streak: a lesson today counts normally');
  assert(streak.yesterday.streak === 5 && !streak.yesterday.protectedByFreeze, 'streak: a lesson yesterday counts normally');
  assert(streak.bridged.streak === 5 && streak.bridged.protectedByFreeze, 'streak: a freeze bridging a gap is reported');
  assert(streak.noFreeze.streak === 0, 'streak: a gap without a freeze ends the streak');
  assert(streak.stale.streak === 0, 'streak: a three day gap ends the streak even with a freeze');

  const projectChecks = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/app.js', window.location.origin).href);
    const project = { id: 'unit-project', requirements: ['Alpha', 'Beta', 'Gamma'] };
    localStorage.setItem('kodingu.progress.v1', JSON.stringify({ projectChecks: { 'unit-project': [0, 2] } }));
    const migrated = app.getProjectChecks(project);
    const saved = app.toggleProjectRequirement(project, 'Beta', true);
    app.toggleProjectRequirement(project, 'Beta', false);
    // Once stored as text, a reordered requirement list keeps the same ticks.
    const afterEdit = app.getProjectChecks({
      id: 'unit-project',
      requirements: ['Gamma', 'Alpha', 'Beta']
    });
    localStorage.removeItem('kodingu.progress.v1');
    return { migrated, afterEdit, saved };
  });
  assert(
    projectChecks.migrated.join(',') === 'Alpha,Gamma',
    'project checks: legacy indexes migrate to requirement text',
    projectChecks.migrated.join(',')
  );
  assert(
    [...projectChecks.afterEdit].sort((a, b) => a.localeCompare(b)).join(',') === 'Alpha,Gamma',
    'project checks: reordering requirements keeps the same items ticked',
    projectChecks.afterEdit.join(',')
  );
  assert(
    projectChecks.saved.join(',') === 'Alpha,Beta,Gamma',
    'project checks: a new tick is stored by text',
    projectChecks.saved.join(',')
  );
}

async function checkPages(page, base) {
  const pages = [
    '/index.html',
    '/catalog.html',
    '/practice.html',
    '/projects.html',
    '/progress.html',
    '/certificate.html?course=html',
    '/404.html'
  ];
  await runSeries(pages, async (path) => {
    const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { state: 'attached', timeout: 10000 });
    const heading = (await page.textContent('h1'))?.replace(/\s+/g, ' ').trim() || '';
    assert(
      response?.status() === 200 && heading.length > 0,
      `${path} renders with an h1`,
      `status ${response?.status()}, heading "${heading}"`
    );
  });

  await page.goto(`${base}/404.html`, { waitUntil: 'domcontentloaded' });
  const emptyLinks = await page.$$eval('a', (links) =>
    links.filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label')).length
  );
  assert(emptyLinks === 0, 'no empty links on the 404 page', String(emptyLinks));

  await page.goto(`${base}/index.html`, { waitUntil: 'load' });
  await page.click('#demo-run');
  await page.waitForTimeout(150);
  const demo = await page.$eval('#demo-frame', (frame) => frame.srcdoc);
  assert(demo.includes('Hello, Kodingu'), 'home demo builds a preview from the editor');

  const heroWidth = await page.$eval('h1', (node) => node.getBoundingClientRect().width);
  assert(heroWidth > 200, 'home headline has a real layout box', `${Math.round(heroWidth)}px`);
}

async function checkProgressTotals(page, base) {
  await openPage(page, base, '/progress.html');
  await page.waitForSelector('.stat-value', { timeout: 10000 });
  const values = await page.$$eval('.stat-value', (nodes) =>
    nodes.map((node) => Number(node.textContent.trim()))
  );
  const [xp, streak, completedLessons, tokens] = values;
  assert(xp === 1960, `progress: 1960 XP after all lessons, challenges, and projects (found ${xp})`);
  assert(completedLessons === 52, `progress: 52 lessons complete (found ${completedLessons})`);
  assert(tokens === 660, `progress: 660 tokens earned (found ${tokens})`);
  assert(streak === 1, `progress: one day streak (found ${streak})`);

  const ready = await page.$$eval('.certificate-card.is-ready', (nodes) => nodes.length);
  assert(ready === 3, `progress: three certificates unlocked (found ${ready})`);

  const history = await page.$$eval('.history-card', (nodes) => nodes.length);
  assert(history === 50, `progress: history keeps the latest 50 entries (found ${history})`);

  await openPage(page, base, '/certificate.html?course=html');
  await page.waitForSelector('#certificate', { timeout: 10000 });
  await page.fill('#certificate-name', 'Test Learner');
  const enabled = await page.$eval('#print-certificate', (button) => !button.disabled);
  assert(enabled, 'certificate: unlocks and prints once a name is added');
  const name = await page.textContent('#certificate-name-display');
  assert(name.trim() === 'Test Learner', 'certificate: shows the typed name');
}

async function checkHeaders(base) {
  const response = await fetch(`${base}/lesson.html`);
  const csp = response.headers.get('content-security-policy') || '';
  assert(response.status === 200, 'dev server serves lesson.html');
  assert(csp.includes("script-src 'self' blob:"), 'CSP allows same-origin and blob scripts', csp);
  assert(!csp.includes("'unsafe-eval'"), 'CSP no longer allows unsafe-eval', csp);
  assert(response.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is applied');
  assert(response.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is applied');

  const extensionless = await fetch(`${base}/lesson?course=html&lesson=html-01`);
  const body = await extensionless.text();
  assert(
    extensionless.status === 200 && body.includes('id="main"'),
    'extensionless URLs resolve like Cloudflare Pages'
  );

  const missing = await fetch(`${base}/not-a-real-page`);
  assert(missing.status === 404, 'unknown paths return 404');
}

async function checkSeo(base) {
  const files = [
    'index.html',
    'catalog.html',
    'course.html',
    'lesson.html',
    'practice.html',
    'challenge.html',
    'projects.html',
    'project.html',
    'progress.html',
    'certificate.html',
    '404.html'
  ];

  await runSeries(files, async (file) => {
    const html = await (await fetch(`${base}/${file}`)).text();
    const required = [
      'name="description"',
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'name="twitter:card"',
      'name="robots"'
    ];
    if (file !== '404.html') required.push('rel="canonical"');
    const missing = required.filter((needle) => !html.includes(needle));
    assert(!missing.length, `${file}: description, social, and canonical tags`, missing.join(', '));
  });

  const notFound = await (await fetch(`${base}/404.html`)).text();
  assert(notFound.includes('noindex'), '404.html asks search engines not to index it');

  const png = await readFile(new URL('../assets/og-image.png', import.meta.url));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert(width === 1200 && height === 630, `share image is 1200x630 (found ${width}x${height})`);

  await runSeries(['index.html', 'catalog.html'], async (file) => {
    const html = await (await fetch(`${base}/${file}`)).text();
    const block = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    let valid = false;
    try {
      JSON.parse(block[1]);
      valid = true;
    } catch {
      // Invalid structured data is a failed check, not a page error.
      valid = false;
    }
    assert(valid, `${file}: JSON-LD parses`);
  });

  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert(locations.length === 70, `sitemap lists 70 URLs (found ${locations.length})`);

  const robots = await (await fetch(`${base}/robots.txt`)).text();
  assert(robots.includes('sitemap.xml'), 'robots.txt points at the sitemap');

  const broken = [];
  await runSeries(locations, async (location) => {
    const response = await fetch(location.replace('https://kodingu.pages.dev', base));
    if (response.status !== 200) broken.push(`${location} ${response.status}`);
  });
  assert(!broken.length, 'every sitemap URL resolves', broken.slice(0, 4).join(' | '));
}

async function checkOffline(base) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/index.html`, { waitUntil: 'load' });
  const registered = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 8000))
    ]);
    return Boolean(registration);
  });
  assert(registered, 'service worker registers');

  if (registered) {
    await page.waitForTimeout(300);
    await page.reload({ waitUntil: 'load' });
    const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
    assert(controlled, 'service worker controls the page after reload');
    const cached = await page.evaluate(async () => {
      const names = await caches.keys();
      if (!names.length) return 0;
      const cache = await caches.open(names[0]);
      return (await cache.keys()).length;
    });
    assert(cached >= 38, `offline shell is cached (${cached} entries)`);
  }
  await browser.close();
}

async function main() {
  if (wants('data')) checkData();

  const server = await startServer({ port: 0 });
  console.log(`\nServing ${server.url}`);

  if (wants('headers')) {
    console.log('\nDev server and headers');
    await checkHeaders(server.url);
  }

  if (wants('seo')) {
    console.log('\nSEO and sharing');
    await checkSeo(server.url);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    serviceWorkers: 'block',
    reducedMotion: 'reduce'
  });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' })
  );
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Not Found')) {
      pageErrors.push(message.text());
    }
  });
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });

  if (wants('unit')) {
    console.log('\nStreak and project-check units');
    await runUnitChecks(page, server.url);
  }

  const ranAll =
    (only.size === 0 || only.has('all') || wants('lessons')) &&
    (only.size === 0 || only.has('all') || wants('challenges')) &&
    (only.size === 0 || only.has('all') || wants('projects'));

  if (wants('lessons')) {
    console.log(`\nLessons (${selectedLessons.length})`);
    await runSeries(selectedLessons, ({ course, lesson }) => runLesson(page, server.url, course, lesson));
  }

  if (wants('challenges')) {
    console.log(`\nExtra challenges (${extraChallenges.length})`);
    await runSeries(extraChallenges, (challenge) => runChallenge(page, server.url, challenge));
  }

  if (wants('projects')) {
    console.log(`\nGuided projects (${projects.length})`);
    await runSeries(projects, (project) => runProject(page, server.url, project));
  }

  if (wants('pages')) {
    console.log('\nPages');
    await checkPages(page, server.url);
  }

  if (ranAll && wants('totals')) {
    console.log('\nProgress totals');
    await checkProgressTotals(page, server.url);
  }

  console.log('\nRuntime errors');
  const interesting = pageErrors.filter((message) => !/favicon|net::ERR_FAILED/.test(message));
  assert(!interesting.length, 'no page or console errors across the run', interesting.slice(0, 5).join(' | '));

  await browser.close();

  if (wants('offline')) {
    console.log('\nOffline support');
    await checkOffline(server.url);
  }

  await server.close();

  console.log(`\n${checks - failures}/${checks} checks passed.`);
  if (failures) {
    console.log(`${failures} failed.`);
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
  // A failure can leave the dev server listening, which keeps Node alive.
  setTimeout(() => process.exit(1), 250);
}
