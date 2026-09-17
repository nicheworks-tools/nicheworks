(() => {
  "use strict";

  const EXPECTED_ENTITLEMENT = "nicheworks_pro";
  const STATUS = {
    inactive: "Product-scoped migration pending / product-scoped移行準備中",
    active: "Legacy Pro compatibility entitlement active / 旧Pro互換entitlement有効",
    failed: "Legacy Pro status unavailable; free checker remains available / 旧Pro状態を確認できません。無料チェックは利用できます"
  };

  function readExactStatus() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
        return { available: false, active: false, entitlement: "" };
      }
      const status = window.NWPro.getLocalStatus() || {};
      return {
        available: true,
        active: status.active === true && status.entitlement === EXPECTED_ENTITLEMENT,
        entitlement: status.entitlement || "",
        checkedAt: status.checkedAt || ""
      };
    } catch (error) {
      return { available: false, active: false, entitlement: "" };
    }
  }

  function setHidden(nodes, hidden) {
    nodes.forEach((node) => {
      node.hidden = hidden;
      node.setAttribute("aria-hidden", hidden ? "true" : "false");
    });
  }

  function retireBuyLinks() {
    document.querySelectorAll("[data-pro-buy]").forEach((link) => {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.setAttribute("aria-disabled", "true");
      link.hidden = true;
    });
  }

  function apply() {
    const status = readExactStatus();
    const active = status.available && status.active;

    document.documentElement.dataset.proActive = active ? "true" : "false";
    document.documentElement.dataset.proTool = "command-safety-checker";

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.textContent = !status.available ? STATUS.failed : (active ? STATUS.active : STATUS.inactive);
    });

    setHidden(Array.from(document.querySelectorAll("[data-pro-preview]")), active);
    setHidden(Array.from(document.querySelectorAll("[data-pro-only]")), !active);

    document.querySelectorAll("[data-pro-action]").forEach((button) => {
      if ("disabled" in button) button.disabled = !active;
      button.setAttribute("aria-disabled", active ? "false" : "true");
      button.title = active ? "" : "Paid bundle migration pending / 有料bundle移行準備中";
    });

    retireBuyLinks();
    return status;
  }

  document.addEventListener("click", (event) => {
    const action = event.target?.closest?.("[data-pro-action]");
    if (!action) return;
    const status = readExactStatus();
    if (status.active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }

  window.addEventListener("storage", apply);
  window.addEventListener("nw-pro-status-change", apply);
  window.NWCommandSafetyAuthorityGuard = Object.freeze({ refresh: apply, readExactStatus });
})();
