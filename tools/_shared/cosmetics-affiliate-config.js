(function attachCosmeticsAffiliateConfig(root) {
  "use strict";

  const skincareSearch = Object.freeze({
    key: "skincare_search",
    href: "https://amzn.to/4xNbcDO",
    labelJa: "Amazonでスキンケアを探す [PR]",
    labelEn: "Find skincare on Amazon [PR]",
    verifiedAt: "2026-09-13"
  });

  const config = Object.freeze({
    version: "1.1.0",
    provider: "amazon",
    enabled: true,
    trackingMode: "special_link",
    associateTag: "",
    disclosure: Object.freeze({
      ja: "Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。",
      en: "As an Amazon Associate, NicheWorks earns from qualifying purchases."
    }),
    slots: Object.freeze({
      "cosmetic-ingredient-checker-lite": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-summary",
        links: Object.freeze([skincareSearch])
      }),
      "inci-fastscan": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-results",
        links: Object.freeze([skincareSearch])
      })
    })
  });

  root.NWCosmeticsAffiliateConfig = config;
})(typeof globalThis !== "undefined" ? globalThis : this);
