import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

const merged = parser.mergeDictionaryRecords([
  {
    en: 'Sodium Hyaluronate',
    jp: ['ヒアルロン酸Na'],
    alias: [],
    safety: 'safe',
    category: 'humectant',
    note_short: 'first'
  },
  {
    en: 'Sodium Hyaluronate',
    jp: ['ヒアルロン酸Ｎａ', 'ヒアルロン酸ナトリウム'],
    alias: ['Hyaluronate Sodium'],
    safety: 'caution',
    category: 'active',
    note_short: 'second'
  },
  {
    en: 'Water',
    jp: ['水'],
    alias: ['Aqua']
  }
]);

assert.equal(merged.length, 2, 'duplicate canonical records should merge');
const ha = merged.find((item) => item.en === 'Sodium Hyaluronate');
assert.ok(ha, 'merged Sodium Hyaluronate missing');
assert.deepEqual(ha.jp, ['ヒアルロン酸Na', 'ヒアルロン酸ナトリウム'], 'normalized duplicate JP names should collapse while unique names survive');
assert.deepEqual(ha.alias, ['Hyaluronate Sodium'], 'later unique aliases should survive canonical merge');
assert.equal(ha.safety, undefined, 'conflicting legacy safety values must not silently select a winner');
assert.deepEqual(ha.legacy_safety_values, ['safe', 'caution'], 'all conflicting legacy safety values must remain auditable');
assert.deepEqual(ha.semantic_conflicts?.safety, ['safe', 'caution'], 'safety conflict must be explicit on the merged canonical record');
assert.deepEqual(ha.categories, ['humectant', 'active'], 'all conflicting functional categories must survive canonical merge');
assert.equal(ha.category, 'humectant / active', 'runtime category must expose all observed functions instead of silently selecting one');
assert.deepEqual(ha.semantic_conflicts?.category, ['humectant', 'active'], 'category conflict must retain the original source values');
const haVerifiedNote = parser.verifiedNoteEvidence?.['sodium hyaluronate'];
assert.ok(haVerifiedNote, 'Sodium Hyaluronate verified note evidence must exist once note provenance is complete for this identity');
assert.equal(ha.note_short, haVerifiedNote.note_short, 'verified note overlay must replace conflicting raw compatibility notes');
assert.equal(ha.note_verified, true, 'verified note flag must survive canonical merge');
assert.deepEqual(ha.note_sources, [...haVerifiedNote.note_sources], 'verified note sources must survive canonical merge');

assert.equal(parser.normalizeKey('ヒアルロン酸ナトリウム'), parser.normalizeKey('Sodium Hyaluronate'));
assert.equal(parser.normalizeKey('AHA'), '', 'ambiguous exact labels must remain blocked');

console.log('cosmetics canonical merge regression checks passed');
