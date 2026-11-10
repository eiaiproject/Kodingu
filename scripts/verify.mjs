import { readFile, readdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { collectHeaders, startServer } from './dev-server.mjs';
import { runSeries } from './series.mjs';
import { courses, getAllLessons } from '../assets/js/data/data.js';
import { courses as indexCourses } from '../assets/js/data/course-index.js';
import { projects } from '../assets/js/data/data-projects.js';
import { extraChallenges } from '../assets/js/data/data-challenges.js';
import { buildLessonPages, ORIGIN } from './make-pages.mjs';
import { buildLessonData } from './make-lesson-data.mjs';

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
  html: { lessons: 32, xp: 815 },
  css: { lessons: 19, xp: 490 },
  js: { lessons: 19, xp: 490 }
};

function heroCountsText() {
  const counts = courses.map((course) => {
    const count = getAllLessons(course).length;
    return `${count} ${course.title} ${count === 1 ? 'lesson' : 'lessons'}`;
  });
  const list = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  return `${list.format(counts)} are open now.`;
}

function courseIndexShape(list) {
  return list.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    status: course.status,
    level: course.level,
    language: course.language || null,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        minutes: lesson.minutes,
        xp: lesson.xp,
        language: lesson.language || null
      }))
    }))
  }));
}

function checkCourseIndex() {
  assert(
    JSON.stringify(courseIndexShape(courses)) === JSON.stringify(courseIndexShape(indexCourses)),
    'course index matches the full lesson data'
  );
}

function checkCatalog() {
  console.log('\nData integrity');

  const seen = new Set();
  const duplicates = [];
  for (const item of everything) {
    if (seen.has(item.id)) duplicates.push(item.id);
    seen.add(item.id);
  }
  assert(!duplicates.length, 'IDs are unique across lessons, projects, and challenges', duplicates.join(', '));
  assert(lessons.length === 70, `70 lessons in the catalog (found ${lessons.length})`);
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
  assert(lessonXp === 1795, `lesson XP totals 1795 (found ${lessonXp})`);

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
  assert(tests === 337, `337 automated checks in lesson content (found ${tests})`);
  const challengeTests = extraChallenges.reduce((sum, challenge) => sum + challenge.tests.length, 0);
  assert(tests + challengeTests === 371, `371 checks across lessons and challenges (found ${tests + challengeTests})`);
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

  const tableChallenge = extraChallenges.find((challenge) => challenge.id === 'extra-html-02');
  const counts = courses.map((course) => getAllLessons(course).length);
  const countText = `${counts[0]}, ${counts[1]}, and ${counts[2]}`;
  assert(
    tableChallenge?.prompt.includes(`HTML with ${counts[0]}, CSS with ${counts[1]}, and JavaScript with ${counts[2]}`),
    'extra-html-02: prompt counts match the course data'
  );
  assert(
    tableChallenge?.requirements.includes(`The lesson counts are ${countText}.`),
    'extra-html-02: requirement counts match the course data'
  );
  assert(
    tableChallenge?.solution.includes(`<td>${counts[2]}</td>`),
    'extra-html-02: solution counts match the course data'
  );
  assert(
    tableChallenge?.tests.at(-1)?.label === `The lesson counts are ${countText}.`,
    'extra-html-02: check label matches the course data'
  );
}

async function checkLessonDataModules() {
  const modules = buildLessonData();
  const existing = new Set(await readdir(new URL('../assets/js/data/lessons/', import.meta.url)));
  const problems = (
    await Promise.all(
      [...modules].map(async ([name, source]) => {
        try {
          const current = await readFile(
            new URL(`../assets/js/data/lessons/${name}`, import.meta.url),
            'utf8'
          );
          return current === source ? null : `stale ${name}`;
        } catch {
          return `missing ${name}`;
        }
      })
    )
  ).filter(Boolean);

  for (const name of existing) {
    if (name.endsWith('.js') && !modules.has(name)) problems.push(`orphaned ${name}`);
  }

  assert(
    !problems.length,
    `all ${modules.size} generated lesson data modules match the data`,
    problems.slice(0, 5).join(' | ')
  );
}

