function coreNormalizeInput(rawText) {
  return typeof rawText === "string" ? rawText.trim() : String(rawText || "").trim();
}

async function coreAnalyzeIngredients(rawText, dict) {
  const preparedText = coreNormalizeInput(rawText);
  const parsedList = coreParseIngredients(preparedText);
  const separated = splitExactIngredientSequences(parsedList, dict);
  const repaired = repairWrappedIngredientFragments(separated.list, dict);
  const results = await coreMatchIngredients(repaired.list, dict);

  return {
    list: repaired.list, results, repairs: repaired.repairs,
    exactSequenceSplits: separated.splitCount
  };
}


// OCR may omit delimiters between two otherwise perfectly recognized names.
// Separate ONLY when an entire unknown Latin fragment admits exactly ONE
// full-coverage decomposition into 2+ exact maintained names or aliases.
// Never infer missing names, discard unmatched text, or split an already
// recognized full INCI name. This is deterministic dictionary segmentation,
// not fuzzy correction or a claimed cosmetic safety classification.
function splitExactIngredientSequences(list, dict) {
  const names = buildKnownIngredientNameMap(dict);
  const output = [];
  let splitCount = 0;
  for (const original of Array.isArray(list) ? list : []) {
    const text = String(original || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!text || text.length > 160 || !/^[A-Za-z0-9\s.\-]+$/.test(text) ||
        isKnownIngredientName(text, names)) {
      output.push(original);
      continue;
    }
    const words = text.split(" ");
    if (words.length < 2 || words.length > 20) {
      output.push(original);
      continue;
    }
    const paths = Array.from({ length: words.length + 1 }, () => []);
    paths[words.length] = [[]];
    for (let i = words.length - 1; i >= 0; i -= 1) {
      for (let j = i + 1; j <= Math.min(words.length, i + 8); j += 1) {
        const phrase = words.slice(i, j).join(" ");
        if (!isKnownIngredientName(phrase, names)) continue;
        for (const tail of paths[j]) {
          paths[i].push([phrase, ...tail]);
          if (paths[i].length > 1) break;
        }
        if (paths[i].length > 1) break;
      }
    }
    const unique = paths[0].length === 1 ? paths[0][0] : null;
    if (unique && unique.length >= 2) {
      output.push(...unique);
      splitCount += 1;
    } else output.push(original);
  }
  // coreParseIngredients() de-duplicates input names. Apply the same policy
  // after splitting so a rescued ingredient cannot appear twice by accident.
  const deduped = [];
  const seen = new Set();
  for (const value of output) {
    const key = ingredientRepairKey(value) ||
      "raw:" + String(value || "").normalize("NFKC").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(value);
  }
  return { list: deduped, splitCount };
}

function repairWrappedIngredientFragments(list, dict) {
  const input = Array.isArray(list) ? list : [];
  if (input.length < 2) return { list: input.slice(), repairs: [] };

  const knownNames = buildKnownIngredientNameMap(dict);
  const output = [];
  const repairs = [];

  for (let index = 0; index < input.length; index += 1) {
    const current = input[index];
    const next = input[index + 1];

    if (!next) {
      output.push(current);
      continue;
    }

    const currentKnown = isKnownIngredientName(current, knownNames);
    const nextKnown = isKnownIngredientName(next, knownNames);

    // Two independently known ingredients must never be collapsed together.
    // If only one fragment is independently known, still allow an exact
    // dictionary-backed combined identity (for example Cetearyl + Alcohol).
    if (currentKnown && nextKnown) {
      output.push(current);
      continue;
    }

    // Retain the original two-line exact repair as the first priority.
    const repairedName = findExactWrappedJoin(current, next, knownNames);
    if (repairedName) {
      output.push(repairedName);
      repairs.push({ from: [current, next], to: repairedName });
      index += 1;
      continue;
    }

    // Some small product labels wrap a single long INCI name across three
    // OCR lines. Repair only when the COMPLETE three-part name is already an
    // exact maintained dictionary name. Never merge two independently known
    // ingredients or override an independently known trailing two-part name.
    const third = input[index + 2];
    if (third) {
      const knownCount = [current, next, third]
        .filter(part => isKnownIngredientName(part, knownNames)).length;
      const trailingPair = findExactWrappedJoin(next, third, knownNames);
      if (knownCount <= 1 && !trailingPair) {
        const triple = findExactWrappedTripleJoin(current, next, third, knownNames);
        if (triple) {
          output.push(triple);
          repairs.push({ from: [current, next, third], to: triple });
          index += 2;
          continue;
        }
      }
    }

    output.push(current);
  }

  return { list: output, repairs };
}

function buildKnownIngredientNameMap(dict) {
  const names = new Map();
  for (const item of Array.isArray(dict) ? dict : []) {
    if (!item?.en) continue;
    const values = [
      item.en,
      ...(Array.isArray(item.jp) ? item.jp : []),
      ...(Array.isArray(item.alias) ? item.alias : [])
    ];
    for (const value of values) {
      const key = ingredientRepairKey(value);
      if (key && !names.has(key)) names.set(key, value);
    }
  }
  return names;
}

function isKnownIngredientName(value, knownNames) {
  const key = ingredientRepairKey(value);
  return Boolean(key && knownNames.has(key));
}

function findExactWrappedJoin(previous, next, knownNames) {
  const left = String(previous || "").trim();
  const right = String(next || "").trim();
  if (!left || !right) return "";

  const candidates = [`${left} ${right}`, `${left}${right}`];
  if (/[-\u2010\u2011\u2012\u2013\u2014]$/.test(left)) {
    const withoutTrailingHyphen = left.slice(0, -1).trimEnd();
    candidates.push(`${withoutTrailingHyphen} ${right}`, `${withoutTrailingHyphen}${right}`);
  }

  for (const candidate of candidates) {
    const key = ingredientRepairKey(candidate);
    if (key && knownNames.has(key)) return knownNames.get(key);
  }
  return "";
}

function findExactWrappedTripleJoin(first, second, third, knownNames) {
  const left = String(first || "").trim();
  const middle = String(second || "").trim();
  const right = String(third || "").trim();
  if (!left || !middle || !right) return "";

  // All candidate boundaries are checked against an EXACT maintained name.
  // Adjacent OCR lines are never combined solely because they look similar.
  const firstParts = [left];
  if (/[-\u2010\u2011\u2012\u2013\u2014]$/.test(left)) {
    firstParts.push(left.slice(0, -1).trimEnd());
  }
  const secondParts = [middle];
  if (/[-\u2010\u2011\u2012\u2013\u2014]$/.test(middle)) {
    secondParts.push(middle.slice(0, -1).trimEnd());
  }
  for (const a of firstParts) {
    for (const b of secondParts) {
      const candidates = [
        a + " " + b + " " + right,
        a + b + " " + right,
        a + " " + b + right,
        a + b + right
      ];
      for (const candidate of candidates) {
        const key = ingredientRepairKey(candidate);
        if (key && knownNames.has(key)) return knownNames.get(key);
      }
    }
  }
  return "";
}

function ingredientRepairKey(value) {
  const shared = globalThis.NWCosmeticIngredientParser;
  if (shared?.normalizeKey) return shared.normalizeKey(value);
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[()（）［］\[\]{}]/g, "")
    .replace(/[\s_]+/g, " ")
    .trim();
}
