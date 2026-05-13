(() => {
  const current = document.currentScript;
  const base = current ? current.src : location.href;
  const batchUrls = [
    "./manuals.batch1.js",
    "./manuals.batch2a.js",
    "./manuals.batch3.js"
  ].map((path) => new URL(path, base).href);
  const originalFetch = window.fetch.bind(window);
  let batchesReady = null;
  function loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src=\"${src}\"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }
  function loadBatches() {
    if (batchesReady) return batchesReady;
    batchesReady = batchUrls.reduce((promise, src) => promise.then(() => loadScript(src)), Promise.resolve());
    return batchesReady;
  }
  const overlayFetch = function(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (!/manuals\.json(?:$|[?#])/.test(url)) return originalFetch(input, init);
    return loadBatches().then(() => {
      if (window.fetch === overlayFetch) return originalFetch(input, init);
      return window.fetch(input, init);
    });
  };
  window.fetch = overlayFetch;
})();
