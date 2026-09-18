(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const MODEL_SOURCE = "https://www.dji.com/support/product/mavic-2-enterprise-advanced";
  const BATTERY_SOURCE = "https://store.dji.com/bg/product/mavic-2-enterprise-battery";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Mavic 2 Enterprise Advanced",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: BATTERY_SOURCE,
      evidenceUrls: Object.freeze([MODEL_SOURCE, BATTERY_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-mavic-2-enterprise-battery-mavic-2-enterprise-advanced",
          kind: "camera_battery_search",
          query: "DJI Mavic 2 Enterprise Battery",
          labelJa: "Amazonで DJI Mavic 2 Enterprise Battery を探す",
          labelEn: "Find DJI Mavic 2 Enterprise Battery on Amazon",
          sourceUrl: BATTERY_SOURCE
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

  function getWave24Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "Mavic 2 Enterprise Advanced") return [];
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE24_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave24Offers(args)];
    }
  });
})();
