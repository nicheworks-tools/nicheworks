(function attachCosmeticsAffiliateConfig(root) {
  "use strict";

  const ASSOCIATE_TAG = "nicheworks09-22";

  const fixedSearchLinks = Object.freeze([
    Object.freeze({
      key: "toner",
      href: "https://www.amazon.co.jp/s?k=%E5%8C%96%E7%B2%A7%E6%B0%B4&tag=nicheworks09-22",
      labelJa: "化粧水をAmazonで見る",
      labelEn: "Toner on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "serum",
      href: "https://www.amazon.co.jp/s?k=%E7%BE%8E%E5%AE%B9%E6%B6%B2&tag=nicheworks09-22",
      labelJa: "美容液をAmazonで見る",
      labelEn: "Serum on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "moisturizer",
      href: "https://www.amazon.co.jp/s?k=%E4%B9%B3%E6%B6%B2+%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%A0&tag=nicheworks09-22",
      labelJa: "乳液・クリームをAmazonで見る",
      labelEn: "Moisturizer on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "cleanser",
      href: "https://www.amazon.co.jp/s?k=%E6%B4%97%E9%A1%94&tag=nicheworks09-22",
      labelJa: "洗顔料をAmazonで見る",
      labelEn: "Facial cleanser on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "cleansing",
      href: "https://www.amazon.co.jp/s?k=%E3%82%AF%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%B3%E3%82%B0&tag=nicheworks09-22",
      labelJa: "クレンジングをAmazonで見る",
      labelEn: "Makeup remover on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "sunscreen",
      href: "https://www.amazon.co.jp/s?k=%E6%97%A5%E7%84%BC%E3%81%91%E6%AD%A2%E3%82%81&tag=nicheworks09-22",
      labelJa: "日焼け止めをAmazonで見る",
      labelEn: "Sunscreen on Amazon",
      verifiedAt: "2026-09-13"
    }),
    Object.freeze({
      key: "bodycare",
      href: "https://www.amazon.co.jp/s?k=%E3%83%9C%E3%83%87%E3%82%A3%E3%82%B1%E3%82%A2&tag=nicheworks09-22",
      labelJa: "ボディケアをAmazonで見る",
      labelEn: "Body care on Amazon",
      verifiedAt: "2026-09-13"
    })
  ]);

  const config = Object.freeze({
    version: "1.4.0",
    provider: "amazon",
    enabled: true,
    trackingMode: "tagged_search",
    displayMode: "post_result_category_choice",
    associateTag: ASSOCIATE_TAG,
    disclosure: Object.freeze({
      ja: "Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。",
      en: "As an Amazon Associate, NicheWorks earns from qualifying purchases."
    }),
    slots: Object.freeze({
      "cosmetic-ingredient-checker-lite": Object.freeze({
        slotId: "amazonAffiliateSlot",
        placement: "after-results",
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
