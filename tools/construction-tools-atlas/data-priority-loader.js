(() => {
  "use strict";

  function loadUxFinal(){
    if (document.querySelector('script[data-cta-ux-final="1"]')) return;
    const script = document.createElement("script");
    script.dataset.ctaUxFinal = "1";
    script.src = "./ux-final.js?v=20260503-3";
    script.async = false;
    (document.body || document.documentElement).appendChild(script);
  }

  if (document.body) loadUxFinal();
  else document.addEventListener("DOMContentLoaded", loadUxFinal, { once: true });
})();
