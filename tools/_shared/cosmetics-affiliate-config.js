(function attachCosmeticsAffiliateConfig(root) {
  "use strict";

  const ASSOCIATE_TAG = "nicheworks09-22";

  const fixedSearchLinks = Object.freeze([
    Object.freeze({
      key: "skincare_general",
      href: "https://www.amazon.co.jp/s?k=%E3%82%B9%E3%82%AD%E3%83%B3%E3%82%B1%E3%82%A2&tag=nicheworks09-22",
      labelJa: "スキンケアをAmazonで探す [PR]",
      labelEn: "Skincare on Amazon [PR]",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "skincare_moisturizing",
      href: "https://www.amazon.co.jp/s?k=%E4%BF%9D%E6%B9%BF+%E3%82%B9%E3%82%AD%E3%83%B3%E3%82%B1%E3%82%A2&tag=nicheworks09-22",
      labelJa: "保湿スキンケアを探す [PR]",
      labelEn: "Moisturizing skincare [PR]",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "skincare_ceramide",
      href: "https://www.amazon.co.jp/s?k=%E3%82%BB%E3%83%A9%E3%83%9F%E3%83%89+%E3%82%B9%E3%82%AD%E3%83%B3%E3%82%B1%E3%82%A2&tag=nicheworks09-22",
      labelJa: "セラミド系スキンケアを探す [PR]",
      labelEn: "Ceramide skincare [PR]",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "sunscreen_general",
      href: "https://www.amazon.co.jp/s?k=%E6%97%A5%E7%84%BC%E3%81%91%E6%AD%A2%E3%82%81&tag=nicheworks09-22",
      labelJa: "日焼け止めをAmazonで探す [PR]",
      labelEn: "Sunscreen on Amazon [PR]",
      verifiedAt: "2026-09-13"
    })
  ]);

  const config = Object.freeze({
    version: "1.2.0",
    provider: "amazon",
    enabled: true,
    trackingMode: "tagged_search",
    associateTag: ASSOCIATE_TAG,
    disclosure: Object.freeze({
      ja: "Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。",
      en: "As an Amazon Associate, NicheWorks earns from qualifying purchases."
    }),
    slots: Object.freeze({
      "cosmetic-ingredient-checker-lite": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-summary",
        links: fixedSearchLinks
      }),
      "inci-fastscan": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-results",
        links: fixedSearchLinks
      })
    })
  });

  root.NWCosmeticsAffiliateConfig = config;
})(typeof globalThis !== "undefined" ? globalThis : this);
