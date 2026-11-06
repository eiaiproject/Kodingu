import { courses } from '../data/course-index.js';
import {
  buildPreviewDocument,
  escapeHtml,
  getResumeTarget,
  icon,
  initChrome,
  pluralize,
  statusLabel
} from '../core/app.js';

function courseLessonCount(course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function renderHeroNote() {
  const note = document.querySelector('#hero-counts');
  if (!note) return;

  const counts = courses.map((course) => {
    const lessonCount = courseLessonCount(course);
    return `${lessonCount} ${course.title} ${lessonCount === 1 ? 'lesson' : 'lessons'}`;
  });
  const list = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  note.textContent = `${list.format(counts)} are open now.`;
}

function renderHeroCta() {
  const link = document.querySelector('#hero-cta');
  const label = document.querySelector('#hero-cta-label');
  if (!link || !label) return;
  const target = getResumeTarget();
  link.href = target.href;
  if (target.label === 'Continue') label.textContent = `Continue: ${target.title}`;
  else if (target.label === 'Review') label.textContent = `Review: ${target.title}`;
  else if (target.label === 'Browse catalog') label.textContent = 'Browse the catalog';
  else label.textContent = 'Start the HTML course';
  link.setAttribute('aria-label', `${target.label}: ${target.title}`);
}

function renderCourses() {
  const list = document.querySelector('#home-courses');
  if (!list) return;

  list.innerHTML = courses
    .map((course, index) => {
      const lessonCount = courseLessonCount(course);
      const meta = lessonCount ? pluralize(lessonCount, 'lesson') : 'Being written';
      return `
        <li class="course-row">
          <a class="course-row-link" href="course.html?course=${encodeURIComponent(course.id)}">
            <span class="course-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="course-main">
              <span class="course-title">${escapeHtml(course.title)}</span>
              <span class="course-sub">${escapeHtml(course.subtitle)}</span>
            </span>
            <span class="course-meta">${meta}</span>
            <span class="status ${course.status === 'open' ? 'status-open' : 'status-progress'}">${statusLabel(course.status)}</span>
            <span class="course-arrow">${icon('ArrowRight', { size: 18 })}</span>
          </a>
        </li>
      `;
    })
    .join('');
}

function initDemo() {
  const code = document.querySelector('#demo-code');
  const frame = document.querySelector('#demo-frame');
  const run = document.querySelector('#demo-run');
  if (!code || !frame || !run) return;

  const update = async () => {
    frame.srcdoc = await buildPreviewDocument(code.value);
  };

  run.addEventListener('click', update);
  code.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void update();
    }
  });

  void update();
}

initChrome();
renderHeroNote();
renderHeroCta();
renderCourses();
initDemo();
