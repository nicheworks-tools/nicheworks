(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const rows = Object.freeze([
    ["E-M10 Mark III", "https://explore.omsystem.com/gb/en/e-m10-mark-iii-black-reconditioned"],
    ["E-M10 Mark IV", "https://explore.omsystem.com/us/en/om-d-e-m10-mark-iv"],
    ["E-M5 Mark III", "https://explore.omsystem.com/lt/en/e-m5-mark-iii-body-black-reconditioned"],
    ["E-P7", "https://explore.omsystem.com/hu/en/e-p7"],
    ["E-PL10", "https://explore.omsystem.com/hu/en/pen-e-pl10-black-single-lens-kit-reconditioned"],
    ["OM-5", "https://explore.omsystem.com/c/en/om-5-body-black"],
    ["OM-5 Mark II", "https://explore.omsystem.com/us/en/om-5-mark-ii-body-black"]
  ].map(([model, sourceUrl]) => Object.freeze({
    maker: "OM SYSTEM",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-19",
    sourceType: "official_manufacturer_model_power",
    sourceUrl,
    evidenceUrls: Object.freeze([sourceUrl]),
    accessories: Object.freeze([
      Object.freeze({
        key: `om-system-bls-50-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        kind: "camera_battery_search",
        query: "OM SYSTEM BLS-50 Lithium Ion Rechargeable Battery",
        labelJa: "Amazonで OM SYSTEM BLS-50 バッテリーを探す",
        labelEn: "Find OM SYSTEM BLS-50 battery on Amazon",
        sourceUrl
      })
    ])
  })));

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave4Offers({ maker, model, category } = {}) {
    if (String(maker || "").trim() !== "OM SYSTEM" || String(category || "").trim() !== "カメラ・映像") return [];
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

  window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE4_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave4Offers(args)];
    }
  });
})();
