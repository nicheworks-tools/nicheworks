// ============================
// LogFormatter common Pro bridge
// ============================
(function () {
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ACTIVE_TEXT = {
    ja: "Pro解放済み。このブラウザでは共通Proが有効です。",
    en: "Pro unlocked. Common Pro is active in this browser.",
  };
  const PREVIEW_TEXT = {
    ja: "Previewモードです。このブラウザでは共通Proがまだ有効ではありません。ProではCSV保存、JSON保存、Markdownレポート、正規表現フィルタ、User-Agent/bot傾向、IP/URL詳細集計を解放します。",
    en: "Preview mode. Common Pro is not active in this browser yet. Pro unlocks CSV export, JSON export, Markdown reports, regex filters, User-Agent/bot trends, and IP/URL detail analysis.",
  };

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function setBuyLinks() {
    document.querySelectorAll("[data-pro-buy]").forEach((link) => {
      link.setAttribute("href", PAYMENT_LINK);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  function readStatus() {
    try {
      if (window.NWPro && typeof window.NWPro.getLocalStatus === "function") {
        const status = window.NWPro.getLocalStatus();
        return { active: Boolean(status && status.active), failed: false };
      }
    } catch (error) {
      return { active: false, failed: true };
    }
    return { active: false, failed: true };
  }

  function applyProStatus() {
    const lang = currentLang();
    const status = readStatus();
    const active = status.active;

    document.documentElement.dataset.proActive = active ? "true" : "false";
    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.textContent = active ? ACTIVE_TEXT[lang] : PREVIEW_TEXT[lang];
      node.classList.toggle("pro-active", active);
      node.classList.toggle("pro-preview", !active);
    });
    document.querySelectorAll("[data-pro-preview]").forEach((node) => {
      node.hidden = active;
    });
    document.querySelectorAll("[data-pro-only]").forEach((node) => {
      node.hidden = !active;
    });
    document.querySelectorAll("button[data-pro-action]").forEach((button) => {
      button.disabled = !active;
      button.setAttribute("aria-disabled", active ? "false" : "true");
    });
    setBuyLinks();
    window.dispatchEvent(new CustomEvent("nw-pro-status-change", { detail: { active, failed: status.failed } }));
  }

  window.LogFormatterProBridge = { applyProStatus, paymentLink: PAYMENT_LINK };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyProStatus);
  } else {
    applyProStatus();
  }
  window.addEventListener("storage", applyProStatus);
  window.addEventListener("nw-language-change", applyProStatus);
})();
