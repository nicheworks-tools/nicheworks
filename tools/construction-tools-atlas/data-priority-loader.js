(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('script[src="./ux-final.js"]')) return;
    const script = document.createElement("script");
    script.src = "./ux-final.js";
    script.defer = true;
    document.body.appendChild(script);
  });
})();
