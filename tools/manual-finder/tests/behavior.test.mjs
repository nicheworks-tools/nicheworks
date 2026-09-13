import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/manual-finder/affiliate-config.js' });

const ledger = context.window.MANUALFINDER_AFFILIATE_LEDGER;
const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;

assert.ok(Array.isArray(ledger), 'affiliate ledger should be exposed');
assert.equal(ledger.length, 14, 'ledger should contain Nikon Z8 plus the 13 Brother Wave 1 candidates');
assert.ok(config, 'runtime affiliate config should be exposed');
assert.equal(config.enabled, true, 'runtime config should be enabled while at least one verified offer exists');

const verified = ledger.filter((row) => row.status === 'verified');
const pending = ledger.filter((row) => row.status === 'pending_special_link');
assert.equal(verified.length, 1, 'only the user-verified Nikon Z8 link should be active');
assert.equal(pending.length, 13, 'all Brother candidates should remain fail-closed until Special Links are supplied');

assert.equal(verified[0].maker, 'Nikon');
assert.equal(verified[0].model, 'Z8');
assert.equal(verified[0].specialLink, 'https://amzn.to/3T7sxbB');
assert.equal(config.targets.nikon_z8_search, 'https://amzn.to/3T7sxbB');
assert.equal(Object.keys(config.targets).length, 1, 'pending rows must not create runtime targets');
assert.equal(config.offers.length, 1, 'pending rows must not create runtime offers');
assert.equal(config.offers[0].maker, 'Nikon');
assert.equal(config.offers[0].model, 'Z8');

const expectedBrother = [
  'MFC-J1500N', 'MFC-J1605DN', 'MFC-J4440N', 'MFC-J4443N', 'MFC-J4450N',
  'MFC-J4510N', 'MFC-J4540N', 'MFC-J4543N', 'MFC-J4720N', 'MFC-J4725N',
  'MFC-J6995CDW', 'MFC-J6997CDW', 'MFC-J6999CDW'
];
assert.deepEqual(
  pending.map((row) => row.model),
  expectedBrother,
  'Brother affiliate candidates should match the accepted ManualFinder Wave 3B model set'
);
assert.ok(pending.every((row) => row.maker === 'Brother'));
assert.ok(pending.every((row) => row.specialLink === ''), 'no Brother URL may be guessed or prefilled');
assert.ok(pending.every((row) => row.verifiedAt === ''), 'pending Brother rows must not claim link verification');

console.log('ManualFinder affiliate ledger behavior test passed.');
