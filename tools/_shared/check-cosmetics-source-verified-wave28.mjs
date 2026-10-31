import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json', 'utf8'));
const sourceFiles = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8}, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')];
const raw = sourceFiles.flatMap(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const byCanonical = new Map(merged.map(record => [parser.canonicalIdentityKey(record.en), record]));
const expected = Object.freeze({
  "polyisobutene": {
    "category": "binder",
    "sourceFunction": "binding",
    "url": "https://cosmileeurope.eu/inci/detail/12319/polyisobutene/",
    "note": "Polyisobutene is a binding ingredient; COSMILE Europe also lists film formation and viscosity control."
  },
  "peg-60 hydrogenated castor oil": {
    "category": "emulsifier",
    "sourceFunction": "surfactant - emulsifying",
    "url": "https://cosmileeurope.eu/inci/detail/10991/peg-60-hydrogenated-castor-oil/",
    "note": "PEG-60 Hydrogenated Castor Oil can help emulsify water and oil; COSMILE Europe also lists cleansing surfactant and fragrance-functional roles."
  },
  "kaolin": {
    "category": "colorant",
    "sourceFunction": "colorant",
    "url": "https://cosmileeurope.eu/inci/detail/7698/kaolin/",
    "note": "Kaolin can act as a colourant; COSMILE Europe also lists absorbent, abrasive and opacifying functions."
  },
  "nylon-12": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "url": "https://cosmileeurope.eu/inci/detail/9521/nylon-12/",
    "note": "Nylon-12 helps control product viscosity; COSMILE Europe also lists bulking and opacifying functions."
  },
  "guar hydroxypropyltrimonium chloride": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "url": "https://cosmileeurope.eu/inci/detail/6212/guar-hydroxypropyltrimonium-chloride/",
    "note": "Guar Hydroxypropyltrimonium Chloride conditions skin; COSMILE Europe also lists antistatic, film-forming and viscosity-controlling functions."
  },
  "calcium carbonate": {
    "category": "buffer",
    "sourceFunction": "buffering",
    "url": "https://cosmileeurope.eu/inci/detail/2372/calcium-carbonate/",
    "note": "Calcium Carbonate can buffer the pH of a cosmetic formula; COSMILE Europe also lists abrasive, bulking and opacifying functions."
  },
  "polyquaternium-37": {
    "category": "film former",
    "sourceFunction": "film forming",
    "url": "https://cosmileeurope.eu/inci/detail/12404/polyquaternium-37/",
    "note": "Polyquaternium-37 forms a film on skin, hair or nails and has an antistatic function."
  },
  "microcrystalline cellulose": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "url": "https://cosmileeurope.eu/inci/detail/9079/microcrystalline-cellulose/",
    "note": "Microcrystalline Cellulose can control formula viscosity; COSMILE Europe also lists absorbent, bulking, emulsion-stabilising and opacifying functions."
  },
  "zinc stearate": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "url": "https://cosmileeurope.eu/inci/detail/17145/zinc-stearate/",
    "note": "Zinc Stearate can control cosmetic viscosity; COSMILE Europe also lists anticaking, slip-modifying and colourant functions."
  },
  "polymethyl methacrylate": {
    "category": "film former",
    "sourceFunction": "film forming",
    "url": "https://cosmileeurope.eu/inci/detail/12336/polymethyl-methacrylate/",
    "note": "Polymethyl Methacrylate is used to form a continuous film on skin, hair or nails."
  },
  "polyacrylate-13": {
    "category": "film former",
    "sourceFunction": "film forming",
    "url": "https://cosmileeurope.eu/inci/detail/11976/polyacrylate-13/",
    "note": "Polyacrylate-13 is used as a film-forming ingredient."
  },
  "magnesium stearate": {
    "category": "colorant",
    "sourceFunction": "colorant",
    "url": "https://cosmileeurope.eu/inci/detail/8561/magnesium-stearate/",
    "note": "Magnesium Stearate can be used as a colourant; COSMILE Europe also lists anticaking, bulking and moisturising functions."
  },
  "glycosphingolipids": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning - miscellaneous",
    "url": "https://cosmileeurope.eu/inci/detail/6143/glycosphingolipids/",
    "note": "Glycosphingolipids are used for skin conditioning."
  },
  "ceramide ns": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning - miscellaneous",
    "url": "https://cosmileeurope.eu/inci/detail/25523/ceramide-ns/",
    "note": "Ceramide NS conditions skin; COSMILE Europe also lists a hair-conditioning function."
  },
  "soluble collagen": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "url": "https://cosmileeurope.eu/inci/detail/15238/soluble-collagen/",
    "note": "Soluble Collagen acts as a humectant; COSMILE Europe also lists film-forming, hair-conditioning, antistatic and skin-conditioning functions."
  },
  "ozokerite": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "url": "https://cosmileeurope.eu/inci/detail/10032/ozokerite/",
    "note": "Ozokerite can adjust cosmetic viscosity; COSMILE Europe also lists binding, emulsion-stabilising and opacifying functions."
  },
  "polyacrylamide": {
    "category": "film former",
    "sourceFunction": "film forming",
    "url": "https://cosmileeurope.eu/inci/detail/11964/polyacrylamide/",
    "note": "Polyacrylamide forms a continuous film on skin, hair or nails; COSMILE Europe also lists binding and antistatic functions."
  },
  "padimate o": {
    "category": "uv filter",
    "sourceFunction": "uv filter",
    "url": "https://cosmileeurope.eu/inci/detail/5470/ethylhexyl-dimethyl-paba/",
    "note": "Padimate O (also called Ethylhexyl Dimethyl PABA) serves as a UV filter; COSMILE Europe also lists UV-absorbing and light-stabilising functions."
  }
});
const authority = 'Cosmetics Europe / COSMILE Europe';

