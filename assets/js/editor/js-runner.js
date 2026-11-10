const CHANNEL = 'kodingu-runner';
const PREFLIGHT_CHANNEL = 'kodingu-preflight';
const TIMEOUT = 10000;
const PREFLIGHT_TIMEOUT = 4000;
let sequence = 0;

function blankDocument(preview) {
  return new DOMParser().parseFromString(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body>${preview}</body></html>`,
    'text/html'
  );
}

function timeoutError(seconds) {
  const error = new Error(`The script did not finish within ${seconds} seconds.`);
  error.name = 'TimeoutError';
  return error;
}

// The preflight runs in a worker created inside a sandboxed frame. The worker
// inherits an opaque origin, so learner code never reaches site storage, and it
// runs off the page thread, so an endless loop can be terminated.
let workerSourcePromise;

function loadWorkerSource() {
  if (!workerSourcePromise) {
    workerSourcePromise = fetch('/assets/js/editor/preflight-worker.js')
      .then((response) => {
        if (!response.ok) throw new Error(`Preflight worker returned ${response.status}.`);
        return response.text();
      })
      .catch((error) => {
        workerSourcePromise = null;
        throw error;
      });
  }
  return workerSourcePromise;
}

function preflightDocument(source, token, workerSource) {
  const encodedPayload = JSON.stringify({ source, token, workerSource }).replaceAll(
    '<',
    String.raw`\u003c`
  );
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body data-kodingu-preflight-token="${token}">
<script data-kodingu-preflight type="application/json" id="kodingu-preflight-source">${encodedPayload}</script>
<script data-kodingu-preflight src="/assets/js/editor/preflight-frame.js"></script>
</body></html>`;
}

export async function preflightJavaScript(source) {
  if (typeof Worker === 'undefined') return 'ok';
  let workerSource;
  try {
    workerSource = await loadWorkerSource();
  } catch (error) {
    console.warn('Kodingu: the script preflight could not load.', error);
    return 'ok';
  }
  return new Promise((resolve) => {
    let frame = null;
    let onMessage = null;
    let timer = 0;
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (onMessage) window.removeEventListener('message', onMessage);
      frame?.remove();
      resolve(result);
    };
    try {
      const token = `preflight-${++sequence}`;
      frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0;';
      onMessage = (event) => {
        if (event.source !== frame.contentWindow) return;
        const data = event.data;
        if (data?.channel !== PREFLIGHT_CHANNEL || data.token !== token) return;
        finish(data.result === 'timeout' ? 'timeout' : 'ok');
      };
      window.addEventListener('message', onMessage);
      frame.srcdoc = preflightDocument(source, token, workerSource);
      document.body.append(frame);
      timer = window.setTimeout(() => finish('timeout'), PREFLIGHT_TIMEOUT);
    } catch (error) {
      console.warn('Kodingu: the script preflight could not start.', error);
      finish('ok');
    }
  });
}

function runnerDocument(source, preview, requestId, tests) {
  const encodedPayload = JSON.stringify({
    source,
    targetOrigin: window.location.origin,
    tests: tests.map((test) => test.source || (test.run || test).toString())
  }).replaceAll('<', String.raw`\u003c`);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body data-kodingu-runner-id="${requestId}">${preview}
<script data-kodingu-runner type="application/json" id="kodingu-runner-source">${encodedPayload}</script>
<script data-kodingu-runner src="/assets/js/editor/runner-frame.js"></script>
</body></html>`;
}

function resultFromPayload(payload, source, preview, tests) {
  const doc = payload?.html
    ? new DOMParser().parseFromString(payload.html, 'text/html')
    : blankDocument(preview);
  let error = null;
  if (payload?.error) {
    error = new Error(payload.error.message);
    error.name = payload.error.name || 'Error';
  }
  const results = Array.isArray(payload?.results)
    ? payload.results.map(Boolean)
    : tests.map(() => false);
  return { doc, raw: source, css: '', error, results };
}

export async function runJavaScriptLesson(raw, preview = '', tests = [], options = {}) {
  const source = String(raw || '');
  if (!source.trim()) {
    return {
      doc: blankDocument(preview),
      raw: source,
      css: '',
      error: null,
      results: tests.map(() => false)
    };
  }

  if (options.preflight !== false && (await preflightJavaScript(source)) === 'timeout') {
    return {
      doc: blankDocument(preview),
      raw: source,
      css: '',
      error: timeoutError(4),
      results: tests.map(() => false)
    };
  }

  const requestId = `kodingu-run-${++sequence}`;
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0;';
  frame.srcdoc = runnerDocument(source, preview, requestId, tests);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve(resultFromPayload(payload, source, preview, tests));
    };
    const onMessage = (event) => {
      if (event.origin !== 'null' || event.source !== frame.contentWindow) return;
      const payload = event.data;
      if (payload?.channel !== CHANNEL || payload.id !== requestId) return;
      finish(payload);
    };
    const timer = window.setTimeout(() => {
      finish({
        error: {
          name: 'TimeoutError',
          message: 'The script did not finish within 10 seconds.'
        },
        results: tests.map(() => false)
      });
    }, TIMEOUT);

    window.addEventListener('message', onMessage);
    document.body.append(frame);
  });
}
