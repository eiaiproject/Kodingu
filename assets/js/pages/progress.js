import { courses, getAllLessons } from '../data/course-index.js';
import { projects } from '../data/data-projects.js';
import {
  createProgressExport,
  currentStreak,
  escapeHtml,
  formatFullDate,
  formatRelativeDate,
  getCourseStats,
  getProgress,
  getProgressReadError,
  getProgressRecovery,
  getTodayCount,
  icon,
  importProgressPayload,
  initChrome,
  MAX_IMPORT_BYTES,
  pluralize,
  progressBar,
  resetProgress,
  setPageTitle,
  storageAvailable,
  toast
} from '../core/app.js';

function renderStats() {
  const mount = document.querySelector('#stats');
  if (!mount) return;
  const progress = getProgress();
  const completed = Object.keys(progress.completed).length;
  const projectsDone = Object.keys(progress.completedProjects).length;
  const today = getTodayCount(progress);
  const streak = currentStreak(progress);
  const streakNote = streak ? `${pluralize(streak, 'day')} in a row` : 'Finish a lesson today to start';

  mount.innerHTML = `
    <div class="stat">
      <p class="stat-label">XP</p>
      <p class="stat-value">${progress.xp || 0}</p>
      <p class="stat-note">Total earned</p>
    </div>
    <div class="stat">
      <p class="stat-label">Streak</p>
      <p class="stat-value">${streak}</p>
      <p class="stat-note">${streakNote}</p>
    </div>
    <div class="stat">
      <p class="stat-label">Lessons</p>
      <p class="stat-value">${completed}</p>
      <p class="stat-note">${today ? `${today} finished today` : 'None finished today'}</p>
    </div>
    <div class="stat">
      <p class="stat-label">Projects</p>
      <p class="stat-value">${projectsDone}</p>
      <p class="stat-note">${projectsDone} of ${pluralize(projects.length, 'project')} complete</p>
    </div>
  `;
}

function renderCourses() {
  const mount = document.querySelector('#courses');
  if (!mount) return;

  mount.innerHTML = `
    <h2 id="courses-heading">Courses</h2>
    ${courses
      .map((course) => {
        const lessons = getAllLessons(course);
        const stats = getCourseStats(course);
        return `
          <div class="progress-course">
            <span class="progress-course-name">${escapeHtml(course.title)}</span>
            ${lessons.length ? progressBar(stats.percent, `${course.title} progress`) : '<span class="muted">Being written</span>'}
            <span class="progress-course-meta">${lessons.length ? `${stats.completed} of ${pluralize(lessons.length, 'lesson')}` : 'No lessons yet'}</span>
          </div>
        `;
      })
      .join('')}
  `;
}

