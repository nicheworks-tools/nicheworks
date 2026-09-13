(() => {
  "use strict";

  const ENTITLEMENT = "nicheworks_pro";
  const BATCH_ACTION_SELECTOR = "#batchDownload";

  function hasSharedPro() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") return false;
      const status = window.NWPro.getLocalStatus() || {};
      return Boolean(status.active === true && status.entitlement === ENTITLEMENT);
    } catch (_) {
      return false;
    }
  }

  function installSharedGate() {
    window.NW = window.NW || {};
    window.NW.hasPro = hasSharedPro;
  }

  function recheckBatchAction(event) {
    const target = event.target && event.target.closest ? event.target.closest(BATCH_ACTION_SELECTOR) : null;
    if (!target) return;
    installSharedGate();
    if (hasSharedPro()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  installSharedGate();
  document.addEventListener("click", recheckBatchAction, true);
  window.addEventListener("storage", installSharedGate);
})();
