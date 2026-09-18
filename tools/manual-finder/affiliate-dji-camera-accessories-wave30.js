(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SUPPORT_SOURCE = "https://www.dji.com/360/faq";
  const BATTERY_SOURCE = "https://store.dji.com/product/osmo-action-extreme-battery-plus";
  const CASE_SOURCE = "https://store.dji.com/product/osmo-action-multifunctional-battery-case-2";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Osmo 360",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: SUPPORT_SOURCE,
      evidenceUrls: Object.freeze([SUPPORT_SOURCE, BATTERY_SOURCE, CASE_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-action-extreme-battery-plus-osmo-360",
          kind: "camera_battery_search",
          query: "DJI Osmo Action Extreme Battery Plus",
          labelJa: "Amazonで DJI Osmo Action Extreme Battery Plus を探す",
          labelEn: "Find DJI Osmo Action Extreme Battery Plus on Amazon",
          sourceUrl: BATTERY_SOURCE
        }),
        Object.freeze({
          key: "dji-osmo-action-multifunctional-battery-case-2-osmo-360",
          kind: "camera_charger_search",
          query: "DJI Osmo Action Multifunctional Battery Case 2",
          labelJa: "Amazonで DJI Osmo Action Multifunctional Battery Case 2 を探す",
          labelEn: "Find DJI Osmo Action Multifunctional Battery Case 2 on Amazon",
          sourceUrl: CASE_SOURCE
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

  function getWave30Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "Osmo 360") return [];
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE30_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave30Offers(args)];
    }
  });
})();
