(() => {
  "use strict";

  if (window.MANUALFINDER_OKI_TONER_WAVE6_LEDGER) return;

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

  const c3h = Object.freeze([
    "TNR-C3HK1", "TNR-C3HY1", "TNR-C3HM1", "TNR-C3HC1",
    "TNR-C3HK2", "TNR-C3HY2", "TNR-C3HM2", "TNR-C3HC2"
  ]);

  const rows = Object.freeze([
    row("C542dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C542dnw/", [
      "TC-C4BK1", "TC-C4BY1", "TC-C4BM1", "TC-C4BC1",
      "TC-C4BK2", "TC-C4BY2", "TC-C4BM2", "TC-C4BC2"
    ]),
    row("MICROLINE 910PS", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/ML910PS/", c3h),
    row("MICROLINE 910PS-D", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/ML910PS-D/", c3h),
    row("MICROLINE Pro 930PS-E", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-E/", c3h),
    row("MICROLINE Pro 930PS-S", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-S/", c3h),
    row("MICROLINE Pro 930PS-X", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-X/", c3h)
  ]);

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

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables)
    ? base.officePrinterConsumables
    : [];

  window.MANUALFINDER_OKI_TONER_WAVE6_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getSupplementalOffers(args)];
    }
  });
})();
