(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BATTERY_SOURCE = "https://store.dji.com/product/mini-2-intelligent-flight-battery";
  const HUB_SOURCE = "https://store.dji.com/product/mini-2-two-way-charging-hub";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const makeRow = (model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: BATTERY_SOURCE,
    evidenceUrls: Object.freeze([BATTERY_SOURCE, HUB_SOURCE]),
    accessories: Object.freeze([
      accessory(
        "dji-mini-2-intelligent-flight-battery",
        "camera_battery_search",
        "DJI Mini 2 Intelligent Flight Battery",
        "Amazonで DJI Mini 2 Intelligent Flight Battery を探す",
        "Find DJI Mini 2 Intelligent Flight Battery on Amazon",
        BATTERY_SOURCE
      ),
      accessory(
        "dji-mini-2-two-way-charging-hub",
        "camera_charger_search",
        "DJI Mini 2 Two-Way Charging Hub",
        "Amazonで DJI Mini 2 Two-Way Charging Hub を探す",
        "Find DJI Mini 2 Two-Way Charging Hub on Amazon",
        HUB_SOURCE
      )
    ])
  });

  const rows = Object.freeze([
    makeRow("DJI Mini 2"),
    makeRow("DJI Mini 4K | DJI Mini 2 SE"),
    makeRow("DJI Mini SE")
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave7Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE7_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave7Offers(args)];
    }
  });
})();
