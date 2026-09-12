(function attachCosmeticsAffiliateConfig(root) {
  "use strict";

  const config = Object.freeze({
    version: "1.0.0",
    provider: "amazon",
    enabled: false,
    associateTag: "",
    disclosure: Object.freeze({
      ja: "",
      en: ""
    }),
    slots: Object.freeze({
      "cosmetic-ingredient-checker-lite": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-summary",
        links: Object.freeze([])
      }),
      "inci-fastscan": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-results",
        links: Object.freeze([])
      })
    })
  });

  root.NWCosmeticsAffiliateConfig = config;
})(typeof globalThis !== "undefined" ? globalThis : this);
