import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];

function baseKey(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[()（）［］\[\]{}【】]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

const rows = DATA_FILES.flatMap((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  return data.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const failures = [];
const canonicalOwners = new Map();
const nameOwners = new Map();

function pushOwner(map, key, owner) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(owner);
}

for (const item of rows) {
  if (!item?.en || !String(item.en).trim()) {
    failures.push(`${item.__file}[${item.__index}]: missing canonical en name`);
    continue;
  }

  const canonicalKey = baseKey(item.en);
  pushOwner(canonicalOwners, canonicalKey, item);

  const names = [
    ['en', item.en],
    ...(Array.isArray(item.jp) ? item.jp.map((value) => ['jp', value]) : []),
    ...(Array.isArray(item.alias) ? item.alias.map((value) => ['alias', value]) : [])
  ];

  const localSeen = new Set();
  for (const [kind, value] of names) {
    const key = baseKey(value);
    if (!key) {
      failures.push(`${item.en}: empty ${kind} value`);
      continue;
    }
    if (localSeen.has(key)) {
      failures.push(`${item.en}: duplicate normalized name within one entry: ${value}`);
      continue;
    }
    localSeen.add(key);
    pushOwner(nameOwners, key, { canonical: item.en, kind, value, file: item.__file });
  }
}

for (const [key, owners] of canonicalOwners) {
  if (owners.length > 1) {
    failures.push(`duplicate canonical key ${key}: ${owners.map((item) => `${item.en} @ ${item.__file}`).join(' | ')}`);
  }
}

for (const [key, owners] of nameOwners) {
  const canonicals = [...new Set(owners.map((owner) => baseKey(owner.canonical)))];
  if (canonicals.length > 1) {
    failures.push(`cross-ingredient name collision ${key}: ${owners.map((owner) => `${owner.value} -> ${owner.canonical}`).join(' | ')}`);
  }
}

if (failures.length) {
  console.error(`Cosmetics dictionary quality check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  dictionary_records: rows.length,
  canonical_keys: canonicalOwners.size,
  exact_name_keys: nameOwners.size,
  files: DATA_FILES.length
}, null, 2));
