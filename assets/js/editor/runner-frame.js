(() => {
  const payloadNode = document.getElementById('kodingu-runner-source');
  const requestId = document.body.dataset.kodinguRunnerId;
  const state = { error: null };
  let targetOrigin = '';
  let finished = false;
  let testResults = [];

  const finish = () => {
    if (finished) return;
    finished = true;
    document.querySelectorAll('[data-kodingu-runner]').forEach((node) => node.remove());
    if (!targetOrigin) return;
    parent.postMessage(
      {
        channel: 'kodingu-runner',
        id: requestId,
        html: '<!DOCTYPE html>' + document.documentElement.outerHTML,
        error: state.error,
        results: testResults
      },
      targetOrigin
    );
  };

  window.addEventListener('error', (event) => {
    if (state.error) return;
    const error = event.error;
    state.error = {
      name: error?.name || 'Error',
      message: error?.message || String(event.message || 'Script error')
    };
  });

  let payload;
  try {
    payload = JSON.parse(payloadNode?.textContent || '{}');
  } catch (error) {
    state.error = { name: 'Error', message: 'The script could not be read.' };
    finish();
    return;
  }

  const source = String(payload.source || '');
  const testSources = Array.isArray(payload.tests) ? payload.tests : [];
  targetOrigin = String(payload.targetOrigin || '');

  const execute = (code, onDone) => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.dataset.kodinguRunner = '';
    script.src = url;
    script.onload = () => {
      URL.revokeObjectURL(url);
      onDone();
    };
    script.onerror = () => {
      URL.revokeObjectURL(url);
      state.error = state.error || { name: 'Error', message: 'The script could not run.' };
      onDone();
    };
    document.body.append(script);
  };

  const runTests = () => {
    if (!testSources.length) {
      finish();
      return;
    }
    const serializedTests = testSources.map((test) => `(${test})`).join(',');
    const serializedSource = JSON.stringify(source);
    const helpers = String.raw`
      (() => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const textOf = (doc, selector) => normalize(doc.querySelector(selector)?.textContent);
        const textsOf = (doc, selector) => Array.from(doc.querySelectorAll(selector)).map((node) => normalize(node.textContent));
        const tests = [${serializedTests}];
        const raw = ${serializedSource};
        window.__kodinguTestResults = tests.map((test) => {
          try {
            return Boolean(test({ doc: document, raw, css: '' }));
          } catch (error) {
            return false;
          }
        });
      })();
    `;
    execute(helpers, () => {
      testResults = Array.isArray(window.__kodinguTestResults)
        ? window.__kodinguTestResults.map(Boolean)
        : testSources.map(() => false);
      finish();
    });
  };

  // Sandboxed previews have an opaque origin, so the real localStorage throws.
  // A memory store lets storage lessons run without weakening the sandbox.
  const installStorage = () => {
    try {
      window.localStorage.getItem('kodingu.storage.check');
      return;
    } catch (error) {
      // Fall through to the temporary store.
    }
    const values = new Map();
    const storage = {
      getItem(key) {
        const value = values.get(String(key));
        return value === undefined ? null : value;
      },
      setItem(key, value) {
        values.set(String(key), String(value));
      },
      removeItem(key) {
        values.delete(String(key));
      },
      clear() {
        values.clear();
      },
      key(index) {
        return Array.from(values.keys())[Number(index)] ?? null;
      },
      get length() {
        return values.size;
      }
    };
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    } catch (error) {
      // Storage calls will report the original browser error if this fails.
    }
  };

  installStorage();
  execute(source, runTests);
  window.setTimeout(() => {
    if (finished) return;
    state.error = state.error || {
      name: 'TimeoutError',
      message: 'The script did not finish within 4 seconds.'
    };
    testResults = testSources.map(() => false);
    finish();
  }, 4000);
})();
