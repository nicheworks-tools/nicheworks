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
  return String(s || "").toLowerCase().trim();
}

function found(item, input) {
  return {
    found: true,
    input,
    en: item.en,
    jp: item.jp || [],
    alias: item.alias || [],
    safety: item.safety,
    note_short: item.note_short
  };
}
