import { getProject, projects } from './data-projects.js';
import {
  buildProjectPreview,
  completeProject,
  escapeHtml,
  formatRelativeDate,
  getProgress,
  icon,
  initChrome,
  pluralize,
  progressBar,
  setPageTitle,
  toggleProjectRequirement,
  toast
} from './app.js';

const project = getProject(new URLSearchParams(window.location.search).get('project'));
const main = document.querySelector('#project-main');
const sidebar = document.querySelector('#project-sidebar');

function readDraft() {
  if (!project) return null;
  try {
    return localStorage.getItem(`kodingu.projectDraft.${project.id}`);
  } catch (error) {
    return null;
  }
}

function saveDraft(value) {
  if (!project) return;
  try {
    localStorage.setItem(`kodingu.projectDraft.${project.id}`, value);
  } catch (error) {
    // Draft saving is optional; the editor keeps working without it.
  }
}

function nextProject() {
  const index = projects.findIndex((item) => item.id === project.id);
  return index >= 0 ? projects[index + 1] || null : null;
}

function renderSidebar() {
  if (!sidebar || !project) return;
  const progress = getProgress();
  const completed = projects.filter((item) => progress.completedProjects[item.id]).length;

  sidebar.innerHTML = `
    <p class="sidebar-course">Projects</p>
    <p class="sidebar-module">Build something whole</p>
    <div class="sidebar-progress">
      <div class="sidebar-progress-label"><span>${completed} of ${projects.length}</span><span>${Math.round((completed / projects.length) * 100)}%</span></div>
      ${progressBar(Math.round((completed / projects.length) * 100), 'Projects complete')}
    </div>
    <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-expanded="false" aria-controls="sidebar-lessons">
      <span>Project index</span>
      <span class="sidebar-toggle-meta">${projects.length} projects ${icon('ChevronDown', { size: 16 })}</span>
    </button>
    <nav class="sidebar-lessons" id="sidebar-lessons" aria-label="Projects" data-open="false">
      <ul class="sidebar-list">
        ${projects
          .map(
            (item, index) => `
              <li>
                <a href="project.html?project=${encodeURIComponent(item.id)}"${item.id === project.id ? ' aria-current="page"' : ''}>
                  <span class="sidebar-num">${String(index + 1).padStart(2, '0')}</span>
                  <span>${escapeHtml(item.title)}</span>
                  ${progress.completedProjects[item.id] ? `<span class="sidebar-check">${icon('CheckCircle', { size: 15, label: 'Complete' })}</span>` : ''}
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
  setPageTitle('Project not found');
  if (sidebar) sidebar.innerHTML = '';
  if (!main) return;
  main.innerHTML = `
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="projects.html">Projects</a>
      </nav>
      <h1>Project not found</h1>
      <p class="lede">This project address does not match a project in the library.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="projects.html">Open the project library</a>
      </div>
    </div>
  `;
}

function completedPanelMarkup(progress) {
  const entry = progress.completedProjects[project.id];
  const next = nextProject();
  return `
    <section class="finish-panel is-complete" id="finish-panel" aria-labelledby="finish-heading">
      <h2 class="finish-title" id="finish-heading">${icon('CheckCircle', { size: 20 })} Project complete</h2>
      <p class="muted">Finished ${escapeHtml(formatRelativeDate(entry?.at))}. You earned ${project.xp} XP and ${entry?.tokens || project.tokens} tokens. The file is still yours to download and keep working on.</p>
      <div class="finish-actions">
        ${next ? `<a class="button button-primary" href="project.html?project=${encodeURIComponent(next.id)}">Next project: ${escapeHtml(next.title)}</a>` : '<a class="button button-primary" href="projects.html">All projects</a>'}
        <a class="button button-secondary" href="projects.html">Project library</a>
        <a class="button button-secondary" href="progress.html">See progress</a>
      </div>
    </section>
  `;
}

