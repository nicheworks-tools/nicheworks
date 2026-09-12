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

  const api = {
    version: "1.1.0",
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
})(typeof globalThis !== "undefined" ? globalThis : this);
