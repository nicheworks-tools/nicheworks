(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.CTA_SEMANTIC_SEARCH = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function foldKana(value) {
    return String(value || "").replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
  }

  function normalizeText(value) {
    return foldKana(String(value || "").normalize("NFKC"))
      .toLowerCase()
      .replace(/[‐‑‒–—―−]/g, "-")
      .replace(/[／]/g, "/")
      .replace(/[、。，,.!?！？()（）\[\]{}「」『』]/g, " ")
      .replace(/[\s\u3000]+/g, " ")
      .trim();
  }

  function toArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  function tokenize(query) {
    const normalized = normalizeText(query);
    if (!normalized) return [];
    return normalized.split(/\s+/).filter(Boolean);
  }

  function entryHay(entry) {
    return normalizeText([
      entry?.id,
      entry?.type,
      entry?.term?.ja,
      entry?.term?.en,
      entry?.description?.ja,
      entry?.description?.en,
      entry?.summary?.ja,
      entry?.summary?.en,
      entry?.detail?.ja,
      entry?.detail?.en,
      ...toArray(entry?.aliases?.ja),
      ...toArray(entry?.aliases?.en),
      ...toArray(entry?.categories),
      ...toArray(entry?.tasks),
      ...toArray(entry?.fuzzy),
      ...toArray(entry?.region),
    ].filter(Boolean).join("\n"));
  }

  function scoreField(value, part, exact, starts, includes) {
    const normalized = normalizeText(value);
    if (!normalized || !part) return 0;
    if (normalized === part) return exact;
    if (normalized.startsWith(part)) return starts;
    if (normalized.includes(part)) return includes;
    return 0;
  }

  function normalizeSignal(raw) {
    return {
      id: String(raw?.id || "").trim(),
      label: {
        ja: String(raw?.label?.ja || raw?.id || "").trim(),
        en: String(raw?.label?.en || raw?.id || "").trim(),
      },
      cues: toArray(raw?.cues),
      boost_terms: toArray(raw?.boost_terms),
      entry_ids: toArray(raw?.entry_ids),
      weight: Number(raw?.weight) || 420,
      id_weight: Number(raw?.id_weight) || 900,
    };
  }

  function normalizeCombination(raw) {
    const boosts = {};
    if (raw?.entry_boosts && typeof raw.entry_boosts === "object") {
      Object.entries(raw.entry_boosts).forEach(([id, value]) => {
        const score = Number(value);
        if (id && Number.isFinite(score) && score > 0) boosts[id] = score;
      });
    }
    return {
      id: String(raw?.id || "").trim(),
      all_signals: toArray(raw?.all_signals),
      entry_boosts: boosts,
    };
  }

  function createEngine(dictionary) {
    const signals = Array.isArray(dictionary?.signals)
      ? dictionary.signals.map(normalizeSignal).filter((signal) => signal.id)
      : [];
    const combinations = Array.isArray(dictionary?.combinations)
      ? dictionary.combinations.map(normalizeCombination).filter((combo) => combo.id && combo.all_signals.length)
      : [];

    function interpret(query, ignoredIds) {
      const normalized = normalizeText(query);
      const ignored = ignoredIds instanceof Set ? ignoredIds : new Set(toArray(ignoredIds));
      if (!normalized) return [];
      return signals.filter((signal) => {
        if (ignored.has(signal.id)) return false;
        return signal.cues.some((cue) => {
          const normalizedCue = normalizeText(cue);
          return normalizedCue && normalized.includes(normalizedCue);
        });
      });
    }

    function semanticMatch(signal, entry) {
      const hay = entryHay(entry);
      const id = String(entry?.id || "");
      if (signal.entry_ids.includes(id)) return { score: signal.id_weight, reason: "entry_id" };
      const matchedTerm = signal.boost_terms.find((term) => {
        const normalizedTerm = normalizeText(term);
        return normalizedTerm && hay.includes(normalizedTerm);
      });
      return matchedTerm ? { score: signal.weight, reason: matchedTerm } : { score: 0, reason: "" };
    }

    function combinationBoost(entry, interpretedSignals) {
      const active = new Set((interpretedSignals || []).map((signal) => signal.id));
      let score = 0;
      const id = String(entry?.id || "");
      for (const combo of combinations) {
        if (!combo.all_signals.every((signalId) => active.has(signalId))) continue;
        score += combo.entry_boosts[id] || 0;
      }
      return score;
    }

    function scoreEntry(entry, query, interpretedSignals) {
      const parts = tokenize(query);
      const fullQuery = normalizeText(query);
      if (!fullQuery) return 0;

      let score = 0;
      const termFields = [entry?.term?.ja, entry?.term?.en];
      const aliasFields = [...toArray(entry?.aliases?.ja), ...toArray(entry?.aliases?.en)];
      const taxonomyFields = [entry?.type, ...toArray(entry?.categories), ...toArray(entry?.tasks)];
      const fuzzyFields = [...toArray(entry?.fuzzy), ...toArray(entry?.region)];
      const bodyFields = [entry?.summary?.ja, entry?.summary?.en, entry?.description?.ja, entry?.description?.en, entry?.detail?.ja, entry?.detail?.en];

      termFields.forEach((field) => { if (normalizeText(field) === fullQuery) score += 5000; });
      aliasFields.forEach((field) => { if (normalizeText(field) === fullQuery) score += 4200; });
      termFields.forEach((field) => { if (fullQuery && normalizeText(field).includes(fullQuery)) score += 1800; });
      aliasFields.forEach((field) => { if (fullQuery && normalizeText(field).includes(fullQuery)) score += 1400; });

      parts.forEach((part) => {
        termFields.forEach((field) => { score += scoreField(field, part, 1200, 950, 750); });
        aliasFields.forEach((field) => { score += scoreField(field, part, 1000, 800, 620); });
        taxonomyFields.forEach((field) => { score += scoreField(field, part, 420, 320, 240); });
        fuzzyFields.forEach((field) => { score += scoreField(field, part, 320, 240, 180); });
        bodyFields.forEach((field) => { score += scoreField(field, part, 120, 80, 45); });
        score += scoreField(entry?.id, part, 80, 60, 30);
      });

      for (const signal of interpretedSignals || []) score += semanticMatch(signal, entry).score;
      score += combinationBoost(entry, interpretedSignals);
      return score;
    }

    function reasonsFor(entry, interpretedSignals) {
      const reasons = (interpretedSignals || []).map((signal) => {
        const match = semanticMatch(signal, entry);
        return match.score > 0 ? { id: signal.id, label: signal.label, reason: match.reason, score: match.score } : null;
      }).filter(Boolean);
      const comboScore = combinationBoost(entry, interpretedSignals);
      if (comboScore > 0) reasons.push({ id: "semantic-combination", label: { ja: "複合条件", en: "Combined intent" }, reason: "combination", score: comboScore });
      return reasons;
    }

    function confidence(rankedScores) {
      const scores = Array.isArray(rankedScores) ? rankedScores.filter((value) => Number.isFinite(value)) : [];
      const top = scores[0] || 0;
      const second = scores[1] || 0;
      const margin = top - second;
      if (top < 45) return "low";
      if (top >= 1000 && margin >= 250) return "high";
      if (top >= 350) return "medium";
      return "low";
    }

    return { normalizeText, tokenize, interpret, scoreEntry, reasonsFor, confidence, entryHay };
  }

  return { normalizeText, tokenize, entryHay, createEngine };
});
