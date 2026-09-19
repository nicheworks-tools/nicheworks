(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rawRows = [
  {
    "maker": "GoPro",
    "model": "HERO13 Black",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/enduro-battery/AEBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/enduro-battery/AEBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-enduro-hero13-black",
        "kind": "camera_battery_search",
        "query": "GoPro Enduro Battery HERO13 Black",
        "labelJa": "Amazonで GoPro HERO13 Black用Enduroバッテリーを探す",
        "labelEn": "Find GoPro Enduro Battery for HERO13 Black on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/enduro-battery/AEBAT-001.html"
      }
    ]
  }
];
  const rows = Object.freeze(rawRows.map((row) => Object.freeze({
    ...row,
    evidenceUrls: Object.freeze(row.evidenceUrls),
    accessories: Object.freeze(row.accessories.map((item) => Object.freeze(item)))
  })));

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getGoProWave1Offers({ maker, model, category } = {}) {
    if (String(maker || "").trim() !== "GoPro" || String(category || "").trim() !== "カメラ・映像") return [];
    const row = rows.find((entry) => entry.model === String(model || "").trim());
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

  window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE1_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getGoProWave1Offers(args)];
    }
  });
})();
