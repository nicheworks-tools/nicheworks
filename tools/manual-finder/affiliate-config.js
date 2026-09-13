(() => {
  "use strict";

  window.MANUALFINDER_AFFILIATE_CONFIG = Object.freeze({
    enabled: true,
    tool: "manual-finder",
    provider: "amazon",
    targets: Object.freeze({
      nikon_z8_search: "https://amzn.to/3T7sxbB"
    }),
    offers: Object.freeze([
      Object.freeze({
        maker: "Nikon",
        model: "Z8",
        target: "nikon_z8_search",
        kind: "amazon_search",
        verifiedAt: "2026-09-13",
        labelJa: "Amazonで Nikon Z8 を探す",
        labelEn: "Find Nikon Z8 on Amazon"
      })
    ])
  });
})();
