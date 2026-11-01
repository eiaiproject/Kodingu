import { getCourse, getAllLessons } from './data.js';
import {
  escapeHtml,
  getCourseStats,
  getProgress,
  icon,
  initChrome,
  pluralize,
  progressBar,
  setMetaDescription,
  setPageTitle,
  statusLabel
} from './app.js';

function renderNotFound() {
  setPageTitle('Course not found');
  const hero = document.querySelector('#course-hero');
  const content = document.querySelector('#course-content');
  if (hero) {
    hero.innerHTML = `
      <div>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="catalog.html">Catalog</a>
          <span class="sep" aria-hidden="true">/</span>
          <span>Not found</span>
        </nav>
        <h1 class="course-title">Course not found</h1>
        <p class="course-description">This course address does not match a course in the catalog.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="catalog.html">Open the catalog</a>
        </div>
      </div>
    `;
  }
  if (content) content.innerHTML = '';
}

function lessonRows(course, lessons, completed) {
  return lessons
    .map((lesson, index) => {
      const state = completed[lesson.id]
        ? icon('CheckCircle', { size: 18, label: 'Complete' })
        : icon('ArrowRight', { size: 18, label: 'Open lesson' });
      return `
        <li class="lesson-row">
          <a href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(lesson.id)}">
            <span class="lesson-num">${String(index + 1).padStart(2, '0')}</span>
            <span class="lesson-title">${escapeHtml(lesson.title)}</span>
            <span class="lesson-meta">${lesson.minutes} min · ${lesson.xp} XP</span>
            <span class="lesson-state">${state}</span>
          </a>
        </li>
      `;
    })
    .join('');
}

function renderCourse(course) {
  setPageTitle(course.title);
  setMetaDescription(course.description);

  const lessons = getAllLessons(course);
  const stats = getCourseStats(course);
  const progress = getProgress();
  const xp = lessons.reduce((total, lesson) => total + lesson.xp, 0);
  const hero = document.querySelector('#course-hero');
  const content = document.querySelector('#course-content');
  if (!hero || !content) return;

  const courseHref = `course.html?course=${encodeURIComponent(course.id)}`;
  const targetLesson = stats.percent === 100 ? lessons[0] : stats.nextLesson;
  const nextHref = targetLesson
    ? `lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(targetLesson.id)}`
    : courseHref;
  const nextIndex = targetLesson ? lessons.findIndex((lesson) => lesson.id === targetLesson.id) : 0;

  let actionLabel = 'Start lesson 01';
  if (stats.percent === 100) actionLabel = 'Review lesson 01';
  else if (stats.started) actionLabel = `Continue lesson ${String(nextIndex + 1).padStart(2, '0')}`;

  const side = lessons.length
    ? `
      <span class="status ${course.status === 'open' ? 'status-open' : 'status-progress'}">${statusLabel(course.status)}</span>
      <div class="course-side-progress">
        <div class="course-side-label"><span>Your progress</span><span>${stats.percent}%</span></div>
        ${progressBar(stats.percent, `${course.title} progress`)}
        <div class="course-side-label"><span>${stats.completed} of ${pluralize(lessons.length, 'lesson')}</span><span>${xp} XP total</span></div>
      </div>
      <a class="button button-primary" href="${nextHref}">${actionLabel}</a>
      ${stats.percent === 100 ? `<a class="button button-secondary" href="certificate.html?course=${encodeURIComponent(course.id)}">Open certificate</a>` : ''}
      <p class="muted">Progress is saved in this browser.</p>
    `
    : `
      <span class="status status-progress">${statusLabel(course.status)}</span>
      <p class="muted">Lessons are not ready yet.</p>
      <a class="button button-primary" href="lesson.html?course=html&amp;lesson=html-01">Open the HTML course</a>
    `;

  hero.innerHTML = `
    <div>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <span>${escapeHtml(course.title)}</span>
      </nav>
      <h1 class="course-title">${escapeHtml(course.title)}</h1>
      <p class="course-sub">${escapeHtml(course.subtitle)}</p>
      <p class="course-description">${escapeHtml(course.description)}</p>
      <div class="course-meta-row">
        ${lessons.length ? `<span>${icon('BookOpen', { size: 16 })} ${pluralize(lessons.length, 'lesson')}</span>` : ''}
        ${course.modules.length ? `<span>${icon('Layers', { size: 16 })} ${pluralize(course.modules.length, 'module')}</span>` : ''}
        ${lessons.length ? `<span>${icon('Gauge', { size: 16 })} ${xp} XP</span>` : ''}
        <span>${icon('GraduationCap', { size: 16 })} ${escapeHtml(course.level)}</span>
      </div>
    </div>
    <aside class="course-side" aria-label="Course actions">
      ${side}
    </aside>
  `;

  if (!course.modules.length) {
    content.innerHTML = `
      <section class="planned-block" aria-labelledby="planned-heading">
        <p class="section-label">In progress</p>
        <h2 id="planned-heading">What is planned</h2>
        <p>${escapeHtml(course.note || 'This course is being written.')}</p>
        ${course.planned ? `<ul class="planned">${course.planned.map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>` : ''}
        <div class="hero-actions">
          <a class="button button-secondary" href="catalog.html">Back to the catalog</a>
        </div>
      </section>
    `;
    return;
  }

  content.innerHTML = `
    ${course.status !== 'open' && course.note ? `<p class="course-note">${escapeHtml(course.note)}</p>` : ''}
    ${course.modules
      .map((module, moduleIndex) => `
        <section class="module" aria-labelledby="module-${moduleIndex}">
          <div class="module-head">
            <div>
              <p class="module-kicker">Module ${String(moduleIndex + 1).padStart(2, '0')}</p>
              <h2 id="module-${moduleIndex}">${escapeHtml(module.title)}</h2>
              <p class="module-desc">${escapeHtml(module.description)}</p>
            </div>
            <p class="muted mono">${pluralize(module.lessons.length, 'lesson')}</p>
          </div>
          <ul class="lesson-rows">
            ${lessonRows(course, module.lessons, progress.completed)}
          </ul>
        </section>
      `)
      .join('')}
  `;
}

const course = getCourse(new URLSearchParams(window.location.search).get('course'));
initChrome();
if (course) renderCourse(course);
else renderNotFound();
