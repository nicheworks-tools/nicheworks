import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {} };
const context = vm.createContext(sandbox);

for (const name of [
  'data/manuals.coverage-passes.js',
  'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
  'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, {
    filename: `tools/manual-finder/${name}`
  });
}

const pass = JSON.parse(fs.readFileSync(new URL('../coverage-passes/panasonic/jp-lumix-camera-bodies-sitemap.json', import.meta.url), 'utf8'));
assert.equal(pass.status, 'coverage-pass-complete');

const rows = Array.from(context.window.MANUALFINDER_COVERAGE_PASS_PANASONIC_LUMIX || []);
assert.equal(rows.length, 27);
assert.equal(new Set(rows.map((row) => row.model)).size, 27);
assert.deepEqual(new Set(rows.map((row) => row.model)), new Set(pass.universe.models));

for (const row of rows) {
  assert.equal(row.maker, 'Panasonic');
  assert.equal(row.brand, 'Panasonic');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.country, 'Japan');
  assert.equal(row.sourceType, 'official');
  assert.equal(row.sourceLevel, 'A');
  assert.equal(row.verifiedAt, '2026-09-19');
  assert.equal(row.resolutionState, 'direct_manual_page');
  assert.ok(row.manualUrl);
  assert.ok(row.supportUrl);
  assert.ok(row.id.startsWith('coveragepass-panasonic-lumix-'));
  for (const value of [row.manualUrl, row.supportUrl]) {
    const url = new URL(value);
    assert.equal(url.protocol, 'https:');
    assert.ok(url.hostname === 'panasonic.jp' || url.hostname.endsWith('.panasonic.jp'), `${row.model} must stay on Panasonic-controlled JP host`);
  }
}

const g100d = rows.find((row) => row.model === 'DC-G100D');
assert.ok(g100d);
assert.equal(g100d.manualUrl, 'https://panasonic.jp/p-db/contents/manualdl/1428461433118.pdf');
assert.equal(g100d.supportUrl, 'https://panasonic.jp/dc/G100D.html');
assert.equal(g100d.manualKind, 'pdf-manual');

const batches = Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES || []);
assert.ok(batches.includes('manuals.coverage-pass.sony-jp-alpha-e-mount.js'));
assert.ok(batches.includes('manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js'));

const merged = Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES?.() || []);
assert.equal(merged.length, 134);
assert.equal(merged.filter((row) => row.maker === 'Sony').length, 107);
assert.equal(merged.filter((row) => row.maker === 'Panasonic').length, 27);

console.log('ManualFinder Panasonic LUMIX 27-row coverage-pass publication passed.');