function renderMain() {
  if (!main || !project) return;
  const progress = getProgress();
  const completed = Boolean(progress.completedProjects[project.id]);
  const checks = new Set(progress.projectChecks[project.id] || []);
  const draft = readDraft() ?? project.starter;
  const next = nextProject();
  const related = project.related
    .map(
      (item) => `<a href="lesson.html?course=${encodeURIComponent(item.course)}&amp;lesson=${encodeURIComponent(item.lesson)}">${escapeHtml(item.label)}</a>`
    )
    .join(' ');
  const finishMarkup = completed
    ? completedPanelMarkup(progress)
    : `
      <section class="finish-panel" id="finish-panel" aria-labelledby="finish-heading">
        <h2 class="finish-title" id="finish-heading">Finish this project</h2>
        <div class="finish-status">
          <span id="finish-checks">${checks.size} of ${project.requirements.length} checked</span>
          <span>Manual self-check</span>
        </div>
        <div class="finish-actions">
          <button class="button button-primary" id="finish-project" type="button"${checks.size === project.requirements.length ? '' : ' disabled'}>
            Finish project · +${project.xp} XP
          </button>
          <span class="finish-hint" id="finish-hint">${checks.size === project.requirements.length ? 'Ready when you are.' : 'Check every requirement before finishing.'}</span>
        </div>
      </section>
    `;
  const nextMarkup = next
    ? `<a class="lesson-nav-next" href="project.html?project=${encodeURIComponent(next.id)}"><span class="lesson-nav-label">Next project</span><span>${escapeHtml(next.title)}</span></a>`
    : '<a class="lesson-nav-next" href="projects.html"><span class="lesson-nav-label">Library</span><span>All projects</span></a>';

  main.innerHTML = `
    <header class="lesson-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="projects.html">Projects</a>
        <span class="sep" aria-hidden="true">/</span>
        <span>${escapeHtml(project.title)}</span>
      </nav>
      <h1>${escapeHtml(project.title)}</h1>
      <div class="lesson-meta-row">
        <span>${icon('Layers', { size: 16 })} ${escapeHtml(project.language)}</span>
        <span>${icon('Clock', { size: 16 })} ${project.minutes} min</span>
        <span>${icon('Gauge', { size: 16 })} ${project.xp} XP</span>
        <span>${icon('CheckCircle', { size: 16 })} ${project.requirements.length} self-checks</span>
        ${completed ? `<span>${icon('CheckCircle', { size: 16 })} Complete</span>` : ''}
      </div>
      <div class="goal">
        <span class="goal-label">Project</span>
        <p>${escapeHtml(project.summary)}</p>
      </div>
    </header>

    <section class="theory" aria-labelledby="brief-heading">
      <h2 id="brief-heading">What you will build</h2>
      <p>${escapeHtml(project.description)}</p>

      <h3>What you will practice</h3>
      <ul>
        ${project.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}
      </ul>

      <h3>Build steps</h3>
      <ol class="project-steps">
        ${project.steps
          .map(
            (step) => `
              <li>
                <span class="project-step-title">${escapeHtml(step.title)}</span>
                <span>${escapeHtml(step.body)}</span>
              </li>
            `
          )
          .join('')}
      </ol>

      <p class="project-related">Related lessons: ${related}</p>
    </section>

    <section class="exercise" aria-labelledby="workspace-heading">
      <div class="exercise-head">
        <h2 id="workspace-heading">Workspace</h2>
        <span class="exercise-kicker">Single file</span>
      </div>
      <p class="challenge-prompt">Edit one complete HTML file. The preview runs an inline script once, so use the self-check list for anything that needs a click.</p>

      <div class="editor">
        <div class="editor-bar">
          <span class="editor-file">project.html</span>
          <div class="editor-actions">
            <button class="button button-secondary button-small" id="run-project" type="button" title="Run the preview (Ctrl+Enter)">
              ${icon('Play', { size: 15 })} Run
            </button>
            <button class="button button-secondary button-small" id="download-project" type="button">
              ${icon('Save', { size: 15 })} Download
            </button>
            <button class="button button-quiet button-small" id="reset-project" type="button">Reset</button>
          </div>
        </div>
        <div class="editor-grid">
          <label class="sr-only" for="project-editor">Your project HTML</label>
          <textarea class="editor-code" id="project-editor" spellcheck="false" autocomplete="off">${escapeHtml(draft)}</textarea>
          <div class="editor-preview">
            <p class="preview-label">Preview</p>
            <iframe id="project-frame" title="Preview of your project" sandbox=""></iframe>
          </div>
        </div>
        <p class="editor-error" id="project-error" role="status" hidden></p>
      </div>
    </section>

    <section class="exercise" aria-labelledby="checklist-heading">
      <div class="exercise-head">
        <h2 id="checklist-heading">Self-check</h2>
        <span class="exercise-kicker">Manual</span>
      </div>
      <p class="challenge-prompt">Kodingu cannot inspect a project you download. Open the preview, try the page, and check each item yourself. A project is finished when every box is checked.</p>
      <fieldset class="checklist"${completed ? ' disabled' : ''}>
        <legend class="sr-only">Project requirements</legend>
        ${project.requirements
          .map(
            (requirement, index) => `
              <label class="checklist-item">
                <input type="checkbox" data-check="${index}"${checks.has(index) ? ' checked' : ''}${completed ? ' disabled' : ''}>
                <span>${escapeHtml(requirement)}</span>
              </label>
            `
          )
          .join('')}
      </fieldset>
    </section>

    ${finishMarkup}

    <nav class="lesson-nav" aria-label="Project navigation">
      <a href="projects.html"><span class="lesson-nav-label">Library</span><span>All projects</span></a>
      ${nextMarkup}
    </nav>
  `;

  wireWorkspace();
}

