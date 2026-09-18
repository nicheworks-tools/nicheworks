(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const CHARGER_SOURCE = "https://store.dji.com/product/dji-65w-portable-charger";
  const NANO_SOURCE = "https://www.dji.com/support/product/nano";

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI RC",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/rc",
      evidenceUrls: Object.freeze(["https://www.dji.com/support/product/rc", CHARGER_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-65w-portable-charger-dji-rc",
          kind: "camera_charger_search",
          query: "DJI 65W Portable Charger",
          labelJa: "Amazonで DJI 65W Portable Charger を探す",
          labelEn: "Find DJI 65W Portable Charger on Amazon",
          sourceUrl: CHARGER_SOURCE
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC Pro",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: "https://www.dji.com/support/product/rc-pro",
      evidenceUrls: Object.freeze(["https://www.dji.com/support/product/rc-pro", CHARGER_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "dji-65w-portable-charger-dji-rc-pro",
          kind: "camera_charger_search",
          query: "DJI 65W Portable Charger",
          labelJa: "Amazonで DJI 65W Portable Charger を探す",
          labelEn: "Find DJI 65W Portable Charger on Amazon",
          sourceUrl: CHARGER_SOURCE
        })
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Nano",
      category: "カメラ・映像",
      verifiedAt: "2026-09-18",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: NANO_SOURCE,
      evidenceUrls: Object.freeze([NANO_SOURCE]),
      accessories: Object.freeze([
        Object.freeze({
          key: "osmo-nano-multifunctional-vision-dock-osmo-nano",
          kind: "camera_battery_search",
          query: "DJI Osmo Nano Multifunctional Vision Dock",
          labelJa: "Amazonで DJI Osmo Nano Multifunctional Vision Dock を探す",
          labelEn: "Find DJI Osmo Nano Multifunctional Vision Dock on Amazon",
          sourceUrl: NANO_SOURCE
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

  function getWave40Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE40_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave40Offers(args)];
    }
  });
})();
