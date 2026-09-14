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

  const rows = Object.freeze([...wave2Rows, ...wave3Rows]);

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
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getOkiOffers(args)];
    }
  });
})();
