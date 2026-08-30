// Runs blocking in <head> so the first paint already has the right theme.
// Light is the default; a stored preference ('light' | 'dark') overrides it.
(function () {
  var theme = 'light';
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
  } catch (e) {
    /* no-op */
  }
  document.documentElement.setAttribute('data-theme', theme);
  // Keep the browser chrome colour in step with the page ground.
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#191817' : '#f3f2ee');
})();
