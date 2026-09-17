(() => {
  "use strict";
  const TRACKING_ID = "nicheworks09-22";
  window.NWAmazonStaticOffers = Object.freeze({
    enabled: true,
    tool: "moving-checklist-generator",
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
    titleJa: "引っ越し・梱包用品をAmazonで探す",
    titleEn: "Find general moving and packing supplies on Amazon",
    noteJa: "チェック状態から購入必須と判定するものではありません。商品購入は行政・契約・ライフライン等の手続き完了を意味しません。",
    noteEn: "These are general packing-supply links. Checklist state does not imply a purchase requirement or completion of any official procedure.",
    offers: Object.freeze([
    Object.freeze({"key":"moving-boxes","target":"packing_supply","query":"引越し ダンボール セット","labelJa":"Amazonで引っ越し用段ボールを探す","labelEn":"Find moving boxes on Amazon"}),
    Object.freeze({"key":"packing-tape","target":"packing_supply","query":"梱包テープ 引越し","labelJa":"Amazonで梱包テープを探す","labelEn":"Find packing tape on Amazon"}),
    Object.freeze({"key":"packing-cushion","target":"packing_supply","query":"緩衝材 梱包","labelJa":"Amazonで梱包用緩衝材を探す","labelEn":"Find packing cushioning on Amazon"}),
    Object.freeze({"key":"compression-bags","target":"packing_supply","query":"衣類 圧縮袋 引越し","labelJa":"Amazonで衣類圧縮袋を探す","labelEn":"Find clothing compression bags on Amazon"})
    ])
  });
})();
