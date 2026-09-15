(() => {
  "use strict";

  if (window.MANUALFINDER_KYOCERA_TONER_WAVE4_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const row = (model, verifiedAt, sourceUrl, codes) => Object.freeze({
    maker: "KYOCERA Document Solutions",
    searchMaker: "KYOCERA",
    model,
    verifiedAt,
    sourceUrl,
    tonerCodes: Object.freeze([...codes])
  });
  const rowsOf = (items) => Object.freeze(items.map((item) => row(...item)));

  const legacyPrinterSource = "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf";
  const discontinuedTonerSource = "https://www.kyoceradocumentsolutions.co.jp/products/other/toner_old.html";
  const wave4Rows = rowsOf([
    ["LS-6020", "2026-09-14", legacyPrinterSource, ["TK-401"]],
    ["LS-3830N", "2026-09-14", legacyPrinterSource, ["TK-66"]],
    ["LS-1820", "2026-09-14", legacyPrinterSource, ["TK-66"]],
    ["FS-920", "2026-09-14", legacyPrinterSource, ["TK-111"]]
  ]);

  const wave5Rows = rowsOf([
    ["TASKalfa 2550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta2550ci_qg.pdf", ["TK-8316C", "TK-8316M", "TK-8316Y", "TK-8316K"]],
    ["TASKalfa 3050ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf", ["TK-8306C", "TK-8306M", "TK-8306Y", "TK-8306K"]],
    ["TASKalfa 3550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf", ["TK-8306C", "TK-8306M", "TK-8306Y", "TK-8306K"]],
    ["TASKalfa 4550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf", ["TK-8506C", "TK-8506M", "TK-8506Y", "TK-8506K"]],
    ["TASKalfa 5550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf", ["TK-8506C", "TK-8506M", "TK-8506Y", "TK-8506K"]],
    ["TASKalfa 6550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf", ["TK-8706C", "TK-8706M", "TK-8706Y", "TK-8706K"]],
    ["TASKalfa 7550ci", "2026-09-14", "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf", ["TK-8706C", "TK-8706M", "TK-8706Y", "TK-8706K"]],
    ["ECOSYS M6526cidn", "2026-09-14", discontinuedTonerSource, ["TK-591K", "TK-591Y", "TK-591M", "TK-591C"]],
    ["ECOSYS M6526cdn", "2026-09-14", discontinuedTonerSource, ["TK-591K", "TK-591Y", "TK-591M", "TK-591C"]]
  ]);

  const wave8Rows = rowsOf([
    ["FS-C2026MFP", "2026-09-15", "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp/price_table.html", ["TK-591K", "TK-591C", "TK-591M", "TK-591Y"]],
    ["FS-C2026MFP+", "2026-09-15", "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp_plus/price_table.html", ["TK-591K", "TK-591C", "TK-591M", "TK-591Y"]],
    ["FS-C2126MFP", "2026-09-15", "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp/price_table.html", ["TK-591K", "TK-591C", "TK-591M", "TK-591Y"]],
    ["FS-C2126MFP+", "2026-09-15", "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp_plus/price_table.html", ["TK-591K", "TK-591C", "TK-591M", "TK-591Y"]],
    ["FS-C2626MFP", "2026-09-15", "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2626mfp/price_table.html", ["TK-591K", "TK-591C", "TK-591M", "TK-591Y"]]
  ]);

  const taskalfa180SeriesSource = "https://www.kyoceradocumentsolutions.eu/en/support/downloads.name-L2V1L2VuL21mcC9UQVNLQUxGQTIyMA%3D%3D.html";
  const taskalfa420SeriesSource = "https://www.kyoceradocumentsolutions.co.uk/en/support/downloads.name-L2diL2VuL21mcC9UQVNLQUxGQTUyMEk%3D.html";
  const km2560SeriesSource = "https://www.kyoceradocumentsolutions.be/nl/support/downloads.name-L2JlL25sL21mcC9LTTI1NjA%3D.html";
  const km8030SeriesSource = "https://www.kyoceradocumentsolutions.pt/pt/support/downloads.name-L3B0L3B0L21mcC9LTTgwMzA%3D.html";
  const wave9Rows = rowsOf([
    ["TASKalfa 180", "2026-09-15", taskalfa180SeriesSource, ["TK-435"]],
    ["TASKalfa 181", "2026-09-15", taskalfa180SeriesSource, ["TK-435"]],
    ["TASKalfa 221", "2026-09-15", taskalfa180SeriesSource, ["TK-435"]],
    ["TASKalfa 420i", "2026-09-15", taskalfa420SeriesSource, ["TK-725"]],
    ["TASKalfa 520i", "2026-09-15", taskalfa420SeriesSource, ["TK-725"]],
    ["KM-2540", "2026-09-15", km2560SeriesSource, ["TK-675"]],
    ["KM-2560", "2026-09-15", km2560SeriesSource, ["TK-675"]],
    ["KM-3040", "2026-09-15", km2560SeriesSource, ["TK-675"]],
    ["KM-3060", "2026-09-15", km2560SeriesSource, ["TK-675"]],
    ["KM-6030", "2026-09-15", km8030SeriesSource, ["TK-655"]],
    ["KM-8030", "2026-09-15", km8030SeriesSource, ["TK-655"]]
  ]);

  const tonerCompatibilitySource = "https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf";
  const taskalfaColorBrochureSource = "https://www.kyoceradocumentsolutions.co.uk/content/download-center/gb/documents/brochure/TASKalfa_250ci_300ci_400ci_500ci_552ci_KDS_Final_pdf.download.pdf";
  const wave10Rows = rowsOf([
    ["TASKalfa 620", "2026-09-15", tonerCompatibilitySource, ["TK-665"]],
    ["TASKalfa 820", "2026-09-15", tonerCompatibilitySource, ["TK-665"]],
    ["TASKalfa 300i", "2026-09-15", tonerCompatibilitySource, ["TK-685"]],
    ["TASKalfa 250ci", "2026-09-15", tonerCompatibilitySource, ["TK-865C", "TK-865K", "TK-865M", "TK-865Y"]],
    ["TASKalfa 300ci", "2026-09-15", tonerCompatibilitySource, ["TK-865C", "TK-865K", "TK-865M", "TK-865Y"]],
    ["TASKalfa 400ci", "2026-09-15", tonerCompatibilitySource, ["TK-855C", "TK-855K", "TK-855M", "TK-855Y"]],
    ["TASKalfa 500ci", "2026-09-15", tonerCompatibilitySource, ["TK-855C", "TK-855K", "TK-855M", "TK-855Y"]],
    ["TASKalfa 552ci", "2026-09-15", taskalfaColorBrochureSource, ["TK-855K", "TK-855C", "TK-855M", "TK-855Y"]],
    ["KM-1620", "2026-09-15", tonerCompatibilitySource, ["TK-410"]],
    ["KM-1650", "2026-09-15", tonerCompatibilitySource, ["TK-410"]],
    ["KM-2020", "2026-09-15", tonerCompatibilitySource, ["TK-410"]],
    ["KM-2050", "2026-09-15", tonerCompatibilitySource, ["TK-410"]],
    ["KM-2550", "2026-09-15", tonerCompatibilitySource, ["TK-420"]],
    ["KM-4050", "2026-09-15", tonerCompatibilitySource, ["TK-715"]],
    ["KM-5050", "2026-09-15", tonerCompatibilitySource, ["TK-715"]],
    ["KM-4530", "2026-09-15", tonerCompatibilitySource, ["TK-603"]],
    ["KM-5530", "2026-09-15", tonerCompatibilitySource, ["TK-603"]],
    ["KM-6330", "2026-09-15", tonerCompatibilitySource, ["TK-603"]],
    ["KM-7530", "2026-09-15", tonerCompatibilitySource, ["TK-603"]],
    ["KM-C2630", "2026-09-15", tonerCompatibilitySource, ["TK-815C", "TK-815K", "TK-815M", "TK-815Y"]],
    ["KM-C850", "2026-09-15", tonerCompatibilitySource, ["TK-805C", "TK-805K", "TK-805M", "TK-805Y"]],
    ["KM-C2520", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]],
    ["KM-C2525E", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]],
    ["KM-C3225", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]],
    ["KM-C3232", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]],
    ["KM-C3232E", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]],
    ["KM-C4035E", "2026-09-15", tonerCompatibilitySource, ["TK-825C", "TK-825K", "TK-825M", "TK-825Y"]]
  ]);

  const wave11Rows = rowsOf([
    ["KM-1530", "2026-09-15", tonerCompatibilitySource, ["1T02AV0NL0"]],
    ["KM-2030", "2026-09-15", tonerCompatibilitySource, ["1T02AV0NL0"]],
    ["KM-3035", "2026-09-15", tonerCompatibilitySource, ["370AB000"]],
    ["KM-4035", "2026-09-15", tonerCompatibilitySource, ["370AB000"]],
    ["KM-5035", "2026-09-15", tonerCompatibilitySource, ["370AB000"]]
  ]);

  const rows = Object.freeze([...wave4Rows, ...wave5Rows, ...wave8Rows, ...wave9Rows, ...wave10Rows, ...wave11Rows]);

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

    const matched = rows.find((item) => item.model === cleanModel);
    if (!matched) return [];

    const query = `KYOCERA ${cleanModel} トナー`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `kyocera-${keyModel(cleanModel)}-toner`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
      labelEn: `Find toner for ${cleanModel} on Amazon`,
      sourceUrl: matched.sourceUrl,
      verifiedAt: matched.verifiedAt,
      verifiedCodes: matched.tonerCodes
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
  window.MANUALFINDER_KYOCERA_TONER_WAVE9_LEDGER = wave9Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE10_LEDGER = wave10Rows;
  window.MANUALFINDER_KYOCERA_TONER_WAVE11_LEDGER = wave11Rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getSupplementalOffers(args)];
    }
  });
})();
