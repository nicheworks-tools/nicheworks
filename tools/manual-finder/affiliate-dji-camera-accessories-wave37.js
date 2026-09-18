(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Osmo",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/osmo",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/osmo",
        "https://store.dji.com/product/osmo-intelligent-battery"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-intelligent-battery-980mah-osmo",
          kind: "camera_battery_search",
          query: "DJI Osmo Intelligent Battery 980mAh",
          labelJa: "Amazonで DJI Osmo Intelligent Battery 980mAh を探す",
          labelEn: "Find DJI Osmo Intelligent Battery 980mAh on Amazon",
          sourceUrl: "https://www.dji.com/support/product/osmo"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/osmo-mobile",
        "https://store.dji.com/product/osmo-intelligent-battery"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-intelligent-battery-980mah-osmo-mobile",
          kind: "camera_battery_search",
          query: "DJI Osmo Intelligent Battery 980mAh",
          labelJa: "Amazonで DJI Osmo Intelligent Battery 980mAh を探す",
          labelEn: "Find DJI Osmo Intelligent Battery 980mAh on Amazon",
          sourceUrl: "https://www.dji.com/support/product/osmo-mobile"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo+",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/osmo-plus",
      evidenceUrls: Object.freeze(["https://www.dji.com/osmo-plus"]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-high-capacity-intelligent-battery-1225mah-osmo-plus",
          kind: "camera_battery_search",
          query: "DJI Osmo High Capacity Intelligent Battery 1225mAh",
          labelJa: "Amazonで DJI Osmo High Capacity Intelligent Battery 1225mAh を探す",
          labelEn: "Find DJI Osmo High Capacity Intelligent Battery 1225mAh on Amazon",
          sourceUrl: "https://www.dji.com/osmo-plus"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Pro and Raw",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/osmo-pro-and-raw/info",
      evidenceUrls: Object.freeze(["https://www.dji.com/osmo-pro-and-raw/info"]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-osmo-high-capacity-intelligent-battery-1225mah-osmo-pro-raw",
          kind: "camera_battery_search",
          query: "DJI Osmo High Capacity Intelligent Battery 1225mAh",
          labelJa: "Amazonで DJI Osmo High Capacity Intelligent Battery 1225mAh を探す",
          labelEn: "Find DJI Osmo High Capacity Intelligent Battery 1225mAh on Amazon",
          sourceUrl: "https://www.dji.com/osmo-pro-and-raw/info"
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

  function getWave37Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE37_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave37Offers(args)];
    }
  });
})();
