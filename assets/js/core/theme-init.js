(function () {
  let stored = null;
  try {
    stored = localStorage.getItem('kodingu.theme');
  } catch (error) {
    stored = null;
  }

  let theme;
  if (stored === 'light' || stored === 'dark') {
    theme = stored;
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches === true) {
    theme = 'dark';
  } else {
    theme = 'light';
  }

  document.documentElement.dataset.theme = theme;

  // Reading pages only load this script, so skip-link focus lives here too.
  const focusMain = () => {
    document.querySelector('#main')?.focus({ preventScroll: true });
  };
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('.skip-link') : null;
    if (link?.getAttribute('href') === '#main') {
      window.requestAnimationFrame(focusMain);
    }
  });
  if (window.location.hash === '#main') {
    document.addEventListener('DOMContentLoaded', focusMain, { once: true });
  }

  // Static reading pages only load this script, so registration lives here.
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || local)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async () => {
          const registration = await navigator.serviceWorker.ready;
          registration.active?.postMessage({ type: 'cache-page', url: window.location.href });
        })
        .catch((error) => {
          // Offline support is optional; the page still works online.
          console.warn('Kodingu: the offline worker did not register.', error);
        });
    });
  }
})();