function wireWorkspace() {
  const editor = document.querySelector('#project-editor');
  const frame = document.querySelector('#project-frame');
  const errorMount = document.querySelector('#project-error');
  const finishButton = document.querySelector('#finish-project');
  const finishChecks = document.querySelector('#finish-checks');
  const finishHint = document.querySelector('#finish-hint');
  const checklist = document.querySelector('.checklist');

  const runPreview = () => {
    if (!editor || !frame) return;
    const result = buildProjectPreview(editor.value);
    frame.srcdoc = result.html;
    if (errorMount) {
      errorMount.hidden = !result.error;
      errorMount.textContent = result.error ? `Script error: ${result.error.message}` : '';
    }
  };

  runPreview();

  document.querySelector('#run-project')?.addEventListener('click', runPreview);

  document.querySelector('#download-project')?.addEventListener('click', () => {
    if (!editor) return;
    try {
      const blob = new Blob([editor.value], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.id}.html`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast('Project downloaded.');
    } catch (error) {
      toast('The download could not start. Copy the file from the editor instead.');
    }
  });

  document.querySelector('#reset-project')?.addEventListener('click', () => {
    if (!editor) return;
    editor.value = project.starter;
    try {
      localStorage.removeItem(`kodingu.projectDraft.${project.id}`);
    } catch (error) {
      // The editor still resets for this page view when storage is unavailable.
    }
    document.querySelectorAll('.checklist input').forEach((input) => {
      input.checked = false;
      toggleProjectRequirement(project.id, Number(input.dataset.check), false);
    });
    if (finishChecks) finishChecks.textContent = `0 of ${project.requirements.length} checked`;
    if (finishButton) finishButton.disabled = true;
    if (finishHint) finishHint.textContent = 'Check every requirement before finishing.';
    runPreview();
    toast('Workspace reset to the starter. The checklist is clear.');
    editor.focus();
  });

  let saveTimer;
  editor?.addEventListener('input', () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveDraft(editor.value), 400);
  });

  editor?.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      runPreview();
    }
  });

  checklist?.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-check]');
    if (!input) return;
    const index = Number(input.dataset.check);
    const saved = toggleProjectRequirement(project.id, index, input.checked);
    if (finishChecks) finishChecks.textContent = `${saved.length} of ${project.requirements.length} checked`;
    if (finishButton) finishButton.disabled = saved.length !== project.requirements.length;
    if (finishHint) {
      finishHint.textContent = saved.length === project.requirements.length
        ? 'Ready when you are.'
        : 'Check every requirement before finishing.';
    }
  });

  finishButton?.addEventListener('click', () => {
    if (editor) saveDraft(editor.value);
    const result = completeProject(project);
    if (!result.completed) {
      toast(result.reason || 'This project is already complete.');
      return;
    }
    toast(`Project complete. +${result.xpEarned} XP, +${result.tokensEarned} tokens.`);
    renderSidebar();
    renderMain();
  });
}

initChrome();
if (project) {
  setPageTitle(project.title);
  renderSidebar();
  renderMain();
} else {
  renderNotFound();
}
