(function attachCosmeticIngredientParser(root) {
  "use strict";

  const LOCANT_COMMA = "\uE000";

  function normalizeText(value = "") {
    return String(value)
      .normalize("NFKC")
      .replace(/\r/g, "\n")
      .replace(/[\t\u3000]+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .trim();
  }

  function normalizeKey(value = "") {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/[()（）［］\[\]{}【】]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ",")
      .trim();
  }

  function protectNumericLocantCommas(value) {
    return String(value).replace(/(\d),(?=\d)/g, `$1${LOCANT_COMMA}`);
  }

  function restoreNumericLocantCommas(value) {
    return String(value).replaceAll(LOCANT_COMMA, ",");
  }

  function splitIngredients(value = "", options = {}) {
    const dedupe = Boolean(options.dedupe);
    const normalized = normalizeText(value);
    if (!normalized) return [];

    // Ingredient names can legitimately contain '/', '・', and numeric locant
    // commas such as 1,2-Hexanediol. Preserve those while splitting explicit
    // list punctuation and line breaks.
    const protectedText = protectNumericLocantCommas(normalized);
    const parts = protectedText
      .split(/[\n,、，;；]+/)
      .map((item) => restoreNumericLocantCommas(normalizeText(item)))
      .filter(Boolean);

    if (!dedupe) return parts;

    const seen = new Set();
    const unique = [];
    for (const item of parts) {
      const key = normalizeKey(item);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }
    return unique;
  }

  function isExactIngredientMatch(value, candidate) {
    const valueKey = normalizeKey(value);
    const candidateKey = normalizeKey(candidate);
    return Boolean(valueKey && candidateKey && valueKey === candidateKey);
  }

  function ensureStylesheet(documentRef, href) {
    if (documentRef.querySelector(`link[href="${href}"]`)) return;
    const link = documentRef.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    documentRef.head.appendChild(link);
  }

  function loadScript(documentRef, src) {
    return new Promise((resolve, reject) => {
      const existing = documentRef.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.nwLoaded === "true") resolve();
        else existing.addEventListener("load", resolve, { once: true });
        return;
      }

      const script = documentRef.createElement("script");
      script.src = src;
      script.async = true;
      script.addEventListener("load", () => {
        script.dataset.nwLoaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", reject, { once: true });
      documentRef.head.appendChild(script);
    });
  }

  function bootstrapOptionalAffiliateRuntime() {
    const documentRef = root?.document;
    if (!documentRef || !documentRef.getElementById("amazonAffiliateSlot")) return;

    ensureStylesheet(documentRef, "/tools/_shared/cosmetics-affiliate-slot.css");
    loadScript(documentRef, "/tools/_shared/cosmetics-affiliate-config.js")
      .then(() => loadScript(documentRef, "/tools/_shared/cosmetics-affiliate-slot.js"))
      .catch((error) => console.warn("Optional affiliate runtime unavailable", error));
  }

  const api = {
    version: "1.2.0",
    normalizeText,
    normalizeKey,
    splitIngredients,
    isExactIngredientMatch
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.NWCosmeticIngredientParser = api;
  }

  bootstrapOptionalAffiliateRuntime();
})(typeof globalThis !== "undefined" ? globalThis : this);
