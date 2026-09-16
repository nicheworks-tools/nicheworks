(() => {
  "use strict";

  function ensureStylesheet(href, marker) {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(marker, "v2.3");
    document.head.appendChild(link);
  }

  function loadScript(src, marker) {
    const existing = document.querySelector(`script[${marker}]`);
    if (existing) {
      if (existing.dataset.loaded === "true") return Promise.resolve();
      return new Promise((resolve) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", resolve, { once: true });
      });
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.setAttribute(marker, "v2.3");
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", resolve, { once: true });
      document.head.appendChild(script);
    });
  }

  ensureStylesheet("./deep-link-v2.3.css?v=20260914-deeplink-1", "data-cta-deep-link-css");
  ensureStylesheet("./ui-mock-v2-parity.css?v=20260916-structural-3", "data-cta-ui-mock-v2-css");
  ensureStylesheet("./ui-mock-v2-hardening.css?v=20260916-structural-3", "data-cta-ui-mock-v2-hardening-css");

  loadScript("./dictionary-presentation-v2.3.js?v=20260914-presentation-1", "data-cta-dictionary-presentation")
    .then(() => loadScript("./deep-link-v2.3.js?v=20260914-deeplink-1", "data-cta-deep-link"))
    .then(() => loadScript("./ui-mock-v2-parity.js?v=20260916-structural-3", "data-cta-ui-mock-v2"))
    .then(() => loadScript("./ui-mock-v2-hardening.js?v=20260916-structural-3", "data-cta-ui-mock-v2-hardening"));
})();
