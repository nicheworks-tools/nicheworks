import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const sandbox = { window: {} };
const context = vm.createContext(sandbox);

for (const name of [
  'data/manuals.coverage-passes.js',
  'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, {
    filename: `tools/manual-finder/${name}`
  });
}

assert.deepEqual(
  Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES || []),
  ['manuals.coverage-pass.sony-jp-alpha-e-mount.js']
);

const rows = Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES?.() || []);
const sonyRows = Array.from(context.window.MANUALFINDER_COVERAGE_PASS_SONY_EMOUNT || []);
const pass = JSON.parse(fs.readFileSync(new URL('../coverage-passes/sony/jp-alpha-e-mount-bodies.json', import.meta.url), 'utf8'));

assert.equal(pass.status, 'coverage-pass-complete');
assert.equal(rows.length, 107);
assert.equal(sonyRows.length, 107);
assert.equal(new Set(rows.map((row) => row.model)).size, 107);
assert.deepEqual(new Set(rows.map((row) => row.model)), new Set(pass.universe.models));

const direct = rows.filter((row) => row.resolutionState === 'direct_manual_page');
const supportOnly = rows.filter((row) => row.resolutionState === 'direct_model_support');
assert.equal(direct.length, 104);
assert.equal(supportOnly.length, 3);
assert.deepEqual(
  new Set(supportOnly.map((row) => row.model)),
  new Set(['ILCE-3000', 'NEX-3N', 'NEX-F3'])
);

const allowedHosts = new Set(['support.sony.jp', 'helpguide.sony.net', 'www.sony.jp', 'sony.jp', 'www.sony.com', 'sony.com']);
for (const row of rows) {
  assert.equal(row.maker, 'Sony');
  assert.equal(row.brand, 'Sony');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.country, 'Japan');
  assert.equal(row.sourceType, 'official');
  assert.equal(row.sourceLevel, 'A');
  assert.equal(row.verifiedAt, '2026-09-19');
  assert.ok(row.id.startsWith('coveragepass-sony-emount-'));
  assert.ok(row.supportUrl, `${row.model} requires an official support URL`);
  const support = new URL(row.supportUrl);
  assert.equal(support.protocol, 'https:');
  assert.ok([...allowedHosts].some((host) => support.hostname === host || support.hostname.endsWith(`.${host}`)), `${row.model} support host must remain Sony-controlled`);

  if (row.resolutionState === 'direct_manual_page') {
    assert.ok(row.manualUrl, `${row.model} direct row requires manualUrl`);
    const manual = new URL(row.manualUrl);
    assert.equal(manual.protocol, 'https:');
    assert.ok([...allowedHosts].some((host) => manual.hostname === host || manual.hostname.endsWith(`.${host}`)), `${row.model} manual host must remain Sony-controlled`);
  } else {
    assert.equal(row.manualUrl, '');
  }
}

const compiledByModel = new Map(rows.map((row) => [row.model, row]));
assert.equal(compiledByModel.get('ILCE-5000')?.manualUrl, 'https://helpguide.sony.net/gbmig/44879440/v1/jp/index.html');
assert.equal(compiledByModel.get('ILCE-7M3M')?.resolutionState, 'direct_manual_page');
assert.equal(compiledByModel.get('NEX-5TY')?.resolutionState, 'direct_manual_page');

const appSource = fs.readFileSync(new URL('../app.paged.js', import.meta.url), 'utf8');
assert.ok(appSource.includes('manuals.coverage-passes.js'));
assert.ok(appSource.includes('MANUALFINDER_COVERAGE_PASS_BATCHES'));
assert.ok(appSource.includes('MANUALFINDER_BUILD_COVERAGE_PASSES'));
assert.ok(appSource.includes('...coveragePassRows'));

console.log('ManualFinder Sony E-mount 107-row coverage-pass publication passed.');
