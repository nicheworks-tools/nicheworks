(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.modelSearchTemplate || !base.trackingId) return;

  const template = Object.freeze({
    templateId: "camera_accessory_search",
    provider: "amazon",
    kind: "amazon_search",
    status: "verified",
    verifiedAt: "2026-09-16",
    verificationMethod: "validated_tagged_search_format_plus_official_compatibility_mapping",
    trackingId: base.trackingId,
    baseUrl: "https://www.amazon.co.jp/s",
    activationTarget: "camera_accessory_search_template",
    proofUrl: base.modelSearchTemplate.proofUrl,
    note: "Camera accessory searches are emitted only from exact manufacturer-verified maker/model compatibility mappings."
  });

  const accessory = (key, kind, query, labelJa, labelEn) => Object.freeze({
    key,
    kind,
    query,
    labelJa,
    labelEn
  });

  const row = (model, sourceUrl) => Object.freeze({
    maker: "Nikon",
    model,
    category: "カメラ・映像",
    verifiedAt: "2026-09-16",
    sourceType: "official_manufacturer_compatibility",
    sourceUrl,
    accessories: Object.freeze([
      accessory(
        "en-el15c",
        "camera_battery_search",
        "Nikon EN-EL15c",
        "Amazonで EN-EL15c バッテリーを探す",
        "Find Nikon EN-EL15c battery on Amazon"
      ),
      accessory(
        "mh-25a",
        "camera_charger_search",
        "Nikon MH-25a",
        "Amazonで MH-25a 充電器を探す",
        "Find Nikon MH-25a charger on Amazon"
      )
    ])
  });

  const rows = Object.freeze([
    row("Z8", "https://search.nikon-image.com/support/faq/products/article?articleNo=000059440"),
    row("Z6III", "https://onlinemanual.nikonimglib.com/z6III/ja/compatible_accessories_379.html"),
    row("Z5II", "https://onlinemanual.nikonimglib.com/z5II/ja/compatible_accessories_374.html"),
    row("Zf", "https://search.nikon-image.com/support/faq/products/article?articleNo=000066700")
  ]);

  function buildTaggedSearchUrl(query) {
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) return "";
    const url = new URL(template.baseUrl);
    url.searchParams.set("k", cleanQuery);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getAccessoryOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    const cleanCategory = String(category || "").trim();
    if (cleanCategory !== "カメラ・映像" || !cleanMaker || !cleanModel) return [];

    const mapping = rows.find((item) =>
      item.maker === cleanMaker && item.model === cleanModel && item.category === cleanCategory
    );
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

  const targets = Object.freeze({
    ...(base.targets || {}),
    [template.activationTarget]: template.proofUrl
  });

  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    enabled: Object.keys(targets).length > 0,
    targets,
    cameraAccessorySearchTemplate: template,
    cameraAccessories: rows,
    getAccessoryOffers
  });
})();
