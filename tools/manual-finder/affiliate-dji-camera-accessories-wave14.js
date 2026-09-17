(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BATTERY_SOURCE = "https://www.dji.com/support/product/mavic-pro-platinum";
  const HUB_SOURCE = "https://repair.dji.com/help/content?customId=01700010412&lang=en&paperDocType=ARTICLE&re=US&spaceId=17";

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
      model: "Mavic Pro Platinum",
      category: "カメラ・映像",
      verifiedAt: "2026-09-17",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: HUB_SOURCE,
      evidenceUrls: Object.freeze([BATTERY_SOURCE, HUB_SOURCE]),
      accessories: Object.freeze([
        accessory(
          "mavic-pro-platinum-intelligent-flight-battery",
          "camera_battery_search",
          "Mavic Pro Platinum Intelligent Flight Battery",
          "Amazonで Mavic Pro Platinum Intelligent Flight Battery を探す",
          "Find Mavic Pro Platinum Intelligent Flight Battery on Amazon",
          BATTERY_SOURCE
        ),
        accessory(
          "mavic-pro-battery-charging-hub-platinum",
          "camera_charger_search",
          "Mavic Pro Battery Charging Hub",
          "Amazonで Mavic Pro Battery Charging Hub を探す",
          "Find Mavic Pro Battery Charging Hub on Amazon",
          HUB_SOURCE
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

  function getWave14Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE14_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave14Offers(args)];
    }
  });
})();
