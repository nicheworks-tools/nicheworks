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

function postProcessOcrText(rawText, options = {}) {
  if (!rawText) return "";

  const langHint = options.langHint === "jp" ? "jp" : "en";
  const normalized = String(rawText)
    .replace(/\r/g, "\n")
    .replace(/[•●]/g, " ")
    .replace(/\t/g, " ")
    .replace(/\u3000/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  if (!normalized) return "";

  const startMarkers = {
    en: [/ingredients/i],
    jp: [/全成分/, /成分/]
  };

  const stopMarkers = {
    en: [/caution/i, /warning/i, /manufactured/i],
    jp: [/注意/, /発売元/, /内容量/, /株式会社/]
  };

  const lines = normalized
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const collected = [];
  let started = false;

  for (let line of lines) {
    if (!line || isNoiseLine(line)) {
      continue;
    }

    if (!started) {
      const startMatch = findFirstMarker(line, startMarkers[langHint]);
      if (startMatch) {
        started = true;
        line = line.slice(startMatch.index + startMatch.match[0].length).trim();
        if (!line) {
          continue;
        }
      }
    }

    if (started) {
      const stopMatch = findFirstMarker(line, stopMarkers[langHint]);
      if (stopMatch) {
        const before = line.slice(0, stopMatch.index).trim();
        if (before) {
          collected.push(before);
        }
        break;
      }
      collected.push(line);
    }
  }

  const targetLines = collected.length > 0
    ? collected
    : lines.filter(line => !isNoiseLine(line));

  const items = [];
  for (let line of targetLines) {
    let cleaned = line
      .replace(/^[\s\-–—*•●・]+/g, "")
      .replace(/[、，;・／/：:→]/g, ",")
      .replace(/,+/g, ",")
      .replace(/[ ]{2,}/g, " ")
      .trim();

    if (!cleaned) continue;

    if (langHint === "jp") {
      cleaned = normalizeJapaneseSpacing(cleaned);
    }

    if (!containsLetters(cleaned)) {
      continue;
    }

    const parts = cleaned
      .split(/\s*,\s*/)
      .map(part => part.trim())
      .filter(Boolean);

    items.push(...parts);
  }

  const merged = [];
  for (const item of items) {
    if (merged.length > 0) {
      const prev = merged[merged.length - 1];
      if (langHint === "en" && shouldMergeEnglish(prev, item)) {
        merged[merged.length - 1] = `${prev} ${item}`.trim();
        continue;
      }
      if (langHint === "jp" && shouldMergeJapanese(prev, item)) {
        merged[merged.length - 1] = `${prev}${item}`.trim();
        continue;
      }
    }
    merged.push(item);
  }

  return merged.join("\n").trim();
}

function findFirstMarker(line, markers) {
  for (const marker of markers) {
    const match = line.match(marker);
    if (match) {
      return { match, index: match.index };
    }
  }
  return null;
}

function containsLetters(text) {
  return /[A-Za-z\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function isNoiseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (!containsLetters(trimmed)) return true;
  if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(trimmed)) return true;
  if (/^\d{1,4}[%％]$/.test(trimmed)) return true;
  if (/^[\W_]+$/.test(trimmed)) return true;
  return false;
}

function normalizeJapaneseSpacing(text) {
  let normalized = text;
  let prev;
  do {
    prev = normalized;
    normalized = normalized.replace(
      /([ぁ-んァ-ヶ一-龠])\s+([ぁ-んァ-ヶ一-龠])/g,
      "$1$2"
    );
  } while (normalized !== prev);

  normalized = normalized
    .replace(/([ぁ-んァ-ヶ一-龠])\s+([A-Za-z0-9])/g, "$1$2")
    .replace(/([A-Za-z0-9])\s+([ぁ-んァ-ヶ一-龠])/g, "$1$2");

  return normalized;
}

function shouldMergeEnglish(previous, next) {
  if (!previous || !next) return false;
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(previous)) return false;
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(next)) return false;

  const prefixes = new Set([
    "Sodium",
    "Potassium",
    "Disodium",
    "Dipotassium",
    "Magnesium",
    "Calcium",
    "Hydrolyzed",
    "Hydrogenated",
    "Cocamidopropyl",
    "Cocoyl",
    "Stearyl",
    "Cetearyl",
    "Cetyl",
    "Lauryl",
    "Myristyl",
    "PEG",
    "PPG",
    "Glyceryl",
    "Sorbitan"
  ]);

  const suffixes = new Set([
    "Acid",
    "Hyaluronate",
    "Chloride",
    "Sulfate",
    "Phosphate",
    "Benzoate",
    "Lactate"
  ]);

  if (previous.endsWith("-")) return true;
  if (next.startsWith("-")) return true;

  return prefixes.has(previous) || suffixes.has(next);
}

function shouldMergeJapanese(previous, next) {
  if (!previous || !next) return false;
  if (!containsLetters(previous) || !containsLetters(next)) return false;

  const kanaOnly = /^[ぁ-んァ-ヶー]+$/;
  if (!kanaOnly.test(previous)) return false;
  if (previous.length > 4) return false;

  return /[ぁ-んァ-ヶー一-龠]/.test(next);
}
