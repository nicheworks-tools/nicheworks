(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";
  const printerConsumables = Object.freeze(
    Array.isArray(window.MANUALFINDER_PRINTER_CONSUMABLES)
      ? window.MANUALFINDER_PRINTER_CONSUMABLES.slice()
      : []
  );

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
    status: "verified",
    verifiedAt: "2026-09-13",
    verificationMethod: "amazon_link_checker",
    trackingId: TRACKING_ID,
    baseUrl: AMAZON_SEARCH_BASE,
    activationTarget: "manual_model_search_template",
    proofUrl: "https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22",
    eligibleCategories: Object.freeze([
      "PC・スマホ",
      "家電",
      "プリンター・複合機",
      "カメラ・映像",
      "オーディオ",
      "ゲーム",
      "ネットワーク機器"
    ]),
    excludedCategories: Object.freeze(["その他"]),
    note: "Amazon Link Checker confirmed the representative tagged search format. The same format is enabled for exact canonical model records in product categories; heterogeneous 'その他' records remain excluded."
  });

  const consumableSearchTemplate = Object.freeze({
    templateId: "printer_consumable_search",
    provider: "amazon",
    kind: "amazon_search",
    status: "verified",
    verifiedAt: "2026-09-13",
    verificationMethod: "validated_tagged_search_format_plus_official_compatibility_mapping",
    trackingId: TRACKING_ID,
    baseUrl: AMAZON_SEARCH_BASE,
    activationTarget: "printer_consumable_search_template",
    proofUrl: modelSearchTemplate.proofUrl,
    note: "Uses the already Link-Checker-validated Amazon tagged-search format. Consumable query terms are enabled only when maker/model compatibility is independently verified on an official manufacturer source."
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

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(AMAZON_SEARCH_BASE);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", TRACKING_ID);
    return url.toString();
  }

  function buildModelSearchUrl({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (!cleanMaker || !cleanModel) return "";
    if (!modelSearchTemplate.eligibleCategories.includes(cleanCategory)) return "";
    return buildTaggedSearchUrl(`${cleanMaker} ${cleanModel}`);
  }

  function getConsumableOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (!cleanMaker || !cleanModel || cleanCategory !== "プリンター・複合機") return [];

    const mapping = printerConsumables.find((row) =>
      row && row.maker === cleanMaker && row.model === cleanModel && row.category === cleanCategory
    );
    if (!mapping || !Array.isArray(mapping.offers) || !mapping.sourceUrl) return [];

    return mapping.offers.map((offer) => Object.freeze({
      target: consumableSearchTemplate.activationTarget,
      kind: offer.kind || "consumable_search",
      key: offer.key || "consumable",
      query: offer.query,
      url: buildTaggedSearchUrl(offer.query),
      labelJa: offer.labelJa,
      labelEn: offer.labelEn,
      sourceUrl: mapping.sourceUrl,
      verifiedAt: mapping.verifiedAt
    })).filter((offer) => Boolean(offer.url));
  }

  const activeStatic = staticOffers.filter(isStaticOfferActive);
  const targets = Object.fromEntries(activeStatic.map((row) => [row.offerId, row.specialLink]));

  if (modelSearchTemplate.status === "verified" && isAmazonHttpsUrl(modelSearchTemplate.proofUrl)) {
    targets[modelSearchTemplate.activationTarget] = modelSearchTemplate.proofUrl;
  }
  if (consumableSearchTemplate.status === "verified" && isAmazonHttpsUrl(consumableSearchTemplate.proofUrl) && printerConsumables.length > 0) {
    targets[consumableSearchTemplate.activationTarget] = consumableSearchTemplate.proofUrl;
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
    consumableSearchTemplate,
    printerConsumables,
    buildModelSearchUrl,
    getConsumableOffers
  });
})();
