(() => {
  "use strict";

  function setFreeActive() {
    document.documentElement.dataset.proActive = "true";
    if (document.body) document.body.dataset.proActive = "true";
  }

  function setHidden(nodes, hidden) {
    nodes.forEach((node) => {
      node.hidden = hidden;
      node.setAttribute("aria-hidden", hidden ? "true" : "false");
    });
  }

  function render() {
    setFreeActive();

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.dataset.proActive = "true";
      node.innerHTML = document.documentElement.lang === "ja"
        ? "<strong>無料で利用できます</strong><span>比較・実装ハンドオフ・Markdown / JSON出力を含む全機能を利用できます。</span>"
        : "<strong>Available for free</strong><span>All features are available, including expanded compare, implementation handoff, and Markdown / JSON export.</span>";
    });

    setHidden(Array.from(document.querySelectorAll("[data-pro-preview]")), true);
    setHidden(Array.from(document.querySelectorAll("[data-pro-only]")), false);

    document.querySelectorAll("[data-pro-buy]").forEach((node) => node.remove());
    document.querySelectorAll("[data-pro-action]").forEach((node) => {
      if ("disabled" in node) node.disabled = false;
      node.removeAttribute("aria-disabled");
    });

    window.dispatchEvent(new CustomEvent("nwpro:state", {
      detail: {
        active: true,
        free: true,
        status: { active: true, entitlement: "free", source: "ads_donation" }
      }
    }));
  }

  // This script is loaded before app.js. Set the data flag synchronously so
  // the existing app initializes with its former advanced path already open.
  setFreeActive();
  render();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  }

  window.NWMotionAtlasProBridge = Object.freeze({ render, mode: "free" });
})();
