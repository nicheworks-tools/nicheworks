(() => {
  "use strict";
  const TRACKING_ID = "nicheworks09-22";
  window.NWAmazonStaticOffers = Object.freeze({
    enabled: true,
    tool: "dry-meter",
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
    titleJa: "乾燥を助ける一般用品をAmazonで探す",
    titleEn: "Find general laundry-drying gear on Amazon",
    noteJa: "Dry Scoreや天気・入力値から購入の必要性を判定するものではありません。室内条件や製品仕様は商品ページで確認してください。",
    noteEn: "These are general product-discovery links, not purchase recommendations derived from Dry Score, weather, location, or manual inputs.",
    offers: Object.freeze([
    Object.freeze({"key":"temp-humidity-meter","target":"room_measurement","query":"温湿度計 室内 デジタル","labelJa":"Amazonで室内用温湿度計を探す","labelEn":"Find an indoor thermo-hygrometer on Amazon"}),
    Object.freeze({"key":"air-circulator","target":"air_circulation","query":"サーキュレーター 部屋干し","labelJa":"Amazonでサーキュレーターを探す","labelEn":"Find an air circulator on Amazon"}),
    Object.freeze({"key":"indoor-drying-rack","target":"drying_rack","query":"室内物干し 折りたたみ","labelJa":"Amazonで室内物干しを探す","labelEn":"Find an indoor drying rack on Amazon"})
    ])
  });
})();
