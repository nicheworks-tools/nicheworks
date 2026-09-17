(() => {
  "use strict";
  const TRACKING_ID = "nicheworks09-22";
  window.NWAmazonStaticOffers = Object.freeze({
    enabled: true,
    tool: "laundry-code-decode",
    trackingId: TRACKING_ID,
    placement: "related_products",
    template: Object.freeze({
      templateId: "nicheworks_fixed_amazon_search",
      provider: "amazon",
      kind: "amazon_search",
      status: "verified",
      verifiedAt: "2026-09-17",
      verificationMethod: "shared_link_checker_validated_tagged_search_format",
      proofUrl: "https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22"
    }),
    titleJa: "一般的な洗濯用品をAmazonで探す",
    titleEn: "Find general laundry accessories on Amazon",
    noteJa: "選択したJIS洗濯表示の意味から処置や商品の安全性を推奨するものではありません。衣類ラベル・メーカー指示・クリーニング店の案内を優先してください。",
    noteEn: "These general accessory links do not interpret a JIS symbol as approval for a treatment or product. Follow the garment label and manufacturer guidance.",
    offers: Object.freeze([
    Object.freeze({"key":"laundry-net","target":"laundry_accessory","query":"洗濯ネット セット","labelJa":"Amazonで洗濯ネットを探す","labelEn":"Find laundry nets on Amazon"}),
    Object.freeze({"key":"laundry-bag","target":"laundry_accessory","query":"ランドリーバッグ 洗濯","labelJa":"Amazonでランドリーバッグを探す","labelEn":"Find a laundry bag on Amazon"}),
    Object.freeze({"key":"pinch-hanger","target":"laundry_accessory","query":"ピンチハンガー 洗濯","labelJa":"Amazonでピンチハンガーを探す","labelEn":"Find a pinch hanger on Amazon"})
    ])
  });
})();
