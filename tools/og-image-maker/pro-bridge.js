(() => {
  "use strict";

  const ENTITLEMENT = "nicheworks_pro";

  function hasSharedPro() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") return false;
      const status = window.NWPro.getLocalStatus() || {};
      return Boolean(status.active && (!status.entitlement || status.entitlement === ENTITLEMENT));
    } catch (_) {
      return false;
    }
  }

  window.NW = window.NW || {};
  window.NW.hasPro = hasSharedPro;
})();
