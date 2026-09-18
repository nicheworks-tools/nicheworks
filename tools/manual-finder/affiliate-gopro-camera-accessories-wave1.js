(() => {
  "use strict";
  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;
  const SOURCE = "https://gopro.com/en/au/shop/mounts-accessories/enduro-extended-cold-weather-battery/ADBAT-011.html";
  const MODELS = Object.freeze(["HERO9 Black","HERO10 Black","HERO11 Black","HERO12 Black"]);
  const rows = Object.freeze(MODELS.map((model) => Object.freeze({
    maker: "GoPro", model, category: "カメラ・映像", verifiedAt: "2026-09-19",
    sourceType: "official_manufacturer_compatibility", sourceUrl: SOURCE,
    evidenceUrls: Object.freeze([SOURCE]),
    accessories: Object.freeze([Object.freeze({
      key: `gopro-wave1-battery-${model.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`,
      kind: "camera_battery_search", query: "GoPro Enduro Battery",
      labelJa: "Amazonで GoPro Enduro Battery を探す", labelEn: "Find GoPro Enduro Battery on Amazon", sourceUrl: SOURCE
    })])
  })));
  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }
  function getWaveOffers({maker,model,category}={}) {
    if (String(maker||"").trim() !== "GoPro" || String(category||"").trim() !== "カメラ・映像") return [];
    const row = rows.find((entry)=>entry.model===String(model||"").trim());
    if (!row) return [];
    return row.accessories.map((item)=>Object.freeze({
      target: template.activationTarget, kind:item.kind, key:item.key, query:item.query,
      url:buildTaggedSearchUrl(item.query), labelJa:item.labelJa, labelEn:item.labelEn,
      sourceUrl:item.sourceUrl, verifiedAt:row.verifiedAt
    })).filter((item)=>Boolean(item.url));
  }
  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);
  window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE1_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base, cameraAccessories: mergedRows,
    getAccessoryOffers(args={}) { return [...previousGet(args), ...getWaveOffers(args)]; }
  });
})();
