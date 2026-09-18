(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const MODEL_SOURCE = "https://www.dji.com/downloads/products/osmo-pocket-3";
  const BATTERY_HANDLE_SOURCE = "https://store.dji.com/product/osmo-pocket-3-battery-handle";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Osmo Pocket 3",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: MODEL_SOURCE,
      evidenceUrls: Object.freeze([MODEL_SOURCE, BATTERY_HANDLE_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-pocket-3-battery-handle-osmo-pocket-3",
          kind: "camera_battery_search",
          query: "DJI Osmo Pocket 3 Battery Handle",
          labelJa: "Amazonで DJI Osmo Pocket 3 Battery Handle を探す",
          labelEn: "Find DJI Osmo Pocket 3 Battery Handle on Amazon",
          sourceUrl: BATTERY_HANDLE_SOURCE
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

  function getWave26Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "Osmo Pocket 3") return [];
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE26_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave26Offers(args)];
    }
  });
})();
