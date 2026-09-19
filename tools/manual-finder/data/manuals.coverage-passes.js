(() => {
  "use strict";

  window.MANUALFINDER_COVERAGE_PASS_BATCHES = Object.freeze([
    "manuals.coverage-pass.sony-jp-alpha-e-mount.js",
    "manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js"
  ]);

  window.MANUALFINDER_BUILD_COVERAGE_PASSES = () => [
    ...(window.MANUALFINDER_COVERAGE_PASS_SONY_EMOUNT || []),
    ...(window.MANUALFINDER_COVERAGE_PASS_PANASONIC_LUMIX || [])
  ];
})();
