(() => {
  "use strict";

  function addScript(src, key){
    if (document.querySelector(`script[data-cta-key="${key}"]`)) return;
    const s = document.createElement("script");
    s.dataset.ctaKey = key;
    s.src = src;
    s.async = false;
    (document.body || document.documentElement).appendChild(s);
  }

  function boot(){
    addScript("./ux-final.js?v=20260504-1", "ux-final");
    addScript("./force-list-v2.js?v=20260504-1", "force-list-v2");
  }

  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
