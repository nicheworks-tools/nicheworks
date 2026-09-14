(() => {
  "use strict";

  if (window.MANUALFINDER_FUJIFILM_TONER_WAVE2_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const families = Object.freeze([
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/color/apeos-c7071-c6571-c5571-c4571-c3571-C3071-c2571",
      evidenceKind: "official_family_toner_sds",
      evidenceScope: "FUJIFILM Business Innovation's official SDS page explicitly groups Apeos C7071/C6571/C5571/C4571/C3571/C3071/C2571 and lists black, yellow, magenta, and cyan toner for the family.",
      models: Object.freeze(["Apeos C7071", "Apeos C6571", "Apeos C5571", "Apeos C4571", "Apeos C3571", "Apeos C2571"])
    }),
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/monochrome/apeos-7580-6580-5580",
      evidenceKind: "official_family_toner_sds",
      evidenceScope: "FUJIFILM Business Innovation's official SDS page explicitly groups Apeos 7580/6580/5580 and lists black toner for the family.",
      models: Object.freeze(["Apeos 7580", "Apeos 6580", "Apeos 5580"])
    }),
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/color/apeos-c3067-c3061-2561-2061",
      evidenceKind: "official_family_toner_sds",
      evidenceScope: "FUJIFILM Business Innovation's official SDS page explicitly groups Apeos C3067/C3061/C2561/C2061 and lists black, yellow, magenta, and cyan toner for the family.",
      models: Object.freeze(["Apeos C3061", "Apeos C2561", "Apeos C2061"])
    }),
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/monochrome/apeos-3060-2560",
      evidenceKind: "official_family_toner_sds",
      evidenceScope: "FUJIFILM Business Innovation's official SDS page explicitly groups Apeos 3060/2560/1860 and lists black toner for the family.",
      models: Object.freeze(["Apeos 3060", "Apeos 2560", "Apeos 1860"])
    }),
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/monochrome/apeos-4570-3570",
      evidenceKind: "official_family_toner_sds",
      evidenceScope: "FUJIFILM Business Innovation's official SDS page explicitly groups Apeos 4570/3570 and lists black toner for the family.",
      models: Object.freeze(["Apeos 4570", "Apeos 3570"])
    }),
    Object.freeze({
      sourceUrl: "https://www.fujifilm.com/fb/ja/products/multifunction-printers/monochrome/apeos-3061-2561-2061/features",
      evidenceKind: "official_family_toner_product_page",
      evidenceScope: "FUJIFILM Business Innovation's official Apeos 3061/2561/2061 product family page explicitly describes newly developed toner for the Apeos 3061 series.",
      models: Object.freeze(["Apeos 3061", "Apeos 2561", "Apeos 2061"])
    })
  ]);

  const rows = Object.freeze(families.flatMap((family) => family.models.map((model) => Object.freeze({
    maker: "FUJIFILM Business Innovation",
    searchMaker: "FUJIFILM",
    model,
    verifiedAt: "2026-09-14",
    sourceUrl: family.sourceUrl,
    evidenceKind: family.evidenceKind,
    evidenceScope: family.evidenceScope,
    tonerCodes: Object.freeze([])
  }))));

  function buildTaggedSearchUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function keyModel(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getWave2Offers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    if (category !== "プリンター・複合機" || cleanMaker !== "FUJIFILM Business Innovation" || !cleanModel) return [];

    const row = rows.find((item) => item.model === cleanModel);
    if (!row) return [];

    const query = `FUJIFILM ${cleanModel} トナー`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `fujifilm-${keyModel(cleanModel)}-toner`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
      labelEn: `Find toner for ${cleanModel} on Amazon`,
      sourceUrl: row.sourceUrl,
      verifiedAt: row.verifiedAt,
      verifiedCodes: row.tonerCodes,
      evidenceKind: row.evidenceKind,
      evidenceScope: row.evidenceScope
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables)
    ? base.officePrinterConsumables
    : [];

  window.MANUALFINDER_FUJIFILM_TONER_WAVE2_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getWave2Offers(args)];
    }
  });
})();
