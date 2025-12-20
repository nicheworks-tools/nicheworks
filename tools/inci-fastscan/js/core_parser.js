function coreParseIngredients(text) {
  if (!text) return [];

  // Normalize line breaks
  const normalized = String(text).replace(/\r/g, "");

  // Split priority: newline, comma, semicolon, Japanese dot, slash (half/full)
  const parts = normalized
    .split(/\n|,|;|・|\/|／/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // De-dup while preserving order
  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    const key = p;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
}
