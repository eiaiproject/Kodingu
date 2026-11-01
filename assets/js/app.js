import { ICONS } from './icons.js';
import { courses, getAllLessons } from './data.js';
import { runJavaScriptLesson } from './js-runner.js';
import {
  CHEST_COST,
  FREEZE_LIMIT,
  TOKENS_PER_CHALLENGE,
  TOKENS_PER_LESSON,
  TOKENS_PER_PROJECT,
  getDailyMissions,
  getMissionProgress
} from './gamification.js';

const STORAGE_KEY = 'kodingu.progress.v1';
const THEME_KEY = 'kodingu.theme';

let storageOk;
let memoryProgress = null;
let toastTimer = null;
let iconSequence = 0;

export function icon(name, options = {}) {
  const { size = 20, weight = 'Outline', className = '', label = '' } = options;
  const data = ICONS[name];
  let body = data ? data[weight === 'Filled' ? 'F' : 'O'] || data.O : '';
  if (body.includes('clip0_')) {
    const clipId = `kodingu-clip-${++iconSequence}`;
    body = body.replace(/clip0_\d+_\d+/g, clipId);
  }
  const accessibility = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ${accessibility}>${body}</svg>`;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[character];
  });
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    const name = node.getAttribute('data-icon');
    const size = Number(node.getAttribute('data-size')) || 20;
    const label = node.getAttribute('data-label') || '';
    node.innerHTML = icon(name, { size, label });
  });
}

export function storageAvailable() {
  if (storageOk !== undefined) return storageOk;
  try {
    const probe = '__kodingu_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    storageOk = true;
  } catch (error) {
    storageOk = false;
  }
  return storageOk;
}

function defaultProgress() {
  return {
    version: 1,
    xp: 0,
    tokens: 0,
    streakFreezes: 0,
    chestsOpened: 0,
    streak: 0,
    lastLessonDay: null,
    completed: {},
    completedChallenges: {},
    completedProjects: {},
    projectChecks: {},
    quizzes: {},
    history: [],
    missions: {},
    activity: [],
    solutionViews: []
  };
}

export function getProgress() {
  if (!storageAvailable()) {
    if (!memoryProgress) memoryProgress = defaultProgress();
    return memoryProgress;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    const completed = parsed.completed || {};
    return {
      ...defaultProgress(),
      ...parsed,
      completed,
      completedChallenges:
        parsed.completedChallenges && typeof parsed.completedChallenges === 'object'
          ? parsed.completedChallenges
          : {},
      completedProjects:
        parsed.completedProjects && typeof parsed.completedProjects === 'object'
          ? parsed.completedProjects
          : {},
      projectChecks:
        parsed.projectChecks && typeof parsed.projectChecks === 'object'
          ? parsed.projectChecks
          : {},
      tokens: Number.isFinite(parsed.tokens)
        ? parsed.tokens
        : Object.keys(completed).length * TOKENS_PER_LESSON,
      streakFreezes: Number.isFinite(parsed.streakFreezes) ? parsed.streakFreezes : 0,
      chestsOpened: Number.isFinite(parsed.chestsOpened) ? parsed.chestsOpened : 0,
      quizzes: parsed.quizzes || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      missions: parsed.missions && typeof parsed.missions === 'object' ? parsed.missions : {},
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      solutionViews: Array.isArray(parsed.solutionViews) ? parsed.solutionViews : []
    };
  } catch (error) {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  if (storageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } else {
    memoryProgress = progress;
  }
  window.dispatchEvent(new CustomEvent('kodingu:progress', { detail: progress }));
}

export function resetProgress() {
  if (storageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  }
  memoryProgress = defaultProgress();
  window.dispatchEvent(new CustomEvent('kodingu:progress', { detail: memoryProgress }));
}

export function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey() {
  const now = new Date();
  return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

function dayDifference(fromKey, toKey) {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return NaN;
  return Math.round((to - from) / 86400000);
}

export function currentStreak(progress = getProgress()) {
  if (!progress.lastLessonDay) return 0;
  if (progress.lastLessonDay === dayKey() || progress.lastLessonDay === yesterdayKey()) {
    return progress.streak || 0;
  }
  if (
    (progress.streakFreezes || 0) > 0 &&
    dayDifference(progress.lastLessonDay, dayKey()) === 2
  ) {
    return progress.streak || 0;
  }
  return 0;
}

export function completeLesson(lesson) {
  const progress = getProgress();
  if (progress.completed[lesson.id]) {
    return { completed: false, progress };
  }

  const now = new Date();
  const today = dayKey(now);
  const previousDay = progress.lastLessonDay;
  let streak = progress.streak || 0;
  let freezeUsed = false;

  if (previousDay === today) {
    streak = Math.max(1, streak);
  } else if (previousDay === yesterdayKey()) {
    streak += 1;
  } else if (
    previousDay &&
    dayDifference(previousDay, today) === 2 &&
    (progress.streakFreezes || 0) > 0
  ) {
    progress.streakFreezes -= 1;
    streak += 1;
    freezeUsed = true;
  } else {
    streak = 1;
  }

  const tokensEarned = TOKENS_PER_LESSON;
  progress.completed[lesson.id] = {
    at: now.toISOString(),
    xp: lesson.xp,
    tokens: tokensEarned
  };
  progress.xp = (progress.xp || 0) + lesson.xp;
  progress.tokens = (progress.tokens || 0) + tokensEarned;
  progress.streak = streak;
  progress.lastLessonDay = today;
  progress.history = [
    {
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      xp: lesson.xp,
      tokens: tokensEarned,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);

  saveProgress(progress);
  return { completed: true, progress, tokensEarned, freezeUsed };
}

export function completeChallenge(challenge) {
  const progress = getProgress();
  if (progress.completedChallenges[challenge.id]) {
    return { completed: false, progress };
  }

  const now = new Date();
  const xpEarned = challenge.xp || 0;
  const tokensEarned = challenge.tokens ?? TOKENS_PER_CHALLENGE;
  progress.completedChallenges[challenge.id] = {
    at: now.toISOString(),
    xp: xpEarned,
    tokens: tokensEarned
  };
  progress.xp = (progress.xp || 0) + xpEarned;
  progress.tokens = (progress.tokens || 0) + tokensEarned;
  progress.history = [
    {
      type: 'challenge',
      id: challenge.id,
      title: challenge.title,
      xp: xpEarned,
      tokens: tokensEarned,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);
  saveProgress(progress);
  return { completed: true, progress, xpEarned, tokensEarned };
}

export function toggleProjectRequirement(projectId, index, checked) {
  const progress = getProgress();
  if (!Number.isInteger(index) || index < 0) {
    return progress.projectChecks[projectId] || [];
  }
  const checks = new Set(progress.projectChecks[projectId] || []);
  if (checked) checks.add(index);
  else checks.delete(index);
  progress.projectChecks[projectId] = [...checks].sort((first, second) => first - second);
  saveProgress(progress);
  return progress.projectChecks[projectId];
}

export function completeProject(project) {
  const progress = getProgress();
  if (progress.completedProjects[project.id]) {
    return { completed: false, progress };
  }
  const checks = new Set(progress.projectChecks[project.id] || []);
  const ready = project.requirements.every((item, index) => checks.has(index));
  if (!ready) {
    return { completed: false, reason: 'Check every requirement first.', progress };
  }

  const now = new Date();
  const xpEarned = project.xp || 0;
  const tokensEarned = project.tokens ?? TOKENS_PER_PROJECT;
  progress.completedProjects[project.id] = {
    at: now.toISOString(),
    xp: xpEarned,
    tokens: tokensEarned
  };
  progress.xp = (progress.xp || 0) + xpEarned;
  progress.tokens = (progress.tokens || 0) + tokensEarned;
  progress.history = [
    {
      type: 'project',
      id: project.id,
      title: project.title,
      xp: xpEarned,
      tokens: tokensEarned,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);
  saveProgress(progress);
  return { completed: true, progress, xpEarned, tokensEarned };
}

export function recordQuiz(lessonId, correct) {
  if (!correct) return;
  const progress = getProgress();
  progress.quizzes[lessonId] = { at: new Date().toISOString(), correct: true };
  saveProgress(progress);
}

export function markSolutionViewed(lessonId) {
  const progress = getProgress();
  if (!progress.solutionViews.includes(lessonId)) {
    progress.solutionViews.push(lessonId);
    saveProgress(progress);
  }
}

function hasUnfinishedLessons(progress) {
  return courses.some((course) =>
    getAllLessons(course).some((lesson) => !progress.completed[lesson.id])
  );
}

export function recordActivity(type, lessonId) {
  if (!lessonId || (type !== 'visit' && type !== 'check')) return;
  const progress = getProgress();
  const today = dayKey();
  const alreadyCounted = (progress.activity || []).some(
    (entry) =>
      entry.type === type &&
      entry.lessonId === lessonId &&
      entry.at &&
      dayKey(new Date(entry.at)) === today
  );
  if (alreadyCounted) return;
  progress.activity = [
    { type, lessonId, at: new Date().toISOString() },
    ...(progress.activity || [])
  ].slice(0, 200);
  saveProgress(progress);
}

export function claimDailyMission(missionId) {
  const progress = getProgress();
  const today = dayKey();
  const day = progress.missions[today] || {};
  const claimed = Array.isArray(day.claimed) ? day.claimed : [];
  const mission = getDailyMissions(hasUnfinishedLessons(progress)).find(
    (item) => item.id === missionId
  );
  if (!mission) {
    return { claimed: false, reason: 'That mission is not available today.' };
  }
  if (claimed.includes(missionId)) {
    return { claimed: false, reason: 'That mission is already claimed.' };
  }
  if (getMissionProgress(progress, mission) < mission.target) {
    return { claimed: false, reason: 'That mission is not complete yet.' };
  }
  progress.tokens = (progress.tokens || 0) + mission.reward;
  progress.missions = {
    ...progress.missions,
    [today]: { claimed: [...claimed, missionId] }
  };
  saveProgress(progress);
  return { claimed: true, reward: mission.reward, progress };
}

export function buyFreezeChest() {
  const progress = getProgress();
  const tokens = progress.tokens || 0;
  if (tokens < CHEST_COST) {
    return { ok: false, reason: `You need ${CHEST_COST - tokens} more tokens.` };
  }
  if ((progress.streakFreezes || 0) >= FREEZE_LIMIT) {
    return { ok: false, reason: 'All three freeze slots are full.' };
  }
  const now = new Date();
  progress.tokens = tokens - CHEST_COST;
  progress.streakFreezes = (progress.streakFreezes || 0) + 1;
  progress.chestsOpened = (progress.chestsOpened || 0) + 1;
  progress.history = [
    {
      type: 'chest',
      id: 'freeze-chest',
      title: 'Freeze chest',
      tokens: -CHEST_COST,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);
  saveProgress(progress);
  return { ok: true, progress };
}

export function getCourseStats(course) {
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const completed = lessons.filter((lesson) => progress.completed[lesson.id]).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !progress.completed[lesson.id]) || lessons[0] || null;
  return {
    total: lessons.length,
    completed,
    percent,
    nextLesson,
    started: completed > 0
  };
}

export function getTodayCount(progress = getProgress()) {
  const today = dayKey();
  return (progress.history || []).filter((entry) => entry.type === 'lesson' && dayKey(new Date(entry.at)) === today).length;
}

export function formatRelativeDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const key = dayKey(date);
  if (key === dayKey()) return 'Today';
  if (key === yesterdayKey()) return 'Yesterday';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' })
  }).format(date);
}

export function formatFullDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function toast(message) {
  const region = document.querySelector('#toast');
  if (!region) return;
  region.textContent = message;
  region.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    region.classList.remove('is-visible');
  }, 4200);
}

export function buildProjectPreview(raw) {
  const source = String(raw || '');
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const styles = Array.from(parsed.querySelectorAll('style'))
    .map((node) => node.outerHTML)
    .join('\n');
  const scripts = Array.from(parsed.querySelectorAll('script'))
    .filter((node) => !node.getAttribute('src'))
    .map((node) => node.textContent)
    .join('\n');
  const bodyAttributes = Array.from(parsed.body?.attributes || [])
    .map((attribute) => ` ${attribute.name}="${escapeHtml(attribute.value)}"`)
    .join('');
  parsed.querySelectorAll('script, style').forEach((node) => node.remove());
  let body = parsed.body ? parsed.body.innerHTML : '';
  let error = null;

  if (scripts.trim()) {
    const result = runJavaScriptLesson(scripts, body);
    error = result.error;
    body = result.doc.body.innerHTML;
  }

  return {
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Project preview</title>${styles}</head><body${bodyAttributes}>${body}</body></html>`,
    error
  };
}

