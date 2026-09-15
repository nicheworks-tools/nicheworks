(() => {
  "use strict";

  if (window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS) return;

  const serviceSource = "https://www.oki.com/jp/printing/services-and-solutions/valueservice/index.html";
  const row = (model, supportUrl) => Object.freeze({
    maker: "OKI",
    model,
    category: "プリンター・複合機",
    reason: "service_managed_consumables",
    verifiedAt: "2026-09-16",
    sourceUrl: serviceSource,
    supportUrl
  });

  window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS = Object.freeze([
    row("MC883dnwvバリューSタイプ", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-S/"),
    row("MC883dnwvバリューMタイプ", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-M/"),
    row("MC883dnwvバリューLタイプ", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-L/"),
    row("MC883dnwvバリューXLタイプ", "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-XL/")
  ]);
})();
