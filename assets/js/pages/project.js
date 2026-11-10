import { getProject, projects } from '../data/data-projects.js';
import {
  buildProjectPreview,
  completeProject,
  escapeHtml,
  formatRelativeDate,
  getProgress,
  getProjectChecks,
  icon,
  initChrome,
  progressBar,
  renderMissingPage,
  setPageTitle,
  setSocialMeta,
  toggleProjectRequirement,
  toast,
  wireSidebar
} from '../core/app.js';
import { mountWorkspace } from '../editor/workspace.js';

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

  wireSidebar(sidebar);
}

function renderNotFound() {
  renderMissingPage({
    mount: main,
    sidebar,
    title: 'Project not found',
    message: 'This project address does not match a project in the library.',
    actionHref: 'projects.html',
    actionLabel: 'Open the project library',
    parentHref: 'projects.html',
    parentLabel: 'Projects'
  });
}

function completedPanelMarkup(progress) {
  const entry = progress.completedProjects[project.id];
  const next = nextProject();
  return `
    <section class="finish-panel is-complete" id="finish-panel" aria-labelledby="finish-heading">
      <h2 class="finish-title" id="finish-heading">${icon('CheckCircle', { size: 20 })} Project complete</h2>
      <p class="muted">Finished ${escapeHtml(formatRelativeDate(entry?.at))}. You earned ${project.xp} XP. The file is still yours to download and keep working on.</p>
      <div class="finish-actions">
        ${next ? `<a class="button button-primary" href="project.html?project=${encodeURIComponent(next.id)}">Next project: ${escapeHtml(next.title)}</a>` : '<a class="button button-primary" href="projects.html">All projects</a>'}
        <a class="button button-secondary" href="projects.html">Project library</a>
        <a class="button button-secondary" href="progress.html">See progress</a>
      </div>
    </section>
  `;
}

function unfinishedPanelMarkup(checks) {
  const ready = checks.size === project.requirements.length;
  const hint = ready ? 'Ready when you are.' : 'Check every requirement before finishing.';
  return `
      <section class="finish-panel" id="finish-panel" aria-labelledby="finish-heading">
        <h2 class="finish-title" id="finish-heading">Finish this project</h2>
        <div class="finish-status">
          <span id="finish-checks">${checks.size} of ${project.requirements.length} checked</span>
          <span>Manual self-check</span>
        </div>
        <div class="finish-actions">
          <button class="button button-primary" id="finish-project" type="button"${ready ? '' : ' disabled'}>
            Finish project · +${project.xp} XP
          </button>
          <span class="finish-hint" id="finish-hint">${hint}</span>
        </div>
      </section>
    `;
}

function projectHeaderMarkup(project, completed) {
  return `
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
  `;
}

function projectBriefMarkup(project, related) {
  return `
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
  `;
}

function projectWorkspaceMarkup(project, draft) {
  return `
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
            <iframe id="project-frame" title="Preview of your project" sandbox="" tabindex="-1"></iframe>
          </div>
        </div>
        <output class="editor-error" id="project-error" hidden></output>
      </div>
    </section>
  `;
}

