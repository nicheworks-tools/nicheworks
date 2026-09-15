(() => {
  "use strict";

  if (window.MANUALFINDER_OKI_TONER_WAVE2_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const row = (model, sourceUrl, tonerCodes) => Object.freeze({
    maker: "OKI",
    searchMaker: "OKI",
    model,
    verifiedAt: "2026-09-15",
    sourceUrl,
    tonerCodes: Object.freeze(tonerCodes)
  });

  const wave2Rows = Object.freeze([
    row("C301dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C301DN/", ["TNR-C4JK1", "TNR-C4JY1", "TNR-C4JM1", "TNR-C4JC1"]),
    row("C310dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C310DN/", ["TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3", "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1"]),
    row("C312dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C312DN/", ["TNR-C4KK3", "TNR-C4KY3", "TNR-C4KM3", "TNR-C4KC3", "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1"]),
    row("C332dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C332DNW/", ["TC-C4AK1", "TC-C4AY1", "TC-C4AM1", "TC-C4AC1", "TC-C4AK2", "TC-C4AY2", "TC-C4AM2", "TC-C4AC2"]),
    row("C510dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C510DN/", ["TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3", "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1", "TNR-C4HK2", "TNR-C4HY2", "TNR-C4HM2", "TNR-C4HC2"]),
    row("C511dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C511DN/", ["TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1", "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"]),
    row("C530dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C530DN/", ["TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3", "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1", "TNR-C4HK2", "TNR-C4HY2", "TNR-C4HM2", "TNR-C4HC2"]),
    row("C531dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C531DN/", ["TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1", "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"])
  ]);

  const wave3Rows = Object.freeze([
    row("C610dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C610N/", ["TNR-C4FK1", "TNR-C4FY1", "TNR-C4FM1", "TNR-C4FC1", "TNR-C4FK2", "TNR-C4FY2", "TNR-C4FM2", "TNR-C4FC2"]),
    row("C610dn2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C610DN2/", ["TNR-C4FK1", "TNR-C4FY1", "TNR-C4FM1", "TNR-C4FC1", "TNR-C4FK2", "TNR-C4FY2", "TNR-C4FM2", "TNR-C4FC2"]),
    row("C612dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C612DNW/", ["TC-C4DK1", "TC-C4DY1", "TC-C4DM1", "TC-C4DC1", "TC-C4DK2", "TC-C4DY2", "TC-C4DM2", "TC-C4DC2"]),
    row("C711dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C711DN/", ["TNR-C4GK1", "TNR-C4GY1", "TNR-C4GM1", "TNR-C4GC1", "TNR-C4GK2", "TNR-C4GY2", "TNR-C4GM2", "TNR-C4GC2"]),
    row("C711dn2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C711DN2/", ["TNR-C4GK1", "TNR-C4GY1", "TNR-C4GM1", "TNR-C4GC1", "TNR-C4GK2", "TNR-C4GY2", "TNR-C4GM2", "TNR-C4GC2"]),
    row("C810dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C810DN/", ["TNR-C3KK3", "TNR-C3KY3", "TNR-C3KM3", "TNR-C3KC3", "TNR-C3KK1", "TNR-C3KY1", "TNR-C3KM1", "TNR-C3KC1"]),
    row("C810dn-T", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C810DN-T/", ["TNR-C3KK3", "TNR-C3KY3", "TNR-C3KM3", "TNR-C3KC3", "TNR-C3KK1", "TNR-C3KY1", "TNR-C3KM1", "TNR-C3KC1"]),
    row("C811dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C811DN/", ["TNR-C3LK3", "TNR-C3LY3", "TNR-C3LM3", "TNR-C3LC3", "TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2"]),
    row("C811dn-T", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C811DN-T/", ["TNR-C3LK3", "TNR-C3LY3", "TNR-C3LM3", "TNR-C3LC3", "TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2"]),
    row("C830dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C830DN/", ["TNR-C3KK3", "TNR-C3KY3", "TNR-C3KM3", "TNR-C3KC3", "TNR-C3KK1", "TNR-C3KY1", "TNR-C3KM1", "TNR-C3KC1"]),
    row("C841dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/c841dn/", ["TNR-C3LK3", "TNR-C3LY3", "TNR-C3LM3", "TNR-C3LC3", "TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2"]),
    row("C841dn-PI", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C841DN-PI/", ["TNR-C3LK3", "TNR-C3LY3", "TNR-C3LM3", "TNR-C3LC3", "TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2"]),
    row("C8800-P", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C8800-P/", ["TNR-C3FK1", "TNR-C3FY1", "TNR-C3FM1", "TNR-C3FC1"])
  ]);

  const wave4Rows = Object.freeze([
    row("MC361dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC361DN/", ["TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1"]),
    row("MC362dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MC362DN/", ["TNR-C4KK3", "TNR-C4KY3", "TNR-C4KM3", "TNR-C4KC3", "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1"]),
    row("MC362dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC362DNW/", ["TNR-C4KK3", "TNR-C4KY3", "TNR-C4KM3", "TNR-C4KC3", "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1"]),
    row("MC363dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC363DNW/", ["TC-C4AK1", "TC-C4AY1", "TC-C4AM1", "TC-C4AC1", "TC-C4AK2", "TC-C4AY2", "TC-C4AM2", "TC-C4AC2"]),
    row("MC561dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC561DN/", ["TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1", "TNR-C4HK2", "TNR-C4HY2", "TNR-C4HM2", "TNR-C4HC2"]),
    row("MC562dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MC562DN/", ["TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1", "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"]),
    row("MC562dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC562DNW/", ["TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1", "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"]),
    row("MC573dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC573DNW/", ["TC-C4BK1", "TC-C4BY1", "TC-C4BM1", "TC-C4BC1", "TC-C4BK2", "TC-C4BY2", "TC-C4BM2", "TC-C4BC2"])
  ]);

  const wave5Rows = Object.freeze([
    row("MC780dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC780DN/", ["TNR-C4RK2", "TNR-C4RY2", "TNR-C4RM2", "TNR-C4RC2", "TNR-C4RK1", "TNR-C4RY1", "TNR-C4RM1", "TNR-C4RC1"]),
    row("MC780dnf", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC780DNF/", ["TNR-C4RK2", "TNR-C4RY2", "TNR-C4RM2", "TNR-C4RC2", "TNR-C4RK1", "TNR-C4RY1", "TNR-C4RM1", "TNR-C4RC1"]),
    row("MC780dnl", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC780DNL/", ["TNR-C4RK2", "TNR-C4RY2", "TNR-C4RM2", "TNR-C4RC2", "TNR-C4RK1", "TNR-C4RY1", "TNR-C4RM1", "TNR-C4RC1"]),
    row("MC843dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC843DNW/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"]),
    row("MC843dnwv", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC843DNWV/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"]),
    row("MC852dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC852DN/", ["TNR-C3MK1", "TNR-C3MY1", "TNR-C3MM1", "TNR-C3MC1"]),
    row("MC860dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC860DN/", ["TNR-C3KK3", "TNR-C3KY3", "TNR-C3KM3", "TNR-C3KC3", "TNR-C3KK1", "TNR-C3KY1", "TNR-C3KM1", "TNR-C3KC1"]),
    row("MC860dtn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC860DTN/", ["TNR-C3KK3", "TNR-C3KY3", "TNR-C3KM3", "TNR-C3KC3", "TNR-C3KK1", "TNR-C3KY1", "TNR-C3KM1", "TNR-C3KC1"]),
    row("MC862dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC862DN/", ["TNR-C3PK1", "TNR-C3PY1", "TNR-C3PM1", "TNR-C3PC1", "TNR-C3PK2", "TNR-C3PY2", "TNR-C3PM2", "TNR-C3PC2"]),
    row("MC862dn-T", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC862DN-T/", ["TNR-C3PK1", "TNR-C3PY1", "TNR-C3PM1", "TNR-C3PC1", "TNR-C3PK2", "TNR-C3PY2", "TNR-C3PM2", "TNR-C3PC2"]),
    row("MC863dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC863DNW/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"]),
    row("MC863dnwv", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC863DNWV/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"]),
    row("MC883dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNW/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"]),
    row("MC883dnwv", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV/", ["TNR-C3LK1", "TNR-C3LY1", "TNR-C3LM1", "TNR-C3LC1", "TNR-C3LK2", "TNR-C3LY2", "TNR-C3LM2", "TNR-C3LC2", "TNR-C3LK4"])
  ]);

  const rows = Object.freeze([...wave2Rows, ...wave3Rows, ...wave4Rows, ...wave5Rows]);

  function buildTaggedSearchUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function keyModel(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getOkiOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    if (category !== "プリンター・複合機" || cleanMaker !== "OKI" || !cleanModel) return [];
    const match = rows.find((item) => item.model === cleanModel);
    if (!match) return [];
    const query = `OKI ${cleanModel} トナー`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `oki-${keyModel(cleanModel)}-toner`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
      labelEn: `Find toner for ${cleanModel} on Amazon`,
      sourceUrl: match.sourceUrl,
      verifiedAt: match.verifiedAt,
      verifiedCodes: match.tonerCodes
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function" ? base.getConsumableOffers.bind(base) : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables) ? base.officePrinterConsumables : [];

  window.MANUALFINDER_OKI_TONER_WAVE2_LEDGER = wave2Rows;
  window.MANUALFINDER_OKI_TONER_WAVE3_LEDGER = wave3Rows;
  window.MANUALFINDER_OKI_TONER_WAVE4_LEDGER = wave4Rows;
  window.MANUALFINDER_OKI_TONER_WAVE5_LEDGER = wave5Rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getOkiOffers(args)];
    }
  });
})();
