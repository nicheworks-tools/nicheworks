function coreParseIngredients(text) {
  if (!text) return [];

  const sharedParser = globalThis.NWCosmeticIngredientParser;
  if (sharedParser?.splitIngredients) {
    return sharedParser.splitIngredients(text, { dedupe: true });
  }

  // Safe local fallback: do not split on '/' or '・' because both can appear
  // inside legitimate ingredient names.
  const normalized = String(text).replace(/\r/g, "\n");
  const parts = normalized
    .split(/[\n,、，;；]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    const key = String(p)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
}
