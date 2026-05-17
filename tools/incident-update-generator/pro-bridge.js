(() => {
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";

  const getLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const copy = {
    active: {
      ja: "Pro解放済み — Markdownパックのコピーと保存が使えます。",
      en: "Pro unlocked — Markdown pack copy and save are available.",
    },
    inactive: {
      ja: "Previewモード — 無料機能は使えます。Pro機能は購入後に解放されます。",
      en: "Preview mode — free features are available. Pro features unlock after purchase.",
    },
  };

  const readStatus = () => {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
        return { active: false, entitlement: ENTITLEMENT };
      }
      const status = window.NWPro.getLocalStatus() || {};
      return {
        active: status.active === true && (status.entitlement || ENTITLEMENT) === ENTITLEMENT,
        entitlement: status.entitlement || ENTITLEMENT,
      };
    } catch (_) {
      return { active: false, entitlement: ENTITLEMENT };
    }
  };

  const setText = (element, status) => {
    const lang = getLang();
    element.textContent = status.active ? copy.active[lang] : copy.inactive[lang];
  };

  const apply = () => {
    const status = readStatus();
    const root = document.documentElement;
    root.dataset.proActive = status.active ? "true" : "false";

    document.querySelectorAll("[data-pro-status]").forEach((element) => setText(element, status));
    document.querySelectorAll("[data-pro-preview]").forEach((element) => {
      element.hidden = status.active;
    });
    document.querySelectorAll("[data-pro-only]").forEach((element) => {
      element.hidden = !status.active;
      element.disabled = !status.active || element.disabled;
      element.setAttribute("aria-disabled", status.active ? "false" : "true");
    });
    document.querySelectorAll("[data-pro-buy]").forEach((element) => {
      element.setAttribute("href", PAYMENT_LINK);
      element.hidden = status.active;
    });

    document.dispatchEvent(new CustomEvent("nw-pro-status-change", { detail: status }));
  };

  document.addEventListener("DOMContentLoaded", apply);
  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest && event.target.closest(".nw-lang-switch")) {
      window.setTimeout(apply, 0);
    }
  });
})();
