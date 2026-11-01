import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const parser=require('./cosmetic-ingredient-parser.js');
const files=['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const raw=files.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const runtime=parser.mergeDictionaryRecords(raw);
const byCanonical=new Map(runtime.map(row=>[parser.canonicalIdentityKey(row.en),row]));
const expected=Object.freeze({
  "disodium cocoamphodiacetate": {
    "url": "https://cosmileeurope.eu/inci/detail/4922/disodium-cocoamphodiacetate/",
    "note": "Disodium Cocoamphodiacetate is a cleansing surfactant; COSMILE Europe also lists hair and skin conditioning and foam boosting."
  },
  "isododecane": {
    "url": "https://cosmileeurope.eu/inci/detail/7429/isododecane/",
    "note": "Isododecane is a solvent and skin-softening emollient, with a fragrance function also listed by COSMILE Europe."
  },
  "sodium lauroyl sarcosinate": {
    "url": "https://cosmileeurope.eu/inci/detail/14896/sodium-lauroyl-sarcosinate/",
    "note": "Sodium Lauroyl Sarcosinate is a cleansing surfactant; COSMILE Europe also lists foaming, skin and hair conditioning and viscosity control."
  },
  "disodium lauryl sulfosuccinate": {
    "url": "https://cosmileeurope.eu/inci/detail/4979/disodium-lauryl-sulfosuccinate/",
    "note": "Disodium Lauryl Sulfosuccinate is a cleansing and foaming surfactant; COSMILE Europe also lists skin conditioning."
  },
  "sodium ascorbyl phosphate": {
    "url": "https://cosmileeurope.eu/inci/detail/14550/sodium-ascorbyl-phosphate/",
    "note": "Sodium Ascorbyl Phosphate is a vitamin C derivative used as an antioxidant in cosmetic formulations."
  },
  "ascorbyl glucoside": {
    "url": "https://cosmileeurope.eu/inci/detail/1239/ascorbyl-glucoside/",
    "note": "Ascorbyl Glucoside is a vitamin C derivative listed for antioxidant function in cosmetics."
  },
  "beta-glucan": {
    "url": "https://cosmileeurope.eu/inci/detail/1642/beta-glucan/",
    "note": "Beta-Glucan is listed for skin conditioning and for bulking cosmetic formulations."
  },
  "ubiquinone": {
    "url": "https://cosmileeurope.eu/inci/detail/16674/ubiquinone/",
    "note": "Ubiquinone (Coenzyme Q10) is used as an antioxidant and skin-conditioning ingredient."
  },
  "ferulic acid": {
    "url": "https://cosmileeurope.eu/inci/detail/5628/ferulic-acid/",
    "note": "Ferulic Acid has antioxidant and antimicrobial functions in cosmetic formulations."
  },
  "magnesium ascorbyl phosphate": {
    "url": "https://cosmileeurope.eu/inci/detail/8511/magnesium-ascorbyl-phosphate/",
    "note": "Magnesium Ascorbyl Phosphate is a vitamin C derivative used for antioxidant and skin-conditioning functions."
  },
  "hyaluronic acid": {
    "url": "https://cosmileeurope.eu/inci/detail/6550/hyaluronic-acid/",
    "note": "Hyaluronic Acid holds moisture in cosmetics and has moisturising and skin-conditioning functions."
  },
  "resveratrol": {
    "url": "https://cosmileeurope.eu/inci/detail/13641/resveratrol/",
    "note": "Resveratrol serves as an antioxidant and has a skin-protecting function in cosmetics."
  },
  "arbutin": {
    "url": "https://cosmileeurope.eu/inci/detail/1127/arbutin/",
    "note": "Arbutin (beta-arbutin) is listed for antioxidant, skin-conditioning and skin-tone lightening functions; its cosmetic use is subject to applicable restrictions."
  },
  "centella asiatica extract": {
    "url": "https://cosmileeurope.eu/inci/detail/2805/centella-asiatica-extract/",
    "note": "Centella Asiatica Extract conditions and soothes skin; COSMILE Europe also lists smoothing and cleansing functions."
  },
  "caffeine": {
    "url": "https://cosmileeurope.eu/inci/detail/2351/caffeine/",
    "note": "Caffeine is listed for skin conditioning and fragrance functions in cosmetic products."
  },
  "madecassoside": {
    "url": "https://cosmileeurope.eu/inci/detail/8504/madecassoside/",
    "note": "Madecassoside is used for antioxidant and skin-conditioning functions in cosmetics."
  },
  "gluconolactone": {
    "url": "https://cosmileeurope.eu/inci/detail/5890/gluconolactone/",
    "note": "Gluconolactone binds metal ions as a chelating ingredient and is also listed for skin conditioning."
  },
  "bht": {
    "url": "https://cosmileeurope.eu/inci/detail/1672/bht/",
    "note": "BHT (Butylhydroxytoluene) acts as an antioxidant to help protect cosmetic formulations against oxidation."
  },
  "sodium gluconate": {
    "url": "https://cosmileeurope.eu/inci/detail/14787/sodium-gluconate/",
    "note": "Sodium Gluconate binds metal ions as a chelating ingredient and is also listed for skin conditioning."
  },
  "phytic acid": {
    "url": "https://cosmileeurope.eu/inci/detail/11656/phytic-acid/",
    "note": "Phytic Acid acts as a chelating ingredient by binding metal ions in cosmetic formulations."
  },
  "sodium phytate": {
    "url": "https://cosmileeurope.eu/inci/detail/15036/sodium-phytate/",
    "note": "Sodium Phytate is used to bind metal ions in cosmetics; COSMILE Europe also lists an oral-care function."
  }
});
const authority='Cosmetics Europe / COSMILE Europe';
assert.equal(raw.length,725,'raw recognition inventory is frozen');
assert.equal(runtime.length,599,'canonical names must not change in a note-only wave');
assert.equal(Object.keys(expected).length,21);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length,196,'category evidence unchanged');
assert.ok(Object.keys(parser.verifiedNoteEvidence).length >= 202,'note wave29 source evidence must remain after note wave30');
assert.ok(Number(parser.version.split('.')[1]) >= 66,'note wave29 parser contract must be retained');
for(const [key,want] of Object.entries(expected)) {
  const note=parser.verifiedNoteEvidence[key];
  const row=byCanonical.get(key);
  assert.ok(note,key+': specific verified note missing');
  assert.equal(note.note_short,want.note,key+': note text differs from review');
  assert.deepEqual([...note.note_sources],[want.url],key+': wrong individual source');
  assert.equal(note.authority,authority);
  assert.ok(row,key+': canonical identity not found');
  assert.equal(row.note_verified,true,key+': runtime note not provenance-marked');
  assert.equal(row.note_short,want.note,key+': runtime note differs from overlay');
  assert.ok(row.note_sources.includes(want.url),key+': official source not propagated');
  assert.equal(row.note_provenance_conflict,undefined);
  assert.ok(Array.isArray(row.jp)&&row.jp.some(Boolean),key+': Japanese name missing');
  assert.ok(row.category && row.category !== 'general',key+': supported role must remain');
}
assert.equal(parser.verifiedNoteEvidence.bha,undefined,'ambiguous BHA must not be verified by the distinct BHT reference');
for(const ambiguous of parser.ambiguousExactKeys||[]) {
  assert.equal(parser.verifiedNoteEvidence[ambiguous],undefined,ambiguous+': ambiguous exact name must remain unsupported');
}
console.log('COSMETICS_NOTE_WAVE29=PASS: 21 source-verified notes, total 202, reviewed roles 196, raw and canonical inventories unchanged');
