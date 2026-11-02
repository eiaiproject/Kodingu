import { buildPreviewDocument, icon, toast } from './app.js';
import { runJavaScriptLesson } from './js-runner.js';

export function renderScriptError(mount, error) {
  if (!mount) return;
  mount.hidden = !error;
  mount.textContent = error ? `Script error: ${error.message}` : '';
}

export function renderChecks(results) {
  const items = document.querySelectorAll('.check-item');
  results.forEach((pass, index) => {
    const item = items[index];
    if (!item) return;
    item.classList.toggle('is-pass', pass);
    item.classList.toggle('is-fail', !pass);
    const iconMount = item.querySelector('.check-icon');
    const stateMount = item.querySelector('.check-state');
    if (iconMount) {
      iconMount.innerHTML = pass
        ? icon('CheckCircle', { size: 16 })
        : icon('CloseCircle', { size: 16 });
    }
    if (stateMount) stateMount.textContent = pass ? 'Pass' : 'Needs work';
  });
  const summary = document.querySelector('#checks-summary');
  if (summary) {
    const passed = results.filter(Boolean).length;
    summary.textContent = passed === results.length
      ? `All ${results.length} passed`
      : `${passed} of ${results.length} passed`;
  }
}

export function resetChecks() {
  document.querySelectorAll('.check-item').forEach((item) => {
    item.classList.remove('is-pass', 'is-fail');
    const iconMount = item.querySelector('.check-icon');
    const stateMount = item.querySelector('.check-state');
    if (iconMount) iconMount.innerHTML = '<span class="check-pending"></span>';
    if (stateMount) stateMount.textContent = 'Not run';
  });
  const summary = document.querySelector('#checks-summary');
  if (summary) summary.textContent = 'Not run';
}

export async function runChecks({ language, preview, tests, raw }) {
  if (language === 'js') {
    const runs = await Promise.all(
      tests.map((test) => runJavaScriptLesson(raw, preview, [test]))
    );
    const failedRun = runs.find((run) => run.error);
    return {
      error: failedRun?.error || null,
      results: runs.map((run) => Boolean(run.results[0]))
    };
  }

  const markup = language === 'css'
    ? await buildPreviewDocument(raw, { language, preview })
    : raw;
  const doc = new DOMParser().parseFromString(markup, 'text/html');
  const css = language === 'css' ? raw : '';
  const results = tests.map((test) => {
    try {
      return Boolean(test.run({ doc, raw, css }));
    } catch (error) {
      // A broken check is a failed check, not a page failure.
      return false;
    }
  });
  return { error: null, results };
}

export function createPreviewRunner({ editor, frame, build, onBuild }) {
  const runPreview = async () => {
    if (!editor || !frame) return null;
    const result = await build(editor.value);
    frame.srcdoc = typeof result === 'string' ? result : result.html;
    if (typeof result !== 'string') onBuild?.(result);
    return result;
  };
  return { runPreview };
}

export function mountWorkspace(options) {
  const {
    editor,
    frame,
    errorMount,
    runButton,
    checkButton,
    resetButton,
    language = 'html',
    preview = '',
    tests = [],
    starter = '',
    draftKey = '',
    build,
    onBuild,
    beforeCheck,
    onCheck,
    onReset,
    resetMessage = 'Editor reset to the starter.'
  } = options;

  const state = { testsPassed: false };
  const { runPreview } = createPreviewRunner({
    editor,
    frame,
    onBuild,
    build: build || ((value) => buildPreviewDocument(value, { language, preview }))
  });

  const saveDraft = () => {
    if (!draftKey || !editor) return;
    try {
      localStorage.setItem(draftKey, editor.value);
    } catch (error) {
      // Draft saving is optional; the editor keeps working without it.
    }
  };

  const clearDraft = () => {
    if (!draftKey) return;
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      // The editor still resets for this page view when storage is unavailable.
    }
  };

  const checkCode = async () => {
    if (!editor) return [];
    beforeCheck?.();
    const { error, results } = await runChecks({ language, preview, tests, raw: editor.value });
    renderScriptError(errorMount, error);
    state.testsPassed = results.length > 0 && results.every(Boolean);
    renderChecks(results);
    void runPreview();
    onCheck?.(results);
    toast(state.testsPassed ? 'All checks passed.' : 'Some checks need work.');
    return results;
  };

  const reset = () => {
    if (!editor) return;
    editor.value = starter;
    clearDraft();
    state.testsPassed = false;
    resetChecks();
    renderScriptError(errorMount, null);
    onReset?.();
    void runPreview();
    toast(resetMessage);
    editor.focus();
  };

  let saveTimer;
  editor?.addEventListener('input', () => {
    renderScriptError(errorMount, null);
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveDraft, 400);
  });

  editor?.addEventListener('keydown', (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return;
    event.preventDefault();
    if (event.shiftKey && checkButton) void checkCode();
    else void runPreview();
  });

  runButton?.addEventListener('click', runPreview);
  checkButton?.addEventListener('click', checkCode);
  resetButton?.addEventListener('click', reset);

  return { state, runPreview, checkCode, reset, saveDraft };
}

export function wireToggle(buttonSelector, panelSelector, showLabel, hideLabel, onOpen) {
  const button = document.querySelector(buttonSelector);
  const panel = document.querySelector(panelSelector);
  button?.addEventListener('click', () => {
    if (!panel) return;
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? hideLabel : showLabel;
    if (open) onOpen?.();
  });
}

export function wireCopyCode(root) {
  root?.addEventListener('click', async (event) => {
    const button = event.target.closest('.copy-code');
    if (!button) return;
    const code = button.closest('.code-block')?.querySelector('code')?.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      const original = button.innerHTML;
      button.innerHTML = `${icon('Check', { size: 14 })} Copied`;
      window.setTimeout(() => {
        button.innerHTML = original;
      }, 2000);
    } catch (error) {
      // Clipboard access can be denied, so point the learner at manual copy.
      console.warn('Kodingu: clipboard copy failed.', error);
      toast('Copy failed. Select the code and copy it.');
    }
  });
}
