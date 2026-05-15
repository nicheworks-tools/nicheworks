(function () {
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";

  const readStatus = () => {
    if (window.NWPro && typeof window.NWPro.getLocalStatus === "function") {
      const status = window.NWPro.getLocalStatus() || {};
      return {
        active: Boolean(status.active && (!status.entitlement || status.entitlement === ENTITLEMENT)),
        entitlement: status.entitlement || ENTITLEMENT,
        checkedAt: status.checkedAt || "",
      };
    }
    return { active: false, entitlement: ENTITLEMENT, checkedAt: "" };
  };

  const applyStatus = () => {
    const status = readStatus();
    const active = status.active === true;
    document.documentElement.dataset.proActive = active ? "true" : "false";

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.textContent = active ? "Pro active" : "Preview";
      node.dataset.proStatus = active ? "active" : "preview";
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

  window.NWApiKeyTokenRedactorProBridge = {
    refresh: applyStatus,
    paymentLink: PAYMENT_LINK,
    entitlement: ENTITLEMENT,
  };
})();
