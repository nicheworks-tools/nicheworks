(() => {
  "use strict";

  const LEGACY_KEY = "pdg_pro_key";
  const EXPECTED_ENTITLEMENT = "nicheworks_pro";
  const BRIDGE_CODE = "NW-PDG-SHRD-PRO1-12";

  function readSharedStatus() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
        return { active: false, entitlement: EXPECTED_ENTITLEMENT };
      }
      return window.NWPro.getLocalStatus() || { active: false, entitlement: EXPECTED_ENTITLEMENT };
    } catch (_) {
      return { active: false, entitlement: EXPECTED_ENTITLEMENT };
    }
  }

  function sharedActive() {
    const status = readSharedStatus();
    return Boolean(status.active && status.entitlement === EXPECTED_ENTITLEMENT);
  }

  function prepareLegacyAdapter() {
    const active = sharedActive();
    document.documentElement.dataset.pdgSharedProActive = active ? "true" : "false";
    try {
      if (active) localStorage.setItem(LEGACY_KEY, BRIDGE_CODE);
      else localStorage.removeItem(LEGACY_KEY);
    } catch (_) {}
    return active;
  }

  function replaceLegacyCodeUi(active) {
    const input = document.getElementById("proKey");
    const field = input && input.closest(".field");
    if (!field) return;

    field.replaceChildren();
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = active
      ? "Shared NicheWorks Pro is active in this browser."
      : "Pro is unlocked through the shared NicheWorks Pro entitlement. Purchase or reactivate Pro, then reload this page.";
    field.appendChild(note);

    if (!active) {
      const link = document.createElement("a");
      link.className = "btn";
      link.href = "/pro/unlock/";
      link.textContent = "Pro unlock page";
      field.appendChild(link);
    }
  }

  const activeAtLoad = prepareLegacyAdapter();

  document.addEventListener("DOMContentLoaded", () => {
    replaceLegacyCodeUi(activeAtLoad);
    // app.js reads the temporary compatibility key during its own DOMContentLoaded
    // handler. Remove it immediately after the event turn so the old local code is
    // never a durable entitlement source.
    window.setTimeout(() => {
      try { localStorage.removeItem(LEGACY_KEY); } catch (_) {}
    }, 0);
  }, { once: true });
})();
