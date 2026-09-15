(() => {
  "use strict";

  if (window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS) return;

  const row = ({ maker, model, reason, sourceUrl, supportUrl }) => Object.freeze({
    maker,
    model,
    category: "プリンター・複合機",
    reason,
    verifiedAt: "2026-09-16",
    sourceUrl,
    supportUrl
  });

  const okiServiceSource = "https://www.oki.com/jp/printing/services-and-solutions/valueservice/index.html";
  const kyocera2531Source = "https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_2531/option.html";
  const kyocera4031Source = "https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_4031/option.html";
  const kyoceraManualSource = "https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m_html/km_2531_3531_4031.html";

  window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS = Object.freeze([
    row({
      maker: "OKI",
      model: "MC883dnwvバリューSタイプ",
      reason: "service_managed_consumables",
      sourceUrl: okiServiceSource,
      supportUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-S/"
    }),
    row({
      maker: "OKI",
      model: "MC883dnwvバリューMタイプ",
      reason: "service_managed_consumables",
      sourceUrl: okiServiceSource,
      supportUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-M/"
    }),
    row({
      maker: "OKI",
      model: "MC883dnwvバリューLタイプ",
      reason: "service_managed_consumables",
      sourceUrl: okiServiceSource,
      supportUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-L/"
    }),
    row({
      maker: "OKI",
      model: "MC883dnwvバリューXLタイプ",
      reason: "service_managed_consumables",
      sourceUrl: okiServiceSource,
      supportUrl: "https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-XL/"
    }),
    row({
      maker: "KYOCERA Document Solutions",
      model: "KM-2531",
      reason: "service_managed_consumables",
      sourceUrl: kyocera2531Source,
      supportUrl: kyoceraManualSource
    }),
    row({
      maker: "KYOCERA Document Solutions",
      model: "KM-3531",
      reason: "service_managed_consumables",
      sourceUrl: kyocera2531Source,
      supportUrl: kyoceraManualSource
    }),
    row({
      maker: "KYOCERA Document Solutions",
      model: "KM-4031",
      reason: "service_managed_consumables",
      sourceUrl: kyocera4031Source,
      supportUrl: kyoceraManualSource
    })
  ]);
})();
