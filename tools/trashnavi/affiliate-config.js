(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const offers = Object.freeze([
    Object.freeze({
      key: "sorting_bin",
      href: "https://www.amazon.co.jp/s?k=%E5%88%86%E5%88%A5+%E3%82%B4%E3%83%9F%E7%AE%B1&tag=nicheworks09-22",
      labelJa: "分別用ごみ箱をAmazonで探す [PR]",
      labelEn: "Find sorting bins on Amazon [PR]"
    }),
    Object.freeze({
      key: "compression_bag",
      href: "https://www.amazon.co.jp/s?k=%E5%9C%A7%E7%B8%AE%E8%A2%8B&tag=nicheworks09-22",
      labelJa: "圧縮袋をAmazonで探す [PR]",
      labelEn: "Find compression bags on Amazon [PR]"
    }),
    Object.freeze({
      key: "trash_bag_storage",
      href: "https://www.amazon.co.jp/s?k=%E3%82%B4%E3%83%9F%E8%A2%8B+%E5%8F%8E%E7%B4%8D&tag=nicheworks09-22",
      labelJa: "ごみ袋収納をAmazonで探す [PR]",
      labelEn: "Find trash-bag storage on Amazon [PR]"
    }),
    Object.freeze({
      key: "packing_supplies",
      href: "https://www.amazon.co.jp/s?k=%E5%BC%95%E3%81%A3%E8%B6%8A%E3%81%97+%E6%A2%B1%E5%8C%85%E7%94%A8%E5%93%81&tag=nicheworks09-22",
      labelJa: "梱包・片付け用品をAmazonで探す [PR]",
      labelEn: "Find packing supplies on Amazon [PR]"
    })
  ]);

  const targets = Object.freeze(Object.fromEntries(offers.map((offer) => [offer.key, offer.href])));

  window.NWTrashNaviAffiliate = Object.freeze({
    enabled: true,
    tool: "trashnavi",
    provider: "amazon",
    trackingMode: "tagged_search",
    trackingId: TRACKING_ID,
    verifiedAt: "2026-09-14",
    verificationMethod: "shared_link_checker_validated_tagged_search_format",
    targets,
    offers
  });
})();
