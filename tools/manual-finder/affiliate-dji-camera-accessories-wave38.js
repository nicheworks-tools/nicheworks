(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "Ronin 2",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/ronin-2",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/ronin-2",
        "https://store.dji.com/product/ronin-2-tb50-intelligent-battery"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-tb50-intelligent-battery-ronin-2",
          kind: "camera_battery_search",
          query: "DJI TB50 Intelligent Battery",
          labelJa: "Amazonで DJI TB50 Intelligent Battery を探す",
          labelEn: "Find DJI TB50 Intelligent Battery on Amazon",
          sourceUrl: "https://store.dji.com/product/ronin-2-tb50-intelligent-battery"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Ronin-M",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/ronin-m/info",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/ronin-m/info",
        "https://store.dji.com/product/ronin-m-battery"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-ronin-m-battery-1580mah-ronin-m",
          kind: "camera_battery_search",
          query: "DJI Ronin-M Battery 1580mAh",
          labelJa: "Amazonで DJI Ronin-M Battery 1580mAh を探す",
          labelEn: "Find DJI Ronin-M Battery 1580mAh on Amazon",
          sourceUrl: "https://www.dji.com/ronin-m/info"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Ronin-MX",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/ronin",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/ronin",
        "https://www.dji.com/downloads/products/ronin-mx"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-ronin-m-battery-1580mah-ronin-mx",
          kind: "camera_battery_search",
          query: "DJI Ronin-M Battery 1580mAh",
          labelJa: "Amazonで DJI Ronin-M Battery 1580mAh を探す",
          labelEn: "Find DJI Ronin-M Battery 1580mAh on Amazon",
          sourceUrl: "https://www.dji.com/support/product/ronin"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Ronin",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/ronin",
      evidenceUrls: Object.freeze([
        "https://www.dji.com/support/product/ronin",
        "https://store.dji.com/product/ronin-battery"
      ]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-ronin-battery-3400mah-ronin",
          kind: "camera_battery_search",
          query: "DJI Ronin Battery 3400mAh",
          labelJa: "Amazonで DJI Ronin Battery 3400mAh を探す",
          labelEn: "Find DJI Ronin Battery 3400mAh on Amazon",
          sourceUrl: "https://www.dji.com/support/product/ronin"
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

  function getWave38Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE38_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave38Offers(args)];
    }
  });
})();
