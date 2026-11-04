import { extraChallenges, getChallenge } from '../data/data-challenges.js';
import {
  completeChallenge,
  escapeHtml,
  formatRelativeDate,
  getProgress,
  icon,
  initChrome,
  progressBar,
  setPageTitle,
  setSocialMeta,
  toast
} from '../core/app.js';
import { mountWorkspace, wireCopyCode, wireToggle } from '../editor/workspace.js';

const params = new URLSearchParams(window.location.search);
const challenge = getChallenge(params.get('challenge'));
const main = document.querySelector('#challenge-main');
const sidebar = document.querySelector('#challenge-sidebar');

const languageMeta = {
  html: { file: 'index.html', label: 'Your HTML', heading: 'Write the markup', frame: 'HTML' },
  css: { file: 'styles.css', label: 'Your CSS', heading: 'Write the styles', frame: 'CSS' },
  js: { file: 'script.js', label: 'Your JavaScript', heading: 'Write the script', frame: 'JavaScript' }
};

function readDraft() {
  if (!challenge) return null;
  try {
    return localStorage.getItem(`kodingu.challengeDraft.${challenge.id}`);
  } catch (error) {
    return null;
  }
}

function challengeAt(offset) {
  const index = extraChallenges.findIndex((item) => item.id === challenge.id);
  return index >= 0 ? extraChallenges[index + offset] || null : null;
}

function renderSidebar() {
  if (!sidebar || !challenge) return;
  const progress = getProgress();
  const completed = extraChallenges.filter((item) => progress.completedChallenges[item.id]).length;

  sidebar.innerHTML = `
    <p class="sidebar-course">Extra challenges</p>
    <p class="sidebar-module">Practice beyond the courses</p>
    <div class="sidebar-progress">
      <div class="sidebar-progress-label"><span>${completed} of ${extraChallenges.length}</span><span>${Math.round((completed / extraChallenges.length) * 100)}%</span></div>
      ${progressBar(Math.round((completed / extraChallenges.length) * 100), 'Extra challenges complete')}
    </div>
    <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-expanded="false" aria-controls="sidebar-lessons">
      <span>Challenge index</span>
      <span class="sidebar-toggle-meta">${extraChallenges.length} challenges ${icon('ChevronDown', { size: 16 })}</span>
    </button>
    <nav class="sidebar-lessons" id="sidebar-lessons" aria-label="Extra challenges" data-open="false">
      <ul class="sidebar-list">
        ${extraChallenges
          .map(
            (item, index) => `
              <li>
                <a href="challenge.html?challenge=${encodeURIComponent(item.id)}"${item.id === challenge.id ? ' aria-current="page"' : ''}>
                  <span class="sidebar-num">${String(index + 1).padStart(2, '0')}</span>
                  <span>${escapeHtml(item.title)}</span>
                  ${progress.completedChallenges[item.id] ? `<span class="sidebar-check">${icon('CheckCircle', { size: 15, label: 'Complete' })}</span>` : ''}
                </a>
              </li>
            `
          )
          .join('')}
      </ul>
    </nav>
  `;

  const toggle = sidebar.querySelector('#sidebar-toggle');
  const list = sidebar.querySelector('#sidebar-lessons');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    if (list) list.dataset.open = String(!open);
  });
}

function renderNotFound() {
  setPageTitle('Challenge not found');
  if (sidebar) sidebar.innerHTML = '';
  if (!main) return;
  main.innerHTML = `
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="practice.html">Practice</a>
      </nav>
      <h1>Challenge not found</h1>
      <p class="lede">This challenge address does not match one in the practice set.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="practice.html">Open the practice set</a>
      </div>
    </div>
  `;
}

function codeBlock(code, lang) {
  return `
    <div class="code-block">
      <div class="code-head">
        <span class="code-lang">${escapeHtml(lang)}</span>
        <button class="copy-code" type="button">${icon('Copy', { size: 14 })} Copy</button>
      </div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </div>
  `;
}

