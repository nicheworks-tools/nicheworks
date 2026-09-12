import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

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

const EQUIVALENT_CANONICAL_GROUPS = [
  ['bemotrizinol', 'bis-ethylhexyloxyphenol methoxyphenyl triazine'],
  ['bisoctrizole', 'methylene bis-benzotriazolyl tetramethylbutylphenol'],
  ['titanium dioxide', 'ci 77891'],
  ['mica', 'ci 77019']
].map((group) => new Set(group));

function baseKey(value = '') {
  if (parser?.normalizeBaseKey) return parser.normalizeBaseKey(value);
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[()（）［］\[\]{}【】]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

function isEquivalentCanonicalSet(canonicalKeys) {
  if (!canonicalKeys.length) return false;
  return EQUIVALENT_CANONICAL_GROUPS.some((group) => canonicalKeys.every((key) => group.has(key)));
}

const rows = DATA_FILES.flatMap((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  return data.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const failures = [];
const canonicalOwners = new Map();
const nameOwners = new Map();
let redundantLocalNames = 0;
let duplicateCanonicalRecords = 0;
let equivalentIdentityCollisions = 0;
let protectedAmbiguousKeys = 0;

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
      // Existing dictionaries intentionally contain full-width/half-width and
      // other NFKC-equivalent spellings. Runtime normalization already merges
      // these safely, so count them as redundancy rather than an identity bug.
      redundantLocalNames += 1;
      continue;
    }
    localSeen.add(key);
    pushOwner(nameOwners, key, { canonical: item.en, kind, value, file: item.__file });
  }
}

for (const owners of canonicalOwners.values()) {
  if (owners.length > 1) duplicateCanonicalRecords += owners.length - 1;
}

const ambiguousSet = new Set((parser?.ambiguousExactKeys || []).map(baseKey));
for (const [key, owners] of nameOwners) {
  const canonicalKeys = [...new Set(owners.map((owner) => baseKey(owner.canonical)))];
  if (canonicalKeys.length <= 1) continue;

  if (ambiguousSet.has(key)) {
    if (parser.normalizeKey(key) !== '') {
      failures.push(`ambiguous exact key must normalize to empty: ${key}`);
    } else {
      protectedAmbiguousKeys += 1;
    }
    continue;
  }

  if (isEquivalentCanonicalSet(canonicalKeys)) {
    equivalentIdentityCollisions += 1;
    continue;
  }

  failures.push(`unprotected cross-ingredient name collision ${key}: ${owners.map((owner) => `${owner.value} -> ${owner.canonical}`).join(' | ')}`);
}

const sharedAliases = parser?.aliasEquivalents || {};
for (const [rawAlias, rawTarget] of Object.entries(sharedAliases)) {
  const aliasKey = baseKey(rawAlias);
  const targetKey = baseKey(rawTarget);
  if (!aliasKey || !targetKey) {
    failures.push(`shared alias has empty key: ${rawAlias} -> ${rawTarget}`);
    continue;
  }
  if (ambiguousSet.has(aliasKey) || ambiguousSet.has(targetKey)) {
    failures.push(`shared alias may not use an ambiguous exact key: ${rawAlias} -> ${rawTarget}`);
    continue;
  }
  if (!canonicalOwners.has(targetKey) && !nameOwners.has(targetKey)) {
    failures.push(`shared alias target missing from maintained dictionary: ${rawAlias} -> ${rawTarget}`);
    continue;
  }

  const existing = nameOwners.get(aliasKey) || [];
  const foreignOwners = existing.filter((owner) => {
    const ownerKey = baseKey(owner.canonical);
    if (ownerKey === targetKey) return false;
    return !isEquivalentCanonicalSet([ownerKey, targetKey]);
  });
  if (foreignOwners.length) {
    failures.push(`shared alias collides with another ingredient: ${rawAlias} -> ${rawTarget}; existing ${foreignOwners.map((owner) => owner.canonical).join(', ')}`);
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
  redundant_local_names: redundantLocalNames,
  duplicate_canonical_records: duplicateCanonicalRecords,
  equivalent_identity_collisions: equivalentIdentityCollisions,
  protected_ambiguous_keys: protectedAmbiguousKeys,
  shared_alias_equivalents: Object.keys(sharedAliases).length,
  files: DATA_FILES.length
}, null, 2));
