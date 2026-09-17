(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const PRODUCT_SOURCE = "https://www.dji.com/downloads/products/inspire-1-pro-and-raw";
  const BATTERY_SOURCE = "https://developer.dji.com/mobile-sdk/documentation/introduction/product_introduction.html";
  const HUB_SOURCE = "https://www.dji.com/newsroom/news/dji-inspire-1";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Inspire 1 Pro/Raw",
      category: "カメラ・映像",
      verifiedAt: "2026-09-17",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: PRODUCT_SOURCE,
      evidenceUrls: Object.freeze([PRODUCT_SOURCE, BATTERY_SOURCE, HUB_SOURCE]),
      accessories: Object.freeze([
        accessory(
          "dji-tb47-intelligent-flight-battery-inspire-1-proraw",
          "camera_battery_search",
          "DJI TB47 Intelligent Flight Battery",
          "Amazonで DJI TB47 Intelligent Flight Battery を探す",
          "Find DJI TB47 Intelligent Flight Battery on Amazon",
          BATTERY_SOURCE
        ),
        accessory(
          "dji-inspire-1-battery-charging-hub-proraw",
          "camera_charger_search",
          "DJI Inspire 1 Battery Charging Hub",
          "Amazonで DJI Inspire 1 Battery Charging Hub を探す",
          "Find DJI Inspire 1 Battery Charging Hub on Amazon",
          HUB_SOURCE
        )
      ])
    })
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave19Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE19_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave19Offers(args)];
    }
  });
})();
