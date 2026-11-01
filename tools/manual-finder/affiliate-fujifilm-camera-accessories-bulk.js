(() => {
  "use strict";

  // Verified Fujifilm Japan exact-camera -> battery / charger relationships.
  // Source: manufacturer accessory compatibility tables and product pages.
  // This file adds no new camera models; it extends commerce handoffs for
  // existing canonical ManualFinder Fujifilm camera records only.
  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  const template = base?.cameraAccessorySearchTemplate;
  if (!base || !template || typeof base.getAccessoryOffers !== "function") return;

  const sources = Object.freeze({
    w126s: "https://www.fujifilm-x.com/ja-jp/support/compatibility/accessories/np-w126s/",
    w235: "https://www.fujifilm-x.com/ja-jp/support/compatibility/accessories/np-w235/",
    w235Product: "https://www.fujifilm-x.com/ja-jp/products/accessories/np-w235/",
    bcW235: "https://www.fujifilm-x.com/ja-jp/products/accessories/bc-w235/"
  });

  // The NP-W235 accessory compatibility table names eight of the models
  // below; the two additional recent models are named explicitly on both
  // NP-W235 and BC-W235 official product compatibility pages.
  const modelGroups = Object.freeze({
    w235: Object.freeze(["GFX100 II","GFX100S II","GFX100S","X-H2S","X-H2","X-T5","X-T4","X-S20"]),
    w235Product: Object.freeze(["GFX100RF","GFX ETERNA 55"]),
    w126s: Object.freeze(["X-H1","X-Pro3","X-Pro2","X-Pro1","X-T3","X-T2","X-T1","X-S10","X-T50","X-T30 II","X-T20","X-T10","X-T200","X-T100","X-E5","X-E4","X-E3","X-E2","X-E1","X-M1","X-A7","X-A5","X-A3","X-A2","X-A1","X100VI","X100V","X100F"])
  });

  function offer(code, kind, sourceUrl) {
    return Object.freeze({
      key: code.toLowerCase(),
      kind,
      query: "Fujifilm " + code,
      sourceUrl,
      labelJa: "Amazonで " + code + (kind === "camera_battery_search" ? " バッテリーを探す" : " 充電器を探す"),
      labelEn: "Find Fujifilm " + code + (kind === "camera_battery_search" ? " battery on Amazon" : " charger on Amazon")
    });
  }

  function row(model, battery, charger, batterySource, chargerSource) {
    return Object.freeze({
      maker: "Fujifilm",
      model,
      category: "カメラ・映像",
      verifiedAt: "2026-11-01",
      sourceType: "official_manufacturer_compatibility",
      sourceUrl: batterySource,
      accessories: Object.freeze([
        offer(battery, "camera_battery_search", batterySource),
        offer(charger, "camera_charger_search", chargerSource)
      ])
    });
  }

  const rows = Object.freeze([
    ...modelGroups.w235.map((model) => row(model, "NP-W235", "BC-W235", sources.w235, sources.bcW235)),
    ...modelGroups.w235Product.map((model) => row(model, "NP-W235", "BC-W235", sources.w235Product, sources.bcW235)),
    ...modelGroups.w126s.map((model) => row(model, "NP-W126S", "BC-W126S", sources.w126s, sources.w126s))
  ]);
  const previousGet = base.getAccessoryOffers.bind(base);

  function getOffers({ maker, model, category } = {}) {
    if (maker !== "Fujifilm" || category !== "カメラ・映像") return [];
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
  window.MANUALFINDER_FUJIFILM_CAMERA_ACCESSORY_BULK_LEDGER = rows;
  window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER = merged;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    cameraAccessories: merged,
    getAccessoryOffers(args = {}) {
      return [...previousGet(args), ...getOffers(args)];
    }
  });
})();
