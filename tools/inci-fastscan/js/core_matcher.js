async function coreMatchIngredients(list, dict) {
  return list.map(name => matchOne(name, dict));
}

function matchOne(name, dict) {
  const norm = normalize(name);

  for (const item of dict) {
    if (normalize(item.en) === norm) return found(item, name);
    if (Array.isArray(item.jp) && item.jp.some(j => normalize(j) === norm)) return found(item, name);
    if (Array.isArray(item.alias) && item.alias.some(a => normalize(a) === norm)) return found(item, name);
  }

  return { found: false, input: name };
}

function normalize(s) {
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

function found(item, input) {
  return {
    found: true,
    input,
    en: item.en,
    jp: item.jp || [],
    alias: item.alias || [],
    safety: item.safety,
    category: item.category || "general",
    note_short: item.note_short
  };
}
