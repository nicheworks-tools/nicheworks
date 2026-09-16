(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const BATTERY_SOURCE = "https://store.dji.com/product/osmo-action-extreme-battery-plus";
  const CHARGER_SOURCE = "https://store.dji.com/product/osmo-action-multifunctional-battery-case-2";

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const row = (model) => Object.freeze({
    maker: "DJI",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: BATTERY_SOURCE,
    evidenceUrls: Object.freeze([BATTERY_SOURCE, CHARGER_SOURCE]),
    accessories: Object.freeze([
      accessory(
        "osmo-action-extreme-battery-plus",
        "camera_battery_search",
        "DJI Osmo Action Extreme Battery Plus",
        "Amazonで Osmo Action Extreme Battery Plus を探す",
        "Find DJI Osmo Action Extreme Battery Plus on Amazon",
        BATTERY_SOURCE
      ),
      accessory(
        "osmo-action-multifunctional-battery-case-2",
        "camera_charger_search",
        "DJI Osmo Action Multifunctional Battery Case 2",
        "Amazonで Osmo Action Multifunctional Battery Case 2 を探す",
        "Find DJI Osmo Action Multifunctional Battery Case 2 on Amazon",
        CHARGER_SOURCE
      )
    ])
  });

  const rows = Object.freeze([
    row("Osmo Action 3"),
    row("Osmo Action 4"),
    row("Osmo Action 5 Pro"),
    row("Osmo Action 6")
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave1Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE1_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave1Offers(args)];
    }
  });
})();