async function checkData() {
  checkCourseIndex();
  checkCatalog();
  checkLessonContent();
  checkProjects();
  checkChallenges();
  await checkLessonDataModules();
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
  if (lesson.id === 'js-01') {
    await page.evaluate(() => {
      window.__pendingCheck = null;
      const summary = document.querySelector('#checks-summary');
      const button = document.querySelector('#check-code');
      const capture = () => {
        if (
          summary?.textContent.trim() === 'Checking...' &&
          button?.disabled &&
          button.getAttribute('aria-busy') === 'true'
        ) {
          window.__pendingCheck = {
            summary: summary.textContent.trim(),
            disabled: button.disabled,
            busy: button.getAttribute('aria-busy')
          };
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(capture);
      if (summary) observer.observe(summary, { childList: true, characterData: true, subtree: true });
      if (button) observer.observe(button, { attributes: true, attributeFilter: ['disabled', 'aria-busy'] });
      capture();
    });
  }
  await page.click('#check-code');
  if (lesson.id === 'js-01') {
    await page.waitForFunction(() => window.__pendingCheck, { timeout: 2000 }).catch(() => {});
    const pending = await page.evaluate(() => window.__pendingCheck);
    assert(
      pending?.summary === 'Checking...' && pending?.disabled === true && pending?.busy === 'true',
      `${lesson.id}: Check shows a busy state while the runner works`,
      JSON.stringify(pending)
    );
  }
  const summary = await page.evaluate(waitForSummary);
  const failedLabels = await page.$$eval('.check-item.is-fail', (nodes) =>
    nodes.map((node) => node.textContent.replace(/\s+/g, ' ').trim())
  );
  const expected = `All ${lesson.challenge.tests.length} passed`;
  assert(summary === expected, `${lesson.id}: solution passes every check`, failedLabels.join(' | '));

  if (lesson.id === 'html-01') {
    await setEditor(page, '#editor-code', '<!DOCTYPE html><html lang="en"><body><h1>Changed</h1></body></html>');
    const resetSummary = await page.$eval('#checks-summary', (node) => node.textContent.trim());
    const finishDisabled = await page.$eval('#finish-lesson', (button) => button.disabled);
    assert(
      resetSummary === 'Not run' && finishDisabled,
      `${lesson.id}: editing after a pass clears the checks and disables finish`,
      `summary "${resetSummary}", disabled ${finishDisabled}`
    );
    await setEditor(page, '#editor-code', lesson.challenge.solution);
    await page.click('#check-code');
    const restored = await page.evaluate(waitForSummary);
    assert(restored === expected, `${lesson.id}: the solution passes again after an edit`, restored);
  }

  const wrongAnswer = (lesson.quiz.answer + 1) % lesson.quiz.options.length;
  await page.check(`input[name="quiz"][value="${wrongAnswer}"]`);
  await page.click('#quiz-check');
  await page.waitForSelector('.feedback.is-fail', { timeout: 5000 });
  const wrongFeedback = await page.$eval('.feedback.is-fail', (node) => ({
    text: node.textContent.replace(/\s+/g, ' ').trim(),
    role: node.getAttribute('role')
  }));
  const explanation = lesson.quiz.explanation.replace(/\s+/g, ' ').trim();
  assert(
    wrongFeedback.text.includes(explanation) && wrongFeedback.role === 'status',
    `${lesson.id}: a wrong quiz answer explains why and is announced`,
    JSON.stringify(wrongFeedback)
  );

  await page.check(`input[name="quiz"][value="${lesson.quiz.answer}"]`);
  await page.click('#quiz-check');
  await page.waitForSelector('.feedback.is-pass', { timeout: 5000 });
  pass(`${lesson.id}: quiz accepts the documented answer`);

  await page.click('#finish-lesson');
  await page.waitForSelector('#finish-panel.is-complete', { timeout: 5000 });
  pass(`${lesson.id}: finishes and records progress`);
  const finishFocus = await page.evaluate(() => document.activeElement?.id || '');
  assert(
    finishFocus === 'finish-heading',
    `${lesson.id}: focus moves to the completion heading`,
    `active element "${finishFocus}"`
  );

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
  await page.waitForFunction(
    () => (document.querySelector('#project-frame')?.srcdoc.length || 0) > 200,
    { timeout: 10000 }
  );
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
  await checkUnitLessonTracking(page);
  await checkUnitProgressTransfer(page);
  await checkUnitImportSanitizing(page);
  await checkUnitProgressDataControls(page, base);
  await checkUnitLessonEditor(page, base);
  await checkUnitProgressRecovery(page, base);
  await checkUnitProgressReset(page);
  await checkUnitHeader(page);
  await checkUnitStorageFallback(page);
}

async function checkUnitLessonTracking(page) {
  const streak = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const keyFor = (offset) => {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    return {
      today: app.getStreakState({ streak: 5, lastLessonDay: keyFor(0) }),
      yesterday: app.getStreakState({ streak: 5, lastLessonDay: keyFor(1) }),
      stale: app.getStreakState({ streak: 5, lastLessonDay: keyFor(2) })
    };
  });
  assert(streak.today.streak === 5, 'streak: a lesson today counts normally');
  assert(streak.yesterday.streak === 5, 'streak: a lesson yesterday counts normally');
  assert(streak.stale.streak === 0, 'streak: a gap ends the streak');

  const projectChecks = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
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

  const metrics = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const at = new Date().toISOString();
    const progress = {
      completed: { 'unit-a': { at, xp: '25' } },
      completedChallenges: { 'unit-b': { at, xp: 30 } },
      completedProjects: { 'unit-c': { at, xp: 80 } },
      history: []
    };
    return { today: app.getTodayCount(progress) };
  });
  assert(metrics.today === 1, `progress: today count reads completion dates (found ${metrics.today})`);

  const normalized = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    localStorage.setItem('kodingu.progress.v1', JSON.stringify({ xp: '100', streak: '2', completed: {} }));
    const progress = app.getProgress();
    localStorage.removeItem('kodingu.progress.v1');
    return {
      xp: progress.xp,
      streak: progress.streak,
      version: progress.version,
      hasTokens: Object.hasOwn(progress, 'tokens')
    };
  });
  assert(
    normalized.xp === 100 && normalized.streak === 2,
    'progress: stored numeric strings are normalized',
    JSON.stringify(normalized)
  );
  assert(
    normalized.version === 2 && !normalized.hasTokens,
    'progress: version 2 drops the token field',
    JSON.stringify(normalized)
  );
}

