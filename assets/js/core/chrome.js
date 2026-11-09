import { courses, getAllLessons } from '../data/course-index.js';
import { escapeHtml } from './html.js';
import { ICONS } from './icons.js';
import { setPageTitle } from './seo.js';
import { currentStreak, getProgress } from './storage.js';

const THEME_KEY = 'kodingu.theme';

let toastTimer = null;
let iconSequence = 0;

export function icon(name, options = {}) {
  const { size = 20, weight = 'Outline', className = '', label = '' } = options;
  const data = ICONS[name];
  const style = weight === 'Filled' ? 'F' : 'O';
  let body = '';
  if (data) body = data[style] || data.O;
  if (body.includes('clip0_')) {
    const clipId = `kodingu-clip-${++iconSequence}`;
    body = body.replace(/clip0_\d+_\d+/g, clipId);
  }
  const accessibility = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ${accessibility}>${body}</svg>`;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    const name = node.dataset.icon;
    const size = Number(node.dataset.size) || 20;
    const label = node.dataset.label || '';
    node.innerHTML = icon(name, { size, label });
  });
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

export function getResumeTarget() {
  const progress = getProgress();
  const started = Object.keys(progress.completed).length > 0;
  for (const course of courses) {
    const lessons = getAllLessons(course);
    const next = lessons.find((lesson) => !progress.completed[lesson.id]);
    if (next) {
      return {
        href: `lesson.html?course=${encodeURIComponent(course.id)}&lesson=${encodeURIComponent(next.id)}`,
        label: started ? 'Continue' : `Start ${course.title.split(' ')[0]}`,
        title: next.title
      };
    }
  }
  const course = courses.find((item) => getAllLessons(item).length);
  const lesson = course ? getAllLessons(course)[0] : null;
  if (!course || !lesson) {
    return { href: 'catalog.html', label: 'Browse catalog', title: 'the catalog' };
  }
  return {
    href: `lesson.html?course=${encodeURIComponent(course.id)}&lesson=${encodeURIComponent(lesson.id)}`,
    label: 'Review',
    title: lesson.title
  };
}

function headerStatsMarkup(progress) {
  const xp = Number(progress.xp) || 0;
  const streak = Number(currentStreak(progress)) || 0;
  if (!xp && !streak) return '';
  return `
    <span class="header-stat" data-stat="xp">${icon('Gauge', { size: 16 })}<span></span></span>
    <span class="header-stat" data-stat="streak">${icon('Fire', { size: 16 })}<span></span></span>
  `;
}

function updateHeaderStats(progress) {
  const strip = document.querySelector('#header-stats');
  if (!strip) return;
  const xp = Number(progress.xp) || 0;
  const streak = Number(currentStreak(progress)) || 0;
  const xpNode = strip.querySelector('[data-stat="xp"]');
  const streakNode = strip.querySelector('[data-stat="streak"]');
  if (xpNode) {
    xpNode.setAttribute('aria-label', `${xp} XP`);
    xpNode.querySelector('span').textContent = `${xp} XP`;
  }
  if (streakNode) {
    const label = `${streak} day streak`;
    streakNode.setAttribute('aria-label', label);
    streakNode.title = label;
    streakNode.querySelector('span').textContent = String(streak);
  }
}

function applyHeaderCta(root = document) {
  const target = getResumeTarget();
  root.querySelectorAll('[data-header-cta]').forEach((link) => {
    link.href = target.href;
    link.textContent = target.label;
    link.setAttribute('aria-label', `${target.label}: ${target.title}`);
  });
}

function refreshHeaderStats() {
  const strip = document.querySelector('#header-stats');
  if (!strip) return;
  const progress = getProgress();
  const markup = headerStatsMarkup(progress);
  strip.innerHTML = markup;
  strip.hidden = !markup;
  updateHeaderStats(progress);
  applyHeaderCta();
}

export function renderHeader() {
  const mount = document.querySelector('#site-header');
  if (!mount) return;

  const progress = getProgress();
  const stats = headerStatsMarkup(progress);
  const theme = readTheme();
  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  mount.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="index.html" aria-label="Kodingu home">
          <span class="brand-mark" aria-hidden="true">${icon('Code', { size: 17 })}</span>
          <span class="brand-word">Kodingu</span>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Main">
          <a href="catalog.html" data-nav="catalog">Catalog</a>
          <a href="projects.html" data-nav="projects project">Projects</a>
          <a href="practice.html" data-nav="practice challenge">Practice</a>
          <a href="progress.html" data-nav="progress">Progress</a>
          <a class="button button-primary nav-cta" data-header-cta href="lesson.html?course=html&amp;lesson=html-01">Start HTML</a>
        </nav>

        <div class="header-actions">
          <div class="header-stats" id="header-stats" ${stats ? '' : 'hidden'}>${stats}</div>
          <button class="icon-button" id="theme-toggle" type="button" aria-label="Switch to dark theme" aria-pressed="false">
            ${icon(theme === 'dark' ? 'Sun' : 'Moon', { size: 19 })}
          </button>
          <a class="button button-primary header-cta" data-header-cta href="lesson.html?course=html&amp;lesson=html-01">Start HTML</a>
          <button class="icon-button nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            ${icon('Menu', { size: 20 })}
            <span class="nav-toggle-label">Menu</span>
          </button>
        </div>
      </div>
    </header>
  `;

  mount.querySelectorAll('[data-nav]').forEach((link) => {
    const targets = (link.dataset.nav || '').split(' ');
    if (targets.includes(page)) link.setAttribute('aria-current', 'page');
  });
  updateHeaderStats(progress);
  applyHeaderCta(mount);

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

export function wireSidebar(root) {
  const toggle = root?.querySelector('#sidebar-toggle');
  const list = root?.querySelector('#sidebar-lessons');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    if (list) list.dataset.open = String(!open);
  });
}

export function renderMissingPage({ mount, sidebar, title, message, actionHref, actionLabel, parentHref, parentLabel }) {
  setPageTitle(title);
  if (sidebar) sidebar.innerHTML = '';
  if (!mount) return;
  mount.innerHTML = `
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="${escapeHtml(parentHref)}">${escapeHtml(parentLabel)}</a>
      </nav>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(message)}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)}</a>
      </div>
    </div>
  `;
}
