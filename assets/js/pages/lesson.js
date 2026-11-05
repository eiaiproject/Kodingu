import { getCourse, getAllLessons } from '../data/course-index.js';
import { TOKENS_PER_LESSON } from '../core/gamification.js';
import {
  completeLesson,
  escapeHtml,
  formatRelativeDate,
  getProgress,
  icon,
  initChrome,
  markSolutionViewed,
  progressBar,
  recordActivity,
  recordQuiz,
  setPageTitle,
  setSocialMeta,
  toast,
  wireSidebar
} from '../core/app.js';
import { mountWorkspace, wireCopyCode, wireToggle } from '../editor/workspace.js';

function findLesson(course, lessonId) {
  for (const module of course?.modules || []) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) return { course, module, lesson };
  }
  return null;
}

function getNextLesson(course, lessonId) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 ? lessons[index + 1] || null : null;
}

function getPreviousLesson(course, lessonId) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index > 0 ? lessons[index - 1] : null;
}

const params = new URLSearchParams(window.location.search);
const courseSummary = getCourse(params.get('course'));
const lessonSummary = findLesson(courseSummary, params.get('lesson'));
let found = null;
if (lessonSummary) {
  try {
    const lessonDataUrl = new URL(
      `../data/lessons/${lessonSummary.lesson.id}.js`,
      import.meta.url
    );
    const data = await import(lessonDataUrl);
    found = { ...lessonSummary, lesson: data.lesson };
    navigator.serviceWorker?.ready
      .then((registration) => {
        registration.active?.postMessage({ type: 'cache-page', url: lessonDataUrl.href });
      })
      .catch(() => {});
  } catch (error) {
    console.warn('Kodingu: lesson data could not be loaded.', error);
  }
}

function readDraft(lessonId) {
  try {
    return localStorage.getItem(`kodingu.draft.${lessonId}`);
  } catch (error) {
    return null;
  }
}

function codeBlock(code, lang = 'html') {
  return `
    <div class="code-block">
      <div class="code-head">
        <span class="code-lang">${escapeHtml(lang === 'js' ? 'javascript' : lang)}</span>
        <button class="copy-code" type="button">${icon('Copy', { size: 14 })} Copy</button>
      </div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </div>
  `;
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderBlock(block) {
  if (block.type === 'p') return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === 'h3') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'note') {
    return `<aside class="note"><span class="note-label">Note</span><p>${escapeHtml(block.text)}</p></aside>`;
  }
  if (block.type === 'list') {
    return `<ul>${listItems(block.items)}</ul>`;
  }
  if (block.type === 'code') return codeBlock(block.code, block.lang || 'html');
  return '';
}

function renderSidebar() {
  const mount = document.querySelector('#lesson-sidebar');
  if (!mount || !found) return;

  const { course, module, lesson } = found;
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const completed = lessons.filter((item) => progress.completed[item.id]).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  mount.innerHTML = `
    <p class="sidebar-course">${escapeHtml(course.title)}</p>
    <p class="sidebar-module">${escapeHtml(module.title)}</p>
    <div class="sidebar-progress">
      <div class="sidebar-progress-label"><span>${completed} of ${lessons.length}</span><span>${percent}%</span></div>
      ${progressBar(percent, `${course.title} progress`)}
    </div>
    <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-expanded="false" aria-controls="sidebar-lessons">
      <span>Lesson index</span>
      <span class="sidebar-toggle-meta">${lessons.length} lessons ${icon('ChevronDown', { size: 16 })}</span>
    </button>
    <nav class="sidebar-lessons" id="sidebar-lessons" aria-label="Lessons" data-open="false">
      <ol class="sidebar-list">
        ${lessons
          .map(
            (item, index) => `
              <li>
                <a href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(item.id)}"${item.id === lesson.id ? ' aria-current="page"' : ''}>
                  <span class="sidebar-num">${String(index + 1).padStart(2, '0')}</span>
                  <span>${escapeHtml(item.title)}</span>
                  ${progress.completed[item.id] ? `<span class="sidebar-check">${icon('CheckCircle', { size: 15, label: 'Complete' })}</span>` : ''}
                </a>
              </li>
            `
          )
          .join('')}
      </ol>
    </nav>
  `;

  wireSidebar(mount);
}

