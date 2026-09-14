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

  const rows = Object.freeze([
    row("C301dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C301DN/", [
      "TNR-C4JK1", "TNR-C4JY1", "TNR-C4JM1", "TNR-C4JC1"
    ]),
    row("C310dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C310DN/", [
      "TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3",
      "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1"
    ]),
    row("C312dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C312DN/", [
      "TNR-C4KK3", "TNR-C4KY3", "TNR-C4KM3", "TNR-C4KC3",
      "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1"
    ]),
    row("C332dnw", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C332DNW/", [
      "TC-C4AK1", "TC-C4AY1", "TC-C4AM1", "TC-C4AC1",
      "TC-C4AK2", "TC-C4AY2", "TC-C4AM2", "TC-C4AC2"
    ]),
    row("C510dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C510DN/", [
      "TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3",
      "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1",
      "TNR-C4HK2", "TNR-C4HY2", "TNR-C4HM2", "TNR-C4HC2"
    ]),
    row("C511dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C511DN/", [
      "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1",
      "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"
    ]),
    row("C530dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C530DN/", [
      "TNR-C4HK3", "TNR-C4HY3", "TNR-C4HM3", "TNR-C4HC3",
      "TNR-C4HK1", "TNR-C4HY1", "TNR-C4HM1", "TNR-C4HC1",
      "TNR-C4HK2", "TNR-C4HY2", "TNR-C4HM2", "TNR-C4HC2"
    ]),
    row("C531dn", "https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C531DN/", [
      "TNR-C4KK1", "TNR-C4KY1", "TNR-C4KM1", "TNR-C4KC1",
      "TNR-C4KK2", "TNR-C4KY2", "TNR-C4KM2", "TNR-C4KC2"
    ])
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

  function getWave2Offers({ maker, model, category } = {}) {
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

  window.MANUALFINDER_OKI_TONER_WAVE2_LEDGER = rows;
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    ...base,
    printerConsumables: Object.freeze([...(base.printerConsumables || []), ...rows]),
    officePrinterConsumables: Object.freeze([...previousOfficeRows, ...rows]),
    getConsumableOffers(args = {}) {
      return [...previousGet(args), ...getWave2Offers(args)];
    }
  });
})();
