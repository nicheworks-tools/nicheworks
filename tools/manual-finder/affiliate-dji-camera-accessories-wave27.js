(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SUPPORT_SOURCE = "https://www.dji.com/support/product/dji-action-2";
  const POWER_MODULE_SOURCE = "https://store.dji.com/ro/product/dji-action-2-power-module?vid=109071";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Action 2",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: SUPPORT_SOURCE,
      evidenceUrls: Object.freeze([SUPPORT_SOURCE, POWER_MODULE_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-action-2-power-module-dji-action-2",
          kind: "camera_battery_search",
          query: "DJI Action 2 Power Module",
          labelJa: "Amazonで DJI Action 2 Power Module を探す",
          labelEn: "Find DJI Action 2 Power Module on Amazon",
          sourceUrl: POWER_MODULE_SOURCE
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

  function getWave27Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "DJI Action 2") return [];
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE27_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave27Offers(args)];
    }
  });
})();