function completedPanelMarkup() {
  const { course, lesson } = found;
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const entry = progress.completed[lesson.id];
  const earnedTokens = entry?.tokens || TOKENS_PER_LESSON;
  const next = getNextLesson(course, lesson.id);
  const allDone = lessons.every((item) => progress.completed[item.id]);
  const courseHref = `course.html?course=${encodeURIComponent(course.id)}`;
  let nextHref = courseHref;
  let nextLabel = `Back to ${escapeHtml(course.title)}`;
  if (allDone) {
    nextLabel = 'Review the course';
  } else if (next) {
    nextHref = `lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(next.id)}`;
    nextLabel = `Next lesson: ${escapeHtml(next.title)}`;
  }

  return `
    <section class="finish-panel is-complete" id="finish-panel" aria-labelledby="finish-heading">
      <h2 class="finish-title" id="finish-heading">${icon('CheckCircle', { size: 20 })} ${allDone ? 'Course complete' : 'Lesson complete'}</h2>
      <p class="muted">Finished ${escapeHtml(formatRelativeDate(entry?.at))}. You earned ${lesson.xp} XP and ${earnedTokens} tokens. You can keep editing your work.</p>
      <div class="finish-actions">
        <a class="button button-primary" href="${nextHref}">${nextLabel}</a>
        ${allDone ? `<a class="button button-secondary" href="certificate.html?course=${encodeURIComponent(course.id)}">Open certificate</a>` : ''}
        <a class="button button-secondary" href="course.html?course=${encodeURIComponent(course.id)}">Course overview</a>
      </div>
    </section>
  `;
}

function unfinishedPanelMarkup(lesson, quizDone) {
  const quizMark = quizDone ? icon('CheckCircle', { size: 15 }) : '<span class="check-pending"></span>';
  return `
      <section class="finish-panel" id="finish-panel" aria-labelledby="finish-heading">
        <h2 class="finish-title" id="finish-heading">Finish this lesson</h2>
        <div class="finish-status">
          <span id="finish-quiz"${quizDone ? ' class="is-done"' : ''}>${quizMark} Quiz</span>
          <span id="finish-checks"><span class="check-pending"></span> Checks</span>
        </div>
        <div class="finish-actions">
          <button class="button button-primary" id="finish-lesson" type="button" disabled>Finish lesson · +${lesson.xp} XP</button>
          <span class="finish-hint" id="finish-hint">Answer the quiz and pass every check to finish.</span>
        </div>
      </section>
    `;
}