assert.equal(raw.length, 725, 'the frozen raw dictionary inventory must remain intact');
assert.equal(merged.length, 599, 'new role evidence must not change canonical recognition');
assert.equal(Object.keys(expected).length, 18, 'only the 18 independently reviewed identities may be promoted');
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 160, 'exact cumulative role evidence count');
assert.equal(Object.keys(parser.verifiedNoteEvidence).length, 126, 'exact cumulative verified-note count');
assert.equal(Object.keys(taxonomy.reviewed_mappings).length, 160, 'taxonomy and parser evidence must match');
assert.equal(parser.version, '1.61.0');
assert.deepEqual(taxonomy.categories.colorant.authority_functions, ['colorant'],
  'COLORANT must be an explicit source-reviewed function, not an inferred powder category');
for (const [canonical, expectedRole] of Object.entries(expected)) {
  const provenance = parser.verifiedCategoryEvidence[canonical];
  const verifiedNote = parser.verifiedNoteEvidence[canonical];
  const tax = taxonomy.reviewed_mappings[canonical];
  const runtime = byCanonical.get(canonical);
  assert.ok(provenance, canonical + ': missing verified role');
  assert.equal(provenance.category, expectedRole.category);
  assert.deepEqual([...provenance.sources], [expectedRole.url]);
  assert.equal(provenance.authority, authority);
  assert.ok(tax?.runtime_verified, canonical + ': taxonomy source not verified');
  assert.equal(tax.category, expectedRole.category);
  assert.deepEqual(tax.source_functions, [expectedRole.sourceFunction]);
  assert.deepEqual(tax.sources, [expectedRole.url]);
  assert.equal(tax.authority, authority);
  assert.ok(verifiedNote, canonical + ': no verified-specific note');
  assert.equal(verifiedNote.note_short, expectedRole.note);
  assert.deepEqual([...verifiedNote.note_sources], [expectedRole.url]);
  assert.equal(verifiedNote.authority, authority);
  assert.ok(runtime, canonical + ': canonical runtime entry missing');
  assert.equal(runtime.category, expectedRole.category, canonical + ': wrong public primary role');
  assert.equal(runtime.category_verified, true, canonical + ': role evidence marker missing');
  assert.equal(runtime.note_verified, true, canonical + ': evidence-backed note missing');
  assert.equal(runtime.note_short, expectedRole.note);
  assert.ok(runtime.note_sources.includes(expectedRole.url));
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean), canonical + ': Japanese ingredient name missing');
  assert.equal(runtime.note_provenance_conflict, undefined);
}
for (const token of parser.ambiguousExactKeys || []) {
  assert.equal(parser.verifiedCategoryEvidence[token], undefined, token + ': ambiguous token must stay unverified');
  assert.equal(parser.verifiedNoteEvidence[token], undefined, token + ': ambiguous token must not receive a note');
}
console.log('COSMETICS_VERIFIED_WAVE28=PASS: 18 source-backed category roles and notes; 160 roles, 126 notes, 599 canonical names');
