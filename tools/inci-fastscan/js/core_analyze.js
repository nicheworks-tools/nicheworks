function coreNormalizeInput(rawText) {
  return typeof rawText === "string" ? rawText.trim() : String(rawText || "").trim();
}

async function coreAnalyzeIngredients(rawText, dict) {
  const preparedText = coreNormalizeInput(rawText);
  const list = coreParseIngredients(preparedText);
  const results = await coreMatchIngredients(list, dict);

  return { list, results };
}
