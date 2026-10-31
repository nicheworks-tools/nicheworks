import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json', 'utf8'));
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')];
const raw = paths.flatMap(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const canonical = new Map(merged.map(row => [parser.canonicalIdentityKey(row.en), row]));
const expected = Object.freeze({
  "disodium edta dihydrate": {
    "category": "chelating agent",
    "sourceFunction": "chelating agent",
    "source": "https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=5761",
    "note": "Disodium EDTA Dihydrate binds metal ions (chelating agent); Health Canada lists this exact hydrated ingredient for non-medicinal chelation.",
    "authority": "Health Canada / Natural Health Products Ingredients Database"
  },
  "benzyl cinnamate": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://kcia.or.kr/cid/search/ingd_view.php?no=524",
    "note": "Benzyl Cinnamate is used for fragrance in cosmetic products; this function does not predict allergy in a particular individual.",
    "authority": "Korea Cosmetic Association / Ingredient Dictionary"
  },
  "citrus aurantium bergamia bergamot fruit oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=4517",
    "note": "Citrus Aurantium Bergamia (Bergamot) Fruit Oil is listed by Health Canada for non-medicinal fragrance use; product-specific restrictions and quality still require separate review.",
    "authority": "Health Canada / Natural Health Products Ingredients Database"
  },
  "talc": {
    "category": "bulking agent",
    "sourceFunction": "bulking",
    "source": "https://cosmileeurope.eu/inci/detail/15804/talc/",
    "note": "Talc can provide a bulking function in cosmetics; COSMILE Europe also lists absorbent, anticaking, opacifying and slip-modifying functions.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "nylon-6": {
    "category": "bulking agent",
    "sourceFunction": "bulking",
    "source": "https://journals.sagepub.com/doi/10.1177/1091581814563524",
    "note": "Nylon-6 belongs to the nylon polymers used mainly as bulking and opacifying agents in cosmetics, according to the Cosmetic Ingredient Review assessment.",
    "authority": "Cosmetic Ingredient Review / International Journal of Toxicology"
  },
  "ptfe": {
    "category": "bulking agent",
    "sourceFunction": "bulking",
    "source": "https://cosmileeurope.eu/inci/detail/13392/ptfe/",
    "note": "PTFE is listed by COSMILE Europe for its bulking function in cosmetic formulations; this is not a product safety determination.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  }
});
assert.equal(raw.length, 725, 'wave31 must not rewrite raw recognition records');
assert.equal(merged.length, 599, 'wave31 must not invent or collapse canonical identities');
assert.equal(Object.keys(expected).length, 6);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 196);
assert.equal(Object.keys(parser.verifiedNoteEvidence).length, 162);
assert.equal(Object.keys(taxonomy.reviewed_mappings).length, 196);
assert.equal(parser.version, '1.64.0');
assert.deepEqual(taxonomy.categories['bulking agent'].authority_functions, ['bulking']);

for (const [key, want] of Object.entries(expected)) {
  const category = parser.verifiedCategoryEvidence[key];
  const note = parser.verifiedNoteEvidence[key];
  const mapping = taxonomy.reviewed_mappings[key];
  const item = canonical.get(key);
  assert.ok(category, key + ': reviewed role missing');
  assert.equal(category.category, want.category);
  assert.equal(category.authority, want.authority);
  assert.deepEqual([...category.sources], [want.source]);
  assert.ok(note, key + ': source-linked ingredient note missing');
  assert.equal(note.authority, want.authority);
  assert.equal(note.note_short, want.note);
  assert.deepEqual([...note.note_sources], [want.source]);
  assert.equal(mapping.category, want.category);
  assert.deepEqual(mapping.source_functions, [want.sourceFunction]);
  assert.equal(mapping.authority, want.authority);
  assert.deepEqual(mapping.sources, [want.source]);
  assert.equal(mapping.runtime_verified, true);
  assert.ok(item, key + ': merged canonical ingredient missing');
  assert.equal(item.category, want.category);
  assert.equal(item.category_verified, true);
  assert.equal(item.note_verified, true);
  assert.equal(item.note_short, want.note);
  assert.ok(item.note_sources.includes(want.source));
  assert.ok(Array.isArray(item.jp) && item.jp.some(Boolean), key + ': Japanese ingredient name missing');
  assert.equal(item.note_provenance_conflict, undefined);
}
assert.equal(parser.verifiedCategoryEvidence.bha, undefined,
  'BHA is ambiguous between different substances and must remain unsupported');
assert.equal(parser.verifiedNoteEvidence.bha, undefined);
assert.ok(canonical.has('bha'), 'do not delete ambiguous BHA from the recognition corpus');

function role(file, name) {
  const s = fs.readFileSync(file, 'utf8');
  const start = s.indexOf('const ' + name + ' = {');
  const end = s.indexOf('\n};', start);
  assert.ok(start >= 0 && end > start, file + ': bilingual role table must exist');
  const context = {};
  vm.runInNewContext(s.slice(start, end + 3) + '\nglobalThis.roles = ' + name + ';', context);
  return context.roles['bulking agent'];
}
const liteFile = 'tools/cosmetic-ingredient-checker-lite/app.js';
const fastFile = 'tools/inci-fastscan/js/web_ui.js';
for (const [a,b] of [['CATEGORY_LABELS','ROLE_LABELS'], ['ROLE_DESCRIPTIONS','ROLE_DESCRIPTIONS']]) {
  const lite = role(liteFile, a);
  const fast = role(fastFile, b);
  assert.ok(lite?.ja && lite?.en && fast?.ja && fast?.en, 'BULKING must be explained in both languages in both tools');
  assert.equal(lite.ja, fast.ja, 'Lite/FastScan Japanese role parity');
  assert.equal(lite.en, fast.en, 'Lite/FastScan English role parity');
}
console.log('COSMETICS_VERIFIED_WAVE31=PASS: 6 exact individually sourced roles, bilingual BULKING, 196 role evidence, 162 verified notes, ambiguous BHA preserved');
