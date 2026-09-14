(() => {
  "use strict";

  if (window.MANUALFINDER_KYOCERA_TONER_WAVE3_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-6970DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_6970dn/price_table.html",
      tonerCodes: Object.freeze(["TK-451"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-6950DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_6950dn/price_table.html",
      tonerCodes: Object.freeze(["TK-441"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-6820N", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_6820n/specs.html",
      tonerCodes: Object.freeze(["TK-21"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-6800", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/ls_6800.pdf",
      tonerCodes: Object.freeze(["TK-20H"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-4020DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_4020dn/price_table.html",
      tonerCodes: Object.freeze(["TK-361"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-3900DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/ls_3900dn.pdf",
      tonerCodes: Object.freeze(["TK-331"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-2020D", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_2020d/price_table.html",
      tonerCodes: Object.freeze(["TK-341"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-2000D", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/ls_2000d.pdf",
      tonerCodes: Object.freeze(["TK-311"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-1370DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/fs_1370dn/price_table.html",
      tonerCodes: Object.freeze(["TK-131"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-1300D", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/fs_1300d/price_table.html",
      tonerCodes: Object.freeze(["TK-131"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-1010", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/past/eco02/fs_1010/option.html",
      tonerCodes: Object.freeze(["TK-17"])
    })
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

  function getWave3Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_KYOCERA_TONER_WAVE3_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getWave3Offers(args)];
    }
  });
})();
