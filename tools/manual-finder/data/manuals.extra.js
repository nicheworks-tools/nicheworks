(() => {
  const current = document.currentScript;
  const batchUrl = new URL("./manuals.batch1.js", current ? current.src : location.href).href;
  const originalFetch = window.fetch.bind(window);
  let batchReady = null;

  function loadBatch() {
    if (batchReady) return batchReady;
    batchReady = new Promise((resolve) => {
      if (document.querySelector(`script[src=\"${batchUrl}\"]`)) return resolve();
      const script = document.createElement("script");
      script.src = batchUrl;
      script.defer = true;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
    return batchReady;
  }

  const overlayFetch = function(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (!/manuals\.json(?:$|[?#])/.test(url)) return originalFetch(input, init);
    return loadBatch().then(() => {
      if (window.fetch === overlayFetch) return originalFetch(input, init);
      return window.fetch(input, init);
    });
  };

  window.fetch = overlayFetch;
})();
