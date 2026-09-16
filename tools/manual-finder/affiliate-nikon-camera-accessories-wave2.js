(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const accessory = (key, kind, query, labelJa, labelEn) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn
  });

  const row = (model, sourceUrl, batteryCode, chargerCode) => Object.freeze({
    maker: "Nikon",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl,
    accessories: Object.freeze([
      accessory(
        batteryCode.toLowerCase(),
        "camera_battery_search",
        `Nikon ${batteryCode}`,
        `Amazonで ${batteryCode} バッテリーを探す`,
        `Find Nikon ${batteryCode} battery on Amazon`
      ),
      accessory(
        chargerCode.toLowerCase(),
        "camera_charger_search",
        `Nikon ${chargerCode}`,
        `Amazonで ${chargerCode} 充電器を探す`,
        `Find Nikon ${chargerCode} charger on Amazon`
      )
    ])
  });

  const rows = Object.freeze([
    row("Z9", "https://onlinemanual.nikonimglib.com/z9/ja/compatible_accessories_324.html", "EN-EL18d", "MH-33"),
    row("Z7II", "https://onlinemanual.nikonimglib.com/z7II_z6II/ja/15_technical_notes_04.html", "EN-EL15c", "MH-25a"),
    row("Z6II", "https://onlinemanual.nikonimglib.com/z7II_z6II/ja/15_technical_notes_04.html", "EN-EL15c", "MH-25a"),
    row("Z7", "https://onlinemanual.nikonimglib.com/z7_z6/ja/14_technical_notes_03.html", "EN-EL15b", "MH-25a"),
    row("Z6", "https://onlinemanual.nikonimglib.com/z7_z6/ja/14_technical_notes_03.html", "EN-EL15b", "MH-25a"),
    row("Z5", "https://onlinemanual.nikonimglib.com/z5/ja/15_technical_notes_04.html", "EN-EL15c", "MH-25a"),
    row("Z50II", "https://onlinemanual.nikonimglib.com/z50II/ja/15-04.html", "EN-EL25a", "MH-32"),
    row("Z50", "https://onlinemanual.nikonimglib.com/z50/ja/90_technical_notes_04.html", "EN-EL25a", "MH-32"),
    row("Z30", "https://onlinemanual.nikonimglib.com/z30/ja/15-04.html", "EN-EL25a", "MH-32"),
    row("Zfc", "https://onlinemanual.nikonimglib.com/zfc/ja/15-04.html", "EN-EL25a", "MH-32")
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getWave2Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanMaker !== "Nikon" || cleanCategory !== "カメラ・映像" || !cleanModel) return [];

    const mapping = rows.find((item) => item.model === cleanModel);
    if (!mapping || !mapping.sourceUrl) return [];

    return mapping.accessories.map((item) => Object.freeze({
      target: template.activationTarget,
      kind: item.kind,
      key: item.key,
      query: item.query,
      url: buildTaggedSearchUrl(item.query),
      labelJa: item.labelJa,
      labelEn: item.labelEn,
      sourceUrl: mapping.sourceUrl,
      verifiedAt: mapping.verifiedAt
    })).filter((item) => Boolean(item.url));
  }

  const previousGet = base.getAccessoryOffers.bind(base);
  const mergedRows = Object.freeze([...(base.cameraAccessories || []), ...rows]);

  window.MANUALFINDER_NIKON_CAMERA_ACCESSORY_WAVE2_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = mergedRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: mergedRows,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getWave2Offers(args)];
    }
  });
})();
