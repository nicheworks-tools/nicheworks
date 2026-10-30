import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractCandidates, review } from '../scripts/vaio-jp-start-guides-review.mjs';
import { validateCoveragePass } from '../scripts/coverage-pass-lib.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../coverage-passes/vaio/jp-pc-start-guide-manual-index.json', import.meta.url), 'utf8'));
const validation = validateCoveragePass(manifest);
assert.equal(validation.valid, true);
assert.equal(validation.completionReady, false);
assert.equal(manifest.status, 'reviewing');
assert.equal(manifest.universe.models.length, 82);
assert.equal(new Set(manifest.universe.models).size, 82);
assert.equal(manifest.subscopes[0].models.length, 47);
assert.equal(manifest.subscopes[1].models.length, 35);
assert.deepEqual(new Set(manifest.subscopes.flatMap(s => s.models)), new Set(manifest.universe.models));

const html = '<html><body><table><tr><th>型番</th><th>発売日</th><th>マニュアル</th></tr>'
 + '<tr><td>VJS4R2*</td><td>2026年05月発売</td><td><a href="https://solutions.vaio.com/assets/start.pdf">Windows 11モデル</a><a href="https://support.vaio.com/manual/vjs4r2/">ユーザーマニュアル</a></td></tr>'
 + '<tr><td>VJPKR2*</td><td>2026年05月発売</td><td><a href="https://solutions.vaio.com/assets/start.pdf">Windows 11モデル</a></td></tr>'
 + '<tr><td>VJ99999*</td><td>2026年08月発売</td><td><a href="https://untrusted.example/pdf">untrusted</a></td></tr>'
 + '</table><table><tr><td>VJS4R2* / VJPKR2*</td><td>安全のために</td><td><a href="https://solutions.vaio.com/safety.pdf">安全</a></td></tr></table></body></html>';

const extracted = extractCandidates(html);
assert.equal(extracted.modelToRows.get('VJS4R2').length, 1);
assert.equal(extracted.modelToRows.get('VJPKR2').length, 1);
assert.equal(extracted.modelToRows.get('VJ99999').length, 1);
assert.equal(extracted.modelToRows.get('VJS4R2')[0].links.length, 2);
assert.equal(extracted.modelToRows.get('VJ99999')[0].links.length, 0, 'unofficial URL rejected');
const result = await review({ html, pass: manifest, checkTargets: false });
assert.equal(result.lockedPopulation, 82);
assert.equal(result.candidates.length, 82);
assert.equal(result.foundLockedModels, 2);
assert.deepEqual(result.extraModels, ['VJ99999']);
assert.equal(result.publicationEligible, false);
assert.equal(result.candidates.filter(x => x.candidateStatus === 'needs_secondary_discovery').length, 80);
assert.equal(result.candidates.find(x => x.model === 'VJS4R2').candidateStatus, 'candidate_only_requires_positive_model_review');
assert.equal(result.candidates.find(x => x.model === 'VJS4R1').reason, 'missing_from_live_official_index');
console.log('VAIO official start-guide candidate runner and silent-drop protections passed.');
