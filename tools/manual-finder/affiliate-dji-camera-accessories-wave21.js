(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SERIES_BATTERY_SOURCE = "https://repair.dji.com/help/content?customId=01700006548&lang=en&spaceId=17";
  const HUB_SOURCE = "https://repair.dji.com/help/content?customId=01700009240&lang=en&paperDocType=ARTICLE&re=US&spaceId=17";
  const PRO_CHARGING_SOURCE = "https://repair.dji.com/help/content?customId=01700006769&lang=en&paperDocType=ARTICLE&re=US&spaceId=17";

  const sourceByModel = Object.freeze({
    "Phantom 4": "https://www.dji.com/downloads/products/phantom-4",
    "Phantom 4 Advanced": "https://www.dji.com/support/product/phantom-4-adv",
    "Phantom 4 Pro": "https://www.dji.com/support/product/phantom-4-pro",
    "Phantom 4 Pro V2.0": PRO_CHARGING_SOURCE,
    "Phantom 4 RTK": "https://www.dji.com/support/product/phantom-4-rtk"
  });

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key, kind, query, labelJa, labelEn, sourceUrl
  });

  const models = Object.freeze([
    "Phantom 4",
    "Phantom 4 Advanced",
    "Phantom 4 Pro",
    "Phantom 4 Pro V2.0",
    "Phantom 4 RTK"
  ]);

  const rows = Object.freeze(models.map((model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-18",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: sourceByModel[model],
    evidenceUrls: Object.freeze([sourceByModel[model], SERIES_BATTERY_SOURCE, HUB_SOURCE, ...(model === "Phantom 4 Pro" || model === "Phantom 4 Pro V2.0" ? [PRO_CHARGING_SOURCE] : [])]),
    accessories: Object.freeze([
      accessory(
        `dji-phantom-4-series-intelligent-flight-battery-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        "camera_battery_search",
        "DJI Phantom 4 Series Intelligent Flight Battery",
        "Amazonで DJI Phantom 4 Series Intelligent Flight Battery を探す",
        "Find DJI Phantom 4 Series Intelligent Flight Battery on Amazon",
        SERIES_BATTERY_SOURCE
      ),
      accessory(
        `dji-phantom-4-battery-charging-hub-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        "camera_charger_search",
        "DJI Phantom 4 Battery Charging Hub",
        "Amazonで DJI Phantom 4 Battery Charging Hub を探す",
        "Find DJI Phantom 4 Battery Charging Hub on Amazon",
        HUB_SOURCE
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

  function getWave21Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE21_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave21Offers(args)];
    }
  });
})();