async function checkUnitProgressTransfer(page) {
  const transfer = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    localStorage.setItem('kodingu.progress.v1', JSON.stringify({ version: 0, xp: '40', completed: {} }));
    const upgraded = app.getProgress();
    const imported = await app.importProgressPayload({
      format: 'kodingu-progress',
      version: 1,
      progress: {
        xp: 75,
        tokens: 10,
        completed: { 'html-01': { at: new Date().toISOString(), xp: 25 } }
      },
      profile: { certificateName: 'Import Tester' }
    });
    let futureRejected = false;
    let formatRejected = false;
    let arrayRejected = false;
    try {
      await app.importProgressPayload({ format: 'kodingu-progress', version: 99, progress: {} });
    } catch (error) {
      futureRejected = true;
    }
    try {
      await app.importProgressPayload({ format: 'other', version: 1, progress: {} });
    } catch (error) {
      formatRejected = true;
    }
    try {
      await app.importProgressPayload({ format: 'kodingu-progress', version: 2, progress: [] });
    } catch (error) {
      arrayRejected = true;
    }
    const exported = app.createProgressExport();
    const result = {
      upgradedVersion: upgraded.version,
      upgradedXp: upgraded.xp,
      importedXp: imported.xp,
      savedName: localStorage.getItem('kodingu.certificate.name'),
      exportedVersion: exported.version,
      exportedXp: exported.progress.xp,
      exportedName: exported.profile.certificateName,
      futureRejected,
      formatRejected,
      arrayRejected
    };
    localStorage.removeItem('kodingu.progress.v1');
    localStorage.removeItem('kodingu.certificate.name');
    return result;
  });
  assert(
    transfer.upgradedVersion === 2 && transfer.upgradedXp === 40,
    'progress: unversioned legacy data migrates to version 2',
    JSON.stringify(transfer)
  );
  assert(
    transfer.importedXp === 25 && transfer.savedName === 'Import Tester',
    'progress: import restores work and recalculates XP',
    JSON.stringify(transfer)
  );
  assert(
    transfer.futureRejected && transfer.formatRejected,
    'progress: import rejects unknown formats and future versions',
    JSON.stringify(transfer)
  );
  assert(
    transfer.arrayRejected,
    'progress: import rejects an array as progress data',
    JSON.stringify(transfer)
  );
  assert(
    transfer.exportedVersion === 2 && transfer.exportedXp === 25 && transfer.exportedName === 'Import Tester',
    'progress: export includes the schema version, progress, and certificate name',
    JSON.stringify(transfer)
  );
}

async function checkUnitImportSanitizing(page) {
  const sanitized = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const at = new Date().toISOString();
    const imported = await app.importProgressPayload({
      format: 'kodingu-progress',
      version: 2,
      progress: {
        xp: 9999,
        completed: { 'html-01': { at, xp: 500 }, 'not-a-lesson': { at, xp: 500 } },
        completedChallenges: { 'extra-html-01': { at, xp: 500 }, 'not-a-challenge': { at, xp: 500 } },
        completedProjects: { 'project-recipe': { at, xp: 500 }, 'not-a-project': { at, xp: 500 } },
        history: []
      }
    });
    localStorage.removeItem('kodingu.progress.v1');
    return {
      xp: imported.xp,
      lessons: Object.keys(imported.completed),
      challenges: Object.keys(imported.completedChallenges),
      projects: Object.keys(imported.completedProjects)
    };
  });
  const expectedSanitizedXp =
    25 +
    extraChallenges.find((item) => item.id === 'extra-html-01').xp +
    projects.find((item) => item.id === 'project-recipe').xp;
  assert(
    sanitized.xp === expectedSanitizedXp,
    `progress: import recalculates XP from known work (found ${sanitized.xp})`
  );
  assert(
    sanitized.lessons.join(',') === 'html-01' &&
      sanitized.challenges.join(',') === 'extra-html-01' &&
      sanitized.projects.join(',') === 'project-recipe',
    'progress: import drops unknown lesson, challenge, and project IDs',
    JSON.stringify(sanitized)
  );

  const sanitizedLists = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const at = new Date().toISOString();
    const imported = await app.importProgressPayload({
      format: 'kodingu-progress',
      version: 2,
      progress: {
        streak: 9999,
        lastLessonDay: '2099-01-01',
        history: [
          null,
          { type: 'lesson', id: 'html-01', title: '<img src=x>', xp: '<img src=x>', at },
          { type: 'made-up', id: 'html-01', xp: 25, at },
          { type: 'lesson', id: 'not-a-lesson', xp: 25, at },
          { type: 'lesson', id: 'html-01', xp: 25, at: 'not-a-date' }
        ],
        activity: [
          null,
          { type: 'visit', lessonId: 'html-01', at },
          { type: 'visit', lessonId: 'not-a-lesson', at },
          { type: 'made-up', lessonId: 'html-01', at }
        ]
      }
    });
    localStorage.removeItem('kodingu.progress.v1');
    return {
      streak: imported.streak,
      lastLessonDay: imported.lastLessonDay,
      history: imported.history,
      activity: imported.activity
    };
  });
  assert(
    sanitizedLists.streak === 0 && sanitizedLists.lastLessonDay === null,
    'progress: import clears an impossible streak and a future date',
    JSON.stringify({ streak: sanitizedLists.streak, lastLessonDay: sanitizedLists.lastLessonDay })
  );
  assert(
    sanitizedLists.history.length === 1 &&
      sanitizedLists.history[0].id === 'html-01' &&
      sanitizedLists.history[0].xp === 25 &&
      sanitizedLists.history[0].title === 'A page is a tree',
    'progress: import drops malformed history and takes XP and title from the catalog',
    JSON.stringify(sanitizedLists.history)
  );
  assert(
    sanitizedLists.activity.length === 1 &&
      sanitizedLists.activity[0].lessonId === 'html-01',
    'progress: import drops malformed activity entries',
    JSON.stringify(sanitizedLists.activity)
  );
}

