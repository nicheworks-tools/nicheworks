import assert from 'node:assert/strict';
import fs from 'node:fs';
import { discoverFromHtml, hostAllowed, validateCoveragePass } from '../scripts/coverage-pass-lib.mjs';

assert.equal(hostAllowed('https://support.sony.jp/a', ['support.sony.jp']), true);
assert.equal(hostAllowed('https://sub.support.sony.jp/a', ['support.sony.jp']), true);
assert.equal(hostAllowed('http://support.sony.jp/a', ['support.sony.jp']), false);
assert.equal(hostAllowed('https://example.com/?u=support.sony.jp', ['support.sony.jp']), false);

const sony = JSON.parse(fs.readFileSync(new URL('../coverage-passes/sony/jp-alpha-e-mount-bodies.json', import.meta.url), 'utf8'));
const sonyValidation = validateCoveragePass(sony);
assert.equal(sonyValidation.valid, true);
assert.equal(sonyValidation.completionReady, false);
assert.equal(sonyValidation.summary.declaredCount, 107);
assert.equal(sonyValidation.summary.capturedPopulation, 69);
assert.equal(sonyValidation.summary.unresolvedUniverseCount, 38);
assert.equal(sonyValidation.summary.reviewedCount, 0);

const sampleHtml = `
<html><body>
  <h1>デジタル一眼カメラ"α"[Eマウント]</h1>
  <div>製品型名: 5</div>
  <a>ILCE-7M3M</a>
  <a>ILCE-7M4M</a>
  <a>ZV-E10K</a>
  <a>ILCE-6400K</a>
  <a>NEX-7</a>
  <script>const duplicate = "ILCE-7M3M";</script>
</body></html>`;
const discovered = discoverFromHtml(sampleHtml, sony.discovery);
assert.equal(discovered.declaredCount, 5);
assert.deepEqual(new Set(discovered.models), new Set(['ILCE-6400K', 'ILCE-7M3M', 'ILCE-7M4M', 'NEX-7', 'ZV-E10K']));
assert.equal(discovered.countMatches, true);

const complete = {
  schemaVersion: 1,
  maker: 'Example',
  scopeId: 'example-scope',
  status: 'coverage-pass-complete',
  allowedDomains: ['example.com'],
  universe: {
    sourceUrls: ['https://example.com/manuals'],
    declaredCount: 4,
    models: ['A1', 'A2', 'A3', 'A4']
  },
  records: [
    { model: 'A1', state: 'direct', manualUrl: 'https://example.com/a1/manual', evidenceUrls: ['https://example.com/a1'] },
    { model: 'A2', state: 'shared', manualUrl: 'https://example.com/shared', evidenceUrls: ['https://example.com/shared'] },
    { model: 'A3', state: 'support_only', supportUrl: 'https://example.com/a3', evidenceUrls: ['https://example.com/a3'] },
    { model: 'A4', state: 'held', reason: 'manual relationship unresolved', attemptedDiscovery: ['manual_index', 'product_page'], evidenceUrls: ['https://example.com/manuals', 'https://example.com/a4'] }
  ]
};
const completeValidation = validateCoveragePass(complete);
assert.equal(completeValidation.valid, true);
assert.equal(completeValidation.completionReady, true);
assert.equal(completeValidation.summary.reconciliation, '4 = 1 direct + 1 shared + 1 support_only + 1 held');

const silentDrop = structuredClone(complete);
silentDrop.records.pop();
const silentDropValidation = validateCoveragePass(silentDrop);
assert.equal(silentDropValidation.valid, false);
assert.ok(silentDropValidation.errors.some((x) => x.includes('coverage-pass-complete')));
assert.deepEqual(silentDropValidation.summary.unreviewedModels, ['A4']);

const guessed = structuredClone(complete);
guessed.records[0].manualUrl = 'https://manual-mirror.example/a1.pdf';
assert.equal(validateCoveragePass(guessed).valid, false);

const weakHeld = structuredClone(complete);
weakHeld.records[3].attemptedDiscovery = ['manual_index'];
assert.equal(validateCoveragePass(weakHeld).valid, false);

console.log('ManualFinder coverage-pass pipeline invariants passed.');
