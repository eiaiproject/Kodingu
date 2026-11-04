const CHANNEL = 'kodingu-runner';
const TIMEOUT = 6000;
let sequence = 0;

function blankDocument(preview) {
  return new DOMParser().parseFromString(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body>${preview}</body></html>`,
    'text/html'
  );
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

export function runJavaScriptLesson(raw, preview = '', tests = []) {
  const source = String(raw || '');
  if (!source.trim()) {
    return Promise.resolve({
      doc: blankDocument(preview),
      raw: source,
      css: '',
      error: null,
      results: tests.map(() => false)
    });
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
          message: 'The script did not finish within 6 seconds.'
        },
        results: tests.map(() => false)
      });
    }, TIMEOUT);

    window.addEventListener('message', onMessage);
    document.body.append(frame);
  });
}