function renderCertificates() {
  const mount = document.querySelector('#certificates');
  if (!mount) return;
  const eligible = courses.filter((course) => getAllLessons(course).length);

  mount.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-label">Certificates</p>
        <h2 id="certificates-heading">Finish a course, keep a record.</h2>
      </div>
      <p class="section-note">A certificate opens when every lesson in a course is complete. It is a local record, not a verified credential.</p>
    </div>
    <div class="certificate-list">
      ${eligible
        .map((course) => {
          const lessons = getAllLessons(course);
          const stats = getCourseStats(course);
          const complete = stats.percent === 100;
          return `
            <article class="certificate-card${complete ? ' is-ready' : ''}">
              <span class="certificate-card-icon">${icon('Award', { size: 20 })}</span>
              <div class="certificate-card-body">
                <h3>${escapeHtml(course.title)}</h3>
                <p>${complete ? `${pluralize(lessons.length, 'lesson')} complete` : `${stats.completed} of ${pluralize(lessons.length, 'lesson')} complete`}</p>
              </div>
              ${complete
                ? `<a class="button button-secondary button-small" href="certificate.html?course=${encodeURIComponent(course.id)}">Open certificate</a>`
                : '<span class="certificate-locked-label">Locked</span>'}
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderHistory() {
  const mount = document.querySelector('#history-section');
  if (!mount) return;
  const progress = getProgress();
  const history = (progress.history || []).filter(
    (entry) => entry && typeof entry === 'object' && !Array.isArray(entry)
  );

  if (!history.length) {
    mount.innerHTML = `
      <h2 id="history-heading">History</h2>
      <div class="empty">
        <p><strong>No lessons finished yet.</strong></p>
        <p>Finish a lesson and it will appear here with the XP you earned.</p>
        <a class="button button-primary" href="lesson.html?course=html&amp;lesson=html-01">Open lesson 01</a>
      </div>
    `;
    return;
  }

  mount.innerHTML = `
    <h2 id="history-heading">History</h2>
    <ul class="history-grid">
      ${history
        .map((entry) => {
          const course = entry.type === 'lesson'
            ? courses.find((item) => getAllLessons(item).some((lesson) => lesson.id === entry.id))
            : null;
          let label = course?.title || 'Lesson';
          let href = `lesson.html?course=${encodeURIComponent(course?.id || 'html')}&amp;lesson=${encodeURIComponent(entry.id)}`;
          if (entry.type === 'challenge') {
            label = 'Extra practice';
            href = `challenge.html?challenge=${encodeURIComponent(entry.id)}`;
          } else if (entry.type === 'project') {
            label = 'Project';
            href = `project.html?project=${encodeURIComponent(entry.id)}`;
          }
          return `
            <li class="history-card">
              <div class="history-card-top">
                <span class="history-icon">${icon('CheckCircle', { size: 16, label: 'Finished' })}</span>
                <span class="history-course">${escapeHtml(label)}</span>
              </div>
              <p class="history-card-title"><a href="${href}">${escapeHtml(entry.title || entry.id)}</a></p>
              <div class="history-card-foot">
                <span class="history-xp">+${Number(entry.xp) || 0} XP</span>
                <span class="history-date" title="${escapeHtml(formatFullDate(entry.at))}">${escapeHtml(formatRelativeDate(entry.at))}</span>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderSafely(render, label) {
  try {
    render();
  } catch (error) {
    console.warn(`Kodingu: the ${label} section could not be rendered.`, error);
  }
}

function renderAll() {
  renderSafely(renderStats, 'stats');
  renderSafely(renderCourses, 'courses');
  renderSafely(renderCertificates, 'certificates');
  renderSafely(renderHistory, 'history');
}

function renderDataNote() {
  const note = document.querySelector('#data-note');
  if (!note) return;
  const readError = getProgressReadError();
  const recovery = getProgressRecovery();
  if (readError) setDataStatus(readError, true);
  else if (recovery) {
    setDataStatus('An older saved record could not be read. Export JSON keeps its raw text under recovery.raw.');
  }
  if (!storageAvailable()) {
    const message = note.querySelector('p');
    if (message) {
      message.innerHTML = '<strong>This browser is blocking local storage.</strong> Progress and certificates will stay on this page and will be lost when you reload or close it.';
    }
  }
}

function setDataStatus(message, isError = false) {
  const status = document.querySelector('#data-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function exportProgress() {
  const payload = createProgressExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kodingu-progress-${payload.exportedAt.slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setDataStatus(
    payload.recovery
      ? 'Progress exported with the unreadable record under recovery.raw. Keep the file somewhere you can find it.'
      : 'Progress exported. Keep the file somewhere you can find it.'
  );
}

async function importProgress(file) {
  if (file.size > MAX_IMPORT_BYTES) {
    setDataStatus('That file is larger than 1 MB. Choose a Kodingu progress export.', true);
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch (error) {
    setDataStatus('That file is not valid JSON.', true);
    return;
  }

  const current = getProgress();
  const hasProgress = current.xp > 0 || Object.keys(current.completed).length > 0;
  const hasSavedRecord = Boolean(getProgressReadError() || getProgressRecovery());
  if ((hasProgress || hasSavedRecord) && !window.confirm('Import this file and replace the progress in this browser?')) {
    setDataStatus('Import cancelled.');
    return;
  }

  try {
    const progress = await importProgressPayload(payload);
    renderAll();
    resetResetButton();
    setDataStatus(`Imported ${progress.xp} XP and ${Object.keys(progress.completed).length} finished lessons.`);
    toast('Progress imported.');
  } catch (error) {
    setDataStatus(error.message || 'That file could not be imported.', true);
    toast('Import failed.');
  }
}

setPageTitle('Progress');
initChrome();
renderAll();
renderDataNote();

const exportButton = document.querySelector('#export-progress');
exportButton?.addEventListener('click', exportProgress);

const importButton = document.querySelector('#import-progress');
const importFile = document.querySelector('#import-file');
importButton?.addEventListener('click', () => importFile?.click());
importFile?.addEventListener('change', () => {
  const file = importFile.files?.[0];
  importFile.value = '';
  if (file) void importProgress(file);
});

const resetButton = document.querySelector('#reset-progress');
let resetTimer;

function resetResetButton() {
  if (!resetButton) return;
  window.clearTimeout(resetTimer);
  resetButton.dataset.confirm = 'false';
  resetButton.textContent = 'Reset progress';
}

resetButton?.addEventListener('click', () => {
  if (resetButton.dataset.confirm !== 'true') {
    resetButton.dataset.confirm = 'true';
    resetButton.textContent = 'Click again to reset';
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(resetResetButton, 5000);
    return;
  }

  resetProgress();
  renderAll();
  resetResetButton();
  setDataStatus('');
  toast('Progress and drafts cleared.');
});
