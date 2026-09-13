async function coreMatchIngredients(list, dict) {
  const exactIndex = buildExactIngredientIndex(dict);
  const suggestionCandidates = buildSuggestionCandidates(dict);
  return list.map(name => matchOne(name, exactIndex, suggestionCandidates));
}

function matchOne(name, exactIndex, suggestionCandidates) {
  const norm = normalize(name);
  const item = exactIndex.get(norm);
  if (item) return found(item, name);

  const suggestions = findNearMatches(name, suggestionCandidates);
  return {
    found: false,
    input: name,
    suggestions,
    ocr_confusion: detectOcrCharacterConfusion(name, suggestions)
  };
}

function buildExactIngredientIndex(dict) {
  const index = new Map();

  for (const item of Array.isArray(dict) ? dict : []) {
    if (!item || !item.en) continue;
    for (const name of ingredientNames(item)) {
      const key = normalize(name);
      if (key && !index.has(key)) index.set(key, item);
    }
  }

  return index;
}

function buildSuggestionCandidates(dict) {
  const candidates = [];

  for (const item of Array.isArray(dict) ? dict : []) {
    if (!item || !item.en) continue;
    for (const name of ingredientNames(item)) {
      const key = normalizeForSuggestion(name);
      if (!key || key.length < 5) continue;
      candidates.push({ item, name, key, script: detectScript(key) });
    }
  }

  return candidates;
}

function ingredientNames(item) {
  return [
    item.en,
    ...(Array.isArray(item.jp) ? item.jp : []),
    ...(Array.isArray(item.alias) ? item.alias : [])
  ].filter(Boolean);
}

function findNearMatches(input, candidates) {
  const inputKey = normalizeForSuggestion(input);
  if (!inputKey || inputKey.length < 5) return [];

  const inputScript = detectScript(inputKey);
  if (inputScript === "other") return [];

  const maxDistance = inputKey.length <= 8 ? 1 : inputKey.length <= 20 ? 2 : 3;
  const bestByIngredient = new Map();

  for (const candidate of candidates) {
    if (candidate.script !== inputScript) continue;
    if (Math.abs(candidate.key.length - inputKey.length) > maxDistance) continue;

    const distance = boundedLevenshtein(inputKey, candidate.key, maxDistance);
    if (distance > maxDistance) continue;

    const ratio = distance / Math.max(inputKey.length, candidate.key.length);
    if (ratio > 0.18) continue;

    const canonicalKey = normalize(candidate.item.en);
    const existing = bestByIngredient.get(canonicalKey);
    if (!existing || distance < existing.distance) {
      bestByIngredient.set(canonicalKey, {
        en: candidate.item.en,
        jp: Array.isArray(candidate.item.jp) ? candidate.item.jp : [],
        matchedName: candidate.name,
        distance
      });
    }
  }

  return [...bestByIngredient.values()]
    .sort((a, b) => a.distance - b.distance || a.en.localeCompare(b.en))
    .slice(0, 3);
}

function detectOcrCharacterConfusion(input, suggestions) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;
  const inputKey = normalizeForOcrConfusion(input);
  if (!inputKey || detectScript(inputKey) !== "latin") return null;

  for (const suggestion of suggestions) {
    const candidate = normalizeForOcrConfusion(suggestion.matchedName || suggestion.en);
    if (!candidate || candidate.length !== inputKey.length) continue;

    const mismatches = [];
    let valid = true;
    for (let i = 0; i < inputKey.length; i += 1) {
      if (inputKey[i] === candidate[i]) continue;
      if (!isCommonOcrConfusion(inputKey[i], candidate[i])) {
        valid = false;
        break;
      }
      mismatches.push({ input: inputKey[i], expected: candidate[i], index: i });
    }

    if (valid && mismatches.length > 0 && mismatches.length <= 2) {
      return {
        en: suggestion.en,
        matchedName: suggestion.matchedName || suggestion.en,
        mismatches
      };
    }
  }

  return null;
}

function normalizeForOcrConfusion(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isCommonOcrConfusion(a, b) {
  const pairs = new Set([
    "i1", "1i", "l1", "1l", "il", "li",
    "o0", "0o"
  ]);
  return pairs.has(`${a}${b}`);
}

function boundedLevenshtein(a, b, maxDistance) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = current[0];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    previous = current;
  }

  return previous[b.length];
}

function normalize(s) {
  const shared = globalThis.NWCosmeticIngredientParser;
  if (shared?.normalizeKey) return shared.normalizeKey(s);

  return String(s || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[\s_]+/g, " ")
    .replace(/[()（）［］\[\]{}]/g, "")
    .replace(/，/g, ",")
    .replace(/\s*,\s*/g, ",")
    .trim();
}

function normalizeBase(s) {
  const shared = globalThis.NWCosmeticIngredientParser;
  if (shared?.normalizeBaseKey) return shared.normalizeBaseKey(s);
  return normalize(s);
}

function normalizeForSuggestion(value) {
  return normalize(value)
    .replace(/[\s,.;:()（）［］\[\]{}\-_\/・]/g, "")
    .trim();
}

function detectScript(value) {
  if (/[ぁ-んァ-ヶ一-龠]/.test(value)) return "jp";
  if (/[a-z]/i.test(value)) return "latin";
  return "other";
}

function classifyExactMatch(item, input) {
  const inputBase = normalizeBase(input);
  if (inputBase && inputBase === normalizeBase(item.en)) {
    return { kind: "canonical", matchedName: item.en };
  }

  for (const name of Array.isArray(item.jp) ? item.jp : []) {
    if (inputBase && inputBase === normalizeBase(name)) {
      return { kind: "jp", matchedName: name };
    }
  }

  for (const name of Array.isArray(item.alias) ? item.alias : []) {
    if (inputBase && inputBase === normalizeBase(name)) {
      return { kind: "alias", matchedName: name };
    }
  }

  if (normalize(input) && normalize(input) === normalize(item.en)) {
    return { kind: "shared_alias", matchedName: input };
  }

  return { kind: "canonical", matchedName: item.en };
}

function found(item, input) {
  const route = classifyExactMatch(item, input);
  return {
    found: true,
    input,
    en: item.en,
    jp: item.jp || [],
    alias: item.alias || [],
    match_kind: route.kind,
    matched_name: route.matchedName,
    safety: item.safety,
    category: item.category || "general",
    note_short: item.note_short
  };
}
