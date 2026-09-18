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
      verifiedAt: "2026-09-18"
    })
  ]);
})();
