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
  ['ジカプリン酸ネオペンチルグリコール', 'Neopentyl Glycol Dicaprate'],
  ['ラウリルヒドロキシスルホベタイン液', 'Lauryl Hydroxysultaine'],
  ['グリセリルエチルヘキシルエーテル', 'Ethylhexylglycerin']
];

const canonicalOwners = new Map();
for (const item of records) {
  if (!item?.en) continue;
  const key = parser.normalizeKey(item.en);
  if (!key) continue;
  if (!canonicalOwners.has(key)) canonicalOwners.set(key, new Set());
  canonicalOwners.get(key).add(parser.canonicalIdentityKey(item.en));
}

for (const [label, canonical] of mappings) {
  const labelKey = parser.normalizeKey(label);
  const canonicalKey = parser.normalizeKey(canonical);
  assert.ok(labelKey, `${label}: reviewed label must produce an exact key`);
  assert.equal(labelKey, canonicalKey, `${label}: must resolve to ${canonical}`);
  const owners = canonicalOwners.get(canonicalKey);
  assert.ok(owners && owners.size === 1, `${canonical}: canonical target must exist uniquely in maintained dictionaries`);
}

for (const unresolved of ['パラベン', 'エデト酸塩', 'Ammonium Polyacryloyldimethyl']) {
  const key = parser.normalizeKey(unresolved);
  const owners = key ? canonicalOwners.get(key) : null;
  assert.ok(!owners || owners.size !== 1, `${unresolved}: intentionally unresolved label must not become one exact maintained identity`);
}

const doc = read('tools/_shared/COSMETICS_JP_LABEL_VARIANTS.md');
for (const token of [
  'MHLW',
  'PMDA',
  'Neopentyl Glycol Dicaprate',
  'Lauryl Hydroxysultaine',
  'Ethylhexylglycerin',
  'no fuzzy auto-replacement',
  'Amazon destinations remain fixed'
]) {
  assert.ok(doc.includes(token), `Japanese label variant documentation missing: ${token}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'jp-label-variants-wave1',
  reviewed_mappings: mappings.length,
  dictionary_files: DATA_FILES.length,
  fuzzy_auto_replacement: false,
  broad_labels_forced_exact: false,
  amazon_input_driven: false
}, null, 2));
