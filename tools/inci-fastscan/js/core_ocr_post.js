function coreProcessOCRText(raw) {
  if (!raw) return "";

  // Basic cleanup: remove bullets / odd dots, normalize whitespace
  let cleaned = String(raw)
    .replace(/[•●]/g, " ")
    .replace(/[、，]/g, ",")
    .replace(/\t/g, " ")
    .replace(/\u3000/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();

  // Convert to line-ish format: keep commas but prefer newlines for parsing
  cleaned = cleaned.replace(/\s*[,;]\s*/g, "\n");
  cleaned = cleaned.replace(/\n{2,}/g, "\n");

  return cleaned.trim();
}
