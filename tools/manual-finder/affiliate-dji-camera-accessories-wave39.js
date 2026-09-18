(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Ronin 4D",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/ronin-4d",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/ronin-4d",
        "https://store.dji.com/product/ronin-2-tb50-intelligent-battery",
        "https://store.dji.com/product/inspire-2-charging-hub"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-tb50-intelligent-battery-ronin-4d",
          kind: "camera_battery_search",
          query: "DJI TB50 Intelligent Battery",
          labelJa: "Amazonで DJI TB50 Intelligent Battery を探す",
          labelEn: "Find DJI TB50 Intelligent Battery on Amazon",
          sourceUrl: "https://store.dji.com/product/ronin-2-tb50-intelligent-battery"
        }),
        Object.freeze({
          key: "dji-inspire-2-ronin-2-battery-charging-hub-ronin-4d",
          kind: "camera_charger_search",
          query: "DJI Inspire 2 Ronin 2 Battery Charging Hub",
          labelJa: "Amazonで DJI Inspire 2 Ronin 2 Battery Charging Hub を探す",
          labelEn: "Find DJI Inspire 2 Ronin 2 Battery Charging Hub on Amazon",
          sourceUrl: "https://store.dji.com/product/inspire-2-charging-hub"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Action",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/osmo-action",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/osmo-action",
        "https://www.dji.com/downloads/products/osmo-action"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-action-battery-1300mah-osmo-action",
          kind: "camera_battery_search",
          query: "DJI Osmo Action Battery 1300mAh",
          labelJa: "Amazonで DJI Osmo Action Battery 1300mAh を探す",
          labelEn: "Find DJI Osmo Action Battery 1300mAh on Amazon",
          sourceUrl: "https://www.dji.com/osmo-action"
        }),
        Object.freeze({
          key: "dji-osmo-action-charging-hub-osmo-action",
          kind: "camera_charger_search",
          query: "DJI Osmo Action Charging Hub",
          labelJa: "Amazonで DJI Osmo Action Charging Hub を探す",
          labelEn: "Find DJI Osmo Action Charging Hub on Amazon",
          sourceUrl: "https://www.dji.com/downloads/products/osmo-action"
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

  function getWave39Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像") return [];
    const row = rows.find((entry) => entry.model === cleanModel);
    if (!row) return [];
    return row.accessories.map((item) => Object.freeze({
      target: template.activationTarget,
      kind: item.kind,
      key: item.key,
      query: item.query,
      url: buildTaggedSearchUrl(item.query),
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      sourceUrl: item.sourceUrl,
      verifiedAt: row.verifiedAt
    })).filter((item) => Boolean(item.url));
  }

  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE39_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave39Offers(args)];
    }
  });
})();
