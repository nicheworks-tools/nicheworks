(() => {
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";
  const TOOL_ID = "ats-paste-doctor";

  const STATUS = {
    active: "Pro解放済み。このブラウザでは共通Proが有効です。 / Pro unlocked. Common Pro is active in this browser.",
    preview: "Previewモードです。このブラウザでは共通Proがまだ有効ではありません。 / Preview mode. Common Pro is not active in this browser yet.",
    unavailable: "Pro状態を確認できませんでした。無料機能は引き続き利用できます。 / Pro status could not be checked. Free features remain available.",
  };

  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function getStatus() {
    if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
      return { available: false, active: false, entitlement: ENTITLEMENT };
    }

    try {
      const local = window.NWPro.getLocalStatus() || {};
      const entitlement = local.entitlement || ENTITLEMENT;
      return {
        available: true,
        active: Boolean(local.active && entitlement === ENTITLEMENT),
        entitlement,
        checkedAt: local.checkedAt || "",
      };
    } catch (error) {
      return { available: false, active: false, entitlement: ENTITLEMENT };
    }
  }

  function syncBuyLinks() {
    $$('[data-pro-buy]').forEach((link) => {
      link.setAttribute("href", PAYMENT_LINK);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
      link.removeAttribute("aria-disabled");
    });
  }

  function setHidden(node, hidden) {
    node.hidden = hidden;
    node.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function syncGate() {
    const status = getStatus();
    const active = Boolean(status.available && status.active);
    const root = document.documentElement;
    root.dataset.proActive = active ? "true" : "false";
    root.dataset.proTool = TOOL_ID;
    root.classList.toggle("nw-pro-active", active);
    root.classList.toggle("nw-pro-preview", !active);

    $$('[data-pro-status]').forEach((node) => {
      node.textContent = status.available ? (active ? STATUS.active : STATUS.preview) : STATUS.unavailable;
    });

    $$('[data-pro-preview]').forEach((node) => setHidden(node, active));
    $$('[data-pro-only]').forEach((node) => setHidden(node, !active));

    $$('[data-pro-action]').forEach((button) => {
      if ("disabled" in button) button.disabled = !active;
      button.setAttribute("aria-disabled", active ? "false" : "true");
      button.classList.toggle("is-locked", !active);
      button.title = active ? "" : "Pro feature locked / Pro限定機能";
    });

    syncBuyLinks();
    document.dispatchEvent(new CustomEvent("nw-pro-status-change", { detail: { ...status, active } }));
    return { ...status, active };
  }

  function init() {
    syncGate();
    window.addEventListener("storage", syncGate);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncGate();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
