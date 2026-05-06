#!/usr/bin/env node
/**
 * Build JP Postal Lite JSON files from Japan Post UTF-8 postal-code data.
 *
 * Usage:
 *   node tools/jp-postal-lite/scripts/build-postal-data.mjs
 *   node tools/jp-postal-lite/scripts/build-postal-data.mjs /path/to/utf_ken_all.csv
 *
 * Default behavior:
 *   Downloads Japan Post's official utf_ken_all.zip, extracts utf_ken_all.csv,
 *   and writes ./data/{都道府県}.json. Runtime pages still load only self-hosted
 *   ./data/*.json files; this script is only for maintainers/build time.
 */
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const OFFICIAL_ZIP_URL = "https://www.post.japanpost.jp/zipcode/dl/utf/zip/utf_ken_all.zip";
const EXPECTED_PREF_COUNT = 47;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolDir = path.resolve(__dirname, "..");
const outputDir = path.join(toolDir, "data");
const providedCsvPath = process.argv[2];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        const nextUrl = new URL(response.headers.location, url).toString();
        downloadFile(nextUrl, dest).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`download_failed_${response.statusCode}`));
        return;
      }
      const out = fs.createWriteStream(dest);
      response.pipe(out);
      out.on("finish", () => out.close(resolve));
      out.on("error", reject);
    });
    request.on("error", reject);
  });
}

function findCsv(dir) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(p);
      else if (entry.isFile() && entry.name.toLowerCase() === "utf_ken_all.csv") return p;
    }
  }
  return null;
}

async function resolveCsvPath() {
  if (providedCsvPath) return path.resolve(providedCsvPath);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jp-postal-lite-"));
  const zipPath = path.join(tmpDir, "utf_ken_all.zip");
  await downloadFile(OFFICIAL_ZIP_URL, zipPath);
  execFileSync("unzip", ["-q", zipPath, "-d", tmpDir], { stdio: "inherit" });
  const csvPath = findCsv(tmpDir);
  if (!csvPath) throw new Error("utf_ken_all.csv_not_found_in_zip");
  return csvPath;
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

function assertGenerated(rowsByPref) {
  if (rowsByPref.size !== EXPECTED_PREF_COUNT) {
    throw new Error(`expected_${EXPECTED_PREF_COUNT}_prefectures_got_${rowsByPref.size}`);
  }
  for (const [pref, rows] of rowsByPref.entries()) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(`empty_prefecture_data_${pref}`);
    }
  }
}

async function main() {
  const csvPath = await resolveCsvPath();
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

  assertGenerated(rowsByPref);
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [pref, rows] of rowsByPref.entries()) {
    rows.sort((a, b) => a.postal_code.localeCompare(b.postal_code) || a.full.localeCompare(b.full, "ja"));
    const file = path.join(outputDir, `${pref}.json`);
    fs.writeFileSync(file, `${JSON.stringify(rows)}\n`, "utf8");
    console.log(`${pref}: ${rows.length} rows -> ${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
