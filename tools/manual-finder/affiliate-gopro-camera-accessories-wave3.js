(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rawRows = [
  {
    "maker": "GoPro",
    "model": "HERO5 Black",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-hero8-rechargeable-hero5-black",
        "kind": "camera_battery_search",
        "query": "GoPro HERO8 Black Rechargeable Battery",
        "labelJa": "Amazonで GoPro HERO8 Black Rechargeable Battery を探す",
        "labelEn": "Find GoPro HERO8 Black Rechargeable Battery on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
      }
    ]
  },
  {
    "maker": "GoPro",
    "model": "HERO6 Black",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-hero8-rechargeable-hero6-black",
        "kind": "camera_battery_search",
        "query": "GoPro HERO8 Black Rechargeable Battery",
        "labelJa": "Amazonで GoPro HERO8 Black Rechargeable Battery を探す",
        "labelEn": "Find GoPro HERO8 Black Rechargeable Battery on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
      }
    ]
  },
  {
    "maker": "GoPro",
    "model": "HERO7 Black",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-hero8-rechargeable-hero7-black",
        "kind": "camera_battery_search",
        "query": "GoPro HERO8 Black Rechargeable Battery",
        "labelJa": "Amazonで GoPro HERO8 Black Rechargeable Battery を探す",
        "labelEn": "Find GoPro HERO8 Black Rechargeable Battery on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
      }
    ]
  },
  {
    "maker": "GoPro",
    "model": "HERO8 Black",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-hero8-rechargeable-hero8-black",
        "kind": "camera_battery_search",
        "query": "GoPro HERO8 Black Rechargeable Battery",
        "labelJa": "Amazonで GoPro HERO8 Black Rechargeable Battery を探す",
        "labelEn": "Find GoPro HERO8 Black Rechargeable Battery on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
      }
    ]
  },
  {
    "maker": "GoPro",
    "model": "HERO 2018",
    "category": "カメラ・映像",
    "verifiedAt": "2026-09-19",
    "sourceType": "official_manufacturer_compatibility",
    "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html",
    "evidenceUrls": [
      "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
    ],
    "accessories": [
      {
        "key": "gopro-hero8-rechargeable-hero-2018",
        "kind": "camera_battery_search",
        "query": "GoPro HERO8 Black Rechargeable Battery",
        "labelJa": "Amazonで GoPro HERO8 Black Rechargeable Battery を探す",
        "labelEn": "Find GoPro HERO8 Black Rechargeable Battery on Amazon",
        "sourceUrl": "https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html"
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

  function getGoProWave3Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE3_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getGoProWave3Offers(args)];
    }
  });
})();
