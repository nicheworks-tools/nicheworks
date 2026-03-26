(function () {
  const root = document.body;
  if (!root) return;

  // Tiny shared helper pattern across atlas tools (kept intentionally small).
  const tool = root.dataset.tool || 'unknown-tool';
  const page = root.dataset.page || 'index';
  const lang = root.dataset.lang || 'en';

  document.documentElement.dataset.tool = tool;
  document.documentElement.dataset.page = page;
  document.documentElement.dataset.lang = lang;
})();
