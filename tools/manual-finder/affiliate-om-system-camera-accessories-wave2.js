(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SOURCE = "https://explore.omsystem.com/us/en/blh-1-li-ion-rechargeable-battery";
  const MODELS = Object.freeze(["E-M1 Mark II", "E-M1 Mark III", "E-M1X"]);

  const rows = Object.freeze(MODELS.map((model) => Object.freeze({
    maker: "OM SYSTEM",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-19",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: SOURCE,
    evidenceUrls: Object.freeze([SOURCE]),
    accessories: Object.freeze([
      Object.freeze({
        key: `om-system-blh-1-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        kind: "camera_battery_search",
        query: "OM SYSTEM BLH-1 Lithium Ion Rechargeable Battery",
        labelJa: "Amazonで OM SYSTEM BLH-1 バッテリーを探す",
        labelEn: "Find OM SYSTEM BLH-1 battery on Amazon",
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

  function getWave2Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "OM SYSTEM" || cleanCategory !== "カメラ・映像") return [];
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

  window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE2_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave2Offers(args)];
    }
  });
})();
