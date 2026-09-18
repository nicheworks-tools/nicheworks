import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
const root = new URL('../', import.meta.url);

for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  ...fs.readdirSync(root).filter((name) => /^affiliate-dji-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0)),
  ...fs.readdirSync(root).filter((name) => /^affiliate-om-system-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0))
]) vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE4_LEDGER;
const models = ['E-M10 Mark III','E-M10 Mark IV','E-M5 Mark III','E-P7','E-PL10','OM-5','OM-5 Mark II'];

assert.equal(wave.length, 7);
assert.deepEqual(Array.from(wave, row => row.model).sort(), [...models].sort());
for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({maker:'OM SYSTEM',model,category:'カメラ・映像'}));
  assert.equal(offers.length, 1, `${model} must expose exactly one reviewed BLS-50 handoff`);
  assert.equal(offers[0].query, 'OM SYSTEM BLS-50 Lithium Ion Rechargeable Battery');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=OM+SYSTEM+BLS-50+Lithium+Ion+Rechargeable+Battery&tag=nicheworks09-22');
  assert.equal(offers[0].verifiedAt, '2026-09-19');
}
for (const args of [
  {maker:'Olympus',model:'E-P7',category:'カメラ・映像'},
  {maker:'OM SYSTEM',model:'OM-5',category:'その他'}
]) assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed BLS-50 mapping must fail closed: ${JSON.stringify(args)}`);

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-om-system-camera-accessories-wave4.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE4_LEDGER'));

console.log('ManualFinder OM SYSTEM BLS-50 camera accessory Wave 4 passed.');
