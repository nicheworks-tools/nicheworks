(() => {
  "use strict";

  if (window.fetch) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      if (/tools\.basic\.json(?:$|[?#])/.test(url)) {
        return originalFetch("./data/tools.priority.json", init);
      }
      return originalFetch(input, init);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('script[src="./ux-final.js"]')) return;
    const script = document.createElement("script");
    script.src = "./ux-final.js";
    script.defer = true;
    document.body.appendChild(script);
  });
})();
