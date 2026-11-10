(() => {
  const payloadNode = document.getElementById('kodingu-preflight-source');
  let token = document.body.dataset.kodinguPreflightToken || '';
  let finished = false;
  let worker = null;
  let workerUrl = '';
  let timer = 0;

  const finish = (result) => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    worker?.terminate();
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    parent.postMessage({ channel: 'kodingu-preflight', token, result }, '*');
  };

  let payload;
  try {
    payload = JSON.parse(payloadNode?.textContent || '{}');
  } catch (error) {
    finish('ok');
    return;
  }
  token = String(payload.token || token);
  const source = String(payload.source || '');
  const workerSource = String(payload.workerSource || '');

  try {
    // The worker is created inside this sandbox, so it inherits an opaque
    // origin: no site storage, cache, or cookies. It still runs off the page
    // thread, so an endless loop can be terminated.
    const workerCode = `${workerSource}\ntry {\n${source}\n} catch (error) {}\nself.postMessage(${JSON.stringify({ token })});\n`;
    workerUrl = URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' }));
    worker = new Worker(workerUrl);
    worker.onmessage = (event) => {
      if (event.data?.token !== token) return;
      finish('ok');
    };
    worker.onerror = () => finish('ok');
    timer = window.setTimeout(() => finish('timeout'), 3800);
  } catch (error) {
    finish('ok');
  }
})();