function projectChecklistMarkup(project, checks, completed) {
  return `
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
                <input type="checkbox" data-check="${index}"${checks.has(requirement) ? ' checked' : ''}${completed ? ' disabled' : ''}>
                <span>${escapeHtml(requirement)}</span>
              </label>
            `
          )
          .join('')}
      </fieldset>
    </section>
  `;
}

function projectNavMarkup(next) {
  const nextMarkup = next
    ? `<a class="lesson-nav-next" href="project.html?project=${encodeURIComponent(next.id)}"><span class="lesson-nav-label">Next project</span><span>${escapeHtml(next.title)}</span></a>`
    : '<a class="lesson-nav-next" href="projects.html"><span class="lesson-nav-label">Library</span><span>All projects</span></a>';
  return `
    <nav class="lesson-nav" aria-label="Project navigation">
      <a href="projects.html"><span class="lesson-nav-label">Library</span><span>All projects</span></a>
      ${nextMarkup}
    </nav>
  `;
}

function renderMain() {
  if (!main || !project) return;
  const progress = getProgress();
  const completed = Boolean(progress.completedProjects[project.id]);
  const checks = new Set(getProjectChecks(project));
  const draft = readDraft() ?? project.starter;
  const next = nextProject();
  const related = project.related
    .map(
      (item) => `<a href="lesson.html?course=${encodeURIComponent(item.course)}&amp;lesson=${encodeURIComponent(item.lesson)}">${escapeHtml(item.label)}</a>`
    )
    .join(' ');
  const finishMarkup = completed ? completedPanelMarkup(progress) : unfinishedPanelMarkup(checks);

  main.innerHTML = `
    ${projectHeaderMarkup(project, completed)}
    ${projectBriefMarkup(project, related)}
    ${projectWorkspaceMarkup(project, draft)}
    ${projectChecklistMarkup(project, checks, completed)}
    ${finishMarkup}
    ${projectNavMarkup(next)}
  `;

  wireWorkspace();
}

function wireWorkspace() {
  const checklist = document.querySelector('.checklist');
  const finishButton = document.querySelector('#finish-project');
  const finishChecks = document.querySelector('#finish-checks');
  const finishHint = document.querySelector('#finish-hint');

  const updateChecklistState = () => {
    const saved = getProjectChecks(project);
    const ready = saved.length === project.requirements.length;
    if (finishChecks) finishChecks.textContent = `${saved.length} of ${project.requirements.length} checked`;
    if (finishButton) finishButton.disabled = !ready;
    if (finishHint) {
      finishHint.textContent = ready ? 'Ready when you are.' : 'Check every requirement before finishing.';
    }
  };

  const workspace = mountWorkspace({
    editor: document.querySelector('#project-editor'),
    frame: document.querySelector('#project-frame'),
    errorMount: document.querySelector('#project-error'),
    runButton: document.querySelector('#run-project'),
    resetButton: document.querySelector('#reset-project'),
    language: 'html',
    tests: [],
    starter: project.starter,
    draftKey: `kodingu.projectDraft.${project.id}`,
    build: buildProjectPreview,
    onBuild: (result) => {
      const errorMount = document.querySelector('#project-error');
      if (!errorMount) return;
      errorMount.hidden = !result.error;
      errorMount.textContent = result.error ? `Script error: ${result.error.message}` : '';
    },
    resetMessage: 'Workspace reset to the starter. The checklist is clear.',
    onReset: () => {
      document.querySelectorAll('.checklist input').forEach((input) => {
        input.checked = false;
        toggleProjectRequirement(project, project.requirements[Number(input.dataset.check)], false);
      });
      updateChecklistState();
    }
  });

  void workspace.runPreview();
  updateChecklistState();

  document.querySelector('#download-project')?.addEventListener('click', () => {
    const editor = document.querySelector('#project-editor');
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
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Project downloaded.');
    } catch (error) {
      // Some browsers block downloads started without a direct file handle.
      console.warn('Kodingu: project download failed.', error);
      toast('The download could not start. Copy the file from the editor instead.');
    }
  });

  checklist?.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-check]');
    if (!input) return;
    const index = Number(input.dataset.check);
    toggleProjectRequirement(project, project.requirements[index], input.checked);
    updateChecklistState();
  });

  finishButton?.addEventListener('click', () => {
    workspace.saveDraft();
    const result = completeProject(project);
    if (!result.completed) {
      toast(result.reason || 'This project is already complete.');
      return;
    }
    toast(`Project complete. +${result.xpEarned} XP.`);
    renderSidebar();
    renderMain();
    const heading = document.querySelector('#project-main h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  });
}

initChrome();
if (project) {
  setPageTitle(project.title);
  setSocialMeta({
    title: project.title,
    description: project.summary,
    path: `/project?project=${encodeURIComponent(project.id)}`
  });
  renderSidebar();
  renderMain();
} else {
  renderNotFound();
}
