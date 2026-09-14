import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
const configUrl = new URL('../affiliate-config.js', import.meta.url);
vm.runInContext(fs.readFileSync(configUrl, 'utf8'), context, { filename: 'tools/manual-finder/affiliate-config.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.ok(config?.enabled, 'affiliate config should be enabled');
assert.deepEqual(
  Array.from(config.modelSearchTemplate.eligibleOtherMakers || []),
  ['CASIO', 'DJI', 'Roland'],
  'other-category model search must stay on the audited maker allowlist'
);

const cases = [
  {
    record: { maker: 'CASIO', model: 'GA-2100-1AJF', category: 'その他' },
    expected: 'https://www.amazon.co.jp/s?k=CASIO+GA-2100-1AJF&tag=nicheworks09-22'
  },
  {
    record: { maker: 'DJI', model: 'DJI Power 1000', category: 'その他' },
    expected: 'https://www.amazon.co.jp/s?k=DJI+DJI+Power+1000&tag=nicheworks09-22'
  },
  {
    record: { maker: 'Roland', model: 'SC-55', category: 'その他' },
    expected: 'https://www.amazon.co.jp/s?k=Roland+SC-55&tag=nicheworks09-22'
  }
];

for (const { record, expected } of cases) {
  assert.equal(config.buildModelSearchUrl(record), expected);
}

assert.equal(
  config.buildModelSearchUrl({ maker: 'Seiko', model: '4R34', category: 'その他' }),
  '',
  'Seiko caliber identifiers are not exact product models and must remain excluded'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'Unknown', model: 'ABC-1', category: 'その他' }),
  '',
  'unreviewed other-category makers must fail closed'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'CASIO', model: '', category: 'その他' }),
  '',
  'maker-index records without a model must remain excluded'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'Brother', model: 'MFC-J4440N', category: 'プリンター・複合機' }),
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22',
  'standard product-category model search must remain unchanged'
);

console.log('ManualFinder audited other-category model-search tests passed.');
