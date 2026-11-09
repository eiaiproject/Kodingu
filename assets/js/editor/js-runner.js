const CHANNEL = 'kodingu-runner';
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

// The preflight runs the learner's script in a Worker before the sandboxed
// iframe exists. A no-op DOM keeps ordinary lessons running, and a script that
// never finishes is terminated here instead of blocking the page thread.
const PREFLIGHT_PREAMBLE = String.raw`
const fakeNode = (() => {
  let proxy;
  let list;
  const node = function () {};
  proxy = new Proxy(node, {
    get(target, key) {
      if (key === Symbol.iterator) return function* () {};
      if (key === Symbol.toPrimitive) return () => '';
      if (key === 'length') return 0;
      if (key === 'textContent' || key === 'innerHTML' || key === 'value' || key === 'href' || key === 'src') return '';
      if (key === 'querySelectorAll') return () => list;
      if (key === 'children' || key === 'childNodes') return [];
      if (key === 'querySelector' || key === 'getElementById' || key === 'createElement' || key === 'closest' || key === 'appendChild' || key === 'append' || key === 'prepend' || key === 'remove' || key === 'setAttribute' || key === 'focus' || key === 'click' || key === 'add' || key === 'toggle') return () => proxy;
      if (key === 'classList' || key === 'style' || key === 'dataset') return proxy;
      if (key === 'addEventListener' || key === 'removeEventListener') return () => {};
      if (key === 'getAttribute') return () => '';
      if (key === 'hasAttribute' || key === 'contains') return () => false;
      return proxy;
    },
    set() { return true; },
    apply() { return proxy; }
  });
  list = new Proxy([], {
    get(target, key) {
      if (key === Symbol.iterator) return function* () {};
      if (key === 'item') return () => proxy;
      if (typeof key === 'string' && /^\d+$/.test(key)) return proxy;
      return Reflect.get(target, key);
    }
  });
  return proxy;
})();
try {
  self.document = fakeNode;
  self.window = self;
  self.localStorage = fakeNode;
  self.alert = () => {};
  self.confirm = () => true;
  self.prompt = () => '';
  self.fetch = () => Promise.reject(new Error('Network is disabled during the preflight.'));
  self.XMLHttpRequest = function () { throw new Error('Network is disabled during the preflight.'); };
  self.WebSocket = self.XMLHttpRequest;
  self.EventSource = self.XMLHttpRequest;
  self.importScripts = () => {};
  self.close = () => {};
} catch (error) {}
try {
`;

function preflightPostamble(token) {
  return `
} catch (error) {}
setTimeout(() => self.postMessage(${JSON.stringify(token)}), 150);
`;
}

export function preflightJavaScript(source) {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined') {
    return Promise.resolve('ok');
  }
  return new Promise((resolve) => {
    let worker = null;
    let workerUrl = '';
    let timer = 0;
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (worker) worker.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      resolve(result);
    };
    try {
      const token = `preflight-${++sequence}`;
      workerUrl = URL.createObjectURL(
        new Blob([PREFLIGHT_PREAMBLE, source, preflightPostamble(token)], {
          type: 'text/javascript'
        })
      );
      worker = new Worker(workerUrl);
      worker.onmessage = (event) => {
        if (event.data === token) finish('ok');
      };
      worker.onerror = () => finish('ok');
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
