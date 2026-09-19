import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox={window:{}};
const context=vm.createContext(sandbox);

for(const name of [
  'data/manuals.coverage-passes.js',
  'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
  'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
  'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js'
]){
  vm.runInContext(fs.readFileSync(new URL(`../${name}`,import.meta.url),'utf8'),context,{filename:`tools/manual-finder/${name}`});
}

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/apple/jp-iphone-ios26-guide-models.json',import.meta.url),'utf8'));
assert.equal(pass.status,'coverage-pass-complete');

const rows=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_APPLE_IPHONE||[]);
assert.equal(rows.length,31);
assert.equal(new Set(rows.map(row=>row.model)).size,31);
assert.deepEqual(new Set(rows.map(row=>row.model)),new Set(pass.universe.models));

const guide='https://support.apple.com/ja-jp/guide/iphone/welcome/ios';
for(const row of rows){
  assert.equal(row.maker,'Apple');
  assert.equal(row.brand,'Apple');
  assert.equal(row.category,'PC・スマホ');
  assert.equal(row.country,'Japan');
  assert.equal(row.sourceType,'official');
  assert.equal(row.sourceLevel,'A');
  assert.equal(row.verifiedAt,'2026-09-19');
  assert.equal(row.resolutionState,'shared_manual_page');
  assert.equal(row.manualKind,'shared-user-guide');
  assert.equal(row.sharedTarget,true);
  assert.equal(row.manualUrl,guide);
  assert.ok(row.supportUrl);
  assert.ok(row.id.startsWith('coveragepass-apple-iphone-'));
  for(const value of [row.manualUrl,row.supportUrl]){
    const url=new URL(value);
    assert.equal(url.protocol,'https:');
    assert.ok(url.hostname==='support.apple.com' || url.hostname.endsWith('.apple.com'),`${row.model} must remain Apple-controlled`);
  }
}

const batches=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(batches.includes('manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js'));

const merged=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES?.()||[]);
assert.equal(merged.length,165);
assert.equal(merged.filter(row=>row.maker==='Sony').length,107);
assert.equal(merged.filter(row=>row.maker==='Panasonic').length,27);
assert.equal(merged.filter(row=>row.maker==='Apple').length,31);

for(const model of ['iPhone 11','iPhone SE (2nd generation)','iPhone 16e','iPhone Air','iPhone 17e']){
  const row=rows.find(x=>x.model===model);
  assert.ok(row,`${model} must be published`);
  assert.ok(row.supportUrl.includes('/docs/iphone/'));
}

console.log('ManualFinder Apple iPhone 31-row coverage-pass publication passed.');
