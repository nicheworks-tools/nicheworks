import { readFile } from 'node:fs/promises';

const FILES = [
  'tools/trashnavi/data/direct-waste-links.json',
  'tools/trashnavi/data/municipalities.json',
  'tools/trashnavi/data/municipalities-extra.json',
  'tools/trashnavi/data/localgovjp-lite.json'
];

const REQUIRED = ['pref', 'city', 'name', 'type', 'url'];
const allowedTypes = new Set(['自治体公式ページ', 'ごみ分別ページ', '収集カレンダー', '粗大ごみ', '検索ページ', '公式サイト']);
let hasError = false;
const seen = new Map();

function fail(message) {
  hasError = true;
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

async function loadJson(path) {
  try {
    const text = await readFile(path, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    fail(`${path}: cannot read or parse JSON: ${error.message}`);
    return null;
  }
}

for (const file of FILES) {
  const rows = await loadJson(file);
  if (!rows) continue;
  if (!Array.isArray(rows)) {
    fail(`${file}: root value must be an array`);
    continue;
  }

  rows.forEach((row, index) => {
    const label = `${file}[${index}]`;
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      fail(`${label}: row must be an object`);
      return;
    }

    for (const key of REQUIRED) {
      if (typeof row[key] !== 'string' || row[key].trim() === '') {
        fail(`${label}: missing required string field '${key}'`);
      }
    }

    if (row.lgcode !== undefined && typeof row.lgcode !== 'string') {
      fail(`${label}: lgcode must be a string when present`);
    }

    if (typeof row.url === 'string' && !/^https?:\/\//.test(row.url)) {
      fail(`${label}: url must start with http:// or https://`);
    }

    if (typeof row.type === 'string' && !allowedTypes.has(row.type)) {
      warn(`${label}: unknown type '${row.type}'`);
    }

    const dedupeKey = `${row.pref || ''}::${row.city || ''}::${row.type || ''}::${row.url || ''}`;
    if (seen.has(dedupeKey)) {
      fail(`${label}: duplicate link also found at ${seen.get(dedupeKey)}`);
    } else {
      seen.set(dedupeKey, label);
    }
  });

  console.log(`Checked ${rows.length} rows in ${file}`);
}

if (hasError) {
  process.exit(1);
}

console.log(`TrashNavi data validation passed. Checked ${seen.size} unique links.`);
