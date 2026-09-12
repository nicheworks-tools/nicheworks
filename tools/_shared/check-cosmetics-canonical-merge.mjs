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
assert.equal(ha.safety, 'safe', 'first semantic safety field must remain authoritative in Wave 1');
assert.equal(ha.category, 'humectant', 'first semantic category field must remain authoritative in Wave 1');
assert.equal(ha.note_short, 'first', 'first note must remain authoritative in Wave 1');

assert.equal(parser.normalizeKey('ヒアルロン酸ナトリウム'), parser.normalizeKey('Sodium Hyaluronate'));
assert.equal(parser.normalizeKey('AHA'), '', 'ambiguous exact labels must remain blocked');

console.log('cosmetics canonical merge regression checks passed');
