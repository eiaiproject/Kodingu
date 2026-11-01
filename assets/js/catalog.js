import { courses } from './data.js';
import {
  escapeHtml,
  getCourseStats,
  initChrome,
  pluralize,
  progressBar,
  setPageTitle,
  statusLabel
} from './app.js';

function lessonCount(course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function xpCount(course) {
  return course.modules.reduce(
    (total, module) => total + module.lessons.reduce((sum, lesson) => sum + lesson.xp, 0),
    0
  );
}

function courseAction(course, stats) {
  const courseHref = `course.html?course=${encodeURIComponent(course.id)}`;
  if (!lessonCount(course)) {
    return `<a class="button button-secondary button-small" href="${courseHref}">See what is planned</a>`;
  }
  if (stats.percent === 100) {
    return `<a class="button button-secondary button-small" href="${courseHref}">Review course</a>`;
  }
  if (stats.nextLesson) {
    const label = stats.started ? 'Continue' : 'Start lesson 01';
    return `<a class="button button-primary button-small" href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(stats.nextLesson.id)}">${label}</a>`;
  }
  return `<a class="button button-secondary button-small" href="${courseHref}">Open course</a>`;
}

function plannedMarkup(course) {
  if (!course.planned) return '';
  const items = course.planned.map((topic) => `<li>${escapeHtml(topic)}</li>`).join('');
  return `<ul class="planned">${items}</ul>`;
}

function renderCatalog() {
  const mount = document.querySelector('#catalog-list');
  if (!mount) return;

  mount.innerHTML = courses
    .map((course, index) => {
      const total = lessonCount(course);
      const stats = getCourseStats(course);
      const xp = xpCount(course);
      const planned = plannedMarkup(course);
      const progress = total
        ? `<div class="catalog-progress">
             <span class="catalog-progress-label">${stats.completed} of ${pluralize(total, 'lesson')} complete</span>
             ${progressBar(stats.percent, `${course.title} progress`)}
           </div>`
        : '';
      const meta = total
        ? `<div class="catalog-meta"><span>${pluralize(total, 'lesson')}</span><span>${pluralize(course.modules.length, 'module')}</span><span>${xp} XP</span></div>`
        : `<div class="catalog-meta"><span>Being written</span><span>${escapeHtml(course.level)}</span></div>`;

      return `
        <article class="catalog-item">
          <span class="catalog-index">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <div class="catalog-title-row">
              <a class="catalog-title" href="course.html?course=${encodeURIComponent(course.id)}">${escapeHtml(course.title)}</a>
              <span class="catalog-sub">${escapeHtml(course.subtitle)}</span>
            </div>
            <p>${escapeHtml(course.description)}</p>
            ${planned}
          </div>
          <div class="catalog-side">
            <span class="status ${course.status === 'open' ? 'status-open' : 'status-progress'}">${statusLabel(course.status)}</span>
            ${meta}
            ${progress}
            <div class="catalog-actions">${courseAction(course, stats)}</div>
          </div>
        </article>
      `;
    })
    .join('');
}

setPageTitle('Catalog');
initChrome();
renderCatalog();
