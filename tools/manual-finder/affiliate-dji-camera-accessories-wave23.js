(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const MODEL_SOURCE = "https://www.dji.com/downloads/products/phantom-3-se";
  const SERIES_BATTERY_SOURCE = "https://repair.dji.com/help/content?customId=01700006548&lang=en&spaceId=17";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Phantom 3 SE",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: MODEL_SOURCE,
      evidenceUrls: Object.freeze([MODEL_SOURCE, SERIES_BATTERY_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-phantom-3-intelligent-flight-battery-phantom-3-se",
          kind: "camera_battery_search",
          query: "DJI Phantom 3 Intelligent Flight Battery",
          labelJa: "Amazonで DJI Phantom 3 Intelligent Flight Battery を探す",
          labelEn: "Find DJI Phantom 3 Intelligent Flight Battery on Amazon",
          sourceUrl: SERIES_BATTERY_SOURCE
        })
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

  function getWave23Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "Phantom 3 SE") return [];
    return rows[0].accessories.map((item) => Object.freeze({
      target: template.activationTarget,
      kind: item.kind,
      key: item.key,
      query: item.query,
      url: buildTaggedSearchUrl(item.query),
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      sourceUrl: item.sourceUrl,
      verifiedAt: rows[0].verifiedAt
    })).filter((item) => Boolean(item.url));
  }

  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE23_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave23Offers(args)];
    }
  });
})();
