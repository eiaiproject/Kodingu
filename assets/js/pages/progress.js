import { courses, getAllLessons } from '../data/course-index.js';
import {
  buyFreezeChest,
  claimDailyMission,
  createProgressExport,
  currentStreak,
  dayKey,
  escapeHtml,
  formatFullDate,
  formatRelativeDate,
  getCourseStats,
  getProgress,
  getStreakState,
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
import {
  CHEST_COST,
  FREEZE_LIMIT,
  getDailyMissions,
  getLeague,
  getMissionProgress,
  getWeeklyXp
} from '../core/gamification.js';

function renderStats() {
  const mount = document.querySelector('#stats');
  if (!mount) return;
  const progress = getProgress();
  const completed = Object.keys(progress.completed).length;
  const today = getTodayCount(progress);
  const streak = currentStreak(progress);
  const streakState = getStreakState(progress);
  const tokens = progress.tokens || 0;
  let streakNote = 'Finish a lesson today to start';
  if (streak) {
    const ending = streakState.protectedByFreeze
      ? ' · a freeze covers the missed day'
      : ' in a row';
    streakNote = pluralize(streak, 'day') + ending;
  }

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
      <p class="stat-label">Tokens</p>
      <p class="stat-value">${tokens}</p>
      <p class="stat-note">${pluralize(progress.streakFreezes || 0, 'freeze')} in the bank</p>
    </div>
  `;
}

function renderRewards() {
  const mount = document.querySelector('#rewards');
  if (!mount) return;
  const progress = getProgress();
  const weeklyXp = getWeeklyXp(progress);
  const league = getLeague(weeklyXp);
  const tokens = progress.tokens || 0;
  const freezes = progress.streakFreezes || 0;
  const canBuy = tokens >= CHEST_COST && freezes < FREEZE_LIMIT;
  let chestNote = 'One freeze, no chance involved.';
  if (freezes >= FREEZE_LIMIT) {
    chestNote = 'Freeze slots are full. Spend tokens after you use one.';
  } else if (tokens < CHEST_COST) {
    chestNote = `${CHEST_COST - tokens} more tokens needed.`;
  }

  mount.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-label">Rewards</p>
        <h2 id="rewards-heading">A small economy.</h2>
      </div>
      <p class="section-note">Everything here is local to this browser and tied to work you actually finished.</p>
    </div>
    <div class="reward-grid">
      <article class="reward-card" aria-labelledby="league-name">
        <div class="reward-card-head">
          <span class="reward-icon">${icon('Trophy', { size: 20 })}</span>
          <p class="reward-kicker">Weekly league</p>
        </div>
        <p class="reward-value" id="league-name">${league.current.name}</p>
        <p class="muted">${weeklyXp} XP this week</p>
        ${progressBar(league.percent, 'League progress')}
        <p class="reward-note">
          ${league.next ? `${league.toNext} XP to ${league.next.name}.` : 'Top league reached this week.'}
          This league measures your own week, not other learners.
        </p>
      </article>
      <article class="reward-card" aria-labelledby="token-balance">
        <div class="reward-card-head">
          <span class="reward-icon">${icon('Coins', { size: 20 })}</span>
          <p class="reward-kicker">Tokens</p>
        </div>
        <p class="reward-value" id="token-balance">${tokens}</p>
        <p class="muted">Earn 10 per lesson and up to 35 from daily missions.</p>
        <div class="reward-line">
          <span>${icon('Snowflake', { size: 16 })} Streak freezes</span>
          <span>${freezes} / ${FREEZE_LIMIT}</span>
        </div>
        <div class="reward-line">
          <span>${icon('Bookmark', { size: 16 })} Chests opened</span>
          <span>${progress.chestsOpened || 0}</span>
        </div>
        <button class="button button-secondary button-small" id="buy-chest" type="button"${canBuy ? '' : ' disabled'}>
          ${icon('Snowflake', { size: 15 })} Open freeze chest · ${CHEST_COST} tokens
        </button>
        <p class="reward-note">${chestNote}</p>
      </article>
    </div>
  `;
}

function renderMissions() {
  const mount = document.querySelector('#missions');
  if (!mount) return;
  const progress = getProgress();
  const hasUnfinished = courses.some((course) =>
    getAllLessons(course).some((lesson) => !progress.completed[lesson.id])
  );
  const missions = getDailyMissions(hasUnfinished);
  const day = progress.missions[dayKey()] || {};
  const claimed = Array.isArray(day.claimed) ? day.claimed : [];

  mount.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-label">Daily practice</p>
        <h2 id="missions-heading">Today's practice.</h2>
      </div>
      <p class="section-note">Three small tasks. They reset at midnight in this browser's time zone.</p>
    </div>
    <ul class="mission-list">
      ${missions
        .map((mission) => {
          const current = Math.min(mission.target, getMissionProgress(progress, mission));
          const complete = current >= mission.target;
          const isClaimed = claimed.includes(mission.id);
          let state = '';
          if (isClaimed) state = 'is-claimed';
          else if (complete) state = 'is-complete';
          let control = '<span class="mission-claimed">Claimed</span>';
          if (!isClaimed) {
            const label = complete ? `Claim +${mission.reward}` : 'In progress';
            control = `<button class="button button-secondary button-small" type="button" data-mission="${mission.id}"${complete ? '' : ' disabled'}>${label}</button>`;
          }
          return `
            <li class="mission-item ${state}">
              <span class="mission-icon">${icon('Target', { size: 18 })}</span>
              <div class="mission-body">
                <p class="mission-title">${escapeHtml(mission.title)}</p>
                <p class="mission-desc">${escapeHtml(mission.description)} +${mission.reward} tokens.</p>
              </div>
              <div class="mission-meter">
                <span class="mission-count">${current} / ${mission.target}</span>
                ${progressBar(Math.round((current / mission.target) * 100), `${mission.title} progress`)}
              </div>
              ${control}
            </li>
          `;
        })
        .join('')}
    </ul>
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
  const history = progress.history || [];

  if (!history.length) {
    mount.innerHTML = `
      <h2 id="history-heading">History</h2>
      <div class="empty">
        <p><strong>No lessons finished yet.</strong></p>
        <p>Finish a lesson and it will appear here with the XP and tokens you earned.</p>
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
          if (entry.type === 'chest') {
            return `
              <li class="history-card history-card-reward">
                <div class="history-card-top">
                  <span class="history-icon">${icon('Snowflake', { size: 16, label: 'Reward' })}</span>
                  <span class="history-course">Reward</span>
                </div>
                <p class="history-card-title">${escapeHtml(entry.title || 'Freeze chest')}</p>
                <div class="history-card-foot">
                  <span class="history-spend">${Math.abs(entry.tokens || 0)} tokens spent</span>
                  <span class="history-date" title="${escapeHtml(formatFullDate(entry.at))}">${escapeHtml(formatRelativeDate(entry.at))}</span>
                </div>
              </li>
            `;
          }
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
                <span class="history-xp">+${entry.xp || 0} XP</span>
                <span class="history-date" title="${escapeHtml(formatFullDate(entry.at))}">${escapeHtml(formatRelativeDate(entry.at))}</span>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderAll() {
  renderStats();
  renderRewards();
  renderMissions();
  renderCourses();
  renderCertificates();
  renderHistory();
}

function renderDataNote() {
  const note = document.querySelector('#data-note');
  if (!note || storageAvailable()) return;
  const message = note.querySelector('p');
  if (message) {
    message.innerHTML = '<strong>This browser is blocking local storage.</strong> Progress, tokens, and certificates will stay on this page and will be lost when you reload or close it.';
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
  setDataStatus('Progress exported. Keep the file somewhere you can find it.');
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
  if (hasProgress && !window.confirm('Import this file and replace the progress in this browser?')) {
    setDataStatus('Import cancelled.');
    return;
  }

  try {
    const progress = importProgressPayload(payload);
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

const rewardMount = document.querySelector('#rewards');
rewardMount?.addEventListener('click', (event) => {
  const button = event.target.closest('#buy-chest');
  if (!button) return;
  const result = buyFreezeChest();
  toast(result.ok ? 'Freeze chest opened. One streak freeze added.' : result.reason);
  if (result.ok) renderAll();
});

const missionMount = document.querySelector('#missions');
missionMount?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mission]');
  if (!button) return;
  const result = claimDailyMission(button.dataset.mission);
  toast(result.claimed ? `Mission claimed. +${result.reward} tokens.` : result.reason);
  if (result.claimed) renderAll();
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
  toast('Progress cleared.');
});
