(() => {
  "use strict";

  // Reviewed camera records that intentionally do not receive an accessory-detail handoff.
  // These rows have built-in batteries and no model-specific replaceable battery/charger
  // accessory was established at the evidence standard used by the camera-detail audit.
  window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS = Object.freeze([
    Object.freeze({
      maker: "DJI",
      model: "DJI Goggles 3",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/goggles-3",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Goggles Integra",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/goggles-integra",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Goggles N3",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/goggles-n3",
      verifiedAt: "2026-09-18"    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RS 3 Mini",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://repair.dji.com/help/content?customId=01700007783&lang=en&paperDocType=ARTICLE&re=US&spaceId=17",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RS 4 Mini",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://repair.dji.com/help/content?customId=01700007783&lang=en&paperDocType=ARTICLE&re=US&spaceId=17",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RSC 2",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://repair.dji.com/help/content?customId=01700007783&lang=en&paperDocType=ARTICLE&re=US&spaceId=17",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI OM 4",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/om-4",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI OM 4 SE",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/om-4-se",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI OM 5",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/om-5",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile 2",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-2",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile 3",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-3",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile 6",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-6",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile 7 Series",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-7-series",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile 8",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-8",
      verifiedAt: "2026-09-18"
    }),
    Object.freeze({
      maker: "DJI",
      model: "Osmo Mobile SE",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/osmo-mobile-se",
      verifiedAt: "2026-09-18"
    })
  ]);
})();
