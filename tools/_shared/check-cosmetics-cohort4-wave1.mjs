import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

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

const WAVE1_EXACT = [
  'Algin',
  'Ananas Sativus (Pineapple) Fruit Extract',
  'Dipentaerythrityl Hexa C5-9 Acid Esters',
  'Guar Hydroxypropyl-Trimonium Chloride',
  'Leontopodium (Edelweiss) Extract',
  'Oryza Sativa (Rice) Lees Extract',
  'Panthenol (Vitamin B5)',
  'Pleiogynium Timoriense Fruit Extract',
  'Podocarpus Elatus Fruit Extract',
  'Terminalia Ferdinandiana Fruit Extract',
  'Thymus Vulgaris (Thyme) Leaf Extract',
  'Tocopheryl Acetate (Vitamin E Acetate)'
];

const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));
const cohort = JSON.parse(read('tools/_shared/cosmetics-real-label-corpus-cohort4.json'));
const owners = new Map();

function canonicalIdentity(value) {
  if (parser?.canonicalIdentityKey) return parser.canonicalIdentityKey(value);
  if (parser?.normalizeBaseKey) return parser.normalizeBaseKey(value);
  return String(value || '').normalize('NFKC').toLowerCase().trim();
}

function addOwner(value, canonical) {
  const key = parser.normalizeKey(value);
  if (!key) return;
  if (!owners.has(key)) owners.set(key, new Set());
  owners.get(key).add(canonicalIdentity(canonical));
}

for (const item of records) {
  if (!item?.en) continue;
  addOwner(item.en, item.en);
  for (const value of Array.isArray(item.jp) ? item.jp : []) addOwner(value, item.en);
  for (const value of Array.isArray(item.alias) ? item.alias : []) addOwner(value, item.en);
}

function isExactKnown(value) {
  const key = parser.normalizeKey(value);
  const identities = owners.get(key);
  return Boolean(key && identities && identities.size === 1);
}

for (const name of WAVE1_EXACT) {
  assert.equal(isExactKnown(name), true, `${name}: cohort 4 Wave 1 exact identity must remain recognized`);
}

let total = 0;
let known = 0;
const unknown = [];
for (const product of cohort) {
  const parts = parser.splitIngredients(product.analysis_label);
  for (const value of parts) {
    total += 1;
    if (isExactKnown(value)) known += 1;
    else unknown.push({ product: product.id, ingredient: value });
  }
}

assert.equal(total, 134, `cohort 4 ingredient count changed unexpectedly: ${total}`);
assert.equal(known, 134, `cohort 4 Wave 1 exact recognition regressed: ${known}/${total}`);
assert.deepEqual(unknown, [], `cohort 4 Wave 1 must retain zero unknown labels: ${JSON.stringify(unknown)}`);

console.log(JSON.stringify({
  status: 'pass',
  phase: 'wave5-cohort4-dictionary-wave1',
  products: cohort.length,
  ingredients: total,
  exact_known: known,
  unknown: unknown.length,
  exact_coverage: Number((known / total).toFixed(4)),
  wave1_exact_names: WAVE1_EXACT.length,
  baseline_exact_known: 122,
  baseline_exact_coverage: 0.9104,
  baseline_unknown: 12
}, null, 2));