function renderMain() {
  const { course, module, lesson } = found;
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = getPreviousLesson(course, lesson.id);
  const next = getNextLesson(course, lesson.id);
  const quizDone = Boolean(progress.quizzes[lesson.id]?.correct);
  const complete = Boolean(progress.completed[lesson.id]);
  const draft = readDraft(lesson.id) ?? lesson.challenge.starter;
  const language = lesson.language || course.language || 'html';
  const languageMeta = {
    html: { file: 'index.html', label: 'Your HTML', heading: 'Write the page', frame: 'HTML' },
    css: { file: 'styles.css', label: 'Your CSS', heading: 'Write the styles', frame: 'CSS' },
    js: { file: 'script.js', label: 'Your JavaScript', heading: 'Write the script', frame: 'JavaScript' }
  }[language] || { file: 'index.html', label: 'Your HTML', heading: 'Write the page', frame: 'HTML' };
  const main = document.querySelector('#lesson-main');
  if (!main) return;

  const quizOptions = lesson.quiz.options
    .map(
      (option, optionIndex) => `
        <label class="quiz-option${quizDone && optionIndex === lesson.quiz.answer ? ' is-correct' : ''}">
          <input type="radio" name="quiz" value="${optionIndex}"${quizDone && optionIndex === lesson.quiz.answer ? ' checked' : ''}${quizDone ? ' disabled' : ''}>
          <span>${escapeHtml(option)}</span>
        </label>
      `
    )
    .join('');

  const quizFeedback = quizDone
    ? `<output class="feedback is-pass">${icon('CheckCircle', { size: 16 })}<span>${escapeHtml(lesson.quiz.explanation)}</span></output>`
    : `<output class="feedback" id="quiz-feedback" hidden></output>`;

  const checks = lesson.challenge.tests
    .map(
      (test, testIndex) => `
        <li class="check-item" data-check="${testIndex}">
          <span class="check-icon"><span class="check-pending"></span></span>
          <span>${escapeHtml(test.label)}</span>
          <span class="check-state">Not run</span>
        </li>
      `
    )
    .join('');

  const finishMarkup = complete ? completedPanelMarkup() : unfinishedPanelMarkup(lesson, quizDone);

  const previousLink = previous
    ? `<a href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(previous.id)}"><span class="lesson-nav-label">Previous</span><span>${escapeHtml(previous.title)}</span></a>`
    : '<span></span>';

  const nextLink = next
    ? `<a class="lesson-nav-next" href="lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(next.id)}"><span class="lesson-nav-label">Next</span><span>${escapeHtml(next.title)}</span></a>`
    : `<a class="lesson-nav-next" href="course.html?course=${encodeURIComponent(course.id)}"><span class="lesson-nav-label">Course</span><span>Back to ${escapeHtml(course.title)}</span></a>`;

  main.innerHTML = `
    <article class="lesson-article" aria-labelledby="lesson-title">
    <header class="lesson-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="course.html?course=${encodeURIComponent(course.id)}">${escapeHtml(course.title)}</a>
        <span class="sep" aria-hidden="true">/</span>
        <span>Lesson ${String(index + 1).padStart(2, '0')}</span>
      </nav>
      <h1 id="lesson-title">${escapeHtml(lesson.title)}</h1>
      <div class="lesson-meta-row">
        <span>${icon('BookOpen', { size: 16 })} ${escapeHtml(module.title)}</span>
        <span>${icon('Clock', { size: 16 })} ${lesson.minutes} min</span>
        <span>${icon('Gauge', { size: 16 })} ${lesson.xp} XP</span>
        <span>${icon('Layers', { size: 16 })} Lesson ${index + 1} of ${lessons.length}</span>
        ${complete ? `<span>${icon('CheckCircle', { size: 16 })} Complete</span>` : ''}
      </div>
      <div class="goal">
        <span class="goal-label">Goal</span>
        <p>${escapeHtml(lesson.objective)}</p>
      </div>
    </header>

    <section class="theory" aria-label="Lesson notes">
      ${lesson.theory.map(renderBlock).join('')}
    </section>

    <section class="exercise" aria-labelledby="quiz-heading">
      <div class="exercise-head">
        <h2 id="quiz-heading">Check your reading</h2>
        <span class="exercise-kicker">Quiz</span>
      </div>
      <p class="quiz-question" id="quiz-question">${escapeHtml(lesson.quiz.question)}</p>
      <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-question">
        ${quizOptions}
      </div>
      <div class="quiz-actions">
        ${quizDone ? '' : '<button class="button button-secondary button-small" id="quiz-check" type="button">Check answer</button>'}
      </div>
      ${quizFeedback}
    </section>

    <section class="exercise" id="challenge" aria-labelledby="challenge-heading">
      <div class="exercise-head">
        <h2 id="challenge-heading">${languageMeta.heading}</h2>
        <span class="exercise-kicker">Challenge</span>
      </div>
      <p class="challenge-prompt">${escapeHtml(lesson.challenge.prompt)}</p>
      <ul class="requirements">
        ${lesson.challenge.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>

      <div class="editor">
        <div class="editor-bar">
          <span class="editor-file">${languageMeta.file}</span>
          <div class="editor-actions">
            <button class="button button-secondary button-small" id="run-code" type="button" title="Run the preview (Ctrl+Enter)">
              ${icon('Play', { size: 15 })} Run
            </button>
            <button class="button button-primary button-small" id="check-code" type="button" title="Run the checks (Ctrl+Shift+Enter)">
              ${icon('Check', { size: 15 })} Check
            </button>
            <button class="button button-quiet button-small" id="reset-code" type="button">Reset</button>
          </div>
        </div>
        <div class="editor-grid">
          <label class="sr-only" for="editor-code">${languageMeta.label}</label>
          <textarea class="editor-code" id="editor-code" spellcheck="false" autocomplete="off">${escapeHtml(draft)}</textarea>
          <div class="editor-preview">
            <p class="preview-label">Preview</p>
            <iframe id="editor-frame" title="Preview of your ${languageMeta.frame}" sandbox="" tabindex="-1"></iframe>
          </div>
        </div>
        <output class="editor-error" id="script-error" hidden></output>
      </div>

      <div class="checks">
        <div class="checks-head"><span>Checks</span><span id="checks-summary" aria-live="polite">Not run</span></div>
        <ul id="test-list">${checks}</ul>
      </div>

      <div class="quiz-actions">
        <button class="button button-quiet button-small" id="hint-toggle" type="button" aria-expanded="false" aria-controls="hint">Show hint</button>
        <button class="button button-quiet button-small" id="solution-toggle" type="button" aria-expanded="false" aria-controls="solution">Show solution</button>
      </div>
      <div class="hint" id="hint" hidden>${escapeHtml(lesson.challenge.hint)}</div>
      <div class="solution" id="solution" hidden>
        <p class="solution-note">One way to do it. Your page may differ and still pass.</p>
        ${codeBlock(lesson.challenge.solution, language)}
      </div>
    </section>

    ${finishMarkup}
    </article>

    <nav class="lesson-nav" aria-label="Lesson navigation">
      ${previousLink}
      ${nextLink}
    </nav>
  `;

  wireLesson(lesson, quizDone);
}

