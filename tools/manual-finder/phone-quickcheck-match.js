(() => {
  "use strict";
  // Exact canonical models derived from Phone QuickCheck phones.json; never infer a carrier SKU.
  const models = Object.freeze({
    Apple: Object.freeze(["iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 12 mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 13 mini","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 16e","iPhone 17","iPhone 17 Pro","iPhone 17 Pro Max","iPhone 17e","iPhone 18 Pro","iPhone 18 Pro Max","iPhone Air","iPhone Duo","iPhone SE (2nd generation)","iPhone SE (3rd generation)","iPhone XR","iPhone XS","iPhone XS Max"]),
    Google: Object.freeze(["Pixel 10","Pixel 10 Pro","Pixel 10 Pro Fold","Pixel 10 Pro XL","Pixel 10a","Pixel 11","Pixel 11 Pro","Pixel 11 Pro Fold","Pixel 11 Pro XL","Pixel 4a","Pixel 4a (5G)","Pixel 5","Pixel 5a (5G)","Pixel 6","Pixel 6 Pro","Pixel 6a","Pixel 7","Pixel 7 Pro","Pixel 7a","Pixel 8","Pixel 8 Pro","Pixel 8a","Pixel 9","Pixel 9 Pro","Pixel 9 Pro Fold","Pixel 9 Pro XL","Pixel 9a","Pixel Fold"])
  });
  const allowed = { Apple: new Set(models.Apple), Google: new Set(models.Google) };
  function linkFor(maker, model) {
    const makerText = String(maker || "").trim();
    const brand = makerText === "Apple" ? "Apple" : makerText === "Google Pixel" ? "Google" : "";
    if (!brand || typeof model !== "string") return null;
    const canonical = brand === "Google" ? model.trim().replace(/^Google\s+(?=Pixel\b)/, "") : model.trim();
    if (!allowed[brand].has(canonical)) return null;
    return "/tools/phone-quickcheck/?model=" + encodeURIComponent(canonical);
  }
  window.MANUALFINDER_QC = Object.freeze({ models, linkFor });
})();
