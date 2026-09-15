(() => {
  "use strict";

  if (window.MANUALFINDER_KYOCERA_TONER_WAVE4_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const legacyPrinterSource = "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf";
  const discontinuedTonerSource = "https://www.kyoceradocumentsolutions.co.jp/products/other/toner_old.html";
  const wave4Rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-6020", verifiedAt: "2026-09-14",
      sourceUrl: legacyPrinterSource, tonerCodes: Object.freeze(["TK-401"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-3830N", verifiedAt: "2026-09-14",
      sourceUrl: legacyPrinterSource, tonerCodes: Object.freeze(["TK-66"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-1820", verifiedAt: "2026-09-14",
      sourceUrl: legacyPrinterSource, tonerCodes: Object.freeze(["TK-66"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-920", verifiedAt: "2026-09-14",
      sourceUrl: legacyPrinterSource, tonerCodes: Object.freeze(["TK-111"])
    })
  ]);

  const wave5Rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 2550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta2550ci_qg.pdf",
      tonerCodes: Object.freeze(["TK-8316C", "TK-8316M", "TK-8316Y", "TK-8316K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 3050ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-8306C", "TK-8306M", "TK-8306Y", "TK-8306K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 3550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-8306C", "TK-8306M", "TK-8306Y", "TK-8306K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 4550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-8506C", "TK-8506M", "TK-8506Y", "TK-8506K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 5550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf",
      tonerCodes: Object.freeze(["TK-8506C", "TK-8506M", "TK-8506Y", "TK-8506K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 6550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf",
      tonerCodes: Object.freeze(["TK-8706C", "TK-8706M", "TK-8706Y", "TK-8706K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "TASKalfa 7550ci", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf",
      tonerCodes: Object.freeze(["TK-8706C", "TK-8706M", "TK-8706Y", "TK-8706K"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "ECOSYS M6526cidn", verifiedAt: "2026-09-14",
      sourceUrl: discontinuedTonerSource,
      tonerCodes: Object.freeze(["TK-591K", "TK-591Y", "TK-591M", "TK-591C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "ECOSYS M6526cdn", verifiedAt: "2026-09-14",
      sourceUrl: discontinuedTonerSource,
      tonerCodes: Object.freeze(["TK-591K", "TK-591Y", "TK-591M", "TK-591C"])
    })
  ]);

  const wave8Rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C2026MFP", verifiedAt: "2026-09-15",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp/price_table.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C2026MFP+", verifiedAt: "2026-09-15",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp_plus/price_table.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C2126MFP", verifiedAt: "2026-09-15",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp/price_table.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C2126MFP+", verifiedAt: "2026-09-15",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp_plus/price_table.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C2626MFP", verifiedAt: "2026-09-15",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2626mfp/price_table.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    })
  ]);

  const rows = Object.freeze([...wave4Rows, ...wave5Rows, ...wave8Rows]);

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

  window.MANUALFINDER_KYOCERA_TONER_WAVE4_LEDGER = wave4Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE5_LEDGER = wave5Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE8_LEDGER = wave8Rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getSupplementalOffers(args)];
    }
  });
})();
