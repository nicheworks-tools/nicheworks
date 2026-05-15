(() => {
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const lang = document.body?.dataset.lang === "ja" || document.documentElement.lang === "ja" ? "ja" : "en";
  const copy = {
    en: {
      previewTitle: "Preview mode",
      previewBody: "Pro output samples are shown below. Unlock Pro to copy and export these outputs.",
      activeTitle: "Pro unlocked",
      activeBody: "Common NicheWorks Pro is active in this browser."
    },
    ja: {
      previewTitle: "Previewモード",
      previewBody: "Pro出力サンプルを表示しています。コピーや書き出しにはProの有効化が必要です。",
      activeTitle: "Pro解放済み",
      activeBody: "このブラウザではNicheWorks共通Proが有効です。"
    }
  }[lang];

  function localStatus() {
    if (window.NWPro && typeof window.NWPro.getLocalStatus === "function") {
      return window.NWPro.getLocalStatus();
    }
    return { active: false, entitlement: "nicheworks_pro", checkedAt: "" };
  }

  function setHidden(nodes, hidden) {
    nodes.forEach((node) => {
      node.hidden = hidden;
      node.setAttribute("aria-hidden", hidden ? "true" : "false");
    });
  }

  function render() {
    const status = localStatus();
    const active = Boolean(status.active);
    document.documentElement.dataset.proActive = active ? "true" : "false";
    if (document.body) document.body.dataset.proActive = active ? "true" : "false";

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.dataset.proActive = active ? "true" : "false";
      node.innerHTML = active
        ? `<strong>${copy.activeTitle}</strong><span>${copy.activeBody}</span>`
        : `<strong>${copy.previewTitle}</strong><span>${copy.previewBody}</span>`;
    });

    setHidden(Array.from(document.querySelectorAll("[data-pro-preview]")), active);
    setHidden(Array.from(document.querySelectorAll("[data-pro-only]")), !active);

    document.querySelectorAll("[data-pro-buy]").forEach((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.href = PAYMENT_LINK;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      }
    });

    window.dispatchEvent(new CustomEvent("nwpro:state", { detail: { active, status } }));
  }

  window.NWMotionAtlasProBridge = { render, paymentLink: PAYMENT_LINK };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }
})();
