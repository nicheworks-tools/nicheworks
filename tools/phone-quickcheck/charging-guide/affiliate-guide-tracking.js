(() => {
  "use strict";

  // Fixed, verified search categories only. Never send visitor search text, model IDs,
  // product queries, Amazon URLs, or other identifying information to GA4.
  const knownKeys = new Set([
    "cable-usbc-usbc", "cable-usbc-lightning", "charger-pd-40w",
    "charger-pps-30w", "charger-pps-65w", "charger-oppo-supervooc",
    "charger-qi2", "charger-oppo-airvooc", "powerbank-10000-usbc"
  ]);

  function bindGuideClicks() {
    document.querySelectorAll("a.amazon[data-offer-key]").forEach((link) => {
      const key = String(link.dataset.offerKey || "");
      if (!knownKeys.has(key)) return;
      let url;
      try { url = new URL(link.href); } catch (_) { return; }
      if (url.protocol !== "https:" ||
          url.hostname !== "www.amazon.co.jp" ||
          url.pathname !== "/s" ||
          url.searchParams.get("tag") !== "nicheworks09-22" ||
          !url.searchParams.get("k")) return;

      link.addEventListener("click", () => {
        if (typeof window.gtag !== "function") return;
        window.gtag("event", "affiliate_outbound", {
          tool_slug: "phone-quickcheck",
          affiliate_id: "phone_guide_" + key,
          placement: "charging_guide",
          merchant: "amazon",
          destination_key: key,
          language: "ja"
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGuideClicks, { once: true });
  } else {
    bindGuideClicks();
  }
})();
