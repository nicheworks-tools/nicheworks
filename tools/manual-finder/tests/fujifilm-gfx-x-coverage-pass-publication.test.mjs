import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox={window:{}};
const context=vm.createContext(sandbox);

for(const name of [
  'data/manuals.coverage-passes.js',
  'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
  'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
  'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
  'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js'
]){
  vm.runInContext(fs.readFileSync(new URL(`../${name}`,import.meta.url),'utf8'),context,{filename:`tools/manual-finder/${name}`});
}

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/fujifilm/jp-gfx-x-camera-manual-index.json',import.meta.url),'utf8'));
assert.equal(pass.status,'coverage-pass-complete');

const rows=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_FUJIFILM_GFX_X||[]);
assert.equal(rows.length,56);
assert.equal(new Set(rows.map(row=>row.model)).size,56);
assert.deepEqual(new Set(rows.map(row=>row.model)),new Set(pass.universe.models));

const direct=rows.filter(row=>row.resolutionState==='direct_manual_page');
const shared=rows.filter(row=>row.resolutionState==='shared_manual_page');
assert.equal(direct.length,52);
assert.equal(shared.length,4);
assert.deepEqual(new Set(shared.map(row=>row.model)),new Set(['GFX 50S','GFX 50R','X-S20','X half']));

const sharedIndex='https://www.fujifilm-x.com/ja-jp/support/manual/cameras/';
for(const row of rows){
  assert.equal(row.maker,'Fujifilm');
  assert.equal(row.brand,'Fujifilm');
  assert.equal(row.category,'カメラ・映像');
  assert.equal(row.country,'Japan');
  assert.equal(row.sourceType,'official');
  assert.equal(row.sourceLevel,'A');
  assert.equal(row.verifiedAt,'2026-09-19');
  assert.ok(row.manualUrl);
  assert.ok(row.supportUrl);
  assert.ok(row.id.startsWith('coveragepass-fujifilm-gfx-x-'));
  for(const value of [row.manualUrl,row.supportUrl]){
    const url=new URL(value);
    assert.equal(url.protocol,'https:');
    assert.ok(
      url.hostname==='www.fujifilm-x.com' ||
      url.hostname==='fujifilm-x.com' ||
      url.hostname==='dl.fujifilm-x.com' ||
      url.hostname.endsWith('.fujifilm-x.com'),
      `${row.model} must stay on FUJIFILM-controlled host`
    );
  }
  if(row.sharedTarget){
    assert.equal(row.manualUrl,sharedIndex);
    assert.equal(row.manualKind,'manual-index');
  }
}

const gfx50sii=rows.find(row=>row.model==='GFX 50S II');
assert.equal(gfx50sii?.manualUrl,'https://www.fujifilm-x.com/ja-jp/support/manual/detail/gfx-50s-ii/');
const xe2=rows.find(row=>row.model==='X-E2');
assert.equal(xe2?.manualUrl,'https://dl.fujifilm-x.com/support/manual/x/ff_x-e2_mn_j101.pdf');
assert.equal(xe2?.manualKind,'pdf-manual');

const batches=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(batches.includes('manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js'));

const merged=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES?.()||[]);
assert.equal(merged.length,221);
assert.equal(merged.filter(row=>row.maker==='Sony').length,107);
assert.equal(merged.filter(row=>row.maker==='Panasonic').length,27);
assert.equal(merged.filter(row=>row.maker==='Apple').length,31);
assert.equal(merged.filter(row=>row.maker==='Fujifilm').length,56);

console.log('ManualFinder Fujifilm GFX/X 56-row coverage-pass publication passed.');
