import { courses } from './data.js';
import {
  buildPreviewDocument,
  escapeHtml,
  icon,
  initChrome,
  pluralize,
  statusLabel
} from './app.js';

function renderCourses() {
  const list = document.querySelector('#home-courses');
  if (!list) return;

  list.innerHTML = courses
    .map((course, index) => {
      const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
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
      update();
    }
  });

  update();
}

initChrome();
renderCourses();
initDemo();
