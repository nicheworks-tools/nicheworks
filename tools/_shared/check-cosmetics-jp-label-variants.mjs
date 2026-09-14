import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const read = (path) => fs.readFileSync(path, 'utf8');

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
const records = DATA_FILES.flatMap((file) => JSON.parse(read(file)));

const mappings = [
  ['PG', 'Propylene Glycol'],
  ['水酸化ナトリウム液', 'Sodium Hydroxide'],
  ['水酸化カリウム液(A)', 'Potassium Hydroxide'],
  ['グリセリルエチルヘキシルエーテル', 'Ethylhexylglycerin'],
  ['ジカプリン酸ネオペンチルグリコール', 'Neopentyl Glycol Dicaprate'],
  ['ラウリルヒドロキシスルホベタイン液', 'Lauryl Hydroxysultaine'],
  ['ヤシ油脂肪酸アシルグルタミン酸Na', 'Sodium Cocoyl Glutamate'],
  ['シュガースクワラン', 'Squalane'],
  ['ラウロイルアスパラギン酸Na液', 'Sodium Lauroyl Aspartate'],
  ['イソステアリルグリセリルエーテル', 'Isostearyl Glyceryl Ether'],
  ['イソステアリン酸コレステリル', 'Cholesteryl Isostearate'],
  ['PEG1540', 'PEG-32'],
  ['PEG6000', 'PEG-150'],
  ['トリシロキサン', 'Trisiloxane']
];

const exactOwners = new Map();
function addOwner(value, canonical) {
  const key = parser.normalizeKey(value);
  if (!key) return;
  if (!exactOwners.has(key)) exactOwners.set(key, new Set());
  exactOwners.get(key).add(parser.canonicalIdentityKey(canonical));
}

for (const item of records) {
  if (!item?.en) continue;
  addOwner(item.en, item.en);
  for (const value of Array.isArray(item.jp) ? item.jp : []) addOwner(value, item.en);
  for (const value of Array.isArray(item.alias) ? item.alias : []) addOwner(value, item.en);
}

for (const [label, canonical] of mappings) {
  const labelKey = parser.normalizeKey(label);
  const canonicalKey = parser.normalizeKey(canonical);
  const canonicalIdentity = parser.canonicalIdentityKey(canonical);
  assert.ok(labelKey, `${label}: reviewed label must produce an exact key`);
  assert.ok(canonicalKey, `${canonical}: canonical identity must produce an exact key`);

  const labelOwners = exactOwners.get(labelKey);
  assert.ok(labelOwners && labelOwners.size === 1, `${label}: reviewed label must resolve to one maintained identity`);
  assert.ok(labelOwners.has(canonicalIdentity), `${label}: maintained owner must be ${canonical}`);

  const canonicalOwners = exactOwners.get(canonicalKey);
  assert.ok(canonicalOwners && canonicalOwners.size === 1, `${canonical}: canonical target must exist uniquely in maintained dictionaries`);
  assert.ok(canonicalOwners.has(canonicalIdentity), `${canonical}: canonical owner identity mismatch`);
}

for (const unresolved of [
  'パラベン',
  'エデト酸塩',
  'Ammonium Polyacryloyldimethyl',
  'POE・ジメチコン共重合体',
  'POEメチルグルコシド',
  'POE水添ヒマシ油'
]) {
  const key = parser.normalizeKey(unresolved);
  const owners = key ? exactOwners.get(key) : null;
  assert.ok(!owners || owners.size !== 1, `${unresolved}: intentionally unresolved label must not become one exact maintained identity`);
}

const canonicalRecordPairs = [
  ['Neopentyl Glycol Dicaprate', 'ジカプリン酸ネオペンチルグリコール', 'emollient'],
  ['Lauryl Hydroxysultaine', 'ラウリルヒドロキシスルホベタイン液', 'surfactant'],
  ['Sodium Lauroyl Aspartate', 'ラウロイルアスパラギン酸Na液', 'surfactant'],
  ['Isostearyl Glyceryl Ether', 'イソステアリルグリセリルエーテル', 'emulsifier'],
  ['Cholesteryl Isostearate', 'イソステアリン酸コレステリル', 'emollient'],
  ['PEG-32', 'PEG1540', 'humectant'],
  ['PEG-150', 'PEG6000', 'humectant'],
  ['Trisiloxane', 'トリシロキサン', 'silicone']
];
for (const [canonical, japaneseLabel, category] of canonicalRecordPairs) {
  const record = records.find((item) => item?.en === canonical);
  assert.ok(record, `${canonical}: reviewed canonical record must exist`);
  assert.ok(Array.isArray(record.jp) && record.jp.includes(japaneseLabel), `${canonical}: reviewed Japanese label must be attached to canonical record`);
  assert.equal(record.category, category, `${canonical}: canonical category mismatch`);
}

const aliasBackedPairs = [
  ['ヤシ油脂肪酸アシルグルタミン酸Na', 'Sodium Cocoyl Glutamate'],
  ['シュガースクワラン', 'Squalane']
];
for (const [label, canonical] of aliasBackedPairs) {
  assert.equal(parser.normalizeKey(label), parser.normalizeKey(canonical), `${label}: shared alias must resolve to ${canonical}`);
}

const doc = read('tools/_shared/COSMETICS_JP_LABEL_VARIANTS.md');
for (const token of [
  'MHLW',
  'PMDA',
  'PEG-32',
  'PEG-150',
  'Trisiloxane',
  'Wave 3',
  'no fuzzy auto-replacement',
  'Amazon destinations remain fixed'
]) {
  assert.ok(doc.includes(token), `Japanese label variant documentation missing: ${token}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'jp-label-variants-peg-trisiloxane-wave1',
  reviewed_active_mappings: mappings.length,
  canonical_records_active: canonicalRecordPairs.length,
  shared_alias_mappings_active: aliasBackedPairs.length,
  dictionary_files: DATA_FILES.length,
  fuzzy_auto_replacement: false,
  broad_labels_forced_exact: false,
  amazon_input_driven: false
}, null, 2));