function wireLesson(lesson, quizDone) {
  const language = lesson.language || found.course.language || 'html';
  const finishButton = document.querySelector('#finish-lesson');
  const state = { quizCorrect: quizDone };
  let workspace;

  const updateFinishState = () => {
    if (!finishButton) return;
    const testsPassed = workspace?.state.testsPassed === true;
    const quiz = document.querySelector('#finish-quiz');
    const checks = document.querySelector('#finish-checks');
    const hint = document.querySelector('#finish-hint');
    if (quiz) {
      quiz.classList.toggle('is-done', state.quizCorrect);
      quiz.innerHTML = `${state.quizCorrect ? icon('CheckCircle', { size: 15 }) : '<span class="check-pending"></span>'} Quiz`;
    }
    if (checks) {
      checks.classList.toggle('is-done', testsPassed);
      checks.innerHTML = `${testsPassed ? icon('CheckCircle', { size: 15 }) : '<span class="check-pending"></span>'} Checks`;
    }
    finishButton.disabled = !(state.quizCorrect && testsPassed);
    if (hint) {
      hint.textContent = state.quizCorrect && testsPassed
        ? 'Ready when you are.'
        : 'Answer the quiz and pass every check to finish.';
    }
  };

  workspace = mountWorkspace({
    editor: document.querySelector('#editor-code'),
    frame: document.querySelector('#editor-frame'),
    errorMount: document.querySelector('#script-error'),
    runButton: document.querySelector('#run-code'),
    checkButton: document.querySelector('#check-code'),
    resetButton: document.querySelector('#reset-code'),
    language,
    preview: lesson.preview,
    tests: lesson.challenge.tests,
    starter: lesson.challenge.starter,
    draftKey: `kodingu.draft.${lesson.id}`,
    beforeCheck: () => recordActivity('check', lesson.id),
    onCheck: updateFinishState,
    onEdit: updateFinishState,
    onReset: updateFinishState
  });

  void workspace.runPreview();
  updateFinishState();

  const quizCheck = document.querySelector('#quiz-check');

  quizCheck?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="quiz"]:checked');
    const feedback = document.querySelector('#quiz-feedback');
    if (!selected) {
      toast('Choose an answer first.');
      document.querySelector('input[name="quiz"]')?.focus();
      return;
    }
    const value = Number(selected.value);
    document.querySelectorAll('.quiz-option').forEach((label) => {
      label.classList.remove('is-wrong', 'is-correct');
    });

    if (value === lesson.quiz.answer) {
      state.quizCorrect = true;
      selected.closest('.quiz-option')?.classList.add('is-correct');
      document.querySelectorAll('input[name="quiz"]').forEach((input) => {
        input.disabled = true;
      });
      if (feedback) {
        feedback.className = 'feedback is-pass';
        feedback.hidden = false;
        feedback.innerHTML = `${icon('CheckCircle', { size: 16 })}<span>${escapeHtml(lesson.quiz.explanation)}</span>`;
      }
      quizCheck.remove();
      recordQuiz(lesson.id, true);
      updateFinishState();
      toast('Correct.');
    } else {
      selected.closest('.quiz-option')?.classList.add('is-wrong');
      if (feedback) {
        feedback.className = 'feedback is-fail';
        feedback.hidden = false;
        feedback.innerHTML = `${icon('CloseCircle', { size: 16 })}<span>That is not the one. Read the lesson notes and try again.</span>`;
      }
      toast('Not quite. Try again.');
    }
  });

  document.querySelectorAll('input[name="quiz"]').forEach((input) => {
    input.addEventListener('change', () => {
      document.querySelectorAll('.quiz-option').forEach((label) => {
        label.classList.remove('is-wrong');
      });
      const feedback = document.querySelector('#quiz-feedback');
      if (feedback) {
        feedback.hidden = true;
        feedback.className = 'feedback';
      }
    });
  });

  wireToggle('#hint-toggle', '#hint', 'Show hint', 'Hide hint');
  wireToggle('#solution-toggle', '#solution', 'Show solution', 'Hide solution', () => {
    markSolutionViewed(lesson.id);
    toast('Solution shown.');
  });

  finishButton?.addEventListener('click', () => {
    workspace.saveDraft();
    const result = completeLesson(lesson);
    if (!result.completed) {
      toast('This lesson is already complete.');
      return;
    }
    toast(`Lesson complete. +${lesson.xp} XP, +${result.tokensEarned} tokens.${result.freezeUsed ? ' A streak freeze covered the missed day.' : ''}`);
    renderSidebar();
    const panel = document.querySelector('#finish-panel');
    if (panel) panel.outerHTML = completedPanelMarkup();
  });

  wireCopyCode(document.querySelector('#lesson-main'));
}

function renderNotFound() {
  setPageTitle('Lesson not found');
  const sidebar = document.querySelector('#lesson-sidebar');
  const main = document.querySelector('#lesson-main');
  if (sidebar) sidebar.innerHTML = '';
  if (!main) return;
  main.innerHTML = `
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="catalog.html">Catalog</a>
        <span class="sep" aria-hidden="true">/</span>
        <span>Not found</span>
      </nav>
      <h1>Lesson not found</h1>
      <p class="lede">This lesson address does not match a lesson in the catalog.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="catalog.html">Open the catalog</a>
        <a class="button button-secondary" href="course.html?course=html">Open HTML</a>
      </div>
    </div>
  `;
}

initChrome();
if (found) {
  setPageTitle(found.lesson.title);
  setSocialMeta({
    title: found.lesson.title,
    description: found.lesson.objective,
    path: `/lessons/${encodeURIComponent(found.lesson.id)}`
  });
  recordActivity('visit', found.lesson.id);
  renderSidebar();
  renderMain();
} else {
  renderNotFound();
}
