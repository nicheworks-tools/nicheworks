(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SERIES_BATTERY_SOURCE = "https://repair.dji.com/help/content?customId=01700006548&lang=en&spaceId=17";
  const sourceByModel = Object.freeze({
    "Phantom 3 Advanced": "https://www.dji.com/downloads/products/phantom-3-adv",
    "Phantom 3 Professional": "https://www.dji.com/downloads/products/phantom-3-pro",
    "Phantom 3 Standard": "https://www.dji.com/downloads/products/phantom-3-standard"
  });
  const standardSupport = "https://www.dji.com/support/product/phantom-3-standard";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key, kind, query, labelJa, labelEn, sourceUrl
  });

  const models = Object.freeze([
    "Phantom 3 Advanced",
    "Phantom 3 Professional",
    "Phantom 3 Standard"
  ]);

  const rows = Object.freeze(models.map((model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-18",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: sourceByModel[model],
    evidenceUrls: Object.freeze([
      sourceByModel[model],
      SERIES_BATTERY_SOURCE,
      ...(model === "Phantom 3 Standard" ? [standardSupport] : [])
    ]),
    accessories: Object.freeze([
      accessory(
        `dji-phantom-3-intelligent-flight-battery-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        "camera_battery_search",
        "DJI Phantom 3 Intelligent Flight Battery",
        "Amazonで DJI Phantom 3 Intelligent Flight Battery を探す",
        "Find DJI Phantom 3 Intelligent Flight Battery on Amazon",
        SERIES_BATTERY_SOURCE
      ),
      accessory(
        `dji-phantom-3-battery-charging-hub-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        "camera_charger_search",
        "DJI Phantom 3 Battery Charging Hub",
        "Amazonで DJI Phantom 3 Battery Charging Hub を探す",
        "Find DJI Phantom 3 Battery Charging Hub on Amazon",
        sourceByModel[model]
      )
    ])
  })));

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave22Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || !cleanModel) return [];
    const mapping = rows.find((item) => item.model === cleanModel);
    if (!mapping) return [];
    return mapping.accessories.map((item) => Object.freeze({
      target: template.activationTarget,
      kind: item.kind,
      key: item.key,
      query: item.query,
      url: buildTaggedSearchUrl(item.query),
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      sourceUrl: item.sourceUrl,
      verifiedAt: mapping.verifiedAt
    })).filter((item) => Boolean(item.url));
  }

  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE22_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave22Offers(args)];
    }
  });
})();
