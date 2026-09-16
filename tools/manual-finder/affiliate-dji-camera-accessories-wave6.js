(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const reviewed = Object.freeze([
    Object.freeze({
      model: "DJI Avata 2",
      battery: Object.freeze({
        key: "dji-avata-2-intelligent-flight-battery",
        query: "DJI Avata 2 Intelligent Flight Battery",
        sourceUrl: "https://store.dji.com/product/dji-avata-2-intelligent-flight-battery"
      }),
      charger: Object.freeze({
        key: "dji-avata-2-two-way-charging-hub",
        query: "DJI Avata 2 Two-Way Charging Hub",
        sourceUrl: "https://store.dji.com/product/dji-avata-2-two-way-charging-hub"
      })
    }),
    Object.freeze({
      model: "DJI Flip",
      battery: Object.freeze({
        key: "dji-flip-intelligent-flight-battery",
        query: "DJI Flip Intelligent Flight Battery",
        sourceUrl: "https://store.dji.com/product/dji-flip-intelligent-flight-battery?vid=180981"
      }),
      charger: Object.freeze({
        key: "dji-flip-parallel-charging-hub",
        query: "DJI Flip Parallel Charging Hub",
        sourceUrl: "https://store.dji.com/product/dji-flip-parallel-charging-hub?vid=181011"
      })
    }),
    Object.freeze({
      model: "DJI Neo",
      battery: Object.freeze({
        key: "dji-neo-intelligent-flight-battery",
        query: "DJI Neo Intelligent Flight Battery",
        sourceUrl: "https://store.dji.com/product/dji-neo-intelligent-flight-battery"
      }),
      charger: Object.freeze({
        key: "dji-neo-two-way-charging-hub",
        query: "DJI Neo Two-Way Charging Hub",
        sourceUrl: "https://store.dji.com/pr/product/dji-neo-two-way-charging-hub?vid=169911"
      })
    })
  ]);

  const accessory = (key, kind, query, labelJa, labelEn, sourceUrl) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn,
    sourceUrl
  });

  const rows = Object.freeze(reviewed.map((item) => Object.freeze({
    maker: "DJI",
    model: item.model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl: item.battery.sourceUrl,
    evidenceUrls: Object.freeze([item.battery.sourceUrl, item.charger.sourceUrl]),
    accessories: Object.freeze([
      accessory(
        item.battery.key,
        "camera_battery_search",
        item.battery.query,
        `Amazonで ${item.battery.query} を探す`,
        `Find ${item.battery.query} on Amazon`,
        item.battery.sourceUrl
      ),
      accessory(
        item.charger.key,
        "camera_charger_search",
        item.charger.query,
        `Amazonで ${item.charger.query} を探す`,
        `Find ${item.charger.query} on Amazon`,
        item.charger.sourceUrl
      )
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

  function getWave6Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE6_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave6Offers(args)];
    }
  });
})();
