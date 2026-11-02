import { getCourse, getAllLessons } from './data.js';
import {
  escapeHtml,
  formatFullDate,
  getCourseStats,
  getProgress,
  icon,
  initChrome,
  pluralize,
  progressBar,
  setPageTitle,
  setSocialMeta
} from './app.js';

const NAME_KEY = 'kodingu.certificate.name';
const params = new URLSearchParams(window.location.search);
const course = getCourse(params.get('course'));
const main = document.querySelector('#certificate-main');
const pageHeading = document.querySelector('.page-head h1');

function readName() {
  try {
    return (localStorage.getItem(NAME_KEY) || '').slice(0, 60);
  } catch (error) {
    return '';
  }
}

function saveName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch (error) {
    // The name still appears on this page view when storage is unavailable.
  }
}

function renderNotFound() {
  setPageTitle('Certificate not found');
  if (pageHeading) pageHeading.textContent = 'Certificate not found';
  if (!main) return;
  main.innerHTML = `
    <div class="empty">
      <h2>No course at this address.</h2>
      <p>The certificate link needs a course that exists in the catalog.</p>
      <a class="button button-primary" href="catalog.html">Open the catalog</a>
    </div>
  `;
}

function renderLocked(stats) {
  const lessons = getAllLessons(course);
  setPageTitle(`${course.title} certificate`);
  setSocialMeta({
    title: `${course.title} certificate`,
    description: `A local record of the completed Kodingu ${course.title} course.`,
    path: `/certificate?course=${encodeURIComponent(course.id)}`
  });
  if (pageHeading) pageHeading.textContent = `${course.title} certificate`;
  if (!main) return;
  const next = stats.nextLesson;
  main.innerHTML = `
    <section class="certificate-locked" aria-labelledby="locked-heading">
      <p class="section-label">Not ready yet</p>
      <h2 id="locked-heading">Finish the course first.</h2>
      <p>${stats.completed} of ${pluralize(lessons.length, 'lesson')} complete. A certificate opens when every lesson is finished.</p>
      ${progressBar(stats.percent, `${course.title} progress`)}
      <div class="hero-actions">
        ${next
          ? `<a class="button button-primary" href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(next.id)}">Continue with ${escapeHtml(next.title)}</a>`
          : ''}
        <a class="button button-secondary" href="course.html?course=${encodeURIComponent(course.id)}">Course overview</a>
      </div>
    </section>
  `;
}

function renderCertificate() {
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const xp = lessons.reduce((sum, lesson) => sum + lesson.xp, 0);
  const completedDates = lessons
    .map((lesson) => progress.completed[lesson.id]?.at)
    .filter(Boolean)
    .sort();
  const completedAt = completedDates[completedDates.length - 1] || new Date().toISOString();
  const name = readName();
  setPageTitle(`${course.title} certificate`);
  setSocialMeta({
    title: `${course.title} certificate`,
    description: `A local record of the completed Kodingu ${course.title} course.`,
    path: `/certificate?course=${encodeURIComponent(course.id)}`
  });
  if (pageHeading) pageHeading.textContent = `${course.title} certificate`;
  if (!main) return;

  main.innerHTML = `
    <section class="certificate-wrap" aria-labelledby="certificate-heading">
      <div class="certificate-actions">
        <label for="certificate-name">Name on certificate</label>
        <input id="certificate-name" name="certificate-name" type="text" maxlength="60" autocomplete="name" placeholder="Your name" value="">
        <button class="button button-primary" id="print-certificate" type="button" disabled>
          ${icon('Award', { size: 16 })} Print or save as PDF
        </button>
        <p class="certificate-hint" id="certificate-hint">Add your name to print.</p>
      </div>

      <article class="certificate" id="certificate">
        <div class="certificate-mark" aria-hidden="true">${icon('Code', { size: 26 })}</div>
        <p class="certificate-kicker">Kodingu certificate</p>
        <h2 class="certificate-course" id="certificate-heading">${escapeHtml(course.title)}</h2>
        <p class="certificate-for">Awarded to</p>
        <p class="certificate-name is-placeholder" id="certificate-name-display">Your name</p>
        <p class="certificate-copy">for completing all ${pluralize(lessons.length, 'lesson')} and earning ${xp} XP.</p>
        <dl class="certificate-meta">
          <div><dt>Date</dt><dd>${escapeHtml(formatFullDate(completedAt))}</dd></div>
          <div><dt>Lessons</dt><dd>${lessons.length}</dd></div>
          <div><dt>XP</dt><dd>${xp}</dd></div>
        </dl>
        <p class="certificate-note">Local record. Stored in this browser and not verified by Kodingu.</p>
      </article>
    </section>
  `;

  const input = document.querySelector('#certificate-name');
  const display = document.querySelector('#certificate-name-display');
  const printButton = document.querySelector('#print-certificate');
  const hint = document.querySelector('#certificate-hint');
  input.value = name;

  const updateName = () => {
    const value = input.value.trim().slice(0, 60);
    saveName(value);
    display.textContent = value || 'Your name';
    display.classList.toggle('is-placeholder', !value);
    printButton.disabled = !value;
    hint.textContent = value ? 'Print or save as PDF from your browser.' : 'Add your name to print.';
  };

  input.addEventListener('input', updateName);
  updateName();
  printButton.addEventListener('click', () => {
    window.print();
  });
}

initChrome();
if (!course) {
  renderNotFound();
} else {
  const stats = getCourseStats(course);
  if (stats.percent !== 100) renderLocked(stats);
  else renderCertificate();
}
