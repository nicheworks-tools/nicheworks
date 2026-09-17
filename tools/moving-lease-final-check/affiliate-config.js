(() => {
  "use strict";
  const TRACKING_ID = "nicheworks09-22";
  window.NWAmazonStaticOffers = Object.freeze({
    enabled: true,
    tool: "moving-lease-final-check",
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
    titleJa: "退去・引渡し前の一般用品をAmazonで探す",
    titleEn: "Find general move-out handoff supplies on Amazon",
    noteJa: "退去費用・原状回復・契約上の必要性を判定する商品提案ではありません。契約書や管理会社の案内を優先してください。",
    noteEn: "These are general move-out supplies, not a diagnosis of lease, restoration, legal, or handoff requirements.",
    offers: Object.freeze([
    Object.freeze({"key":"masking-tape","target":"handoff_supply","query":"養生テープ 引越し","labelJa":"Amazonで養生テープを探す","labelEn":"Find masking/protective tape on Amazon"}),
    Object.freeze({"key":"packing-labels","target":"handoff_supply","query":"荷造り ラベル シール","labelJa":"Amazonで荷造りラベルを探す","labelEn":"Find packing labels on Amazon"}),
    Object.freeze({"key":"document-case","target":"handoff_supply","query":"書類ケース A4","labelJa":"AmazonでA4書類ケースを探す","labelEn":"Find an A4 document case on Amazon"})
    ])
  });
})();
