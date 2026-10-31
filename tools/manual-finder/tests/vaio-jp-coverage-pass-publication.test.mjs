import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { validateCoveragePass, hostAllowed } from '../scripts/coverage-pass-lib.mjs';

const pass = JSON.parse(fs.readFileSync(new URL('../coverage-passes/vaio/jp-pc-start-guide-manual-index.json', import.meta.url), 'utf8'));
const validated = validateCoveragePass(pass);
assert.equal(validated.valid, true, validated.errors.join('; '));
assert.equal(validated.completionReady, true, 'publication requires a fully reconciled pass');
assert.equal(pass.status, 'coverage-pass-complete');
assert.equal(validated.summary.capturedPopulation, 82);
assert.deepEqual(validated.summary.states, { direct: 21, shared: 0, support_only: 61, held: 0 });
assert.equal(validated.summary.unreviewedCount, 0);
const context = vm.createContext({ window: {} });
for (const name of [
  'data/manuals.coverage-passes.js',
  'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
  'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
  'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
  'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
  'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js'
]) vm.runInContext(fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8'), context, { filename: name });

const published = Array.from(context.window.MANUALFINDER_COVERAGE_PASS_VAIO_JP || []);
assert.equal(published.length, 82);
assert.equal(new Set(published.map(x => x.model)).size, 82);
assert.deepEqual(new Set(published.map(x => x.model)), new Set(pass.universe.models));
const final = new Map(pass.records.map(x => [x.model, x]));
for (const row of published) {
  const record = final.get(row.model);
  assert.ok(record, 'unexpected model ' + row.model);
  assert.equal(row.brand, 'VAIO');
  assert.equal(row.maker, 'VAIO');
  assert.equal(row.category, 'PC・スマホ');
  assert.equal(row.country, 'Japan');
  assert.equal(row.sourceType, 'official');
  assert.equal(row.sourceLevel, 'A');
  assert.equal(row.sharedTarget, false);
  assert.equal(row.verifiedAt, '2026-10-31');
  assert.equal(row.supportUrl, record.supportUrl);
  assert.equal(row.evidenceUrl, record.state === 'direct' ? record.manualUrl : record.supportUrl);
  assert.ok(hostAllowed(row.supportUrl, pass.allowedDomains));
  assert.ok(row.id.startsWith('coveragepass-vaio-jp-'));
  if (record.state === 'direct') {
    assert.equal(row.manualUrl, record.manualUrl);
    assert.equal(row.resolutionState, 'direct_manual_page');
    assert.ok(hostAllowed(row.manualUrl, pass.allowedDomains));
  } else {
    assert.equal(record.state, 'support_only');
    assert.equal(row.manualUrl, '');
    assert.equal(row.resolutionState, 'direct_model_support');
  }
}
const batches = Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES || []);
assert.ok(batches.includes('manuals.coverage-pass.vaio-jp-pc-start-guide.js'));
const merged = Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(merged.length>=303,'later manufacturer batches must not break VAIO scope tests');
for (const [maker, count] of [['Sony', 107], ['Panasonic', 27], ['Apple', 31], ['Fujifilm', 56], ['VAIO', 82]])
  assert.equal(merged.filter(x => x.maker === maker).length, count);
console.log('VAIO 82-model official publication and 303-row coverage-pass runtime passed.');
