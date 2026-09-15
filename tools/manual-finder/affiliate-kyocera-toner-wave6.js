(() => {
  "use strict";

  if (window.MANUALFINDER_KYOCERA_TONER_WAVE6_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const wave6Rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 3500i", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-6306"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 4500i", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-6306"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 5500i", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-6306"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 6500i", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_8000i_6500i_qg.pdf",
      tonerCodes: Object.freeze(["TK-6706"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 8000i", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_8000i_6500i_qg.pdf",
      tonerCodes: Object.freeze(["TK-6706"])
    })
  ]);

  const recycleSource = "https://www.kyoceradocumentsolutions.co.jp/support/receive_recycle/pdf/form_recycle.pdf";
  const wave7Rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-1135MFP", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco03/ls_1135mfp/price_table.html",
      tonerCodes: Object.freeze(["TK-1141"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-1035MFP/DP", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco03/ls_1035mfp/specs_1.html",
      tonerCodes: Object.freeze(["TK-1141"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-1128MFP", verifiedAt: "2026-09-14",
      sourceUrl: recycleSource, tonerCodes: Object.freeze(["TK-131"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-1028MFP", verifiedAt: "2026-09-14",
      sourceUrl: recycleSource, tonerCodes: Object.freeze(["TK-131"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-3140MFP", verifiedAt: "2026-09-14",
      sourceUrl: recycleSource, tonerCodes: Object.freeze(["TK-361"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-3640MFP", verifiedAt: "2026-09-14",
      sourceUrl: recycleSource, tonerCodes: Object.freeze(["TK-361"])
    })
  ]);

  const taskalfaAliasSource = "https://www.kyoceradocumentsolutions.com/support/mobileprint/index.html";
  const tonerCompatibilitySource = "https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf";
  const wave12Row = (model, evidenceAlias, tonerCodes) => Object.freeze({
    maker: "KYOCERA Document Solutions",
    searchMaker: "KYOCERA",
    model,
    verifiedAt: "2026-09-16",
    sourceUrl: tonerCompatibilitySource,
    evidenceAlias,
    evidenceUrls: Object.freeze([taskalfaAliasSource, tonerCompatibilitySource]),
    tonerCodes: Object.freeze(tonerCodes)
  });
  const wave12Rows = Object.freeze([
    wave12Row("TASKalfa 205c", "FS-C8020MFP", ["TK-895C", "TK-895K", "TK-895M", "TK-895Y"]),
    wave12Row("TASKalfa 255c", "FS-C8025MFP", ["TK-895C", "TK-895K", "TK-895M", "TK-895Y"]),
    wave12Row("TASKalfa 255", "FS-6025MFP", ["TK-475"]),
    wave12Row("TASKalfa 305", "FS-6030MFP", ["TK-475"])
  ]);

  const wave13Row = (model, evidenceAlias, relationSource, tonerCodes) => Object.freeze({
    maker: "KYOCERA Document Solutions",
    searchMaker: "KYOCERA",
    model,
    verifiedAt: "2026-09-16",
    sourceUrl: tonerCompatibilitySource,
    evidenceAlias,
    evidenceRelation: "official_same_engine_variant",
    evidenceUrls: Object.freeze([relationSource, tonerCompatibilitySource]),
    tonerCodes: Object.freeze(tonerCodes)
  });
  const wave13Rows = Object.freeze([
    wave13Row(
      "KM-1570",
      "KM-1530",
      "https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_1570/specs.html",
      ["1T02AV0NL0"]
    ),
    wave13Row(
      "KM-2070",
      "KM-2030",
      "https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_2030/specs.html",
      ["1T02AV0NL0"]
    ),
    wave13Row(
      "KM-C2630D",
      "KM-C2630",
      "https://www.kyoceradocumentsolutions.co.jp/products/past/copy01/km_c2630/specs.html",
      ["TK-815C", "TK-815K", "TK-815M", "TK-815Y"]
    )
  ]);

  const rows = Object.freeze([...wave6Rows, ...wave7Rows, ...wave12Rows, ...wave13Rows]);

  function buildTaggedSearchUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function keyModel(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getSupplementalOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    if (category !== "プリンター・複合機" || cleanMaker !== "KYOCERA Document Solutions" || !cleanModel) return [];

    const row = rows.find((item) => item.model === cleanModel);
    if (!row) return [];

    const query = `KYOCERA ${cleanModel} トナー`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `kyocera-${keyModel(cleanModel)}-toner`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
      labelEn: `Find toner for ${cleanModel} on Amazon`,
      sourceUrl: row.sourceUrl,
      verifiedAt: row.verifiedAt,
      verifiedCodes: row.tonerCodes
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables)
    ? base.officePrinterConsumables
    : [];

  window.MANUALFINDER_KYOCERA_TONER_WAVE6_LEDGER = wave6Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE7_LEDGER = wave7Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE12_LEDGER = wave12Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE13_LEDGER = wave13Rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getSupplementalOffers(args)];
    }
  });
})();
