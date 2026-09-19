(() => {
  "use strict";

  // Reviewed camera records that intentionally do not receive an accessory-detail handoff.
  // These rows have built-in/nonremovable batteries or rechargeable controller power
  // with no model-specific replaceable battery/charger accessory established at the
  // evidence standard used by the camera-detail audit.
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
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/rc",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC 2",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/rc-2",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC Motion 2",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/rc-motion-2",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC Motion 3",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/rc-motion-3",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC Pro",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/rc-pro",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI RC-N3 Remote Controller",
      category: "カメラ・映像",
      reason: "rechargeable_controller_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://store.dji.com/product/dji-rc-n3-remote-controller",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Digital FPV System",
      category: "カメラ・映像",
      reason: "multi_component_system_no_single_model_specific_power_handoff",
      sourceUrl: "https://www.dji.com/support/product/fpv",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Goggles",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/dji-goggles",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI Goggles RE",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://www.dji.com/support/product/dji-goggles-re",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI O3 Air Unit",
      category: "カメラ・映像",
      reason: "externally_powered_component_no_model_specific_battery_or_charger",
      sourceUrl: "https://www.dji.com/support/product/o3-air-unit",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "DJI",
      model: "DJI O4 Air Unit Series",
      category: "カメラ・映像",
      reason: "externally_powered_component_no_model_specific_battery_or_charger",
      sourceUrl: "https://www.dji.com/support/product/o4-air-unit",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO11 Black Mini",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/ja/jp/shop/cameras/hero11-black-mini/CHDHF-111-master.html",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO7 Silver",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/hero7-silver/manuals/HERO7Silver_UM_ENG_REVA.pdf",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO7 White",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/hero7-white/manuals/HERO7White_UM_ENG_REVB.pdf",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO5 Session",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/hero5-session/manuals/HERO5Session_UM_ENG_REVD_WEB.pdf",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO Session",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/hero-session/manuals/UM_HEROSession_ENG_REVC_Web.pdf",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO+",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/heroplus/manuals/UM_HEROPlus_ENG_REVA_WEB.pdf",
      verifiedAt: "2026-09-19"
    }),
    Object.freeze({
      maker: "GoPro",
      model: "HERO+ LCD",
      category: "カメラ・映像",
      reason: "built_in_battery_no_model_specific_replaceable_power_accessory",
      sourceUrl: "https://gopro.com/content/dam/help/heroplus-lcd/manuals/UM_HEROPlusLCD_ENG_REVB_WEB.pdf",
      verifiedAt: "2026-09-19"
    })
  ]);
})();
