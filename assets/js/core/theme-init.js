(function () {
  let stored;
  try {
    stored = localStorage.getItem('kodingu.theme');
  } catch (error) {
    stored = null;
  }

  const storedTheme = stored === 'light' || stored === 'dark' ? stored : null;
  const systemTheme =
    window.matchMedia?.('(prefers-color-scheme: dark)').matches === true ? 'dark' : 'light';
  const theme = storedTheme || systemTheme;

  document.documentElement.dataset.theme = theme;
  const scheme = document.querySelector('meta[name="color-scheme"]');
  if (scheme) scheme.content = storedTheme || 'light dark';

  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    let activeTheme = theme;
    if (!storedTheme) {
      const media = meta.getAttribute('media') || '';
      activeTheme = media.includes('dark') ? 'dark' : 'light';
    }
    meta.content = activeTheme === 'dark' ? '#191817' : '#F3EFE6';
  });

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
