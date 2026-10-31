(() => {
  "use strict";

  window.MANUALFINDER_COVERAGE_PASS_BATCHES = Object.freeze([
    "manuals.coverage-pass.sony-jp-alpha-e-mount.js",
    "manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js",
    "manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js",
    "manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js",
    "manuals.coverage-pass.vaio-jp-pc-start-guide.js",
    "manuals.coverage-pass.samsung-jp-galaxy-smartphones.js",
    "manuals.coverage-pass.dynabook-jp-2024-2026.js",
    "manuals.coverage-pass.fujitsu-lifebook-u.js",
    "manuals.coverage-pass.google-pixel-jp.js",
    "manuals.coverage-pass.motorola-jp-lineup.js"
  ]);

  window.MANUALFINDER_BUILD_COVERAGE_PASSES = () => [
    ...(window.MANUALFINDER_COVERAGE_PASS_SONY_EMOUNT || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_PANASONIC_LUMIX || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_APPLE_IPHONE || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_FUJIFILM_GFX_X || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_VAIO_JP || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_SAMSUNG_JP_GALAXY || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_DYNABOOK_JP || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_FUJITSU_LIFEBOOK_U || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_GOOGLE_PIXEL_JP || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_MOTOROLA_JP || [])
  ];
})();
