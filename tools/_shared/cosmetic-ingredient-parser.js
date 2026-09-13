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

  function normalizeBaseKey(value = "") {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/[()（）［］\[\]{}【】]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ",")
      .trim();
  }

  const ALIAS_EQUIVALENTS = Object.freeze({
    "精製水": "water",
    "グリセロール": "glycerin",
    "1,3-ブチレングリコール": "butylene glycol",
    "塩化ナトリウム": "sodium chloride",
    "クエン酸ナトリウム": "sodium citrate",
    "水酸化ナトリウム": "sodium hydroxide",
    "水酸化ナトリウム液": "sodium hydroxide",
    "エデト酸2ナトリウム": "disodium edta",
    "エデト酸二ナトリウム": "disodium edta",
    "ニコチン酸アミド": "niacinamide",
    "ヒアルロン酸ナトリウム": "sodium hyaluronate",
    "ヒアルロン酸ソーダ": "sodium hyaluronate",
    "乳酸ナトリウム": "sodium lactate",
    "ポリアクリル酸ナトリウム": "sodium polyacrylate",
    "ラウレス硫酸ナトリウム": "sodium laureth sulfate",
    "安息香酸ナトリウム": "sodium benzoate",
    "ソルビン酸カリウム": "potassium sorbate",
    "水酸化カリウム": "potassium hydroxide",
    "水酸化カリウム液a": "potassium hydroxide",
    "リン酸ナトリウム": "sodium phosphate",
    "リン酸二ナトリウム": "disodium phosphate",
    "pcaナトリウム": "sodium pca",
    "pg": "propylene glycol",
    "グリセリルエチルヘキシルエーテル": "ethylhexylglycerin",
    "ヤシ油脂肪酸アシルグルタミン酸na": "sodium cocoyl glutamate",
    "シュガースクワラン": "squalane",
    "alcohol denat": "alcohol denat."
  });

  const CANONICAL_EQUIVALENTS = Object.freeze({
    "bemotrizinol": "bis-ethylhexyloxyphenol methoxyphenyl triazine",
    "bisoctrizole": "methylene bis-benzotriazolyl tetramethylbutylphenol",
    "ci 77891": "titanium dioxide",
    "ci 77019": "mica"
  });

  const AMBIGUOUS_EXACT_KEYS = Object.freeze([
    "aha",
    "bha",
    "pha",
    "iron oxides",
    "酸化鉄"
  ]);
  const ambiguousExactKeySet = new Set(AMBIGUOUS_EXACT_KEYS);

  function canonicalIdentityKey(value = "") {
    const base = normalizeBaseKey(value);
    if (!base) return "";
    return CANONICAL_EQUIVALENTS[base] || base;
  }

  function normalizeKey(value = "") {
    const base = normalizeBaseKey(value);
    if (!base || ambiguousExactKeySet.has(base)) return "";
    const aliasEquivalent = ALIAS_EQUIVALENTS[base] || base;
    if (ambiguousExactKeySet.has(aliasEquivalent)) return "";
    return canonicalIdentityKey(aliasEquivalent);
  }

  function isAmbiguousExactName(value = "") {
    return ambiguousExactKeySet.has(normalizeBaseKey(value));
  }

  function mergeNameLists(...lists) {
    const output = [];
    const seen = new Set();
    for (const list of lists) {
      for (const value of Array.isArray(list) ? list : []) {
        const text = normalizeText(value);
        const key = normalizeBaseKey(text);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        output.push(text);
      }
    }
    return output;
  }

  function mergeDictionaryRecords(items = []) {
    const byCanonical = new Map();
    const order = [];

    for (const raw of Array.isArray(items) ? items : []) {
      if (!raw || !raw.en) continue;
      const rawBaseKey = normalizeBaseKey(raw.en);
      const canonicalKey = canonicalIdentityKey(raw.en);
      if (!canonicalKey) continue;

      if (!byCanonical.has(canonicalKey)) {
        const first = {
          ...raw,
          jp: mergeNameLists(raw.jp),
          alias: mergeNameLists(raw.alias)
        };
        byCanonical.set(canonicalKey, first);
        order.push(canonicalKey);
        continue;
      }

      const current = byCanonical.get(canonicalKey);
      const currentBaseKey = normalizeBaseKey(current.en);
      const rawIsPreferredCanonical = rawBaseKey === canonicalKey && currentBaseKey !== canonicalKey;

      if (rawIsPreferredCanonical) {
        current.alias = mergeNameLists(current.alias, [current.en], raw.alias);
        current.en = raw.en;
        if (raw.category) current.category = raw.category;
        if (raw.note_short) current.note_short = raw.note_short;
        if (raw.safety) current.safety = raw.safety;
      } else {
        current.alias = mergeNameLists(current.alias, rawBaseKey !== currentBaseKey ? [raw.en] : [], raw.alias);
      }

      current.jp = mergeNameLists(current.jp, raw.jp);
      if (!current.category && raw.category) current.category = raw.category;
      if (!current.note_short && raw.note_short) current.note_short = raw.note_short;
      if (!current.safety && raw.safety) current.safety = raw.safety;
    }

    return order.map((key) => byCanonical.get(key));
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

    const protectedText = protectNumericLocantCommas(normalized);
    const parts = protectedText
      .split(/[\n,、，;；]+/)
      .map((item) => restoreNumericLocantCommas(normalizeText(item)))
      .filter(Boolean);

    if (!dedupe) return parts;

    const seen = new Set();
    const unique = [];
    for (const item of parts) {
      const key = normalizeKey(item) || `ambiguous:${normalizeBaseKey(item)}`;
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

  function bootstrapOptionalToolEnhancements() {
    const documentRef = root?.document;
    if (!documentRef) return;

    if (documentRef.getElementById("inciInput") && documentRef.getElementById("summaryBox")) {
      ensureStylesheet(documentRef, "/tools/cosmetic-ingredient-checker-lite/enhancements.css");
      loadScript(documentRef, "/tools/cosmetic-ingredient-checker-lite/enhancements.js")
        .catch((error) => console.warn("Lite enhancements unavailable", error));
    }

    if (documentRef.getElementById("fast-input") && documentRef.getElementById("ocr-file-fast")) {
      ensureStylesheet(documentRef, "/tools/inci-fastscan/enhancements.css");
      loadScript(documentRef, "/tools/inci-fastscan/enhancements.js")
        .catch((error) => console.warn("FastScan enhancements unavailable", error));
    }
  }

  const api = {
    version: "1.10.1",
    normalizeText,
    normalizeBaseKey,
    normalizeKey,
    canonicalIdentityKey,
    splitIngredients,
    isExactIngredientMatch,
    isAmbiguousExactName,
    mergeDictionaryRecords,
    aliasEquivalents: ALIAS_EQUIVALENTS,
    canonicalEquivalents: CANONICAL_EQUIVALENTS,
    ambiguousExactKeys: AMBIGUOUS_EXACT_KEYS
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.NWCosmeticIngredientParser = api;
  }

  bootstrapOptionalAffiliateRuntime();
  bootstrapOptionalToolEnhancements();
})(typeof globalThis !== "undefined" ? globalThis : this);