async function checkUnitProgressDataControls(page, base) {
  await page.evaluate(() => {
    localStorage.setItem(
      'kodingu.progress.v1',
      JSON.stringify({
        version: 2,
        history: [null],
        activity: [null],
        streak: 9999,
        lastLessonDay: '2099-01-01'
      })
    );
  });
  await openPage(page, base, '/progress.html');
  await page.waitForSelector('#reset-progress', { timeout: 10000 });
  const dataControls = await page.evaluate(() => ({
    exportButton: Boolean(document.querySelector('#export-progress')),
    importButton: Boolean(document.querySelector('#import-progress')),
    resetButton: Boolean(document.querySelector('#reset-progress')),
    historyCards: document.querySelectorAll('.history-card').length
  }));
  assert(
    dataControls.exportButton && dataControls.importButton && dataControls.resetButton,
    'progress: data controls stay attached when saved history is corrupt',
    JSON.stringify(dataControls)
  );
  assert(
    dataControls.historyCards === 0,
    'progress: corrupt history entries are not rendered',
    JSON.stringify(dataControls)
  );
  await page.evaluate(() => localStorage.removeItem('kodingu.progress.v1'));
}

async function checkUnitLessonEditor(page, base) {
  await openPage(page, base, '/lesson.html?course=js&lesson=js-01');
  await page.waitForSelector('#run-code', { timeout: 15000 });
  await setEditor(page, '#editor-code', 'const saved = 1;');
  await page.click('#run-code');
  const flushedOnRun = await page.evaluate(() => localStorage.getItem('kodingu.draft.js-01'));
  assert(
    flushedOnRun === 'const saved = 1;',
    'draft: running the preview saves the editor immediately',
    String(flushedOnRun)
  );

  await setEditor(page, '#editor-code', 'while (true) {}');
  const loopStarted = Date.now();
  await page.click('#check-code');
  await page.waitForFunction(
    () => {
      const error = document.querySelector('#script-error');
      return Boolean(error && !error.hidden && error.textContent.includes('did not finish'));
    },
    { timeout: 9000 }
  );
  const loopElapsed = Date.now() - loopStarted;
  const responsive = await page.evaluate(() => 1 + 1);
  assert(
    loopElapsed < 9000 && responsive === 2,
    'runner: an infinite loop is stopped without freezing the page',
    `${loopElapsed}ms`
  );
  await page.evaluate(() => localStorage.removeItem('kodingu.draft.js-01'));

  await page.route('**/assets/js/data/lessons/html-02.js', (route) => route.abort());
  await openPage(page, base, '/lesson.html?course=html&lesson=html-02');
  await page.waitForSelector('#lesson-main h1', { timeout: 10000 });
  const failedLoad = await page.evaluate(() => ({
    title: document.querySelector('#lesson-main h1')?.textContent.trim(),
    retry: Boolean(document.querySelector('#retry-lesson'))
  }));
  assert(
    failedLoad.title === 'Lesson could not load' && failedLoad.retry,
    'lesson: a failed data load is not reported as a missing lesson',
    JSON.stringify(failedLoad)
  );
  const retryRequest = page.waitForRequest(
    (request) => request.url().includes('/data/lessons/html-02.js'),
    { timeout: 10000 }
  );
  await page.click('#retry-lesson');
  await retryRequest;
  pass('lesson: Try again reloads the failed lesson');
  await page.unroute('**/assets/js/data/lessons/html-02.js');

  await openPage(page, base, '/lesson.html?course=html&lesson=html-01');
  await page.waitForSelector('#editor-code', { timeout: 15000 });
  const starter = await page.$eval('#editor-code', (editor) => editor.value);
  await setEditor(page, '#editor-code', '<p>unsaved draft</p>');
  // Navigate before the 400ms debounce fires; pagehide must flush the draft.
  await openPage(page, base, '/index.html');
  const flushedDraft = await page.evaluate(() => localStorage.getItem('kodingu.draft.html-01'));
  assert(
    flushedDraft === '<p>unsaved draft</p>',
    'draft: navigating away flushes the editor before the debounce',
    String(flushedDraft)
  );

  await openPage(page, base, '/lesson.html?course=html&lesson=html-01');
  await page.waitForSelector('#editor-code', { timeout: 15000 });
  await setEditor(page, '#editor-code', '<p>keep this</p>');
  let askedToReset = false;
  page.once('dialog', async (dialog) => {
    askedToReset = true;
    await dialog.dismiss();
  });
  await page.click('#reset-code');
  const afterDismiss = await page.$eval('#editor-code', (editor) => editor.value);
  page.once('dialog', (dialog) => dialog.accept());
  await page.click('#reset-code');
  const afterAccept = await page.$eval('#editor-code', (editor) => editor.value);
  assert(
    askedToReset && afterDismiss === '<p>keep this</p>' && afterAccept === starter,
    'draft: reset asks before discarding unsaved code',
    `asked ${askedToReset}, kept "${afterDismiss}", reset "${afterAccept.slice(0, 24)}"`
  );
  await page.evaluate(() => localStorage.removeItem('kodingu.draft.html-01'));
}

