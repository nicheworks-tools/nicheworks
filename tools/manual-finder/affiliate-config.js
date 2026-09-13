(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  const staticOffers = Object.freeze([
    Object.freeze({
      offerId: "nikon_z8_search",
      maker: "Nikon",
      model: "Z8",
      category: "カメラ・映像",
      provider: "amazon",
      kind: "amazon_search",
      status: "verified",
      specialLink: "https://amzn.to/3T7sxbB",
      verifiedAt: "2026-09-13",
      labelJa: "Amazonで Nikon Z8 を探す",
      labelEn: "Find Nikon Z8 on Amazon"
    })
  ]);

  const modelSearchTemplate = Object.freeze({
    templateId: "manual_model_search",
    provider: "amazon",
    kind: "amazon_search",
    status: "pending_link_checker",
    trackingId: TRACKING_ID,
    baseUrl: AMAZON_SEARCH_BASE,
    activationTarget: "manual_model_search_template",
    proofUrl: "https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22",
    eligibleCategories: Object.freeze(["カメラ・映像", "プリンター・複合機"]),
    note: "One validated tagged search-link template replaces per-model Special Link creation."
  });

  function isAmazonHttpsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return false;
      return ["amzn.to", "amazon.co.jp", "www.amazon.co.jp"].includes(url.hostname);
    } catch (_) {
      return false;
    }
  }

  function isStaticOfferActive(row) {
    return Boolean(row && row.status === "verified" && isAmazonHttpsUrl(row.specialLink));
  }

  function buildModelSearchUrl({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (!cleanMaker || !cleanModel) return "";
    if (!modelSearchTemplate.eligibleCategories.includes(cleanCategory)) return "";

    const url = new URL(modelSearchTemplate.baseUrl);
    url.searchParams.set("k", `${cleanMaker} ${cleanModel}`);
    url.searchParams.set("tag", modelSearchTemplate.trackingId);
    return url.toString();
  }

  const activeStatic = staticOffers.filter(isStaticOfferActive);
  const targets = Object.fromEntries(activeStatic.map((row) => [row.offerId, row.specialLink]));

  if (modelSearchTemplate.status === "verified" && isAmazonHttpsUrl(modelSearchTemplate.proofUrl)) {
    targets[modelSearchTemplate.activationTarget] = modelSearchTemplate.proofUrl;
  }

  const offers = activeStatic.map((row) => Object.freeze({
    maker: row.maker,
    model: row.model,
    target: row.offerId,
    kind: row.kind,
    verifiedAt: row.verifiedAt,
    labelJa: row.labelJa,
    labelEn: row.labelEn
  }));

  window.MANUALFINDER_AFFILIATE_LEDGER = staticOffers;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    enabled: Object.keys(targets).length > 0,
    tool: "manual-finder",
    provider: "amazon",
    trackingId: TRACKING_ID,
    targets: Object.freeze(targets),
    offers: Object.freeze(offers),
    modelSearchTemplate,
    buildModelSearchUrl
  });
})();
