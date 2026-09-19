(() => {
  "use strict";

  window.MANUALFINDER_COVERAGE_PASS_BATCHES = Object.freeze([
    "manuals.coverage-pass.sony-jp-alpha-e-mount.js",
    "manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js",
    "manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js",
    "manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js"
  ]);

  window.MANUALFINDER_BUILD_COVERAGE_PASSES = () => [
    ...(window.MANUALFINDER_COVERAGE_PASS_SONY_EMOUNT || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_PANASONIC_LUMIX || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_APPLE_IPHONE || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_FUJIFILM_GFX_X || [])
  ];
})();