function completedPanelMarkup(progress) {
  const entry = progress.completedChallenges[challenge.id];
  const next = challengeAt(1);
  return `
    <section class="finish-panel is-complete" id="finish-panel" aria-labelledby="finish-heading">
      <h2 class="finish-title" id="finish-heading">${icon('CheckCircle', { size: 20 })} Challenge complete</h2>
      <p class="muted">Finished ${escapeHtml(formatRelativeDate(entry?.at))}. You earned ${challenge.xp} XP and ${entry?.tokens || challenge.tokens} tokens. Extra practice does not change course progress.</p>
      <div class="finish-actions">
        ${next ? `<a class="button button-primary" href="challenge.html?challenge=${encodeURIComponent(next.id)}">Next challenge: ${escapeHtml(next.title)}</a>` : '<a class="button button-primary" href="practice.html">All challenges</a>'}
        <a class="button button-secondary" href="practice.html">Practice set</a>
        <a class="button button-secondary" href="progress.html">See progress</a>
      </div>
    </section>
  `;
}

function renderMain() {
  if (!main || !challenge) return;
  const progress = getProgress();
  const completed = Boolean(progress.completedChallenges[challenge.id]);
  const draft = readDraft() ?? challenge.starter;
  const meta = languageMeta[challenge.language] || languageMeta.html;
  const previous = challengeAt(-1);
  const next = challengeAt(1);
  const checks = challenge.tests
    .map(
      (test, index) => `
        <li class="check-item" data-check="${index}">
          <span class="check-icon"><span class="check-pending"></span></span>
          <span>${escapeHtml(test.label)}</span>
          <span class="check-state">Not run</span>
        </li>
      `
    )
    .join('');
  const previousLink = previous
    ? `<a href="challenge.html?challenge=${encodeURIComponent(previous.id)}"><span class="lesson-nav-label">Previous challenge</span><span>${escapeHtml(previous.title)}</span></a>`
    : '<span></span>';
  const nextLink = next
    ? `<a class="lesson-nav-next" href="challenge.html?challenge=${encodeURIComponent(next.id)}"><span class="lesson-nav-label">Next challenge</span><span>${escapeHtml(next.title)}</span></a>`
    : '<a class="lesson-nav-next" href="practice.html"><span class="lesson-nav-label">Practice set</span><span>All challenges</span></a>';
  const finishMarkup = completed
    ? completedPanelMarkup(progress)
    : `
      <section class="finish-panel" id="finish-panel" aria-labelledby="finish-heading">
        <h2 class="finish-title" id="finish-heading">Finish this challenge</h2>
        <div class="finish-status">
          <span id="finish-checks"><span class="check-pending"></span> Checks</span>
        </div>
        <div class="finish-actions">
          <button class="button button-primary" id="finish-challenge" type="button" disabled>Finish challenge · +${challenge.xp} XP</button>
          <span class="finish-hint" id="finish-hint">Pass every check to finish.</span>
        </div>
      </section>
    `;

  main.innerHTML = `
    <header class="lesson-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="practice.html">Practice</a>
        <span class="sep" aria-hidden="true">/</span>
        <span>${escapeHtml(challenge.title)}</span>
      </nav>
      <h1>${escapeHtml(challenge.title)}</h1>
      <div class="lesson-meta-row">
        <span>${icon('Layers', { size: 16 })} ${meta.frame}</span>
        <span>${icon('Clock', { size: 16 })} ${challenge.minutes} min</span>
        <span>${icon('Gauge', { size: 16 })} ${challenge.xp} XP</span>
        <span>${icon('Target', { size: 16 })} ${challenge.tests.length} checks</span>
        ${completed ? `<span>${icon('CheckCircle', { size: 16 })} Complete</span>` : ''}
      </div>
      <div class="goal">
        <span class="goal-label">Goal</span>
        <p>${escapeHtml(challenge.objective)}</p>
      </div>
    </header>

    <section class="exercise" aria-labelledby="brief-heading">
      <div class="exercise-head">
        <h2 id="brief-heading">The brief</h2>
        <span class="exercise-kicker">${escapeHtml(challenge.language.toUpperCase())}</span>
      </div>
      <p class="challenge-prompt">${escapeHtml(challenge.prompt)}</p>
      <ul class="requirements">
        ${challenge.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>

    <section class="exercise" aria-labelledby="workspace-heading">
      <div class="exercise-head">
        <h2 id="workspace-heading">${meta.heading}</h2>
        <span class="exercise-kicker">Workspace</span>
      </div>

      <div class="editor">
        <div class="editor-bar">
          <span class="editor-file">${meta.file}</span>
          <div class="editor-actions">
            <button class="button button-secondary button-small" id="run-challenge" type="button" title="Run the preview (Ctrl+Enter)">
              ${icon('Play', { size: 15 })} Run
            </button>
            <button class="button button-primary button-small" id="check-challenge" type="button" title="Run the checks (Ctrl+Shift+Enter)">
              ${icon('Check', { size: 15 })} Check
            </button>
            <button class="button button-quiet button-small" id="reset-challenge" type="button">Reset</button>
          </div>
        </div>
        <div class="editor-grid">
          <label class="sr-only" for="challenge-editor">${meta.label}</label>
          <textarea class="editor-code" id="challenge-editor" spellcheck="false" autocomplete="off">${escapeHtml(draft)}</textarea>
          <div class="editor-preview">
            <p class="preview-label">Preview</p>
            <iframe id="challenge-frame" title="Preview of your ${meta.frame}" sandbox="" tabindex="-1"></iframe>
          </div>
        </div>
        <output class="editor-error" id="challenge-error" hidden></output>
      </div>

      <div class="checks">
        <div class="checks-head"><span>Checks</span><span id="checks-summary" aria-live="polite">Not run</span></div>
        <ul id="test-list">${checks}</ul>
      </div>

      <div class="quiz-actions">
        <button class="button button-quiet button-small" id="hint-toggle" type="button" aria-expanded="false" aria-controls="hint">Show hint</button>
        <button class="button button-quiet button-small" id="solution-toggle" type="button" aria-expanded="false" aria-controls="solution">Show solution</button>
      </div>
      <div class="hint" id="hint" hidden>${escapeHtml(challenge.hint)}</div>
      <div class="solution" id="solution" hidden>
        <p class="solution-note">One way to do it. Your page may differ and still pass.</p>
        ${codeBlock(challenge.solution, challenge.language)}
      </div>
    </section>

    ${finishMarkup}

    <nav class="lesson-nav" aria-label="Challenge navigation">
      ${previousLink}
      ${nextLink}
    </nav>
  `;

  wireChallenge();
}

