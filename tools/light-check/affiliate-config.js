(() => {
  "use strict";
  const TRACKING_ID = "nicheworks09-22";
  window.NWAmazonStaticOffers = Object.freeze({
    enabled: true,
    tool: "light-check",
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
    titleJa: "撮影・配信用の一般照明用品をAmazonで探す",
    titleEn: "Find general shooting and streaming lighting gear on Amazon",
    noteJa: "B/C/S/Fの値から特定の照明器具が必要だと判定しているものではありません。照度・色温度・フリッカー性能は商品仕様で確認してください。",
    noteEn: "These links are general equipment discovery and are not calibrated recommendations derived from B/C/S/F values.",
    offers: Object.freeze([
    Object.freeze({"key":"video-led-light","target":"video_light","query":"撮影用 LEDライト","labelJa":"Amazonで撮影用LEDライトを探す","labelEn":"Find a video LED light on Amazon"}),
    Object.freeze({"key":"ring-light","target":"ring_light","query":"リングライト 撮影","labelJa":"Amazonでリングライトを探す","labelEn":"Find a ring light on Amazon"}),
    Object.freeze({"key":"reflector","target":"reflector","query":"レフ板 撮影","labelJa":"Amazonで撮影用レフ板を探す","labelEn":"Find a photo reflector on Amazon"})
    ])
  });
})();
