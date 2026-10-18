(function () {
  let savedTheme;
  try {
    savedTheme = localStorage.getItem('portfolio-theme-v2');
  } catch {
    // Storage may be disabled by browser privacy settings.
  }

  const theme =
    savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();
