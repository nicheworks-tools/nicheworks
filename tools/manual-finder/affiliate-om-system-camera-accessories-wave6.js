(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SOURCE = "https://support.jp.omsystem.com/en/support/imsg/digicamera/compati/pen_power.html";
  const MODELS = Object.freeze(["E-M10","E-M10 Mark II","E-P1","E-P2","E-P3","E-PL1","E-PL2","E-PL3","E-PL5","E-PL6","E-PL7","E-PL8","E-PL9","E-PM1","E-PM2"]);

  const rows = Object.freeze(MODELS.map((model) => Object.freeze({
    maker: "OM SYSTEM",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-19",
    sourceType: "official_manufacturer_compatibility_table",
    sourceUrl: SOURCE,
    evidenceUrls: Object.freeze([SOURCE]),
    accessories: Object.freeze([
      Object.freeze({
        key: `om-system-bls-50-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        kind: "camera_battery_search",
        query: "OM SYSTEM BLS-50 Lithium Ion Rechargeable Battery",
        labelJa: "Amazonで OM SYSTEM BLS-50 バッテリーを探す",
        labelEn: "Find OM SYSTEM BLS-50 battery on Amazon",
        sourceUrl: SOURCE
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

  function getWave6Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE6_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave6Offers(args)];
    }
  });
})();
