#!/usr/bin/env node
/**
 * TSV -> pack JSON generator (safe)
 *
 * Input TSV columns expected (header required):
 * - id (required)
 * - term_ja (required)
 * - term_en (required)
 * - hint_text (optional)
 * - category (required)
 * - allowed_categories (optional; ignored by default)
 *
 * Validates:
 * - id unique
 * - category exists in data/index.json categories
 * - required fields non-empty
 *
 * Usage:
 *  node tools/construction-tools-atlas/scripts/tsv-to-pack.mjs \
 *    --tsv tools/construction-tools-atlas/_work/pack-001.tsv \
 *    --out tools/construction-tools-atlas/data/packs/pack-001.json
 */

import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--tsv") args.tsv = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--index") args.index = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else fail(`Unknown arg: ${a}`);
  }
  return args;
}

function readFileUtf8(p) {
  return fs.readFileSync(p, "utf8");
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function splitLinesKeepMeaningful(raw) {
  // normalize newlines, remove trailing empty lines
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim() !== "");
}

function parseTSV(tsvText) {
  const lines = splitLinesKeepMeaningful(tsvText);
  if (lines.length === 0) fail("TSV is empty");

  const header = lines.shift().split("\t").map((s) => s.trim());
  const idx = (name) => header.indexOf(name);

  const requiredCols = ["id", "term_ja", "term_en", "category"];
  for (const col of requiredCols) {
    if (idx(col) === -1) fail(`Missing required TSV column: ${col}`);
  }

  const rows = [];
  for (const line of lines) {
    const cols = line.split("\t");
    const get = (name) => (cols[idx(name)] ?? "").trim();

    const row = {
      id: get("id"),
      term_ja: get("term_ja"),
      term_en: get("term_en"),
      hint_text: idx("hint_text") !== -1 ? get("hint_text") : "",
      category: get("category"),
      allowed_categories: idx("allowed_categories") !== -1 ? get("allowed_categories") : "",
    };
    rows.push(row);
  }
  return rows;
}

function loadAllowedCategories(indexPath) {
  const index = JSON.parse(readFileUtf8(indexPath));
  const allowed = new Set(
    (index.categories || [])
      .map((c) => String(c.id || "").trim())
      .filter(Boolean),
  );
  return allowed;
}

function buildPack(rows, allowedCategories) {
  const seen = new Set();
  const entries = [];

  for (const r of rows) {
    if (!r.id) fail("Row missing id");
    if (seen.has(r.id)) fail(`Duplicate id: ${r.id}`);
    seen.add(r.id);

    if (!r.term_ja) fail(`Missing term_ja for ${r.id}`);
    if (!r.term_en) fail(`Missing term_en for ${r.id}`);
    if (!r.category) fail(`Missing category for ${r.id}`);

    if (!allowedCategories.has(r.category)) {
      fail(`Invalid category '${r.category}' for ${r.id} (not in data/index.json categories)`);
    }

    // pack entry format (top-level array required by validate-data.mjs)
    entries.push({
      id: r.id,
      term: {
        ja: r.term_ja,
        en: r.term_en,
      },
      hint: r.hint_text || "",
      category: r.category,
    });
  }

  return entries;
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.tsv || !args.out) {
    console.log(`Usage:
  node tools/construction-tools-atlas/scripts/tsv-to-pack.mjs --tsv <input.tsv> --out <pack.json> [--index <index.json>] [--dry-run]

Defaults:
  --index tools/construction-tools-atlas/data/index.json
`);
    process.exit(args.help ? 0 : 1);
  }

  const indexPath = args.index || "tools/construction-tools-atlas/data/index.json";
  if (!fs.existsSync(args.tsv)) fail(`TSV not found: ${args.tsv}`);
  if (!fs.existsSync(indexPath)) fail(`index.json not found: ${indexPath}`);

  const allowedCategories = loadAllowedCategories(indexPath);
  const rows = parseTSV(readFileUtf8(args.tsv));
  const pack = buildPack(rows, allowedCategories);

  if (args.dryRun) {
    console.log(`[DRY RUN] entries=${pack.length}`);
    console.log(JSON.stringify(pack.slice(0, 2), null, 2));
    process.exit(0);
  }

  ensureDirForFile(args.out);
  fs.writeFileSync(args.out, JSON.stringify(pack, null, 2) + "\n", "utf8");
  console.log(`[OK] Wrote pack: ${args.out} entries=${pack.length}`);
}

main();