async function checkUnitProgressRecovery(page, base) {
  await page.evaluate(() => localStorage.setItem('kodingu.progress.v1', '{not json'));
  await openPage(page, base, '/progress.html');
  await page.waitForSelector('#data-status', { timeout: 10000 });
  const readError = await page.$eval('#data-status', (node) => ({
    text: node.textContent.trim(),
    isError: node.classList.contains('is-error')
  }));
  assert(
    readError.isError && readError.text.includes('could not be read'),
    'progress: an unreadable saved record is reported',
    JSON.stringify(readError)
  );

  const recovery = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const exported = app.createProgressExport();
    return {
      error: app.getProgressReadError(),
      raw: exported.recovery?.raw,
      xp: exported.progress.xp
    };
  });
  assert(
    recovery.raw === '{not json' && recovery.xp === 0,
    'progress: export keeps the unreadable record under recovery.raw',
    JSON.stringify(recovery)
  );

  const preserved = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    localStorage.setItem('kodingu.progress.v1', '{not json');
    app.recordActivity('visit', 'html-01');
    return {
      backup: localStorage.getItem('kodingu.progress.corrupt.v1'),
      stored: localStorage.getItem('kodingu.progress.v1'),
      recovery: app.getProgressRecovery()
    };
  });
  assert(
    preserved.backup?.includes('{not json') &&
      preserved.stored &&
      !preserved.stored.includes('{not json') &&
      preserved.recovery?.raw === '{not json',
    'progress: a new save backs up unreadable data before replacing it',
    JSON.stringify({ backup: preserved.backup, stored: preserved.stored, recovery: preserved.recovery })
  );
}

async function checkUnitProgressReset(page) {
  await page.evaluate(() => {
    localStorage.setItem('kodingu.progress.v1', '{not json');
    localStorage.setItem('kodingu.certificate.name', 'Test Learner');
    localStorage.setItem('kodingu.draft.html-01', 'my old code');
    localStorage.setItem('kodingu.challengeDraft.extra-html-01', 'challenge draft');
    localStorage.setItem('kodingu.projectDraft.project-recipe', 'project draft');
    localStorage.setItem(
      'kodingu.progress.corrupt.v1',
      JSON.stringify({ savedAt: new Date().toISOString(), raw: '{not json' })
    );
  });
  await page.click('#reset-progress');
  await page.click('#reset-progress');
  const resetState = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    return {
      xp: app.getProgress().xp,
      progress: localStorage.getItem('kodingu.progress.v1'),
      name: localStorage.getItem('kodingu.certificate.name'),
      backup: localStorage.getItem('kodingu.progress.corrupt.v1'),
      draft: localStorage.getItem('kodingu.draft.html-01'),
      challengeDraft: localStorage.getItem('kodingu.challengeDraft.extra-html-01'),
      projectDraft: localStorage.getItem('kodingu.projectDraft.project-recipe'),
      status: document.querySelector('#data-status')?.textContent.trim()
    };
  });
  assert(
    resetState.xp === 0 &&
      resetState.progress === null &&
      resetState.name === null &&
      resetState.backup === null &&
      resetState.draft === null &&
      resetState.challengeDraft === null &&
      resetState.projectDraft === null &&
      resetState.status === '',
    'progress: reset clears drafts, the unreadable backup, and the error status',
    JSON.stringify(resetState)
  );
}

async function checkUnitHeader(page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'kodingu.progress.v1',
      JSON.stringify({
        version: 2,
        xp: 25,
        streak: 0,
        completed: { 'html-01': { at: new Date().toISOString(), xp: 25 } }
      })
    );
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.header-cta[data-header-cta]', { timeout: 5000 });
  const header = await page.evaluate(() => ({
    text: document.querySelector('.header-cta[data-header-cta]')?.textContent.trim(),
    href: document.querySelector('.header-cta[data-header-cta]')?.getAttribute('href'),
    label: document.querySelector('.header-cta[data-header-cta]')?.getAttribute('aria-label'),
    stats: [...document.querySelectorAll('#header-stats [data-stat]')].map((node) => node.dataset.stat)
  }));
  assert(
    header.text === 'Continue' && header.href.includes('lesson=html-02'),
    `header: CTA continues at the next unfinished lesson (found "${header.text}" ${header.href})`
  );
  assert(
    header.label.includes('Headings carry rank'),
    'header: CTA names the next lesson',
    header.label
  );
  assert(
    header.stats.join(',') === 'xp,streak',
    'header: the stats strip shows XP and streak without tokens',
    header.stats.join(',')
  );
}

async function checkUnitStorageFallback(page) {
  const storageFallback = await page.evaluate(async () => {
    const app = await import(new URL('/assets/js/core/app.js', window.location.origin).href);
    const originalSetItem = Storage.prototype.setItem;
    let threw = false;
    Storage.prototype.setItem = () => {
      throw new DOMException('QuotaExceededError');
    };
    try {
      app.saveProgress({ ...app.getProgress(), xp: 99 });
    } catch (error) {
      threw = true;
    } finally {
      Storage.prototype.setItem = originalSetItem;
    }
    localStorage.removeItem('kodingu.progress.v1');
    return { threw, xp: app.getProgress().xp };
  });
  assert(
    !storageFallback.threw && storageFallback.xp === 99,
    `progress: a failed storage write keeps progress in memory (found ${JSON.stringify(storageFallback)})`
  );
  await page.evaluate(() => localStorage.removeItem('kodingu.progress.v1'));
}

