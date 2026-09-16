(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const SOURCE = "https://store.dji.com/se/product/dji-avata-fly-more-kit?vid=118761";

  const accessory = (key, kind, query, labelJa, labelEn) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl: SOURCE
  });

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Avata",
      category: "カメラ・映像",
      verifiedAt: "2026-09-16",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: SOURCE,
      evidenceUrls: Object.freeze([SOURCE]),
      accessories: Object.freeze([
        accessory(
          "dji-avata-intelligent-flight-battery",
          "camera_battery_search",
          "DJI Avata Intelligent Flight Battery",
          "Amazonで DJI Avata Intelligent Flight Battery を探す",
          "Find DJI Avata Intelligent Flight Battery on Amazon"
        ),
        accessory(
          "dji-avata-battery-charging-hub",
          "camera_charger_search",
          "DJI Avata Battery Charging Hub",
          "Amazonで DJI Avata Battery Charging Hub を探す",
          "Find DJI Avata Battery Charging Hub on Amazon"
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

  function getWave9Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE9_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave9Offers(args)];
    }
  });
})();
