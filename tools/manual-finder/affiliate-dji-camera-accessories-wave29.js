(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SUPPORT_SOURCE = "https://www.dji.com/osmo-pocket/info";
  const CHARGING_CASE_SOURCE = "https://store.dji.com/product/osmo-pocket-charging-case";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Osmo Pocket",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: SUPPORT_SOURCE,
      evidenceUrls: Object.freeze([SUPPORT_SOURCE, CHARGING_CASE_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-pocket-charging-case-osmo-pocket",
          kind: "camera_charger_search",
          query: "DJI Osmo Pocket Charging Case",
          labelJa: "Amazonで DJI Osmo Pocket Charging Case を探す",
          labelEn: "Find DJI Osmo Pocket Charging Case on Amazon",
          sourceUrl: CHARGING_CASE_SOURCE
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

  function getWave29Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || cleanModel !== "Osmo Pocket") return [];
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE29_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave29Offers(args)];
    }
  });
})();
