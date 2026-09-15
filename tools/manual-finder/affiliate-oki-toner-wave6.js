(() => {
  "use strict";

  if (window.MANUALFINDER_OKI_TONER_WAVE6_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const tonerRow = (model, sourceUrl, tonerCodes) => Object.freeze({
    maker: "OKI",
    searchMaker: "OKI",
    model,
    verifiedAt: "2026-09-15",
    sourceUrl,
    tonerCodes: Object.freeze(tonerCodes)
  });

  const ribbonRow = (model, sourceUrl, ribbonCodes) => Object.freeze({
    maker: "OKI",
    searchMaker: "OKI",
    model,
    verifiedAt: "2026-09-15",
    sourceUrl,
    ribbonCodes: Object.freeze(ribbonCodes)
  });

  const c3h = Object.freeze([
    "TNR-C3HK1", "TNR-C3HY1", "TNR-C3HM1", "TNR-C3HC1",
    "TNR-C3HK2", "TNR-C3HY2", "TNR-C3HM2", "TNR-C3HC2"
  ]);

  const tonerRows = Object.freeze([
    tonerRow("C542dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C542dnw/", [
      "TC-C4BK1", "TC-C4BY1", "TC-C4BM1", "TC-C4BC1",
      "TC-C4BK2", "TC-C4BY2", "TC-C4BM2", "TC-C4BC2"
    ]),
    tonerRow("MICROLINE 910PS", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/ML910PS/", c3h),
    tonerRow("MICROLINE 910PS-D", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/ML910PS-D/", c3h),
    tonerRow("MICROLINE Pro 930PS-E", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-E/", c3h),
    tonerRow("MICROLINE Pro 930PS-S", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-S/", c3h),
    tonerRow("MICROLINE Pro 930PS-X", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/MLPro930PS-X/", c3h)
  ]);

  const ribbonRows = Object.freeze([
    ribbonRow("MICROLINE 50HU", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML50HU/", ["RN6-00-008"]),
    ribbonRow("MICROLINE 5350SE", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML5350SE/", ["RN6-00-009"]),
    ribbonRow("MICROLINE 5460HU2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML5460HU2/", ["RBC-21-001", "IRB-21-006"]),
    ribbonRow("MICROLINE 5650SU-R", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML5650SU-R/", ["RN6-00-009"]),
    ribbonRow("MICROLINE 5650SU3-R", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML5650SU3-R/", ["RN6-00-009"]),
    ribbonRow("MICROLINE 6300FB2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML6300FB2/", ["RBC-11-001", "IRB-11-006"]),
    ribbonRow("MICROLINE 80HU", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML80HU/", ["RN6-00-008"]),
    ribbonRow("MICROLINE 8460HU2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8460HU2/", ["RBC-22-001", "IRB-22-006"]),
    ribbonRow("MICROLINE 8480SU2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8480SU2/", ["RBN-00-007", "RN6-00-007"]),
    ribbonRow("MICROLINE 8480SU2-R", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8480SU2-R/", ["RBN-00-007", "RN6-00-007"]),
    ribbonRow("MICROLINE 8480SU3", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8480SU3/", ["RBN-00-007", "RN6-00-007"]),
    ribbonRow("MICROLINE 8480SU3-R", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8480SU3-R/", ["RBN-00-007", "RN6-00-007"]),
    ribbonRow("MICROLINE 8580SE", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8580SE/", ["RBN-00-002", "RN6-00-003"]),
    ribbonRow("MICROLINE 8720SE2", "https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/ML8720SE2/", ["RBN-00-006", "RN6-00-003"])
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

    const tonerMatch = tonerRows.find((item) => item.model === cleanModel);
    if (tonerMatch) {
      const query = `OKI ${cleanModel} トナー`;
      return [Object.freeze({
        target: base.consumableSearchTemplate.activationTarget,
        kind: "toner_search",
        key: `oki-${keyModel(cleanModel)}-toner`,
        query,
        url: buildTaggedSearchUrl(query),
        labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
        labelEn: `Find toner for ${cleanModel} on Amazon`,
        sourceUrl: tonerMatch.sourceUrl,
        verifiedAt: tonerMatch.verifiedAt,
        verifiedCodes: tonerMatch.tonerCodes
      })];
    }

    const ribbonMatch = ribbonRows.find((item) => item.model === cleanModel);
    if (!ribbonMatch) return [];

    const query = `OKI ${cleanModel} インクリボン`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "ribbon_search",
      key: `oki-${keyModel(cleanModel)}-ribbon`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用インクリボンを探す`,
      labelEn: `Find ink ribbon for ${cleanModel} on Amazon`,
      sourceUrl: ribbonMatch.sourceUrl,
      verifiedAt: ribbonMatch.verifiedAt,
      verifiedCodes: ribbonMatch.ribbonCodes
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables)
    ? base.officePrinterConsumables
    : [];
  const rows = Object.freeze([...tonerRows, ...ribbonRows]);

  window.MANUALFINDER_OKI_TONER_WAVE6_LEDGER = tonerRows;
  window.MANUALFINDER_OKI_RIBBON_WAVE1_LEDGER = ribbonRows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getSupplementalOffers(args)];
    }
  });
})();
