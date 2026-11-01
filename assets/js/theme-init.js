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
})();
