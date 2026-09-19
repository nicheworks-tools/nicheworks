(() => {
  "use strict";

  window.MANUALFINDER_COVERAGE_PASS_BATCHES = Object.freeze([
    "manuals.coverage-pass.sony-jp-alpha-e-mount.js"
  ]);

  window.MANUALFINDER_BUILD_COVERAGE_PASSES = () => [
    ...(window.MANUALFINDER_COVERAGE_PASS_SONY_EMOUNT || [])
  ];
})();
