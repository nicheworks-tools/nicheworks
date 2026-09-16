(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BATTERY_SOURCE = "https://store.dji.com/product/dji-air-3-intelligent-flight-battery?vid=143391";
  const CHARGER_SOURCE = "https://www.dji.com/support/product/air-3s";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const row = (model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: BATTERY_SOURCE,
    evidenceUrls: Object.freeze([BATTERY_SOURCE, CHARGER_SOURCE]),
    accessories: Object.freeze([
      accessory(
        "dji-air-3-intelligent-flight-battery",
        "camera_battery_search",
        "DJI Air 3 Intelligent Flight Battery",
        "Amazonで DJI Air 3 Intelligent Flight Battery を探す",
        "Find DJI Air 3 Intelligent Flight Battery on Amazon",
        BATTERY_SOURCE
      ),
      accessory(
        "dji-air-3-series-battery-charging-hub",
        "camera_charger_search",
        "DJI Air 3 Series Battery Charging Hub",
        "Amazonで DJI Air 3 Series Battery Charging Hub を探す",
        "Find DJI Air 3 Series Battery Charging Hub on Amazon",
        CHARGER_SOURCE
      )
    ])
  });

  const rows = Object.freeze([
    row("DJI Air 3"),
    row("DJI Air 3S")
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave2Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE2_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave2Offers(args)];
    }
  });
})();