async function checkCoursePage(page, base, course) {
  const response = await page.goto(`${base}/course.html?course=${course.id}`, {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForSelector('.course-title', { timeout: 10000 });
  const heading = (await page.textContent('.course-title'))?.replace(/\s+/g, ' ').trim() || '';
  const rows = await page.$$eval('.lesson-row', (nodes) => nodes.length);
  const expectedRows = getAllLessons(course).length;
  assert(
    response?.status() === 200 && heading === course.title && rows === expectedRows,
    `course ${course.id}: heading and ${expectedRows} lesson rows render`,
    `status ${response?.status()}, heading "${heading}", rows ${rows}`
  );
}

async function checkCoursePages(page, base) {
  await courses.reduce(
    (previous, course) => previous.then(() => checkCoursePage(page, base, course)),
    Promise.resolve()
  );

  const response = await page.goto(`${base}/course.html?course=missing`, {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForSelector('.course-title', { timeout: 10000 });
  const heading = (await page.textContent('.course-title'))?.replace(/\s+/g, ' ').trim() || '';
  const rows = await page.$$eval('.lesson-row', (nodes) => nodes.length);
  const message = (await page.textContent('.course-description'))?.replace(/\s+/g, ' ').trim() || '';
  assert(
    response?.status() === 200 &&
      heading === 'Course not found' &&
      rows === 0 &&
      message.includes('does not match a course'),
    'course missing: empty state renders without lesson rows',
    `status ${response?.status()}, heading "${heading}", rows ${rows}, message "${message}"`
  );
}

async function checkSkipLink(page, base, path, name) {
  await page.goto(`${base}${path}`, { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  const focusedSkipLink = await page.evaluate(() =>
    document.activeElement?.classList.contains('skip-link')
  );
  await page.keyboard.press('Enter');
  await page
    .waitForFunction(() => document.activeElement?.id === 'main', { timeout: 2000 })
    .catch(() => {});
  const activeId = await page.evaluate(() => document.activeElement?.id || '');
  assert(
    focusedSkipLink && activeId === 'main',
    `${name}: skip link moves focus to main`,
    `skip link focused ${focusedSkipLink}, active element "${activeId}"`
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

  await checkCoursePages(page, base);
  await checkSkipLink(page, base, '/index.html', 'home');
  await checkSkipLink(page, base, '/lessons/html-01.html', 'static lesson');

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

  const heroNote = (await page.textContent('#hero-counts'))?.replace(/\s+/g, ' ').trim();
  assert(heroNote === heroCountsText(), 'homepage lesson counts render from course data', heroNote);

  await openPage(page, base, '/lesson.html?course=html&lesson=html-01');
  await page.waitForSelector('#editor-code', { timeout: 15000 });
  const canonical = await page.$eval('link[rel="canonical"]', (node) => node.href);
  assert(
    canonical === 'https://kodingu.pages.dev/lessons/html-01',
    'canonical: interactive lessons point at the reading page',
    canonical
  );
}

async function checkProgressTotals(page, base) {
  await openPage(page, base, '/progress.html');
  await page.waitForSelector('.stat-value', { timeout: 10000 });
  const values = await page.$$eval('.stat-value', (nodes) =>
    nodes.map((node) => Number(node.textContent.trim()))
  );
  const [xp, streak, completedLessons, completedProjects] = values;
  assert(xp === 2410, `progress: 2410 XP after all lessons, challenges, and projects (found ${xp})`);
  assert(completedLessons === 70, `progress: 70 lessons complete (found ${completedLessons})`);
  assert(completedProjects === 4, `progress: 4 projects complete (found ${completedProjects})`);
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

  await openPage(page, base, '/progress.html');
  await page.waitForSelector('#import-file', { state: 'attached', timeout: 10000 });
  const payload = {
    format: 'kodingu-progress',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: {
      version: 1,
      xp: 75,
      tokens: 20,
      streak: 1,
      completed: { 'html-01': { at: new Date().toISOString(), xp: 25 } },
      completedChallenges: {},
      completedProjects: {},
      history: []
    },
    profile: { certificateName: 'Import Tester' }
  };
  page.once('dialog', (dialog) => dialog.accept());
  await page.setInputFiles('#import-file', {
    name: 'kodingu-progress.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload))
  });
  await page.waitForFunction(
    () => document.querySelector('#data-status')?.textContent.includes('Imported'),
    { timeout: 5000 }
  );
  const importedXp = await page.$eval('.stat-value', (node) => Number(node.textContent.trim()));
  assert(importedXp === 25, `progress: import file replaces the local profile (found ${importedXp} XP)`);

  const downloadPromise = page.waitForEvent('download');
  await page.click('#export-progress');
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert(
    exported.format === 'kodingu-progress' && exported.version === 2 && exported.progress.xp === 25,
    'progress: export downloads a versioned JSON file',
    JSON.stringify({ format: exported.format, version: exported.version, xp: exported.progress?.xp })
  );
}

async function checkHeaders(base) {
  const response = await fetch(`${base}/lesson.html`);
  const csp = response.headers.get('content-security-policy') || '';
  assert(response.status === 200, 'dev server serves lesson.html');
  assert(csp.includes("script-src 'self' blob:"), 'CSP allows same-origin and blob scripts', csp);
  assert(csp.includes("worker-src 'self' blob:"), 'CSP allows the sandboxed preflight worker', csp);
  assert(csp.includes("frame-src 'self' data: blob:"), 'CSP allows the sandboxed preflight frame', csp);
  assert(!csp.includes("'unsafe-eval'"), 'CSP no longer allows unsafe-eval', csp);
  assert(csp.includes("frame-ancestors 'none'"), "CSP blocks framing with frame-ancestors 'none'", csp);
  assert(csp.includes("object-src 'none'"), "CSP blocks plugins with object-src 'none'", csp);
  assert(response.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is applied');
  assert(response.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is applied');
  assert(
    response.headers.get('cross-origin-opener-policy') === 'same-origin',
    'Cross-Origin-Opener-Policy is applied'
  );

  const font = await fetch(`${base}/assets/fonts/public-sans.woff2`);
  const fontCache = font.headers.get('cache-control') || '';
  assert(
    fontCache === 'public, max-age=31536000, immutable',
    'fonts use a long immutable cache',
    fontCache
  );

  const asset = await fetch(`${base}/assets/js/core/app.js`);
  const assetCache = asset.headers.get('cache-control') || '';
  assert(
    assetCache === 'public, max-age=0, must-revalidate',
    'assets revalidate instead of mixing conflicting cache rules',
    assetCache
  );

  const merged = collectHeaders(
    [
      { pattern: '/*', headers: { 'Cache-Control': 'public, max-age=0' } },
      { pattern: '/assets/*', headers: { 'Cache-Control': 'public, max-age=60' } }
    ],
    '/assets/js/core/app.js'
  );
  assert(
    merged['Cache-Control'] === 'public, max-age=0, public, max-age=60',
    'repeated header rules combine with a comma like Cloudflare Pages',
    merged['Cache-Control']
  );

  const detached = collectHeaders(
    [
      { pattern: '/*', headers: { 'Cache-Control': 'public, max-age=0' } },
      {
        pattern: '/assets/fonts/*',
        remove: ['cache-control'],
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
      }
    ],
    '/assets/fonts/public-sans.woff2'
  );
  assert(
    detached['Cache-Control'] === 'public, max-age=31536000, immutable',
    'a header detach replaces the general cache rule',
    detached['Cache-Control']
  );

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
    assert(
      !html.includes('fonts.googleapis.com') && html.includes('assets/css/fonts.css'),
      `${file}: fonts are self-hosted`
    );
  });

  const home = await (await fetch(`${base}/index.html`)).text();
  assert(
    home.includes(heroCountsText()),
    'homepage lesson counts match the data without JavaScript',
    heroCountsText()
  );

  const notFound = await (await fetch(`${base}/404.html`)).text();
  assert(notFound.includes('noindex'), '404.html asks search engines not to index it');

  const lessonPages = buildLessonPages();
  const stalePages = (
    await Promise.all(
      [...lessonPages].map(async ([name, expected]) => {
        try {
          const actual = await readFile(new URL(`../lessons/${name}`, import.meta.url), 'utf8');
          return actual === expected ? null : `stale ${name}`;
        } catch {
          return `missing ${name}`;
        }
      })
    )
  ).filter(Boolean);
  assert(
    !stalePages.length,
    `all ${lessonPages.size} static lesson pages match the generator`,
    stalePages.slice(0, 5).join(' | ')
  );

  const sampleLesson = await (await fetch(`${base}/lessons/html-01`)).text();
  assert(
    sampleLesson.includes(`<link rel="canonical" href="${ORIGIN}/lessons/html-01">`),
    'static lesson: canonical points at the reading page'
  );
  assert(
    sampleLesson.includes('<h1>A page is a tree</h1>') &&
      sampleLesson.includes('HTML gives a page its structure.'),
    'static lesson: the heading and theory are present without JavaScript'
  );
  assert(
    !sampleLesson.includes('type="module"') && sampleLesson.includes('assets/css/static.css'),
    'static lesson: reading content needs no module script'
  );
  assert(
    sampleLesson.includes('lesson.html?course=html&amp;lesson=html-01'),
    'static lesson: links to the interactive workspace'
  );
  const lessonLd = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(sampleLesson);
  let lessonLdValid = true;
  try {
    JSON.parse(lessonLd[1]);
  } catch {
    lessonLdValid = false;
  }
  assert(lessonLdValid, 'static lesson: JSON-LD parses');

  const png = await readFile(new URL('../assets/og-image.png', import.meta.url));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert(width === 1200 && height === 630, `share image is 1200x630 (found ${width}x${height})`);

  await runSeries(['index.html', 'catalog.html'], async (file) => {
    const html = await (await fetch(`${base}/${file}`)).text();
    const block = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    let valid = true;
    try {
      JSON.parse(block[1]);
    } catch {
      // Invalid structured data is a failed check, not a page error.
      valid = false;
    }
    assert(valid, `${file}: JSON-LD parses`);
  });

  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert(locations.length === 77, `sitemap lists 77 URLs (found ${locations.length})`);
  assert(
    !sitemap.includes('/progress') &&
      !sitemap.includes('/project?') &&
      !sitemap.includes('/challenge?'),
    'sitemap leaves noindex and query-only shells out'
  );

  const shells = ['lesson.html', 'challenge.html', 'project.html', 'progress.html', 'certificate.html'];
  const shellMarkup = await Promise.all(
    shells.map(async (file) => ({
      file,
      html: await (await fetch(`${base}/${file}`)).text()
    }))
  );
  for (const { file, html } of shellMarkup) {
    assert(html.includes('content="noindex'), `${file}: asks search engines not to index it`);
  }
  const staticLessons = locations.filter((location) => location.includes('/lessons/'));
  assert(
    staticLessons.length === lessonPages.size,
    `sitemap lists all ${lessonPages.size} static lessons (found ${staticLessons.length})`
  );
  assert(
    !sitemap.includes('/lesson?course='),
    'sitemap lists reading pages instead of lesson query URLs'
  );

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
  const themeContext = await browser.newContext();
  await themeContext.addInitScript(() => {
    try {
      localStorage.setItem('kodingu.theme', 'dark');
    } catch (error) {
      // A blocked store leaves the offline page on its light default.
    }
  });
  const themePage = await themeContext.newPage();
  await themePage.goto(`${base}/offline.html`, { waitUntil: 'load' });
  const offlineTheme = await themePage.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    background: getComputedStyle(document.body).backgroundColor,
    colorScheme: getComputedStyle(document.documentElement).colorScheme
  }));
  assert(
    offlineTheme.theme === 'dark' &&
      offlineTheme.background === 'rgb(25, 24, 23)' &&
      offlineTheme.colorScheme === 'dark',
    'offline page follows the saved theme',
    JSON.stringify(offlineTheme)
  );
  await themeContext.close();

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
      if (!names.length) return null;
      const cache = await caches.open(names[0]);
      return {
        count: (await cache.keys()).length,
        offline: Boolean(await cache.match(new URL('/offline.html', location.origin).href))
      };
    });
    assert(cached?.count >= 38, `offline shell is cached (${cached?.count} entries)`);
    assert(Boolean(cached?.offline), 'offline fallback page is cached');
  }

  const staticContext = await browser.newContext();
  const staticPage = await staticContext.newPage();
  await staticPage.goto(`${base}/lessons/html-01.html`, { waitUntil: 'load' });
  const staticRegistered = await staticPage.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 8000))
    ]);
    return Boolean(registration);
  });
  assert(staticRegistered, 'service worker registers from a static reading page');

  if (staticRegistered) {
    const pageCached = await staticPage
      .waitForFunction(
        async () => {
          const names = await caches.keys();
          if (!names.length) return false;
          const cache = await caches.open(names[0]);
          return Boolean(await cache.match(window.location.href));
        },
        { timeout: 5000 }
      )
      .then(() => true)
      .catch(() => false);
    assert(pageCached, 'first visit from a static reading page is cached');

    await staticContext.setOffline(true);
    let status;
    let heading = '';
    try {
      const response = await staticPage.reload({ waitUntil: 'domcontentloaded' });
      status = response?.status() || 0;
      heading = (await staticPage.textContent('h1'))?.replace(/\s+/g, ' ').trim() || '';
    } catch {
      // A failed offline reload is reported by the status assertion below.
      status = 0;
    }
    assert(
      status === 200 && heading === 'A page is a tree',
      'static reading page reloads offline from its first visit',
      `status ${status}, heading "${heading}"`
    );
  }

  await staticContext.close();

  const lessonContext = await browser.newContext();
  const lessonPage = await lessonContext.newPage();
  await lessonPage.goto(`${base}/lesson.html?course=html&lesson=html-01`, { waitUntil: 'load' });
  await lessonPage.waitForSelector('#lesson-title', { timeout: 15000 });
  const lessonRegistered = await lessonPage.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 8000))
    ]);
    return Boolean(registration);
  });
  assert(lessonRegistered, 'service worker registers from an interactive lesson');

  if (lessonRegistered) {
    const lessonCached = await lessonPage
      .waitForFunction(
        async () => {
          const names = await caches.keys();
          if (!names.length) return false;
          const cache = await caches.open(names[0]);
          const dataUrl = new URL('/assets/js/data/lessons/html-01.js', location.origin).href;
          return Boolean(await cache.match(dataUrl)) && Boolean(await cache.match(location.href));
        },
        { timeout: 5000 }
      )
      .then(() => true)
      .catch(() => false);
    assert(lessonCached, 'first interactive lesson visit caches its page and data module');

    await lessonContext.setOffline(true);
    let status;
    let heading = '';
    try {
      const response = await lessonPage.reload({ waitUntil: 'domcontentloaded' });
      status = response?.status() || 0;
      heading = (await lessonPage.textContent('#lesson-title'))?.replace(/\s+/g, ' ').trim() || '';
    } catch {
      // A failed offline reload is reported by the status assertion below.
      status = 0;
    }
    assert(
      status === 200 && heading === 'A page is a tree',
      'interactive lesson reloads offline after its first visit',
      `status ${status}, heading "${heading}"`
    );
  }

  await lessonContext.close();
  await browser.close();
}

async function main() {
  if (wants('data')) await checkData();

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
