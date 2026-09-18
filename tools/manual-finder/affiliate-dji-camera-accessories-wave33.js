(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BG30_SOURCE = "https://store.dji.com/product/ronin-bg30-grip";
  const MODELS = Object.freeze([
    "DJI RS 2",
    "DJI RS 3",
    "DJI RS 3 Pro",
    "DJI RS 4",
    "DJI RS 4 Pro",
    "DJI RS 5"
  ]);

  const rows = Object.freeze(MODELS.map((model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-18",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: BG30_SOURCE,
    evidenceUrls: Object.freeze([BG30_SOURCE]),
    accessories: Object.freeze([
      Object.freeze({
        key: `dji-rs-bg30-battery-grip-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        kind: "camera_battery_search",
        query: "DJI RS BG30 Battery Grip",
        labelJa: "Amazonで DJI RS BG30 Battery Grip を探す",
        labelEn: "Find DJI RS BG30 Battery Grip on Amazon",
        sourceUrl: BG30_SOURCE
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

  function getWave33Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE33_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave33Offers(args)];
    }
  });
})();
