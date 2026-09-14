(() => {
  "use strict";

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const rows = Object.freeze([
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C650dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C650DNW/",
      tonerCodes: Object.freeze(["TC-C4EK1", "TC-C4EY1", "TC-C4EM1", "TC-C4EC1"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C651dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C651DNW/",
      tonerCodes: Object.freeze(["TC-C4FK1", "TC-C4FY1", "TC-C4FM1", "TC-C4FC1"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C712dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C712DNW/",
      tonerCodes: Object.freeze(["TC-C4CK1", "TC-C4CY1", "TC-C4CM1", "TC-C4CC1", "TC-C4CK2", "TC-C4CY2", "TC-C4CM2", "TC-C4CC2"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C835dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C835DNW/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C844dnw", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C844DNW/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C824dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C824DN/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C835dnwt", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C835DNWT/",
      tonerCodes: Object.freeze(["TC-C3BK1", "TC-C3BY1", "TC-C3BM1", "TC-C3BC1", "TC-C3BK2", "TC-C3BY2", "TC-C3BM2", "TC-C3BC2"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C911dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C911DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C931dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C931DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2", "TNR-C3RK1", "TNR-C3RY1", "TNR-C3RM1", "TNR-C3RC1"])
    }),
    Object.freeze({
      maker: "OKI", searchMaker: "OKI", model: "C941dn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C941DN/",
      tonerCodes: Object.freeze(["TNR-C3RK2", "TNR-C3RY2", "TNR-C3RM2", "TNR-C3RC2", "TNR-C3RSW2", "TNR-C3RSC2", "TNR-C3RK1", "TNR-C3RY1", "TNR-C3RM1", "TNR-C3RC1"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "ECOSYS P6026cdn", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/p6026cdn/specs_1.html",
      tonerCodes: Object.freeze(["TK-591K", "TK-591C", "TK-591M", "TK-591Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C8500DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/ls_c8500dn/specs_1.html",
      tonerCodes: Object.freeze(["TK-881K", "TK-881C", "TK-881M", "TK-881Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C5300DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/fs_c5300dn/price_table.html",
      tonerCodes: Object.freeze(["TK-561K", "TK-561Y", "TK-561M", "TK-561C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "FS-C5200DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/fs_c5200dn/specs_1.html",
      tonerCodes: Object.freeze(["TK-551K", "TK-551C", "TK-551M", "TK-551Y"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C8026N", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/ls_c8026n/option.html",
      tonerCodes: Object.freeze(["TK-811K", "TK-811Y", "TK-811M", "TK-811C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C8100DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf",
      tonerCodes: Object.freeze(["TK-821K", "TK-821Y", "TK-821M", "TK-821C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C8008N", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf",
      tonerCodes: Object.freeze(["TK-801K", "TK-801Y", "TK-801M", "TK-801C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C8008DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf",
      tonerCodes: Object.freeze(["TK-801K", "TK-801Y", "TK-801M", "TK-801C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C5030N", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco01/ls_c5030n/specs_1.html",
      tonerCodes: Object.freeze(["TK-511K", "TK-511Y", "TK-511M", "TK-511C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-C5016N", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf",
      tonerCodes: Object.freeze(["TK-501K", "TK-501Y", "TK-501M", "TK-501C"])
    }),
    Object.freeze({
      maker: "KYOCERA Document Solutions", searchMaker: "KYOCERA", model: "LS-9520DN", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco02/ls_9520dn/option.html",
      tonerCodes: Object.freeze(["TK-76"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C8010", model: "RICOH IM C8010", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c8010-c6510/maintenance",
      tonerCodes: Object.freeze(["RICOH MP トナー ブラック C8003", "RICOH MP トナー イエロー C8003", "RICOH MP トナー マゼンタ C8003", "RICOH MP トナー シアン C8003"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C6510", model: "RICOH IM C6510", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c8010-c6510/maintenance",
      tonerCodes: Object.freeze(["RICOH MP トナー ブラック C8003", "RICOH MP トナー イエロー C8003", "RICOH MP トナー マゼンタ C8003", "RICOH MP トナー シアン C8003"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C7010", model: "RICOH IM C7010", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c7010-c6010-c5510-c4510-c3510-c3010-c2510/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C7010", "RICOH トナー イエロー IM C7010", "RICOH トナー マゼンタ IM C7010", "RICOH トナー シアン IM C7010"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C6011", model: "RICOH IM C6011", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C6010", "RICOH トナー イエロー IM C6010", "RICOH トナー マゼンタ IM C6010", "RICOH トナー シアン IM C6010"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C3511", model: "RICOH IM C3511", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C3510", "RICOH トナー イエロー IM C3510", "RICOH トナー マゼンタ IM C3510", "RICOH トナー シアン IM C3510"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C5511", model: "RICOH IM C5511", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C6010", "RICOH トナー イエロー IM C6010", "RICOH トナー マゼンタ IM C6010", "RICOH トナー シアン IM C6010"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C4511", model: "RICOH IM C4511", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C6010", "RICOH トナー イエロー IM C6010", "RICOH トナー マゼンタ IM C6010", "RICOH トナー シアン IM C6010"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C3011", model: "RICOH IM C3011", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C3510", "RICOH トナー イエロー IM C3510", "RICOH トナー マゼンタ IM C3510", "RICOH トナー シアン IM C3510"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C2511", model: "RICOH IM C2511", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c6011-c5511-c4511-c3511-c3011-c2511/maintenance",
      tonerCodes: Object.freeze(["RICOH トナー ブラック IM C2510", "RICOH トナー イエロー IM C2510", "RICOH トナー マゼンタ IM C2510", "RICOH トナー シアン IM C2510"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C320F", model: "RICOH IM C320F", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c320f/maintenance",
      tonerCodes: Object.freeze(["RICOH Pトナー ブラック IM C320", "RICOH Pトナー イエロー IM C320", "RICOH Pトナー マゼンタ IM C320", "RICOH Pトナー シアン IM C320"])
    }),
    Object.freeze({
      maker: "RICOH", searchMaker: "RICOH", searchModel: "IM C2011", model: "RICOH IM C2011", verifiedAt: "2026-09-14",
      sourceUrl: "https://www.ricoh.co.jp/products/list/ricoh-im-c2011/maintenance",
      tonerCodes: Object.freeze(["RICOH トナーキット ブラック IM C2010", "RICOH トナーキット イエロー IM C2010", "RICOH トナーキット マゼンタ IM C2010", "RICOH トナーキット シアン IM C2010"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C7773", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C6673", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C5573", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C4473", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C3373", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C3372", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    }),
    Object.freeze({
      maker: "FUJIFILM Business Innovation", searchMaker: "FUJIFILM", model: "ApeosPort-VII C2273", verifiedAt: "2026-09-14",
      sourceUrl: "https://opencds-fb.fujifilm.com/gen/product2_aux/prod/manual/jp/ap7_c7773/users_guide/contents/ja/UG_210100.html",
      tonerCodes: Object.freeze(["CT203138", "CT203139", "CT203140", "CT203141"])
    })
  ]);

  function buildTaggedSearchUrl(query) {
    const url = new URL("https://www.amazon.co.jp/s");
    url.searchParams.set("k", query);
    url.searchParams.set("tag", base.trackingId);
    return url.toString();
  }

  function keyMaker(value) {
    return String(value || "office").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getOfficeOffers({ maker, model, category } = {}) {
    const cleanMaker = String(maker || "").trim();
    const cleanModel = String(model || "").trim();
    if (category !== "プリンター・複合機" || !cleanMaker || !cleanModel) return [];

    const row = rows.find((item) => item.maker === cleanMaker && item.model === cleanModel);
    if (!row) return [];

    const searchMaker = row.searchMaker || row.maker;
    const searchModel = row.searchModel || cleanModel;
    const query = `${searchMaker} ${searchModel} トナー`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: "toner_search",
      key: `${keyMaker(searchMaker)}-${searchModel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-toner`,
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
