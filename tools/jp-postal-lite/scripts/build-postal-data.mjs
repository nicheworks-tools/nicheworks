#!/usr/bin/env node
/**
 * Build JP Postal Lite JSON files from Japan Post UTF-8 CSV.
 *
 * Usage:
 *   node tools/jp-postal-lite/scripts/build-postal-data.mjs /path/to/utf_ken_all.csv
 *
 * Source CSV:
 *   Japan Post "住所の郵便番号（1レコード1行、UTF-8形式）（CSV形式）".
 *   Download and unzip utf_ken_all.zip from the official Japan Post page, then pass
 *   the extracted CSV path to this script.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolDir = path.resolve(__dirname, "..");
const outputDir = path.join(toolDir, "data");
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node tools/jp-postal-lite/scripts/build-postal-data.mjs /path/to/utf_ken_all.csv");
  process.exit(1);
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

function normalizeTown(town) {
  if (!town || town === "以下に掲載がない場合") return "";
  return town;
}

function toRow(cells) {
  const postalCode = String(cells[2] || "").padStart(7, "0");
  const pref = cells[6] || "";
  const city = cells[7] || "";
  const town = normalizeTown(cells[8] || "");
  if (!/^\d{7}$/.test(postalCode) || !pref || !city) return null;
  return {
    postal_code: postalCode,
    postal_hyphen: `${postalCode.slice(0, 3)}-${postalCode.slice(3)}`,
    pref,
    city,
    town,
    full: `${pref}${city}${town}`
  };
}

const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rowsByPref = new Map();
const seen = new Set();

for (const line of raw.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const row = toRow(parseCsvLine(line));
  if (!row) continue;
  const key = `${row.postal_code}|${row.pref}|${row.city}|${row.town}`;
  if (seen.has(key)) continue;
  seen.add(key);
  if (!rowsByPref.has(row.pref)) rowsByPref.set(row.pref, []);
  rowsByPref.get(row.pref).push(row);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const [pref, rows] of rowsByPref.entries()) {
  rows.sort((a, b) => a.postal_code.localeCompare(b.postal_code) || a.full.localeCompare(b.full, "ja"));
  const file = path.join(outputDir, `${pref}.json`);
  fs.writeFileSync(file, `${JSON.stringify(rows)}\n`, "utf8");
  console.log(`${pref}: ${rows.length} rows -> ${file}`);
}
