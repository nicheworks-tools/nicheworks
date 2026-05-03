(() => {
  "use strict";

  if (!window.fetch) return;
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (/tools\.basic\.json(?:$|[?#])/.test(url)) {
      return originalFetch("./data/tools.priority.json", init);
    }
    return originalFetch(input, init);
  };
})();
