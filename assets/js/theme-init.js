(function () {
  var stored;
  try {
    stored = localStorage.getItem('kodingu.theme');
  } catch (error) {
    stored = null;
  }

  var theme;
  if (stored === 'light' || stored === 'dark') {
    theme = stored;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark';
  } else {
    theme = 'light';
  }

  document.documentElement.dataset.theme = theme;
})();
