import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

// Independent, exact-name COSMILE Europe review; no inferred safety or therapy claims.
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const expected = {
  "acetone": {
    "note": "Acetone is listed as a solvent that dissolves other substances, and also has denaturant and fragrance-carrier functions in cosmetics.",
    "source": "https://cosmileeurope.eu/inci/detail/215/acetone/"
  },
  "alpha-isomethyl ionone": {
    "note": "Alpha-Isomethyl Ionone is a fragrance ingredient; COSMILE also lists a skin-conditioning function.",
    "source": "https://cosmileeurope.eu/inci/detail/707/alpha-isomethyl-ionone/"
  },
  "aminomethyl propanol": {
    "note": "Aminomethyl Propanol is a buffering ingredient used to control the pH of cosmetic formulations.",
    "source": "https://cosmileeurope.eu/inci/detail/846/aminomethyl-propanol/"
  },
  "ammonium laureth sulfate": {
    "note": "Ammonium Laureth Sulfate is listed as a cleansing surfactant that also helps form foam.",
    "source": "https://cosmileeurope.eu/inci/detail/910/ammonium-laureth-sulfate/"
  },
  "amodimethicone": {
    "note": "Amodimethicone has antistatic and hair-conditioning functions, including helping hair feel softer and easier to comb.",
    "source": "https://cosmileeurope.eu/inci/detail/953/amodimethicone/"
  },
  "argania spinosa kernel oil": {
    "note": "Argania Spinosa Kernel Oil is a plant-derived skin-conditioning emollient that softens and smooths the skin.",
    "source": "https://cosmileeurope.eu/inci/detail/1152/argania-spinosa-kernel-oil/"
  },
  "aspartic acid": {
    "note": "Aspartic Acid is listed for hair and skin conditioning and for reducing static charge; COSMILE also lists a fragrance function.",
    "source": "https://cosmileeurope.eu/inci/detail/1271/aspartic-acid/"
  },
  "azelaic acid": {
    "note": "For cosmetic ingredient functions, COSMILE lists Azelaic Acid for pH buffering and fragrance; this entry does not establish a therapeutic claim.",
    "source": "https://cosmileeurope.eu/inci/detail/1389/azelaic-acid/"
  },
  "bakuchiol": {
    "note": "Bakuchiol is listed for antioxidant, antimicrobial and skin-conditioning/emollient functions; the listing is not a clinical efficacy claim.",
    "source": "https://cosmileeurope.eu/inci/detail/1440/bakuchiol/"
  },
  "behentrimonium chloride": {
    "note": "Behentrimonium Chloride is listed for antistatic and hair-conditioning functions, as well as preservative use.",
    "source": "https://cosmileeurope.eu/inci/detail/1530/behentrimonium-chloride/"
  },
  "bentonite": {
    "note": "Bentonite is a mineral clay listed as an absorbent and bulking ingredient that also helps stabilize emulsions and control viscosity.",
    "source": "https://cosmileeurope.eu/inci/detail/1555/bentonite/"
  },
  "benzalkonium chloride": {
    "note": "Benzalkonium Chloride is listed for preservative, antimicrobial, antistatic and dispersing functions in cosmetic formulations.",
    "source": "https://cosmileeurope.eu/inci/detail/1559/benzalkonium-chloride/"
  },
  "camellia sinensis leaf extract": {
    "note": "Camellia Sinensis Leaf Extract is listed for antioxidant, humectant and skin-conditioning functions among other cosmetic uses.",
    "source": "https://cosmileeurope.eu/inci/detail/2499/camellia-sinensis-leaf-extract/"
  },
  "cellulose gum": {
    "note": "Cellulose Gum is listed as a binder, film former, emulsion stabilizer and viscosity-control ingredient.",
    "source": "https://cosmileeurope.eu/inci/detail/2796/cellulose-gum/"
  },
  "cetrimonium chloride": {
    "note": "Cetrimonium Chloride has antistatic, preservative and emulsifying-surfactant functions in cosmetics.",
    "source": "https://cosmileeurope.eu/inci/detail/2965/cetrimonium-chloride/"
  },
  "citronellol": {
    "note": "Citronellol is a fragrance ingredient used to contribute to the scent of a cosmetic product.",
    "source": "https://cosmileeurope.eu/inci/detail/19208/citronellol/"
  },
  "coumarin": {
    "note": "Coumarin is listed as a fragrance ingredient that enhances the scent of cosmetic products.",
    "source": "https://cosmileeurope.eu/inci/detail/19218/coumarin/"
  },
  "dehydroacetic acid": {
    "note": "Dehydroacetic Acid is listed as a preservative that helps protect cosmetic formulations from microbial spoilage.",
    "source": "https://cosmileeurope.eu/inci/detail/4211/dehydroacetic-acid/"
  }
};
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')];
const raw = paths.flatMap(path => JSON.parse(fs.readFileSync(path, 'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const canonical = new Map(merged.map(item => [parser.canonicalIdentityKey(item.en), item]));

assert.equal(raw.length, 725, 'frozen raw records must stay untouched');
assert.equal(merged.length, 599, 'frozen canonical scope must stay untouched');
assert.equal(Object.keys(expected).length, 18);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 196);
assert.equal(Object.keys(parser.verifiedNoteEvidence).length, 253, '235 + 18 unique source-backed notes');
assert.ok(Number(parser.version.split('.')[1]) >= 69, 'wave32 parser contract');
assert.equal(parser.verifiedNoteEvidence.bha, undefined, 'ambiguous BHA remains incomplete');
const sourceUrls = new Set();
for (const [key, want] of Object.entries(expected)) {
  assert.equal(parser.canonicalIdentityKey(key), key, key + ': canonical key mismatch');
  const actual = parser.verifiedNoteEvidence[key];
  const runtime = canonical.get(key);
  assert.ok(actual && runtime, key + ': missing canonical identity/evidence');
  assert.equal(actual.note_short, want.note);
  assert.deepEqual([...actual.note_sources], [want.source]);
  assert.equal(actual.authority, 'Cosmetics Europe / COSMILE Europe');
  assert.match(want.source, /^https:\/\/cosmileeurope\.eu\/inci\/detail\/\d+\/[^/]+\/$/);
  assert.ok(!sourceUrls.has(want.source), key + ': duplicate source');
  sourceUrls.add(want.source);
  assert.equal(runtime.note_verified, true, key + ': provenance gate');
  assert.equal(runtime.note_short, want.note);
  assert.ok(runtime.note_sources.includes(want.source));
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean), key + ': Japanese name must exist');
  assert.equal(runtime.note_provenance_conflict, undefined);
  assert.doesNotMatch(want.note, /guaranteed safe|hypoallergenic|cures|approved for all|clinically proven/i);
}
const ready = merged.filter(item => !!item.note_verified && !!item.note_short && item.note_sources?.length);
assert.equal(ready.length, 253, 'reviewed runtime notes must all survive conflict-aware merge');
console.log('COSMETICS_NOTE_WAVE32=PASS: 18 distinct exact COSMILE entries; 253/599 notes, 598/599 public roles; ambiguous BHA unresolved');
