(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "OKI", model: "C650dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C650DNW/",
      tonerCodes: Object.freeze(["TC-C4EK1", "TC-C4EY1", "TC-C4EM1", "TC-C4EC1"])
    }),
    Object.freeze({
      maker: "OKI", model: "C651dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C651DNW/",
      tonerCodes: Object.freeze(["TC-C4FK1", "TC-C4FY1", "TC-C4FM1", "TC-C4FC1"])
    }),
    Object.freeze({
      maker: "OKI", model: "C712dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C712DNW/",
      tonerCodes: Object.freeze(["TC-C4CK1", "TC-C4CY1", "TC-C4CM1", "TC-C4CC1", "TC-C4CK2", "TC-C4CY2", "TC-C4CM2", "TC-C4CC2"])
    }),
    Object.freeze({
      maker: "OKI", model: "C835dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C835DNW/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", model: "C844dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C844DNW/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", model: "C824dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C824DN/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1"])
    }),
    Object.freeze({
      maker: "OKI", model: "C835dnwt", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C835DNWT/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", model: "C911dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C911DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2"])
    }),
    Object.freeze({
      maker: "OKI", model: "C931dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C931DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2", "TNR-C3RK1", "TNR-C3RY1", "TNR-C3RM1", "TNR-C3RC1"])
    }),
    Object.freeze({
      maker: "OKI", model: "C941dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C941DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2", "TNR-C3RSW2", "TNR-C3RSC2", "TNR-C3RK1", "TNR-C3RY1", "TNR-C3RM1", "TNR-C3RC1"])
    })
  ]);

  function buildTaggedSearchUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function getOfficeOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    if (category !== "プリンター・複合機" || !cleanMaker || !cleanModel) return [];

    const row = rows.find((item) => item.maker === cleanMaker && item.model === cleanModel);
    if (!row) return [];

    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `oki-${cleanModel.toLowerCase()}-toner`,
      query: `OKI ${cleanModel} トナー`,
      url: buildTaggedSearchUrl(`OKI ${cleanModel} トナー`),
      labelJa: `Amazonで ${cleanModel} 用トナーを探す`,
      labelEn: `Find toner for OKI ${cleanModel} on Amazon`,
      sourceUrl: row.sourceUrl,
      verifiedAt: row.verifiedAt,
      verifiedCodes: row.tonerCodes
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];

  window.MANUALFINDER_OFFICE_CONSUMABLE_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: rows,
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getOfficeOffers(args)];
    }
  });
})();
