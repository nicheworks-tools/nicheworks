(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SOURCE = "https://explore.omsystem.com/in/en/li-92b-lithium-ion-battery";
  const MODELS = Object.freeze(["TG-4", "TG-5", "TG-6", "TG-7"]);

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
        key: `om-system-li-92b-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        kind: "camera_battery_search",
        query: "OM SYSTEM LI-92B Lithium Ion Rechargeable Battery",
        labelJa: "Amazonで OM SYSTEM LI-92B バッテリーを探す",
        labelEn: "Find OM SYSTEM LI-92B battery on Amazon",
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

  function getWave3Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE3_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave3Offers(args)];
    }
  });
})();
