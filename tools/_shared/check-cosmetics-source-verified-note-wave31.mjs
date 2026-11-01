import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const expected = {
  "alcohol": {
    "note": "COSMILE Europe lists Alcohol (ethanol) as a solvent that dissolves other substances; it also lists antimicrobial and viscosity-related functions.",
    "source": "https://cosmileeurope.eu/inci/detail/590/alcohol/"
  },
  "peg-150": {
    "note": "PEG-150 is listed as a humectant and solvent in cosmetics, with additional binding and fragrance-carrier functions.",
    "source": "https://cosmileeurope.eu/inci/detail/10488/peg-150/"
  },
  "lecithin": {
    "note": "Lecithin can help emulsify oil-and-water mixtures and is also listed for skin conditioning and emollient functions.",
    "source": "https://cosmileeurope.eu/inci/detail/8209/lecithin/"
  },
  "silica": {
    "note": "Silica is used as an absorbent and bulking ingredient in cosmetics; other listed functions include anticaking, opacifying and viscosity control.",
    "source": "https://cosmileeurope.eu/inci/detail/14425/silica/"
  },
  "histidine": {
    "note": "Histidine is listed as a humectant and skin-conditioning ingredient, as well as an antistatic agent.",
    "source": "https://cosmileeurope.eu/inci/detail/6499/histidine/"
  },
  "sucrose": {
    "note": "Sucrose can act as a humectant and skin-conditioning ingredient in cosmetic formulations.",
    "source": "https://cosmileeurope.eu/inci/detail/15664/sucrose/"
  },
  "ascorbyl palmitate": {
    "note": "Ascorbyl Palmitate is listed as an antioxidant used to limit oxidation of cosmetic ingredients; this does not establish a finished product's efficacy.",
    "source": "https://cosmileeurope.eu/inci/detail/1244/ascorbyl-palmitate/"
  },
  "coco-caprylate": {
    "note": "Coco-Caprylate is listed as a skin-conditioning emollient that helps soften and smooth the skin.",
    "source": "https://cosmileeurope.eu/inci/detail/3638/coco-caprylate/"
  },
  "acrylates copolymer": {
    "note": "Acrylates Copolymer is listed for film forming, binding and antistatic functions in cosmetic products.",
    "source": "https://cosmileeurope.eu/inci/detail/365/acrylates-copolymer/"
  },
  "hydrogenated lecithin": {
    "note": "Hydrogenated Lecithin is used to support emulsification of oil and water and is listed for skin conditioning.",
    "source": "https://cosmileeurope.eu/inci/detail/6653/hydrogenated-lecithin/"
  },
  "c12-15 alkyl benzoate": {
    "note": "C12-15 Alkyl Benzoate is listed for skin-conditioning and emollient functions in cosmetics.",
    "source": "https://cosmileeurope.eu/inci/detail/2154/c12-15-alkyl-benzoate/"
  },
  "glyceryl oleate": {
    "note": "Glyceryl Oleate serves as an emulsifier and an emollient in cosmetic formulations.",
    "source": "https://cosmileeurope.eu/inci/detail/6036/glyceryl-oleate/"
  },
  "sorbitan stearate": {
    "note": "Sorbitan Stearate is used as an emulsifier to help form mixtures of oil and water in cosmetic products.",
    "source": "https://cosmileeurope.eu/inci/detail/15319/sorbitan-stearate/"
  }
};
const authority = 'Cosmetics Europe / COSMILE Europe';
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')];
const raw = paths.flatMap(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const canonical = new Map(merged.map(item => [parser.canonicalIdentityKey(item.en), item]));

assert.equal(raw.length, 725, 'Do not expand or edit raw dictionary inventory');
assert.equal(merged.length, 599, 'Do not invent/collapse canonical names');
assert.equal(Object.keys(expected).length, 13);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 196);
assert.equal(Object.keys(parser.verifiedNoteEvidence).length, 235, '222 + 13 notes');
assert.equal(parser.version, '1.68.0');
assert.equal(parser.verifiedNoteEvidence.bha, undefined, 'Ambiguous BHA remains incomplete');
for (const [key, want] of Object.entries(expected)) {
  assert.equal(parser.canonicalIdentityKey(key), key);
  const note = parser.verifiedNoteEvidence[key];
  const runtime = canonical.get(key);
  assert.ok(note, key + ': missing official source-backed note');
  assert.equal(note.note_short, want.note);
  assert.deepEqual([...note.note_sources], [want.source]);
  assert.equal(note.authority, authority);
  assert.ok(runtime, key + ': canonical dictionary identity missing');
  assert.equal(runtime.note_verified, true, key + ': runtime evidence gate');
  assert.equal(runtime.note_short, want.note);
  assert.ok(runtime.note_sources.includes(want.source));
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean), key + ': maintained Japanese label missing');
  assert.equal(runtime.note_provenance_conflict, undefined);
  assert.ok(!/guaranteed safe|hypoallergenic|cures|approved for all products/i.test(want.note));
}
console.log('COSMETICS_NOTE_WAVE31=PASS: 13 exact new COSMILE source records, 235/599 notes, 196 verified roles, raw inventory unchanged');