function wireChallenge() {
  const finishButton = document.querySelector('#finish-challenge');
  let workspace;

  const updateFinishState = () => {
    if (!finishButton) return;
    const testsPassed = workspace?.state.testsPassed === true;
    const checks = document.querySelector('#finish-checks');
    const hint = document.querySelector('#finish-hint');
    finishButton.disabled = !testsPassed;
    if (checks) {
      checks.classList.toggle('is-done', testsPassed);
      checks.innerHTML = `${testsPassed ? icon('CheckCircle', { size: 15 }) : '<span class="check-pending"></span>'} Checks`;
    }
    if (hint) {
      hint.textContent = testsPassed ? 'Ready when you are.' : 'Pass every check to finish.';
    }
  };

  workspace = mountWorkspace({
    editor: document.querySelector('#challenge-editor'),
    frame: document.querySelector('#challenge-frame'),
    errorMount: document.querySelector('#challenge-error'),
    runButton: document.querySelector('#run-challenge'),
    checkButton: document.querySelector('#check-challenge'),
    resetButton: document.querySelector('#reset-challenge'),
    language: challenge.language,
    preview: challenge.preview,
    tests: challenge.tests,
    starter: challenge.starter,
    draftKey: `kodingu.challengeDraft.${challenge.id}`,
    onCheck: updateFinishState,
    onEdit: updateFinishState,
    onReset: updateFinishState
  });

  void workspace.runPreview();
  updateFinishState();

  wireToggle('#hint-toggle', '#hint', 'Show hint', 'Hide hint');
  wireToggle('#solution-toggle', '#solution', 'Show solution', 'Hide solution');

  finishButton?.addEventListener('click', () => {
    workspace.saveDraft();
    const result = completeChallenge(challenge);
    if (!result.completed) {
      toast('This challenge is already complete.');
      return;
    }
    toast(`Challenge complete. +${result.xpEarned} XP, +${result.tokensEarned} tokens.`);
    renderSidebar();
    renderMain();
  });
}

initChrome();
wireCopyCode(main);
if (challenge) {
  setPageTitle(challenge.title);
  setSocialMeta({
    title: challenge.title,
    description: challenge.summary,
    path: `/challenge?challenge=${encodeURIComponent(challenge.id)}`
  });
  renderSidebar();
  renderMain();
} else {
  renderNotFound();
}
