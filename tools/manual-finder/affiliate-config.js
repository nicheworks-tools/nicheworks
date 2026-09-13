(() => {
  "use strict";

  const rows = [
    {
      offerId: "nikon_z8_search",
      maker: "Nikon",
      model: "Z8",
      category: "カメラ・映像",
      provider: "amazon",
      kind: "amazon_search",
      status: "verified",
      specialLink: "https://amzn.to/3T7sxbB",
      verifiedAt: "2026-09-13",
      labelJa: "Amazonで Nikon Z8 を探す",
      labelEn: "Find Nikon Z8 on Amazon"
    },
    ...[
      "MFC-J1500N",
      "MFC-J1605DN",
      "MFC-J4440N",
      "MFC-J4443N",
      "MFC-J4450N",
      "MFC-J4510N",
      "MFC-J4540N",
      "MFC-J4543N",
      "MFC-J4720N",
      "MFC-J4725N",
      "MFC-J6995CDW",
      "MFC-J6997CDW",
      "MFC-J6999CDW"
    ].map((model) => ({
      offerId: `brother_${model.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_search`,
      maker: "Brother",
      model,
      category: "プリンター・複合機",
      provider: "amazon",
      kind: "amazon_search",
      status: "pending_special_link",
      specialLink: "",
      verifiedAt: "",
      labelJa: `Amazonで Brother ${model} を探す`,
      labelEn: `Find Brother ${model} on Amazon`
    }))
  ].map((row) => Object.freeze(row));

  function isApprovedSpecialLink(row) {
    if (!row || row.status !== "verified" || !row.specialLink) return false;
    try {
      const url = new URL(row.specialLink);
      if (url.protocol !== "https:") return false;
      return ["amzn.to", "amazon.co.jp", "www.amazon.co.jp"].includes(url.hostname);
    } catch (_) {
      return false;
    }
  }

  const activeRows = rows.filter(isApprovedSpecialLink);
  const targets = Object.freeze(Object.fromEntries(activeRows.map((row) => [row.offerId, row.specialLink])));
  const offers = Object.freeze(activeRows.map((row) => Object.freeze({
    maker: row.maker,
    model: row.model,
    target: row.offerId,
    kind: row.kind,
    verifiedAt: row.verifiedAt,
    labelJa: row.labelJa,
    labelEn: row.labelEn
  })));

  window.MANUALFINDER_AFFILIATE_LEDGER = Object.freeze(rows);
  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    enabled: activeRows.length > 0,
    tool: "manual-finder",
    provider: "amazon",
    targets,
    offers
  });
})();
