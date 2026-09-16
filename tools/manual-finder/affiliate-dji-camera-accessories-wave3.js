(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const MINI3_BATTERY_SOURCE = "https://store.dji.com/product/dji-mini-3-pro-intelligent-flight-battery";
  const MINI4_BATTERY_SOURCE = "https://store.dji.com/product/dji-mini-4-pro-intelligent-flight-battery?vid=148701";
  const HUB_SOURCE = "https://store.dji.com/product/dji-mini-3-pro-two-way-charging-hub";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const makeRow = (model, battery) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: battery.sourceUrl,
    evidenceUrls: Object.freeze([battery.sourceUrl, HUB_SOURCE]),
    accessories: Object.freeze([
      accessory(
        battery.key,
        "camera_battery_search",
        battery.query,
        `Amazonで ${battery.query} を探す`,
        `Find ${battery.query} on Amazon`,
        battery.sourceUrl
      ),
      accessory(
        "dji-mini-4-pro-mini-3-series-two-way-charging-hub",
        "camera_charger_search",
        "DJI Mini 4 Pro Mini 3 Series Two-Way Charging Hub",
        "Amazonで DJI Mini 4 Pro Mini 3 Series Two-Way Charging Hub を探す",
        "Find DJI Mini 4 Pro Mini 3 Series Two-Way Charging Hub on Amazon",
        HUB_SOURCE
      )
    ])
  });

  const mini3Battery = Object.freeze({
    key: "dji-mini-3-series-intelligent-flight-battery",
    query: "DJI Mini 3 Series Intelligent Flight Battery",
    sourceUrl: MINI3_BATTERY_SOURCE
  });
  const mini4Battery = Object.freeze({
    key: "dji-mini-4-pro-intelligent-flight-battery",
    query: "DJI Mini 4 Pro Intelligent Flight Battery",
    sourceUrl: MINI4_BATTERY_SOURCE
  });

  const rows = Object.freeze([
    makeRow("DJI Mini 3", mini3Battery),
    makeRow("DJI Mini 3 Pro", mini3Battery),
    makeRow("DJI Mini 4 Pro", mini4Battery)
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave3Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE3_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave3Offers(args)];
    }
  });
})();
