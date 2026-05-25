const fs = require("fs");
const path = require("path");

const dictPath = path.join(__dirname, "..", "data", "ingredients.json");

function normalizeName(value, { lowercase = false } = {}) {
  const replaced = value.replace(/\u3000/g, " ");
  const collapsed = replaced.replace(/\s+/g, " ").trim();
  return lowercase ? collapsed.toLowerCase() : collapsed;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringList(value, fieldName, index, enName, errors, opts = {}) {
  const allowEmptyArray = !!opts.allowEmptyArray;

  if (value == null) return [];

  // allow "string" shorthand
  if (typeof value === "string") value = [value];

  if (!Array.isArray(value)) {
    errors.push({ index, en: enName, field: fieldName, reason: "must be an array of strings" });
    return [];
  }

  // IMPORTANT:
  // - alias can be empty array (allowEmptyArray=true)
  // - other list fields may require non-empty
  if (value.length === 0) {
    if (allowEmptyArray) return [];
    errors.push({ index, en: enName, field: fieldName, reason: "must not be an empty array" });
    return [];
  }

  const out = [];
  for (let itemIndex = 0; itemIndex < value.length; itemIndex++) {
    const item = value[itemIndex];
    if (item == null) {
      errors.push({ index, en: enName, field: fieldName, reason: "must not be null" });
      continue;
    }
    if (typeof item !== "string" || item.trim().length === 0) {
      errors.push({
        index,
        en: enName,
        field: fieldName,
        reason: `item ${itemIndex} must be a non-empty string`,
      });
      continue;
    }
    out.push(item.trim());
  }
  return out;
}


let data;
try {
  const raw = fs.readFileSync(dictPath, "utf8");
  data = JSON.parse(raw);
} catch (error) {
  console.error(`Failed to load dictionary: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("Dictionary root must be an array.");
  process.exit(1);
}

const errors = [];
const enNameSet = new Map();
const jpNameSet = new Map();
const mainNameIndex = new Map();
const aliasEntries = [];
const allowedSafety = new Set(["safe", "caution", "risk"]);

const requiredFields = ["en", "safety"];

function recordDuplicate(map, normalized, index, enName, field) {
  if (map.has(normalized)) {
    const otherIndex = map.get(normalized);
    errors.push({
      index,
      en: enName,
      field,
      reason: `duplicate value (also at index ${otherIndex})`,
    });
    return true;
  }
  map.set(normalized, index);
  return false;
}

data.forEach((entry, index) => {
  if (entry == null) {
    errors.push({ index, en: "(unknown)", field: "entry", reason: "entry is null" });
    return;
  }
  if (typeof entry !== "object" || Array.isArray(entry)) {
    errors.push({ index, en: "(unknown)", field: "entry", reason: "entry must be an object" });
    return;
  }

  const enName = typeof entry.en === "string" ? entry.en : "(unknown)";

  requiredFields.forEach((field) => {
    if (!(field in entry)) {
      errors.push({ index, en: enName, field, reason: "field is required" });
    }
  });

  if ("en" in entry) {
    if (!isNonEmptyString(entry.en)) {
      errors.push({ index, en: enName, field: "en", reason: "must be a non-empty string" });
    } else {
      const normalizedEn = normalizeName(entry.en, { lowercase: true });
      recordDuplicate(enNameSet, normalizedEn, index, entry.en, "en");
      if (!mainNameIndex.has(normalizedEn)) {
        mainNameIndex.set(normalizedEn, index);
      }
    }
  }

  if ("jp" in entry) {
    const jpValues = validateStringList(entry.jp, "jp", index, enName, errors);
    jpValues.forEach((jpValue) => {
      const normalizedJp = normalizeName(jpValue);
      recordDuplicate(jpNameSet, normalizedJp, index, enName, "jp");
      if (!mainNameIndex.has(normalizedJp)) {
        mainNameIndex.set(normalizedJp, index);
      }
    });
  }

  const aliasFields = ["alias", "aliases", "en_aliases", "jp_aliases"];
  aliasFields.forEach((field) => {
    if (!(field in entry)) {
      return;
    }
    const aliasValues = validateStringList(entry[field], field, index, enName, errors, { allowEmptyArray: true });
    aliasValues.forEach((aliasValue) => {
      const normalizedAlias = normalizeName(aliasValue, { lowercase: true });
      aliasEntries.push({
        index,
        en: enName,
        field,
        raw: aliasValue,
        normalized: normalizedAlias,
      });
    });
  });

  if ("safety" in entry) {
    if (!isNonEmptyString(entry.safety)) {
      errors.push({ index, en: enName, field: "safety", reason: "must be a non-empty string" });
    } else if (!allowedSafety.has(entry.safety)) {
      errors.push({
        index,
        en: enName,
        field: "safety",
        reason: `unknown value "${entry.safety}"`,
      });
    }
  }
});

aliasEntries.forEach((aliasEntry) => {
  const ownerIndex = mainNameIndex.get(aliasEntry.normalized);
  if (ownerIndex != null && ownerIndex !== aliasEntry.index) {
    errors.push({
      index: aliasEntry.index,
      en: aliasEntry.en,
      field: aliasEntry.field,
      reason: `alias "${aliasEntry.raw}" collides with entry ${ownerIndex} main name`,
    });
  }
});

console.log(`Dictionary entries: ${data.length}`);
console.log(`Errors: ${errors.length}`);

errors.forEach((error) => {
  console.log(
    `[${error.index}] ${error.en} - ${error.field}: ${error.reason}`
  );
});

if (errors.length > 0) {
  process.exit(1);
}
