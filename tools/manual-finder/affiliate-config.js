(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  const consumableOffer = (key, query, labelJa, labelEn) => Object.freeze({ key, kind: "ink_search", query, labelJa, labelEn });
  const consumableRow = (model, sourceUrl, offers) => Object.freeze({
    maker: "Brother",
    model,
    category: "プリンター・複合機",
    verifiedAt: "2026-09-13",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl,
    offers: Object.freeze(offers)
  });

  const printerConsumables = Object.freeze([
    consumableRow("MFC-J1500N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1500/", [
      consumableOffer("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      consumableOffer("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    consumableRow("MFC-J1605DN", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1605/", [
      consumableOffer("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      consumableOffer("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    consumableRow("MFC-J4440N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4440n/accessory/index.aspx", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("MFC-J4443N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4443n/accessory/index.aspx", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("MFC-J4450N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4450n/accessory/index.aspx", [
      consumableOffer("lc516", "Brother LC516", "Amazonで LC516 インクを探す", "Find Brother LC516 ink on Amazon"),
      consumableOffer("lc516xl", "Brother LC516XL", "Amazonで LC516XL インクを探す", "Find Brother LC516XL ink on Amazon")
    ]),
    consumableRow("MFC-J4510N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4510/", [
      consumableOffer("lc113", "Brother LC113", "Amazonで LC113 インクを探す", "Find Brother LC113 ink on Amazon"),
      consumableOffer("lc117-115", "Brother LC117 LC115", "Amazonで LC117 / LC115 インクを探す", "Find Brother LC117 / LC115 ink on Amazon")
    ]),
    consumableRow("MFC-J4540N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4540n/accessory/index.aspx", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("MFC-J4543N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4543n/accessory/index.aspx", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("MFC-J4720N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4720/", [
      consumableOffer("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      consumableOffer("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    consumableRow("MFC-J4725N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4725n/accessory/index.aspx", [
      consumableOffer("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      consumableOffer("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    consumableRow("MFC-J6995CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6995cdw/accessory/index.aspx", [
      consumableOffer("lc3129", "Brother LC3129", "Amazonで LC3129 インクを探す", "Find Brother LC3129 ink on Amazon")
    ]),
    consumableRow("MFC-J6997CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6997cdw/accessory/index.aspx", [
      consumableOffer("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ]),
    consumableRow("MFC-J6999CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6999cdw/accessory/index.aspx", [
      consumableOffer("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ])
  ]);

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
    note: "Uses the Link-Checker-validated tagged-search format. Consumable terms are emitted only from manufacturer-verified maker/model compatibility mappings."
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
      row.maker === cleanMaker && row.model === cleanModel && row.category === cleanCategory
    );
    if (!mapping || !mapping.sourceUrl) return [];

    return mapping.offers.map((offer) => Object.freeze({
      target: consumableSearchTemplate.activationTarget,
      kind: offer.kind,
      key: offer.key,
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
