(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BATTERY_SOURCE = "https://store.dji.com/sg/product/dji-fpv-intelligent-flight-battery?vid=101902";
  const ADAPTER_SOURCE = "https://store.dji.com/product/dji-fpv-ac-power-adapter?vid=101991";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI FPV",
      category: "カメラ・映像",
      verifiedAt: "2026-09-16",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: BATTERY_SOURCE,
      evidenceUrls: Object.freeze([BATTERY_SOURCE, ADAPTER_SOURCE]),
      accessories: Object.freeze([
        accessory(
          "dji-fpv-intelligent-flight-battery",
          "camera_battery_search",
          "DJI FPV Intelligent Flight Battery",
          "Amazonで DJI FPV Intelligent Flight Battery を探す",
          "Find DJI FPV Intelligent Flight Battery on Amazon",
          BATTERY_SOURCE
        ),
        accessory(
          "dji-fpv-ac-power-adapter",
          "camera_charger_search",
          "DJI FPV AC Power Adapter",
          "Amazonで DJI FPV AC Power Adapter を探す",
          "Find DJI FPV AC Power Adapter on Amazon",
          ADAPTER_SOURCE
        )
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

  function getWave8Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "DJI" || cleanCategory !== "カメラ・映像" || !cleanModel) return [];

    const mapping = rows.find((item) => item.model === cleanModel);
    if (!mapping) return [];

    return mapping.accessories.map((item) => Object.freeze({
      target: template.activationTarget,
      kind: item.kind,
      key: item.key,
      query: item.query,
      url: buildTaggedSearchUrl(item.query),
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      sourceUrl: item.sourceUrl,
      verifiedAt: mapping.verifiedAt
    })).filter((item) => Boolean(item.url));
  }

  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE8_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave8Offers(args)];
    }
  });
})();
