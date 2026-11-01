(() => {
  "use strict";
  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;
  const pdSource = "https://support.sony.jp/electronics/support/a-mount-body-slt-a50-series/slt-a57/articles/00301779";
  const fzSource = "https://www.sony.jp/ichigan/products/NP-FZ100/compatible.html";
  const fwSource = "https://www.sony.jp/ichigan/products/NP-FW50/compatible.html";
  const chargerFz = "https://www.sony.jp/ichigan/products/BC-QZ1/";
  const chargerFw = "https://www.sony.jp/ichigan/products/NP-FW50/compatible.html";
  const groups = Object.freeze({
    sonyPdFz: Object.freeze(["ILCE-1M2","ILCE-1","ILCE-9M3","ILCE-7RM5","ILCE-7SM3","ILCE-7M5","ILCE-7M4","ILCE-7CR","ILCE-7CM2","ILCE-6700","ZV-E1","ZV-E10M2"]),
    sonyOtherFz: Object.freeze(["ILCE-9","ILCE-7RM3","ILCE-7RM4","ILCE-7M3"]),
    sonyFw: Object.freeze(["ZV-E10","ILCE-6400","ILCE-6100","ILCE-7M2","ILCE-QX1","ILCE-6000"])
  });
  const explicitFz = Object.freeze({
    "ILCE-9": chargerFz,
    "ILCE-7RM3": "https://www.sony.jp/ichigan/products/ILCE-7RM3/compatible.html",
    "ILCE-7RM4": "https://www.sony.jp/ichigan/products/ILCE-7RM4/compatible.html",
    "ILCE-7M3": "https://www.sony.jp/ichigan/products/ILCE-7M3/compatible.html"
  });
  const explicitFw = Object.freeze({
    "ILCE-6000": "https://www.sony.jp/ichigan/products/ILCE-6000/compatible.html"
  });
  function accessory(code, kind, sourceUrl) {
    return Object.freeze({
      key: code.toLowerCase(),
      kind,
      query: "Sony " + code,
      sourceUrl,
      labelJa: "Amazonで " + code + (kind === "camera_battery_search" ? " バッテリーを探す" : " 充電器を探す"),
      labelEn: "Find Sony " + code + (kind === "camera_battery_search" ? " battery on Amazon" : " charger on Amazon")
    });
  }
  function row(model, battery, charger, sourceUrl, chargerSource) {
    return Object.freeze({
      maker: "Sony",
      model,
      category: "カメラ・映像",
      verifiedAt: "2026-11-01",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl,
      accessories: Object.freeze([
        accessory(battery, "camera_battery_search", sourceUrl),
        accessory(charger, "camera_charger_search", chargerSource)
      ])
    });
  }
  const rows = Object.freeze([
    ...groups.sonyPdFz.map((model) => row(model, "NP-FZ100", "BC-QZ1", pdSource, chargerFz)),
    ...groups.sonyOtherFz.map((model) => row(model, "NP-FZ100", "BC-QZ1", explicitFz[model], chargerFz)),
    ...groups.sonyFw.map((model) => row(model, "NP-FW50", "BC-TRW", explicitFw[model] || fwSource, chargerFw))
  ]);
  const previousGet = base.getAccessoryOffers.bind(base);
  function getOffers({ maker, model, category } = {}) {
    if (maker !== "Sony" || category !== "カメラ・映像") return [];
    const match = rows.find((item) => item.model === model);
    if (!match) return [];
    return match.accessories.map((item) => {
      const url = new URL(template.baseUrl);
      url.searchParams.set("k", item.query);
      url.searchParams.set("tag", base.trackingId);
      return Object.freeze({
        target: template.activationTarget,
        kind: item.kind,
        key: item.key,
        query: item.query,
        url: url.toString(),
        labelJa: item.labelJa,
        labelEn: item.labelEn,
        sourceUrl: item.sourceUrl,
        verifiedAt: match.verifiedAt
      });
    });
  }
  const merged = Object.freeze([...(base.cameraAccessories || []), ...rows]);
  window.MANUALFINDER_SONY_CAMERA_ACCESSORY_BULK_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = merged;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: merged,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getOffers(args)];
    }
  });
})();
