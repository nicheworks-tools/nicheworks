(function () {
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";

  const messages = {
    preview: {
      ja: "Previewモードです。このブラウザでは共通Proがまだ有効ではありません。",
      en: "Preview mode. Common Pro is not active in this browser yet.",
    },
    active: {
      ja: "Pro解放済み。このブラウザでは共通Proが有効です。",
      en: "Pro unlocked. Common Pro is active in this browser.",
    },
    error: {
      ja: "Pro状態を確認できませんでした。無料機能は引き続き利用できます。",
      en: "Could not check Pro status. Free features remain available.",
    },
  };

  const currentLang = () => {
    const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (htmlLang.startsWith("ja")) return "ja";
    if (htmlLang.startsWith("en")) return "en";

    const activeLangButton = document.querySelector(".nw-lang-switch button.active[data-lang]");
    const activeLang = (activeLangButton?.dataset.lang || "").toLowerCase();
    if (activeLang === "ja" || activeLang === "en") return activeLang;

    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const statusText = (state) => messages[state][currentLang()] || messages[state].en;

  const readStatus = () => {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
        return { active: false, entitlement: ENTITLEMENT, checkedAt: "", error: true };
      }
      const status = window.NWPro.getLocalStatus() || {};
      return {
        active: Boolean(status.active && (!status.entitlement || status.entitlement === ENTITLEMENT)),
        entitlement: status.entitlement || ENTITLEMENT,
        checkedAt: status.checkedAt || "",
        error: false,
      };
    } catch (error) {
      return { active: false, entitlement: ENTITLEMENT, checkedAt: "", error: true };
    }
  };

  const applyStatus = () => {
    const status = readStatus();
    const active = status.active === true;
    document.documentElement.dataset.proActive = active ? "true" : "false";

    const state = status.error ? "error" : active ? "active" : "preview";

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.textContent = statusText(state);
      node.dataset.proStatus = state;
    });

    document.querySelectorAll("[data-pro-preview]").forEach((node) => {
      node.hidden = active;
    });

    document.querySelectorAll("[data-pro-only]").forEach((node) => {
      node.hidden = !active;
    });

    document.querySelectorAll("[data-pro-buy]").forEach((node) => {
      node.setAttribute("href", PAYMENT_LINK);
    });

    window.dispatchEvent(new CustomEvent("nw-pro-status", { detail: status }));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyStatus);
  } else {
    applyStatus();
  }

  document.addEventListener("nw-lang-change", applyStatus);
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.(".nw-lang-switch button[data-lang]")) {
      window.setTimeout(applyStatus, 0);
    }
  });

  window.NWApiKeyTokenRedactorProBridge = {
    refresh: applyStatus,
    paymentLink: PAYMENT_LINK,
    entitlement: ENTITLEMENT,
  };
})();
