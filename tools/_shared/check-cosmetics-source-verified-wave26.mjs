import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json', 'utf8'));
const files = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8}, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i+1) + '.json')];
const rows = files.flatMap(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const merged = parser.mergeDictionaryRecords(rows);
const byCanonical = new Map(merged.map(item => [parser.canonicalIdentityKey(item.en), item]));
const AUTHORITY = 'Cosmetics Europe / COSMILE Europe';
const expected = Object.freeze({
  "hydrolyzed keratin": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/6885/hydrolyzed-keratin/",
    "note": "Hydrolyzed Keratin is used for hair conditioning and film formation; COSMILE Europe also lists humectant and skin-conditioning functions."
  },
  "hydrolyzed silk": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/6982/hydrolyzed-silk/",
    "note": "Hydrolyzed Silk serves hair conditioning and moisture retention; COSMILE Europe also lists antistatic and skin-conditioning functions."
  },
  "hydrolyzed collagen": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "source": "https://cosmileeurope.eu/inci/detail/6824/hydrolyzed-collagen/",
    "note": "Hydrolyzed Collagen is a humectant and film-forming ingredient; COSMILE Europe also lists hair- and skin-conditioning functions."
  },
  "menthol": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/8827/menthol/",
    "note": "Menthol can impart fragrance and a refreshing sensation; COSMILE Europe also lists soothing and denaturant functions."
  },
  "beeswax": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "source": "https://cosmileeurope.eu/inci/detail/21574/beeswax/",
    "note": "Beeswax can control formulation viscosity and bind powders; COSMILE Europe also lists emulsion-stabilising and skin-conditioning functions."
  },
  "aluminum starch octenylsuccinate": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "source": "https://cosmileeurope.eu/inci/detail/791/aluminum-starch-octenylsuccinate/",
    "note": "Aluminum Starch Octenylsuccinate can control formulation viscosity, absorb dispersed substances and reduce powder caking."
  },
  "benzyl benzoate": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/1593/benzyl-benzoate/",
    "note": "Benzyl Benzoate serves as a fragrance ingredient or solvent; COSMILE Europe also lists an antimicrobial function."
  },
  "benzyl salicylate": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/1601/benzyl-salicylate/",
    "note": "Benzyl Salicylate serves as a fragrance ingredient and a UV absorber that can help protect the cosmetic formulation."
  },
  "hydroxycitronellal": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/19143/hydroxycitronellal/",
    "note": "Hydroxycitronellal is used to impart fragrance to cosmetic products."
  },
  "isoeugenol": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/7436/isoeugenol/",
    "note": "Isoeugenol is a fragrance ingredient; COSMILE Europe also lists a flavouring function."
  },
  "amyl cinnamal": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/19189/amyl-cinnamal/",
    "note": "Amyl Cinnamal is used to impart fragrance to cosmetic products."
  }
});

assert.equal(rows.length, 725, 'maintained raw dictionaries must remain unchanged');
assert.equal(merged.length, 599, 'wave26 must not change the canonical recognition inventory');
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 130, 'wave26 adds exactly eleven reviewed role identities');
assert.equal(Object.keys(parser.verifiedNoteEvidence).length, 96, 'note wave22 adds exactly eleven verified ingredient notes');
assert.equal(parser.version, '1.59.0');

for (const [key, expectation] of Object.entries(expected)) {
  const category = parser.verifiedCategoryEvidence[key];
  const note = parser.verifiedNoteEvidence[key];
  const mapping = taxonomy.reviewed_mappings[key];
  assert.ok(category, key + ': source-backed category missing');
  assert.equal(category.category, expectation.category, key + ': unsupported category replacement');
  assert.equal(category.authority, AUTHORITY, key + ': category authority mismatch');
  assert.deepEqual([...category.sources], [expectation.source], key + ': exact reviewed category source');
  assert.ok(mapping?.runtime_verified, key + ': category taxonomy must be runtime-verified');
  assert.equal(mapping.category, expectation.category, key + ': taxonomy category mismatch');
  assert.deepEqual(mapping.source_functions, [expectation.sourceFunction], key + ': authority function mismatch');
  assert.deepEqual(mapping.sources, [expectation.source], key + ': category taxonomy source mismatch');
  assert.ok(note, key + ': reviewed note missing');
  assert.equal(note.note_short, expectation.note, key + ': reviewed note text changed');
  assert.equal(note.authority, AUTHORITY);
  assert.deepEqual([...note.note_sources], [expectation.source], key + ': reviewed note source');
  const result = byCanonical.get(key);
  assert.ok(result, key + ': canonical merged ingredient missing');
  assert.equal(result.category, expectation.category, key + ': public runtime role must be source-reviewed');
  assert.ok(Array.isArray(result.jp) && result.jp.some(Boolean), key + ': Japanese name missing');
  assert.equal(result.note_verified, true, key + ': source-backed note must be present');
  assert.equal(result.note_short, expectation.note, key + ': canonical note provenance must survive merge');
  assert.equal(result.note_provenance_conflict, undefined, key + ': conflicting notes must fail closed');
  assert.ok(result.note_sources.includes(expectation.source), key + ': missing runtime source URL');
  assert.equal(result.note_authority, AUTHORITY);
}
for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(parser.verifiedCategoryEvidence[ambiguous], undefined,
    ambiguous + ': ambiguity must not be converted into a sourced category');
  assert.equal(parser.verifiedNoteEvidence[ambiguous], undefined,
    ambiguous + ': ambiguity must not receive a verified note');
}
console.log('COSMETICS_VERIFIED_WAVE26=PASS: 11 independently sourced roles and notes, 599 canonical identities unchanged, 130 role sources, 96 verified notes');
