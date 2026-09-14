(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  const consumableOffer = (key, query, labelJa, labelEn) => Object.freeze({ key, kind: "ink_search", query, labelJa, labelEn });
  const consumableRow = (maker, model, sourceUrl, verifiedAt, offers) => Object.freeze({
    maker,
    model,
    category: "プリンター・複合機",
    verifiedAt,
    sourceType: "official_manufacturer_compatibility",
    sourceUrl,
    offers: Object.freeze(offers)
  });

  const printerConsumables = Object.freeze([
    consumableRow("Brother", "MFC-J1500N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1500/", "2026-09-13", [
      consumableOffer("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      consumableOffer("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J1605DN", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj1605/", "2026-09-13", [
      consumableOffer("lc3133", "Brother LC3133", "Amazonで LC3133 インクを探す", "Find Brother LC3133 ink on Amazon"),
      consumableOffer("lc3135", "Brother LC3135", "Amazonで LC3135 インクを探す", "Find Brother LC3135 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4440N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4440n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4443N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4443n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4450N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4450n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc516", "Brother LC516", "Amazonで LC516 インクを探す", "Find Brother LC516 ink on Amazon"),
      consumableOffer("lc516xl", "Brother LC516XL", "Amazonで LC516XL インクを探す", "Find Brother LC516XL ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4510N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4510/", "2026-09-13", [
      consumableOffer("lc113", "Brother LC113", "Amazonで LC113 インクを探す", "Find Brother LC113 ink on Amazon"),
      consumableOffer("lc117-115", "Brother LC117 LC115", "Amazonで LC117 / LC115 インクを探す", "Find Brother LC117 / LC115 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4540N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4540n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4543N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4543n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc416", "Brother LC416", "Amazonで LC416 インクを探す", "Find Brother LC416 ink on Amazon"),
      consumableOffer("lc416xl", "Brother LC416XL", "Amazonで LC416XL インクを探す", "Find Brother LC416XL ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4720N", "https://direct.brother.co.jp/shop/r/r-printer-supply-model-mfcj4720/", "2026-09-13", [
      consumableOffer("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      consumableOffer("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J4725N", "https://www.brother.co.jp/product/printer/inkjet/mfcj4725n/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc213", "Brother LC213", "Amazonで LC213 インクを探す", "Find Brother LC213 ink on Amazon"),
      consumableOffer("lc217-215", "Brother LC217 LC215", "Amazonで LC217 / LC215 インクを探す", "Find Brother LC217 / LC215 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J6995CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6995cdw/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc3129", "Brother LC3129", "Amazonで LC3129 インクを探す", "Find Brother LC3129 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J6997CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6997cdw/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ]),
    consumableRow("Brother", "MFC-J6999CDW", "https://www.brother.co.jp/product/printer/inkjet/mfcj6999cdw/accessory/index.aspx", "2026-09-13", [
      consumableOffer("lc3139", "Brother LC3139", "Amazonで LC3139 インクを探す", "Find Brother LC3139 ink on Amazon")
    ]),

    consumableRow("Epson", "EW-056A", "https://www.epson.jp/support/portal/shoumouhin/ew-056a.htm", "2026-09-14", [
      consumableOffer("med-4cl", "Epson MED-4CL", "Amazonで MED-4CL インクを探す", "Find Epson MED-4CL ink on Amazon")
    ]),
    consumableRow("Epson", "EW-456A", "https://www.epson.jp/support/portal/shoumouhin/ew-456a.htm", "2026-09-14", [
      consumableOffer("med-4cl", "Epson MED-4CL", "Amazonで MED-4CL インクを探す", "Find Epson MED-4CL ink on Amazon")
    ]),
    consumableRow("Epson", "EP-817A", "https://www.epson.jp/support/portal/shoumouhin/ep-817a.htm", "2026-09-14", [
      consumableOffer("kak-6cl", "Epson KAK-6CL", "Amazonで KAK-6CL インクを探す", "Find Epson KAK-6CL ink on Amazon")
    ]),
    consumableRow("Epson", "EP-887AW", "https://www.epson.jp/products/colorio/ep887a/supply.htm", "2026-09-14", [
      consumableOffer("kni-6cl", "Epson KNI-6CL", "Amazonで KNI-6CL インクを探す", "Find Epson KNI-6CL ink on Amazon"),
      consumableOffer("kni-6cl-l", "Epson KNI-6CL-L", "Amazonで KNI-6CL-L 増量インクを探す", "Find Epson KNI-6CL-L high-capacity ink on Amazon")
    ]),
    consumableRow("Epson", "EP-887AB", "https://www.epson.jp/products/colorio/ep887a/supply.htm", "2026-09-14", [
      consumableOffer("kni-6cl", "Epson KNI-6CL", "Amazonで KNI-6CL インクを探す", "Find Epson KNI-6CL ink on Amazon"),
      consumableOffer("kni-6cl-l", "Epson KNI-6CL-L", "Amazonで KNI-6CL-L 増量インクを探す", "Find Epson KNI-6CL-L high-capacity ink on Amazon")
    ]),
    consumableRow("Epson", "EP-887AP", "https://www.epson.jp/products/colorio/ep887a/supply.htm", "2026-09-14", [
      consumableOffer("kni-6cl", "Epson KNI-6CL", "Amazonで KNI-6CL インクを探す", "Find Epson KNI-6CL ink on Amazon"),
      consumableOffer("kni-6cl-l", "Epson KNI-6CL-L", "Amazonで KNI-6CL-L 増量インクを探す", "Find Epson KNI-6CL-L high-capacity ink on Amazon")
    ]),

    consumableRow("Canon", "TS8830", "https://personal.canon.jp/product/printer/pixus/lineup/ts8830/supply", "2026-09-14", [
      consumableOffer("bci331-330", "Canon BCI-331 BCI-330", "Amazonで BCI-331 / BCI-330 インクを探す", "Find Canon BCI-331 / BCI-330 ink on Amazon"),
      consumableOffer("bci331xl-330xl", "Canon BCI-331XL BCI-330XL", "Amazonで BCI-331XL / BCI-330XL インクを探す", "Find Canon BCI-331XL / BCI-330XL ink on Amazon")
    ]),
    consumableRow("Canon", "TS8730", "https://personal.canon.jp/product/supply/models/ts8730", "2026-09-14", [
      consumableOffer("bci331-330", "Canon BCI-331 BCI-330", "Amazonで BCI-331 / BCI-330 インクを探す", "Find Canon BCI-331 / BCI-330 ink on Amazon"),
      consumableOffer("bci331xl-330xl", "Canon BCI-331XL BCI-330XL", "Amazonで BCI-331XL / BCI-330XL インクを探す", "Find Canon BCI-331XL / BCI-330XL ink on Amazon")
    ]),
    consumableRow("Canon", "TS7630", "https://personal.canon.jp/product/supply/models/ts7630", "2026-09-14", [
      consumableOffer("bci331-330", "Canon BCI-331 BCI-330", "Amazonで BCI-331 / BCI-330 インクを探す", "Find Canon BCI-331 / BCI-330 ink on Amazon"),
      consumableOffer("bci331xl-330xl", "Canon BCI-331XL BCI-330XL", "Amazonで BCI-331XL / BCI-330XL インクを探す", "Find Canon BCI-331XL / BCI-330XL ink on Amazon")
    ]),
    consumableRow("Canon", "TS6730", "https://personal.canon.jp/product/supply/models/ts6730", "2026-09-14", [
      consumableOffer("bc385-386", "Canon BC-385 BC-386", "Amazonで BC-385 / BC-386 インクを探す", "Find Canon BC-385 / BC-386 ink on Amazon"),
      consumableOffer("bc385xl-386xl", "Canon BC-385XL BC-386XL", "Amazonで BC-385XL / BC-386XL インクを探す", "Find Canon BC-385XL / BC-386XL ink on Amazon")
    ]),
    consumableRow("Canon", "TS3730", "https://personal.canon.jp/product/supply/models/ts3730", "2026-09-14", [
      consumableOffer("bc365-366", "Canon BC-365 BC-366", "Amazonで BC-365 / BC-366 インクを探す", "Find Canon BC-365 / BC-366 ink on Amazon"),
      consumableOffer("bc365xl-366xl", "Canon BC-365XL BC-366XL", "Amazonで BC-365XL / BC-366XL インクを探す", "Find Canon BC-365XL / BC-366XL ink on Amazon")
    ]),
    consumableRow("Canon", "XK130", "https://personal.canon.jp/product/supply/models/xk130", "2026-09-14", [
      consumableOffer("xki-n21-n20", "Canon XKI-N21 XKI-N20", "Amazonで XKI-N21 / XKI-N20 インクを探す", "Find Canon XKI-N21 / XKI-N20 ink on Amazon")
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
    eligibleOtherMakers: Object.freeze(["CASIO", "DJI", "Roland"]),
    excludedCategories: Object.freeze(["その他"]),
    note: "Amazon Link Checker confirmed the representative tagged search format. Exact canonical model records in standard product categories are enabled; heterogeneous 'その他' records are enabled only for audited product-model makers CASIO, DJI, and Roland. Seiko caliber records and maker-index records remain excluded."
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
    const standardCategory = modelSearchTemplate.eligibleCategories.includes(cleanCategory);
    const auditedOtherMaker = cleanCategory === "その他" && modelSearchTemplate.eligibleOtherMakers.includes(cleanMaker);
    if (!standardCategory && !auditedOtherMaker) return "";
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
