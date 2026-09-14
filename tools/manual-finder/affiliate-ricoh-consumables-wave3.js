(() => {
  "use strict";

  if (window.MANUALFINDER_RICOH_CONSUMABLES_WAVE3_LEDGER) return;

  const base = window.MANUALFINDER_AFFILIATE_CONFIG;
  if (!base || !base.consumableSearchTemplate) return;

  const toner = (model, sourceUrl, tonerCodes) => Object.freeze({
    maker: "RICOH",
    searchMaker: "RICOH",
    searchModel: model.replace(/^RICOH /, ""),
    model,
    kind: "toner_search",
    verifiedAt: "2026-09-15",
    sourceUrl,
    verifiedCodes: Object.freeze(tonerCodes)
  });

  const ink = (model, sourceUrl, inkCodes) => Object.freeze({
    maker: "RICOH",
    searchMaker: "RICOH",
    searchModel: model.replace(/^RICOH /, ""),
    model,
    kind: "ink_search",
    verifiedAt: "2026-09-15",
    sourceUrl,
    verifiedCodes: Object.freeze(inkCodes)
  });

  const monoNew = "https://www.ricoh.co.jp/products/list/ricoh-im-7010-6010-4510-3510-2510/maintenance";
  const monoEarlier = "https://www.ricoh.co.jp/products/list/ricoh-im-6000-5000-4000-3500-2500/maintenance";
  const monoCompact = "https://www.ricoh.co.jp/products/list/ricoh-im-460f-370f/maintenance";
  const monoHighSpeed = "https://www.ricoh.co.jp/products/list/ricoh-im-9000-8000-7000/maintenance";
  const colorSd = "https://www.ricoh.co.jp/products/list/ricoh-im-c6010sd-c4510sd-c3010sd/maintenance";
  const colorC431 = "https://www.ricoh.co.jp/products/list/ricoh-im-c431/maintenance";
  const colorCe = "https://www.ricoh.co.jp/products/list/ricoh-im-c6000f-ce-c4500f-ce-c3000f-ce-c2500f-ce/maintenance";
  const wideInk = "https://www.ricoh.co.jp/products/list/ricoh-im-cw2200-cw1200/supply";
  const wideMono = "https://www.ricoh.co.jp/products/list/ricoh-mp-w8140-w7100/supply";
  const wideMono6700 = "https://www.ricoh.co.jp/products/list/ricoh-mp-w6700-sp/supply";

  const c6010 = Object.freeze([
    "RICOH トナー ブラック IM C6010",
    "RICOH トナー イエロー IM C6010",
    "RICOH トナー マゼンタ IM C6010",
    "RICOH トナー シアン IM C6010"
  ]);
  const c3510 = Object.freeze([
    "RICOH トナー ブラック IM C3510",
    "RICOH トナー イエロー IM C3510",
    "RICOH トナー マゼンタ IM C3510",
    "RICOH トナー シアン IM C3510"
  ]);
  const c300 = Object.freeze([
    "RICOH トナー ブラック IM C300",
    "RICOH トナー イエロー IM C300",
    "RICOH トナー マゼンタ IM C300",
    "RICOH トナー シアン IM C300"
  ]);
  const c6003 = Object.freeze([
    "RICOH MP トナー ブラック C6003",
    "RICOH MP トナー イエロー C6003",
    "RICOH MP トナー マゼンタ C6003",
    "RICOH MP トナー シアン C6003"
  ]);
  const c3503 = Object.freeze([
    "RICOH MP トナー ブラック C3503",
    "RICOH MP トナー イエロー C3503",
    "RICOH MP トナー マゼンタ C3503",
    "RICOH MP トナー シアン C3503"
  ]);
  const c2503 = Object.freeze([
    "RICOH MP トナー ブラック C2503",
    "RICOH MP トナー イエロー C2503",
    "RICOH MP トナー マゼンタ C2503",
    "RICOH MP トナー シアン C2503"
  ]);
  const cw2200 = Object.freeze([
    "RICOH MP カートリッジ ブラック CW2200",
    "RICOH MP カートリッジ シアン CW2200",
    "RICOH MP カートリッジ マゼンタ CW2200",
    "RICOH MP カートリッジ イエロー CW2200"
  ]);

  const rows = Object.freeze([
    toner("RICOH IM 7010", monoNew, ["RICOH トナー ブラック IM 6010"]),
    toner("RICOH IM 6010", monoNew, ["RICOH トナー ブラック IM 6010"]),
    toner("RICOH IM 4510", monoNew, ["RICOH トナー ブラック IM 6010"]),
    toner("RICOH IM 3510", monoNew, ["RICOH トナー ブラック IM 3510"]),
    toner("RICOH IM 2510", monoNew, ["RICOH トナー ブラック IM 3510"]),

    toner("RICOH IM 6000", monoEarlier, ["RICOH MP Pトナー ブラック 6054"]),
    toner("RICOH IM 5000", monoEarlier, ["RICOH MP Pトナー ブラック 6054"]),
    toner("RICOH IM 4000", monoEarlier, ["RICOH MP Pトナー ブラック 6054"]),
    toner("RICOH IM 3500", monoEarlier, ["RICOH MP Pトナー ブラック 3554"]),
    toner("RICOH IM 2500", monoEarlier, ["RICOH MP Pトナー ブラック 3554"]),

    toner("RICOH IM 460F", monoCompact, ["RICOH P トナー IM 460"]),
    toner("RICOH IM 370F", monoCompact, ["RICOH トナーキット IM 370"]),

    toner("RICOH IM 9000", monoHighSpeed, ["imagio Pトナータイプ7"]),
    toner("RICOH IM 8000", monoHighSpeed, ["imagio Pトナータイプ7"]),
    toner("RICOH IM 7000", monoHighSpeed, ["imagio Pトナータイプ7"]),

    toner("RICOH IM C6010SD", colorSd, c6010),
    toner("RICOH IM C4510SD", colorSd, c6010),
    toner("RICOH IM C3010SD", colorSd, c3510),
    toner("RICOH IM C431", colorC431, c300),

    toner("RICOH IM C6000F CE", colorCe, c6003),
    toner("RICOH IM C4500F CE", colorCe, c6003),
    toner("RICOH IM C3000F CE", colorCe, c3503),
    toner("RICOH IM C2500F CE", colorCe, c2503),

    ink("RICOH IM CW2200", wideInk, cw2200),
    ink("RICOH IM CW1200", wideInk, cw2200),

    toner("RICOH MP W8140", wideMono, ["imagio トナー タイプ19W ブラック"]),
    toner("RICOH MP W7100", wideMono, ["imagio トナー タイプ19W ブラック"]),
    toner("RICOH MP W6700 SP", wideMono6700, ["imagio トナー タイプ19W ブラック"])
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
    if (category !== "プリンター・複合機" || cleanMaker !== "RICOH" || !cleanModel) return [];

    const row = rows.find((item) => item.model === cleanModel);
    if (!row) return [];

    const suffixJa = row.kind === "ink_search" ? "インク" : "トナー";
    const suffixEn = row.kind === "ink_search" ? "ink" : "toner";
    const query = `${row.searchMaker} ${row.searchModel} ${suffixJa}`;
    return [Object.freeze({
      target: base.consumableSearchTemplate.activationTarget,
      kind: row.kind,
      key: `ricoh-${keyModel(row.searchModel)}-${suffixEn}`,
      query,
      url: buildTaggedSearchUrl(query),
      labelJa: `Amazonで ${cleanModel} 用${suffixJa}を探す`,
      labelEn: `Find ${suffixEn} for ${cleanModel} on Amazon`,
      sourceUrl: row.sourceUrl,
      verifiedAt: row.verifiedAt,
      verifiedCodes: row.verifiedCodes
    })];
  }

  const previousGet = typeof base.getConsumableOffers === "function"
    ? base.getConsumableOffers.bind(base)
    : () => [];
  const previousOfficeRows = Array.isArray(base.officePrinterConsumables)
    ? base.officePrinterConsumables
    : [];

  window.MANUALFINDER_RICOH_CONSUMABLES_WAVE3_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getWave3Offers(args)];
    }
  });
})();
