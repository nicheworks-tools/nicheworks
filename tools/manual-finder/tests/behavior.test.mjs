import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/manual-finder/affiliate-config.js' });

const ledger = context.window.MANUALFINDER_AFFILIATE_LEDGER;
const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;

assert.ok(Array.isArray(ledger), 'fixed affiliate ledger should be exposed');
assert.equal(ledger.length, 1, 'per-model stored links should not be required');
assert.ok(config, 'runtime affiliate config should be exposed');
assert.equal(config.enabled, true, 'affiliate runtime should be enabled');

assert.equal(ledger[0].maker, 'Nikon');
assert.equal(ledger[0].model, 'Z8');
assert.equal(ledger[0].specialLink, 'https://amzn.to/3T7sxbB');
assert.equal(config.targets.nikon_z8_search, 'https://amzn.to/3T7sxbB');

assert.equal(config.trackingId, 'nicheworks09-22');
assert.equal(config.modelSearchTemplate.status, 'verified');
assert.equal(config.modelSearchTemplate.verifiedAt, '2026-09-13');
assert.equal(config.modelSearchTemplate.verificationMethod, 'amazon_link_checker');
assert.equal(config.modelSearchTemplate.activationTarget, 'manual_model_search_template');
assert.equal(
  config.modelSearchTemplate.proofUrl,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22'
);
assert.equal(
  config.targets.manual_model_search_template,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22',
  'validated template should expose one coarse active target'
);
assert.equal(Object.keys(config.targets).length, 2, 'one fixed override plus one reusable template target should be active');
assert.equal(config.offers.length, 1, 'dynamic model search should not create one stored offer per model');

const brother = config.buildModelSearchUrl({
  maker: 'Brother',
  model: 'MFC-J4440N',
  category: 'プリンター・複合機'
});
assert.equal(
  brother,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22',
  'canonical maker/model should deterministically produce one tagged Amazon search URL'
);

const nikon = config.buildModelSearchUrl({
  maker: 'Nikon',
  model: 'Z6III',
  category: 'カメラ・映像'
});
assert.equal(
  nikon,
  'https://www.amazon.co.jp/s?k=Nikon+Z6III&tag=nicheworks09-22'
);

assert.equal(
  config.buildModelSearchUrl({ maker: 'Brother', model: 'MFC-J4440N', category: 'その他' }),
  '',
  'ineligible categories must fail closed'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'Brother', model: '', category: 'プリンター・複合機' }),
  '',
  'missing canonical model must fail closed'
);

console.log('ManualFinder live affiliate template behavior test passed.');
