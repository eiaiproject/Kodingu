import { extraChallenges } from './data-challenges.js';
import {
  escapeHtml,
  getProgress,
  icon,
  initChrome,
  setPageTitle
} from './app.js';

const groups = [
  { id: 'html', label: 'HTML', note: 'Structure and accessible markup.' },
  { id: 'css', label: 'CSS', note: 'Layout, color, and responsive rules.' },
  { id: 'js', label: 'JavaScript', note: 'Events and page state.' }
];

function renderSummary(progress) {
  const mount = document.querySelector('#practice-summary');
  if (!mount) return;
  const completed = extraChallenges.filter((challenge) => progress.completedChallenges[challenge.id]);
  const xp = completed.reduce((sum, challenge) => sum + challenge.xp, 0);

  mount.innerHTML = `
    <div>
      <p class="practice-summary-value">${completed.length} of ${extraChallenges.length}</p>
      <p class="practice-summary-label">challenges complete</p>
    </div>
    <p class="practice-summary-note">
      ${completed.length
        ? `${xp} XP earned from extra practice. The courses are unchanged.`
        : 'Start anywhere. Each challenge takes about 12 to 16 minutes.'}
    </p>
  `;
}

function renderGroups(progress) {
  const mount = document.querySelector('#challenge-groups');
  if (!mount) return;

  mount.innerHTML = groups
    .map((group) => {
      const items = extraChallenges.filter((challenge) => challenge.language === group.id);
      return `
        <section class="challenge-group" aria-labelledby="group-${group.id}">
          <div class="challenge-group-head">
            <div>
              <h2 id="group-${group.id}">${group.label}</h2>
              <p>${group.note}</p>
            </div>
            <span class="challenge-group-count">${items.length} challenges</span>
          </div>
          <ul class="challenge-list">
            ${items
              .map((challenge) => {
                const complete = Boolean(progress.completedChallenges[challenge.id]);
                return `
                  <li>
                    <a class="challenge-row" href="challenge.html?challenge=${encodeURIComponent(challenge.id)}">
                      <span class="challenge-index">${String(extraChallenges.indexOf(challenge) + 1).padStart(2, '0')}</span>
                      <span class="challenge-body">
                        <span class="challenge-title-row">
                          <span class="challenge-title">${escapeHtml(challenge.title)}</span>
                          <span class="challenge-language">${group.label}</span>
                        </span>
                        <span class="challenge-summary">${escapeHtml(challenge.summary)}</span>
                        <span class="challenge-meta">
                          <span>${icon('Clock', { size: 14 })} ${challenge.minutes} min</span>
                          <span>${icon('Gauge', { size: 14 })} ${challenge.xp} XP</span>
                          <span>${icon('Target', { size: 14 })} ${challenge.tests.length} checks</span>
                        </span>
                      </span>
                      <span class="challenge-side">
                        <span class="status${complete ? ' status-complete' : ''}">${complete ? 'Complete' : 'Open'}</span>
                        <span class="challenge-action">${complete ? 'Review challenge' : 'Open challenge'}</span>
                      </span>
                    </a>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </section>
      `;
    })
    .join('');
}

const progress = getProgress();
setPageTitle('Practice');
initChrome();
renderSummary(progress);
renderGroups(progress);
