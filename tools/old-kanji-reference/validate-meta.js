#!/usr/bin/env node
/*
  Old Kanji Reference metadata validator

  Usage:
    node tools/old-kanji-reference/validate-meta.js

  Checks:
    - meta keys exist in dict.json
    - modern values match dict.json
    - popularOrder entries exist and have complete verified metadata
    - verified entries have reading / meaning / category
    - placeholder-like text is not included
    - duplicate metadata keys across meta files are reported
*/

const fs = require("fs");
const path = require("path");

const dir = __dirname;
const dictPath = path.join(dir, "dict.json");
const baseMetaPath = path.join(dir, "meta.json");

const FORBIDDEN_PATTERNS = [
  /準備中/,
  /placeholder/i,
  /pending/i,
  /語による/,
  /todo/i,
  /TBD/i,
  /旧字体「.*」は現代表記「.*」に対応します/
];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    throw new Error(`Failed to read JSON: ${filePath}\n${err.message}`);
  }
}

function normalizeModern(value) {
  if (Array.isArray(value)) return value.join("、");
  return String(value || "");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function scanForbidden(value) {
  if (typeof value !== "string") return null;
  return FORBIDDEN_PATTERNS.find((pattern) => pattern.test(value)) || null;
}

function listMetaFiles() {
  const files = fs.readdirSync(dir)
    .filter((name) => name === "meta.json" || /^meta-extra-.*\.json$/.test(name))
    .sort((a, b) => {
      if (a === "meta.json") return -1;
      if (b === "meta.json") return 1;
      return a.localeCompare(b);
    });
  return files.map((name) => path.join(dir, name));
}

function main() {
  const errors = [];
  const warnings = [];

  const dict = readJson(dictPath);
  const oldToNew = dict.old_to_new || {};
  const metaFiles = listMetaFiles();

  if (!metaFiles.includes(baseMetaPath)) {
    errors.push("meta.json is missing.");
  }

  const mergedEntries = {};
  const seen = new Map();
  let popularOrder = [];

  for (const filePath of metaFiles) {
    const name = path.basename(filePath);
    const meta = readJson(filePath);
    const entries = meta.entries || {};

    if (name === "meta.json") {
      popularOrder = Array.isArray(meta.popularOrder) ? meta.popularOrder : [];
      if (!popularOrder.length) errors.push("meta.json popularOrder is missing or empty.");
    }

    for (const [oldChar, entry] of Object.entries(entries)) {
      if (seen.has(oldChar)) {
        warnings.push(`Duplicate metadata key: ${oldChar} in ${seen.get(oldChar)} and ${name}. Later file overrides earlier data.`);
      }
      seen.set(oldChar, name);
      mergedEntries[oldChar] = entry;
    }
  }

  for (const [oldChar, entry] of Object.entries(mergedEntries)) {
    if (!Object.prototype.hasOwnProperty.call(oldToNew, oldChar)) {
      errors.push(`Metadata key is not in dict.json: ${oldChar}`);
      continue;
    }

    const expectedModern = normalizeModern(oldToNew[oldChar]);
    if (hasText(entry.modern) && entry.modern !== expectedModern) {
      errors.push(`Modern mismatch for ${oldChar}: meta=${entry.modern} dict=${expectedModern}`);
    }

    if (!hasText(entry.category)) {
      errors.push(`Missing category for ${oldChar}`);
    }

    if (entry.verified) {
      for (const field of ["readingJa", "readingEn", "meaningJa", "meaningEn"]) {
        if (!hasText(entry[field])) errors.push(`Verified entry ${oldChar} missing ${field}`);
      }
    }

    for (const [field, value] of Object.entries(entry)) {
      const matched = scanForbidden(value);
      if (matched) errors.push(`Forbidden placeholder-like text in ${oldChar}.${field}: ${value}`);
    }
  }

  for (const oldChar of popularOrder) {
    const entry = mergedEntries[oldChar];
    if (!entry) {
      errors.push(`popularOrder entry missing metadata: ${oldChar}`);
      continue;
    }
    if (!entry.verified) errors.push(`popularOrder entry is not verified: ${oldChar}`);
    for (const field of ["readingJa", "readingEn", "meaningJa", "meaningEn", "usageJa", "usageEn"]) {
      if (!hasText(entry[field])) errors.push(`popularOrder entry ${oldChar} missing ${field}`);
    }
  }

  const verifiedCount = Object.values(mergedEntries).filter((entry) => entry.verified).length;
  const totalMetaCount = Object.keys(mergedEntries).length;
  const dictCount = Object.keys(oldToNew).length;

  console.log("Old Kanji Reference metadata validation");
  console.log(`dict entries: ${dictCount}`);
  console.log(`meta entries: ${totalMetaCount}`);
  console.log(`verified entries: ${verifiedCount}`);
  console.log(`meta files: ${metaFiles.map((file) => path.basename(file)).join(", ")}`);

  if (warnings.length) {
    console.warn("\nWarnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (errors.length) {
    console.error("\nErrors:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("\nOK: metadata passed validation.");
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
