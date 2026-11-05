(() => {
  "use strict";
  // Never transmit user-entered search strings, model names or Amazon URL to GA4.
  const keys = new Set(["charger-pd-check-wattage","charger-compat-check","cable-usbc-usbc","cable-usbc-lightning","phone-case-model-search","screen-film-model-search"]);
  const init = () => document.querySelectorAll('a[data-offer-key]').forEach(link => {
    const key = String(link.dataset.offerKey || "");
    if (!keys.has(key)) return;
    let url;
    try { url = new URL(link.href); } catch (_) { return; }
    if (url.protocol !== "https:" || url.hostname !== "www.amazon.co.jp" ||
        url.pathname !== "/s" || url.searchParams.get("tag") !== "nicheworks09-22" ||
        !url.searchParams.get("k")) return;
    link.addEventListener("click", () => {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "affiliate_outbound", {
        tool_slug: "phone-quickcheck",
        affiliate_id: "phone_profile_" + key,
        placement: "model_profile",
        merchant: "amazon",
        destination_key: key,
        language: "ja"
      });
    });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
