import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = new URL(".", import.meta.url).pathname;
const dictionaryFiles = [
  "data/ingredients.json",
  "data/ingredients-extra-1.json",
  "data/ingredients-extra-2.json",
  "data/ingredients-extra-3.json",
  "data/ingredients-extra-4.json",
  "data/ingredients-extra-5.json",
  "data/ingredients-extra-6.json",
  "data/ingredients-extra-7.json",
  "data/ingredients-extra-8.json",
];

const minimumTotal = 500;
const requiredStringFields = ["id", "en", "safety"];
const allowedSafety = new Set(["safe", "caution", "risk"]);
const allowedCategories = new Set([
  "active",
  "amino acid",
  "animal extract",
  "barrier lipid",
  "buffer",
  "chelator",
  "colorant",
  "conditioning polymer",
  "emollient",
  "emulsifier",
  "essential oil",
  "ferment",
  "film former",
  "fragrance",
  "fragrance allergen",
  "hair conditioning",
  "humectant",
  "humectant/solvent",
  "mineral",
  "oil",
  "pH adjuster",
  "peptide",
  "pigment coating",
  "plant extract",
  "polymer",
  "powder",
  "powder binder",
  "preservative",
  "preservative booster",
  "preservative/fragrance",
  "protein",
  "sensory",
  "silicone",
  "soap",
  "solubilizer",
  "solvent",
  "soothing",
  "surfactant",
  "surfactant/emulsifier",
  "thickener",
  "uv filter",
  "uv filter/colorant",
  "viscosity adjuster",
  "wax",
  "general",
]);

const errors = [];
const warnings = [];
const allItems = [];
const ids = new Map();
const enNames = new Map();

function readJson(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`${file}: missing file`);
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    if (!Array.isArray(parsed)) {
      errors.push(`${file}: root must be an array`);
      return [];
    }
    return parsed.map((item, index) => ({ ...item, __file: file, __index: index }));
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
    return [];
  }
}

function normalized(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[\s_]+/g, " ")
    .replace(/[()（）［］\[\]{}]/g, "")
    .replace(/，/g, ",")
    .replace(/\s*,\s*/g, ",")
    .trim();
}

function location(item) {
  return `${item.__file}[${item.__index}]`;
}

for (const file of dictionaryFiles) {
  const items = readJson(file);
  allItems.push(...items);
}

for (const item of allItems) {
  for (const field of requiredStringFields) {
    if (typeof item[field] !== "string" || !item[field].trim()) {
      errors.push(`${location(item)}: missing or invalid string field '${field}'`);
    }
  }

  if (!Array.isArray(item.jp)) {
    errors.push(`${location(item)}: 'jp' must be an array`);
  }

  if (item.alias !== undefined && !Array.isArray(item.alias)) {
    errors.push(`${location(item)}: 'alias' must be an array when present`);
  }

  if (!allowedSafety.has(item.safety)) {
    errors.push(`${location(item)}: invalid safety '${item.safety}'`);
  }

  if (item.category && !allowedCategories.has(item.category)) {
    warnings.push(`${location(item)}: non-standard category '${item.category}'`);
  }

  if (item.id) {
    const key = normalized(item.id);
    if (ids.has(key)) {
      errors.push(`${location(item)}: duplicate id '${item.id}' also seen at ${ids.get(key)}`);
    } else {
      ids.set(key, location(item));
    }
  }

  if (item.en) {
    const key = normalized(item.en);
    if (enNames.has(key)) {
      warnings.push(`${location(item)}: duplicate/overlapping en '${item.en}' also seen at ${enNames.get(key)}`);
    } else {
      enNames.set(key, location(item));
    }
  }
}

const uniqueEnCount = enNames.size;
const totalCount = allItems.length;

if (uniqueEnCount < minimumTotal) {
  errors.push(`unique English ingredient count ${uniqueEnCount} is below minimum ${minimumTotal}`);
}

const report = {
  files: dictionaryFiles.length,
  totalItems: totalCount,
  uniqueEnglishIngredients: uniqueEnCount,
  minimumTotal,
  warnings: warnings.length,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));

if (warnings.length) {
  console.warn("\nWarnings:");
  warnings.forEach(warning => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error("\nErrors:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
