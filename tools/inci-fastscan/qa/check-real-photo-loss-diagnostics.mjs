import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createOcrLossDiagnostics, summarizeOcrLoss } from './real-photo-loss-diagnostics.mjs';

const tool = createOcrLossDiagnostics();
assert.ok(tool.dictSize > 1000, 'The actual complete dictionary is required for the QA experiment');

const joined = await tool.assess('Water Glycerin', 'Water Glycerin', ['Water', 'Glycerin']);
assert.equal(joined.supportedReferences, 2);
assert.equal(joined.baselineHits, 0, 'Existing parser must not silently split spaces');
assert.equal(joined.experimentHits, 2, 'A unique exact dictionary-only list segmentation can recover two names');
assert.equal(joined.attemptedSplitActions, 1);
assert.equal(joined.rawPresentMissing, 2, 'Raw OCR words are present even when parser misses them');
assert.equal(joined.processedPresentMissing, 2);

const normal = await tool.assess('Water\nGlycerin', 'Water\nGlycerin', ['Water', 'Glycerin']);
assert.equal(normal.baselineHits, 2);
assert.equal(normal.experimentHits, 2);
assert.equal(normal.attemptedSplitActions, 0);

const invalid = await tool.assess('Water Glycerin Unrecognized', 'Water Glycerin Unrecognized', ['Water', 'Glycerin']);
assert.equal(invalid.baselineHits, 0);
assert.equal(invalid.experimentHits, 0, 'Never discard unmatched trailing text to manufacture recognized matches');
assert.equal(invalid.attemptedSplitActions, 0);

const canonical = await tool.assess('Cetearyl Alcohol', 'Cetearyl Alcohol', ['Cetearyl Alcohol']);
assert.equal(canonical.baselineHits, 1);
assert.equal(canonical.experimentHits, 1);
assert.equal(canonical.attemptedSplitActions, 0, 'An already exact canonical ingredient must remain intact');

const absent = await tool.assess('Nonsense', 'Nonsense', ['Glycerin']);
assert.equal(absent.baselineHits, 0);
assert.equal(absent.rawAbsentMissing, 1);
assert.equal(absent.rawPresentMissing, 0);
assert.equal(absent.experimentHits, 0, 'Never invent absent ingredient names');

const pooled = summarizeOcrLoss([joined, normal, invalid, canonical, absent], 'test');
assert.equal(pooled.photos, 5);
assert.equal(pooled.supportedReferences, 8);
assert.equal(pooled.baselineHits, 3);
assert.equal(pooled.experimentHits, 5);
assert.equal(pooled.rawAbsentMissing, 1);
assert.ok(!JSON.stringify(pooled).includes('Glycerin'), 'No reference labels in aggregate metrics');
assert.ok(!JSON.stringify(joined).includes('Water'), 'No OCR labels in per-photo diagnostics');

// Test the experimental source-backed spaced-dash delimiter independently.
// Explicit spaces around the dash are essential: a dash inside an INCI name,
// decimal locant or compound code must NOT become an ingredient separator.
const postScope = {};
const ocrPostScript = fs.readFileSync('tools/inci-fastscan/js/core_ocr_post.js', 'utf8');
vm.runInNewContext(ocrPostScript + '\\nglobalThis.post = postProcessOcrText;', postScope);
const ocrPost = postScope.post;
const dashLabel = 'INGREDIENTS: WATER - GLYCERIN - CETEARYL ALCOHOL - PEG-20 - C12-15 ALKYL BENZOATE';
const originalText = ocrPost(dashLabel, { langHint: 'en' });
const dashProcessed = ocrPost(dashLabel, { langHint: 'en', spacedDashDelimiter: true });
assert.equal(originalText.includes('WATER - GLYCERIN'), true, 'Existing default output is untouched');
assert.equal(dashProcessed.includes('WATER\\nGLYCERIN'), true, 'True spaced hyphen-delimited ingredients separate');
assert.equal(dashProcessed.includes('PEG-20'), true, 'Hyphen in INCI name is preserved');
assert.equal(dashProcessed.includes('C12-15 ALKYL BENZOATE'), true, 'Numeric INCI range preserved');
assert.equal(dashProcessed.split('\\n').length, 5);
assert.ok(!dashProcessed.includes('PEG\\n20'));

// The experimental flag is English-only; JP spacing and slash compounds
// retain their existing behavior.
const jpText = '全成分: 水 - グリセリン';
assert.equal(ocrPost(jpText, { langHint: 'jp', spacedDashDelimiter: true }),
  ocrPost(jpText, { langHint: 'jp' }));
assert.ok(ocrPost('INGREDIENTS: PEG/PPG-9/2 DIMETHYL ETHER - WATER',
  { langHint: 'en', spacedDashDelimiter: true }).includes('PEG/PPG-9/2 DIMETHYL ETHER'));

console.log('FASTSCAN_OCR_LOSS_FUNNEL_TEST=PASS: known OCR words vs parser misses; conservative exact-list segmentation, no invention, unmodified default, and numeric-only reports');
