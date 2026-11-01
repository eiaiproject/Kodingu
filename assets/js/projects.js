import { projects } from './data-projects.js';
import {
  escapeHtml,
  getProgress,
  icon,
  initChrome,
  progressBar,
  setPageTitle
} from './app.js';

function projectState(project, progress) {
  const complete = Boolean(progress.completedProjects[project.id]);
  const checks = Array.isArray(progress.projectChecks[project.id])
    ? progress.projectChecks[project.id].length
    : 0;
  return {
    complete,
    checks,
    started: checks > 0,
    percent: complete ? 100 : Math.round((Math.min(checks, project.requirements.length) / project.requirements.length) * 100)
  };
}

function renderProjects() {
  const mount = document.querySelector('#project-list');
  if (!mount) return;

  const progress = getProgress();
  mount.innerHTML = projects
    .map((project, index) => {
      const state = projectState(project, progress);
      const status = state.complete
        ? '<span class="status status-complete">Complete</span>'
        : state.started
          ? '<span class="status status-progress">In progress</span>'
          : '<span class="status">Open</span>';
      const action = state.complete
        ? 'Review project'
        : state.started
          ? 'Continue project'
          : 'Open project';
      const checked = Math.min(state.checks, project.requirements.length);

      return `
        <article class="project-row">
          <span class="project-index">${String(index + 1).padStart(2, '0')}</span>
          <div class="project-body">
            <div class="project-title-row">
              <a class="project-title" href="project.html?project=${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a>
              <span class="project-language">${escapeHtml(project.language)}</span>
            </div>
            <p>${escapeHtml(project.summary)}</p>
            <div class="project-meta">
              <span>${icon('Clock', { size: 15 })} ${project.minutes} min</span>
              <span>${icon('Gauge', { size: 15 })} ${project.xp} XP</span>
              <span>${icon('CheckCircle', { size: 15 })} ${project.requirements.length} self-checks</span>
            </div>
          </div>
          <div class="project-side">
            ${status}
            ${state.started && !state.complete
              ? `<div class="project-side-progress">
                   <span>${checked} of ${project.requirements.length} checked</span>
                   ${progressBar(state.percent, `${project.title} self-check progress`)}
                 </div>`
              : ''}
            <a class="button button-secondary button-small" href="project.html?project=${encodeURIComponent(project.id)}">${action}</a>
          </div>
        </article>
      `;
    })
    .join('');
}

setPageTitle('Projects');
initChrome();
renderProjects();
