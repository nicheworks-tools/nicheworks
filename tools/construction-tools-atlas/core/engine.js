/* tools/construction-tools-atlas/core/engine.js
 * Construction Tools & Slang Atlas — Dictionary Core Engine (DOM-free)
 *
 * Rules:
 * - No DOM usage
 * - No external libraries
 * - Input/Output are plain JS objects/arrays
 *
 * Data schema (minimum expected fields):
 * {
 *   id: string,
 *   type: "tool" | "action" | "slang" | string,
 *   term: { ja: string, en: string },
 *   aliases?: { ja?: string[], en?: string[] },
 *   description?: { ja?: string, en?: string },
 *   categories?: string[],
 *   tasks?: string[],
 *   fuzzy?: string[],
 *   region?: string[],
 *   image?: string
 * }
 */

(function () {
  "use strict";

  /**
   * Normalize whitespace for safe comparisons.
   */
  function normalizeWhitespace(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  /**
   * Normalize a string for matching.
   * - Lowercase (for EN)
   * - Trim
   */
  function normalizeText(s) {
    return normalizeWhitespace(s).toLowerCase();
  }

  /**
   * Normalize a generic string (without lowercasing).
   */
  function normalizeString(value) {
    return normalizeWhitespace(typeof value === "string" ? value : "");
  }

  /**
   * Normalize an array of strings.
   */
  function normalizeStringArray(values) {
    if (!Array.isArray(values)) return [];
    return values
      .filter((v) => typeof v === "string")
      .map((v) => normalizeWhitespace(v))
      .filter((v) => v.length > 0);
  }

  /**
   * Normalize a raw entry object to the expected structure.
   * Returns null when required fields are missing.
   */
  function normalizeEntry(raw, source) {
    const data = raw && typeof raw === "object" ? raw : {};
    const term = data.term && typeof data.term === "object" ? data.term : {};
    const aliases = data.aliases && typeof data.aliases === "object" ? data.aliases : {};
    const description = data.description && typeof data.description === "object" ? data.description : {};

    const normalized = {
      id: normalizeString(data.id),
      term: {
        ja: normalizeString(term.ja),
        en: normalizeString(term.en),
      },
      category: normalizeString(data.category),
      categories: [],
      tags: normalizeStringArray(data.tags),
      aliases: {
        ja: normalizeStringArray(aliases.ja),
        en: normalizeStringArray(aliases.en),
      },
      description: undefined,
    };

    if (description.ja || description.en) {
      normalized.description = {
        ja: description.ja ? normalizeString(description.ja) : undefined,
        en: description.en !== undefined ? normalizeString(description.en) : undefined,
      };
    }

    if (normalized.category) {
      normalized.categories = [normalized.category];
    }

    if (!normalized.id || !normalized.term.ja || !normalized.category) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Entry skipped due to missing required fields", source || raw);
      }
      return null;
    }

    return normalized;
  }

  /**
   * Safe getter for language fields.
   */
  function getLangValue(obj, lang) {
    if (!obj) return "";
    const v = obj[lang];
    return v == null ? "" : String(v);
  }

  /**
   * Build a searchable text bucket for an entry in a given language.
   * Includes:
   * - term[lang]
   * - aliases[lang] (joined)
   * - fuzzy tokens (language-agnostic, treated as-is)
   */
  function buildSearchHaystack(entry, lang) {
    const parts = [];

    // term
    parts.push(getLangValue(entry.term, lang));

    // aliases
    if (entry.aliases && Array.isArray(entry.aliases[lang])) {
      parts.push(entry.aliases[lang].join(" "));
    }

    // fuzzy (language-agnostic list of tokens/phrases)
    if (Array.isArray(entry.fuzzy)) {
      parts.push(entry.fuzzy.join(" "));
    }

    // description
    if (entry.description) {
      const desc = getLangValue(entry.description, lang);
      const otherDesc = getLangValue(entry.description, lang === "ja" ? "en" : "ja");
      parts.push(desc, otherDesc);
    }

    // Also include the other language term/aliases lightly to support mixed queries
    // (e.g., user types "saw" while in JA mode)
    const otherLang = lang === "ja" ? "en" : "ja";
    parts.push(getLangValue(entry.term, otherLang));
    if (entry.aliases && Array.isArray(entry.aliases[otherLang])) {
      parts.push(entry.aliases[otherLang].join(" "));
    }

    return normalizeText(parts.filter(Boolean).join(" "));
  }

  /**
   * De-duplicate entries by id while preserving order.
   */
  function dedupeById(entries) {
    const seen = new Set();
    const out = [];
    for (const e of entries || []) {
      const id = e && e.id ? String(e.id) : "";
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(e);
    }
    return out;
  }

  /**
   * Ensure the input is an array of objects (entries).
   */
  function coerceEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.filter((e) => e && typeof e === "object");
  }

  /**
   * Search by free text query.
   * Matching:
   * - Partial match (includes)
   * - Case-insensitive (EN)
   * - Also allows mixed-language matching via haystack including both langs
   *
   * @param {string} query
   * @param {"ja"|"en"} lang
   * @param {Array} entries
   * @returns {Array}
   */
  function searchByText(query, lang, entries) {
    const list = coerceEntries(entries);
    const q = normalizeText(query);
    if (!q) return list;

    const results = [];
    for (const entry of list) {
      const hay = buildSearchHaystack(entry, lang);
      if (hay.includes(q)) results.push(entry);
    }
    return results;
  }

  /**
   * Build a lightweight search index to avoid recomputing haystacks.
   *
   * @param {Array} entries
   * @returns {Array<{ entry: any, haystack: { ja: string, en: string } }>}
   */
  function buildSearchIndex(entries) {
    return coerceEntries(entries).map((entry) => ({
      entry,
      haystack: {
        ja: buildSearchHaystack(entry, "ja"),
        en: buildSearchHaystack(entry, "en"),
      },
    }));
  }

  /**
   * Search using a precomputed index.
   *
   * @param {string} query
   * @param {"ja"|"en"} lang
   * @param {Array<{ entry: any, haystack: { ja: string, en: string } }>} index
   * @returns {Array}
   */
  function searchByTextWithIndex(query, lang, index) {
    const list = Array.isArray(index) ? index : [];
    const q = normalizeText(query);
    if (!q) return list.map((item) => item.entry);

    const results = [];
    for (const item of list) {
      const hay = item && item.haystack ? item.haystack[lang] : "";
      if (hay && hay.includes(q)) {
        results.push(item.entry);
      }
    }
    return results;
  }

  /**
   * Filter by category id.
   *
   * @param {string} categoryId
   * @param {"ja"|"en"} lang (kept for signature consistency; not used here)
   * @param {Array} entries
   * @returns {Array}
   */
  function filterByCategory(categoryId, lang, entries) {
    const list = coerceEntries(entries);
    const cid = String(categoryId || "").trim();
    if (!cid) return list;

    return list.filter((e) => {
      if (Array.isArray(e.categories)) return e.categories.includes(cid);
      if (typeof e.category === "string") return e.category === cid;
      return false;
    });
  }

  /**
   * Search by task id.
   *
   * @param {string} taskId
   * @param {"ja"|"en"} lang (kept for signature consistency; not used here)
   * @param {Array} entries
   * @returns {Array}
   */
  function searchByTask(taskId, lang, entries) {
    const list = coerceEntries(entries);
    const tid = String(taskId || "").trim();
    if (!tid) return list;

    return list.filter((e) => Array.isArray(e.tasks) && e.tasks.includes(tid));
  }

  /**
   * Fuzzy search using tokens.
   * Strategy:
   * - Normalize input tokens
   * - For each entry, build haystack and count token hits
   * - Return entries with at least 1 hit, sorted by hit count desc
   *
   * @param {string[]} tokens
   * @param {"ja"|"en"} lang
   * @param {Array} entries
   * @returns {Array}
   */
  function searchByFuzzy(tokens, lang, entries) {
    const list = coerceEntries(entries);

    const toks = Array.isArray(tokens)
      ? tokens.map(normalizeText).filter(Boolean)
      : [];

    if (toks.length === 0) return [];

    const scored = [];
    for (const entry of list) {
      const hay = buildSearchHaystack(entry, lang);
      let score = 0;
      for (const t of toks) {
        if (hay.includes(t)) score += 1;
      }
      if (score > 0) scored.push({ entry, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return dedupeById(scored.map((s) => s.entry));
  }

  /**
   * Optional helper: tokenize a sentence for fuzzy search.
   * Splits by whitespace and common punctuation.
   *
   * @param {string} text
   * @returns {string[]}
   */
  function tokenize(text) {
    const raw = String(text || "")
      .replace(/[.,/#!$%^&*;:{}=\-_`~()［］【】「」『』（）]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) return [];
    return raw.split(" ").filter(Boolean);
  }

  // Export (UMD-like)
  const api = {
    normalizeWhitespace,
    normalizeString,
    normalizeStringArray,
    normalizeEntry,
    getLangValue,
    buildSearchIndex,
    searchByText,
    searchByTextWithIndex,
    filterByCategory,
    searchByTask,
    searchByFuzzy,
    tokenize,
  };

  // Browser global
  if (typeof window !== "undefined") {
    window.AtlasEngine = api;
  }

  // CommonJS (optional)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
