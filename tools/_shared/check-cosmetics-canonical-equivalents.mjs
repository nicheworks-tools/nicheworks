import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

const cases = [
  ['Bemotrizinol', 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine'],
  ['Bisoctrizole', 'Methylene Bis-Benzotriazolyl Tetramethylbutylphenol'],
  ['CI 77891', 'Titanium Dioxide'],
  ['CI 77019', 'Mica']
];

for (const [alternate, preferred] of cases) {
  assert.equal(
    parser.canonicalIdentityKey(alternate),
    parser.canonicalIdentityKey(preferred),
    `${alternate} and ${preferred} must share one canonical identity`
  );
  assert.equal(
    parser.normalizeKey(alternate),
    parser.normalizeKey(preferred),
    `${alternate} and ${preferred} must resolve to one exact-match key`
  );
}

const merged = parser.mergeDictionaryRecords([
  {
    id: 'generic',
    en: 'Bemotrizinol',
    jp: ['ビモトリジノール'],
    alias: ['Tinosorb S'],
    safety: 'caution',
    category: 'uv filter'
  },
  {
    id: 'inci',
    en: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine',
    jp: ['ビスエチルヘキシルオキシフェノールメトキシフェニルトリアジン'],
    alias: ['Tinosorb S'],
    safety: 'safe',
    category: 'uv filter'
  }
]);

assert.equal(merged.length, 1, 'equivalent canonical records must merge into one runtime identity');
assert.equal(
  merged[0].en,
  'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine',
  'preferred canonical INCI name must win when present'
);
assert.ok(merged[0].alias.includes('Bemotrizinol'), 'alternate canonical name must remain searchable as an alias');
assert.ok(merged[0].alias.includes('Tinosorb S'), 'existing aliases must survive canonical promotion');
assert.ok(merged[0].jp.includes('ビモトリジノール'), 'Japanese names from the alternate record must survive merge');

for (const ambiguous of ['AHA', 'BHA', 'PHA', 'Iron Oxides', '酸化鉄']) {
  assert.equal(parser.normalizeKey(ambiguous), '', `${ambiguous} must remain protected as ambiguous`);
}

console.log('cosmetics canonical equivalent regression checks passed');
