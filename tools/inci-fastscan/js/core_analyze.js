function coreNormalizeInput(rawText) {
  return typeof rawText === "string" ? rawText.trim() : String(rawText || "").trim();
}

async function coreAnalyzeIngredients(rawText, dict) {
  const preparedText = coreNormalizeInput(rawText);
  const parsedList = coreParseIngredients(preparedText);
  const repaired = repairWrappedIngredientFragments(parsedList, dict);
  const results = await coreMatchIngredients(repaired.list, dict);

  return { list: repaired.list, results, repairs: repaired.repairs };
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

    if (!next || isKnownIngredientName(current, knownNames) || isKnownIngredientName(next, knownNames)) {
      output.push(current);
      continue;
    }

    const repairedName = findExactWrappedJoin(current, next, knownNames);
    if (!repairedName) {
      output.push(current);
      continue;
    }

    output.push(repairedName);
    repairs.push({ from: [current, next], to: repairedName });
    index += 1;
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