export function buildPreviewDocument(raw, options = {}) {
  const style = `<style>
    html { color-scheme: light; }
    body { margin: 0; padding: 1.25rem; background: #ffffff; color: #1f1d1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 15px; line-height: 1.6; }
    h1, h2, h3 { margin: 0 0 0.6rem; line-height: 1.2; font-weight: 600; }
    h1 { font-size: 1.6rem; }
    h2 { font-size: 1.25rem; }
    p { margin: 0 0 0.75rem; }
    ul, ol { margin: 0 0 0.75rem; padding-left: 1.25rem; }
    a { color: #b23a2f; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    .preview-error { margin: 0.75rem 0 0; padding: 0.75rem; border: 1px solid #b23a2f; color: #b23a2f; font-size: 0.85rem; }
  </style>`;
  const source = String(raw || '');
  if (options.language === 'js') {
    const preview = options.preview || '<h1>Preview</h1><p>Write a script and run it.</p>';
    const result = runJavaScriptLesson(source, preview);
    const error = result.error
      ? `<p class="preview-error">Script error: ${escapeHtml(result.error.message)}</p>`
      : '';
    const page = result.doc.documentElement.outerHTML;
    return page.replace('</head>', `${style}</head>`).replace('</body>', `${error}</body>`);
  }
  if (options.language === 'css') {
    const preview = options.preview || '<h1>Preview</h1><p>Write a rule and run it.</p>';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${style}<style>${source}</style></head><body>${preview}</body></html>`;
  }
  if (/<\/head>/i.test(source)) {
    return source.replace(/<\/head>/i, `${style}</head>`);
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${style}</head><body>${source}</body></html>`;
}

export function progressBar(percent, label) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="progress" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
    <span class="progress-fill" style="width: ${value}%"></span>
  </div>`;
}

export function statusLabel(status) {
  return status === 'open' ? 'Open now' : 'In progress';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function readTheme() {
  const stored = document.documentElement.dataset.theme;
  return stored === 'dark' ? 'dark' : 'light';
}

function updateThemeButton(theme) {
  const button = document.querySelector('#theme-toggle');
  if (!button) return;
  const dark = theme === 'dark';
  button.innerHTML = icon(dark ? 'Sun' : 'Moon', { size: 19 });
  button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  button.setAttribute('aria-pressed', String(dark));
  button.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // The theme still applies for this page view when storage is unavailable.
  }
  updateThemeButton(theme);
}

function headerStatsMarkup(progress) {
  const xp = progress.xp || 0;
  const streak = currentStreak(progress);
  const tokens = progress.tokens || 0;
  if (!xp && !streak && !tokens) return '';
  return `
    <span class="header-stat" aria-label="${xp} XP">${icon('Gauge', { size: 16 })}<span>${xp} XP</span></span>
    <span class="header-stat" aria-label="${streak} day streak">${icon('Fire', { size: 16 })}<span>${streak}</span></span>
    ${tokens ? `<span class="header-stat" aria-label="${tokens} tokens">${icon('Coins', { size: 16 })}<span>${tokens}</span></span>` : ''}
  `;
}

function refreshHeaderStats() {
  const strip = document.querySelector('#header-stats');
  if (!strip) return;
  const markup = headerStatsMarkup(getProgress());
  strip.innerHTML = markup;
  strip.hidden = !markup;
}

export function renderHeader() {
  const mount = document.querySelector('#site-header');
  if (!mount) return;

  const progress = getProgress();
  const stats = headerStatsMarkup(progress);
  const theme = readTheme();
  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  const current = (...hrefs) =>
    hrefs.some((href) => href.replace(/\.html$/, '') === page) ? ' aria-current="page"' : '';

  mount.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="index.html" aria-label="Kodingu home">
          <span class="brand-mark" aria-hidden="true">${icon('Code', { size: 17 })}</span>
          <span class="brand-word">Kodingu</span>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Main">
          <a href="catalog.html"${current('catalog.html')}>Catalog</a>
          <a href="projects.html"${current('projects.html', 'project.html')}>Projects</a>
          <a href="practice.html"${current('practice.html', 'challenge.html')}>Practice</a>
          <a href="progress.html"${current('progress.html')}>Progress</a>
          <a class="button button-primary nav-cta" href="lesson.html?course=html&amp;lesson=html-01">Start HTML</a>
        </nav>

        <div class="header-actions">
          <div class="header-stats" id="header-stats" ${stats ? '' : 'hidden'}>${stats}</div>
          <button class="icon-button" id="theme-toggle" type="button" aria-label="Switch to dark theme" aria-pressed="false">
            ${icon(theme === 'dark' ? 'Sun' : 'Moon', { size: 19 })}
          </button>
          <a class="button button-primary header-cta" href="lesson.html?course=html&amp;lesson=html-01">Start HTML</a>
          <button class="icon-button nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            ${icon('Menu', { size: 20 })}
            <span class="sr-only">Menu</span>
          </button>
        </div>
      </div>
    </header>
  `;

  updateThemeButton(theme);

  const themeButton = mount.querySelector('#theme-toggle');
  themeButton?.addEventListener('click', () => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark');
  });

  const nav = mount.querySelector('#site-nav');
  const navToggle = mount.querySelector('#nav-toggle');
  const closeNav = (restoreFocus = false) => {
    if (!nav || !navToggle) return;
    nav.dataset.open = 'false';
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    if (restoreFocus) navToggle.focus();
  };
  const openNav = () => {
    if (!nav || !navToggle) return;
    nav.dataset.open = 'true';
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    nav.querySelector('a')?.focus();
  };

  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    if (open) closeNav(true);
    else openNav();
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
      closeNav(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (navToggle?.getAttribute('aria-expanded') !== 'true') return;
    if (!event.target.closest('.site-header')) closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeNav();
  });

  window.addEventListener('kodingu:progress', refreshHeaderStats);
}

export function renderFooter() {
  const mount = document.querySelector('#site-footer');
  if (!mount) return;
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-inner">
        <div class="footer-brand">
          <a class="brand" href="index.html" aria-label="Kodingu home">
            <span class="brand-mark" aria-hidden="true">${icon('Code', { size: 16 })}</span>
            <span class="brand-word">Kodingu</span>
          </a>
          <p>A quiet place to learn HTML, CSS, and JavaScript.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer">
          <a href="catalog.html">Catalog</a>
          <a href="projects.html">Projects</a>
          <a href="practice.html">Practice</a>
          <a href="progress.html">Progress</a>
          <a href="index.html#method">Method</a>
        </nav>
        <p class="footer-note">Icons from <a href="https://reicon.dev" rel="noopener">Reicon</a>. Progress stays in this browser.</p>
      </div>
    </footer>
  `;
}

export function initChrome() {
  renderHeader();
  renderFooter();
  hydrateIcons();
}

export function setPageTitle(title) {
  document.title = title ? `${title} · Kodingu` : 'Kodingu';
}

export function setMetaDescription(description) {
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', description);
}

export function findCourse(id) {
  return courses.find((course) => course.id === id) || null;
}
