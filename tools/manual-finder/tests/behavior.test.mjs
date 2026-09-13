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
assert.equal(ledger.length, 1, 'per-model pending link rows should not be required');
assert.ok(config, 'runtime affiliate config should be exposed');
assert.equal(config.enabled, true, 'verified Nikon Z8 override keeps affiliate runtime enabled');

assert.equal(ledger[0].maker, 'Nikon');
assert.equal(ledger[0].model, 'Z8');
assert.equal(ledger[0].specialLink, 'https://amzn.to/3T7sxbB');
assert.equal(config.targets.nikon_z8_search, 'https://amzn.to/3T7sxbB');
assert.equal(Object.keys(config.targets).length, 1, 'unverified dynamic template must not create an active target');
assert.equal(config.offers.length, 1, 'only the verified fixed override should be active before template validation');

assert.equal(config.trackingId, 'nicheworks09-22');
assert.equal(config.modelSearchTemplate.status, 'pending_link_checker');
assert.equal(config.modelSearchTemplate.activationTarget, 'manual_model_search_template');
assert.equal(
  config.modelSearchTemplate.proofUrl,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22'
);

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

console.log('ManualFinder affiliate template behavior test passed.');
