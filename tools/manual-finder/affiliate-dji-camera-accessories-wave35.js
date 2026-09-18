(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const ROWS = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Ronin-SC",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://store.dji.com/product/ronin-sc-bg18-grip",
      evidenceUrls: Object.freeze(["https://store.dji.com/product/ronin-sc-bg18-grip"]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-ronin-sc-bg18-grip",
          kind: "camera_battery_search",
          query: "DJI Ronin-SC BG18 Grip",
          labelJa: "Amazonで DJI Ronin-SC BG18 Grip を探す",
          labelEn: "Find DJI Ronin-SC BG18 Grip on Amazon",
          sourceUrl: "https://store.dji.com/product/ronin-sc-bg18-grip"
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Ronin-S",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://store.dji.com/product/ronin-s-bg37-grip",
      evidenceUrls: Object.freeze(["https://store.dji.com/product/ronin-s-bg37-grip"]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-ronin-s-bg37-grip",
          kind: "camera_battery_search",
          query: "DJI Ronin-S BG37 Grip",
          labelJa: "Amazonで DJI Ronin-S BG37 Grip を探す",
          labelEn: "Find DJI Ronin-S BG37 Grip on Amazon",
          sourceUrl: "https://store.dji.com/product/ronin-s-bg37-grip"
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

  function getWave35Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像") return [];
    const row = ROWS.find((entry) => entry.model === cleanModel);
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
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...ROWS]);

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE35_LEDGER = ROWS;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave35Offers(args)];
    }
  });
})();
