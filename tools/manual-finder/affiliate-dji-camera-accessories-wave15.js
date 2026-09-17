(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const ENTERPRISE_BATTERY_SOURCE = "https://enterprise.dji.com/mavic-3-enterprise/specs";
  const ENTERPRISE_HUB_SOURCE = "https://www.dji.com/support/product/mavic-3-enterprise";
  const MAVIC_3M_SOURCE = "https://www.dji.com/support/product/mavic-3-m";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const battery = (sourceUrl) => accessory(
    "mavic-3-series-intelligent-flight-battery-enterprise",
    "camera_battery_search",
    "DJI Mavic 3 Series Intelligent Flight Battery",
    "Amazonで DJI Mavic 3 Series Intelligent Flight Battery を探す",
    "Find DJI Mavic 3 Series Intelligent Flight Battery on Amazon",
    sourceUrl
  );

  const hub = (sourceUrl) => accessory(
    "mavic-3-battery-charging-hub-100w-enterprise",
    "camera_charger_search",
    "DJI Mavic 3 Battery Charging Hub 100W",
    "Amazonで DJI Mavic 3 Battery Charging Hub 100W を探す",
    "Find DJI Mavic 3 Battery Charging Hub 100W on Amazon",
    sourceUrl
  );

  const rows = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Mavic 3 Enterprise",
      category: "カメラ・映像",
      verifiedAt: "2026-09-17",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: ENTERPRISE_HUB_SOURCE,
      evidenceUrls: Object.freeze([ENTERPRISE_BATTERY_SOURCE, ENTERPRISE_HUB_SOURCE]),
      accessories: Object.freeze([
        battery(ENTERPRISE_BATTERY_SOURCE),
        hub(ENTERPRISE_HUB_SOURCE)
      ])
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Mavic 3M",
      category: "カメラ・映像",
      verifiedAt: "2026-09-17",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: MAVIC_3M_SOURCE,
      evidenceUrls: Object.freeze([MAVIC_3M_SOURCE]),
      accessories: Object.freeze([
        battery(MAVIC_3M_SOURCE),
        hub(MAVIC_3M_SOURCE)
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

  function getWave15Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE15_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave15Offers(args)];
    }
  });
})();
