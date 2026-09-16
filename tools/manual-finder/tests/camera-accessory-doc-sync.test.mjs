import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const output = execFileSync(
  process.execPath,
  [new URL('./camera-accessory-coverage.test.mjs', import.meta.url).pathname],
  { encoding: 'utf8' }
);
const prefix = 'MANUALFINDER_CAMERA_ACCESSORY_COVERAGE ';
const line = output.split(/\r?\n/).find((entry) => entry.startsWith(prefix));
assert.ok(line, 'camera accessory coverage test must emit a machine-readable summary');
const summary = JSON.parse(line.slice(prefix.length));

const doc = fs.readFileSync(new URL('../CAMERA_ACCESSORY_COVERAGE.md', import.meta.url), 'utf8');
const affiliateDoc = fs.readFileSync(new URL('../AFFILIATE_COVERAGE.md', import.meta.url), 'utf8');
const spec = fs.readFileSync(new URL('../SPEC.md', import.meta.url), 'utf8');

for (const [label, value] of [
  ['Canonical `カメラ・映像` records', summary.cameraTotal],
  ['Camera records with a basic Amazon path', summary.cameraBasic],
  ['Camera records with verified accessory detail', summary.cameraDetail],
  ['Reviewed camera-detail exclusions', summary.cameraDetailExcluded],
  ['Actionable camera records still missing accessory detail', summary.cameraMissingAccessory],
  ['Non-actionable camera maker-index records', summary.cameraNonActionable]
]) {
  assert.ok(
    doc.includes(`| ${label} | **${value}** |`),
    `${label} must match the live camera coverage audit`
  );
}

const reconciliation = `camera basic ${summary.cameraBasic} = detail ${summary.cameraDetail} + reviewed exclusion ${summary.cameraDetailExcluded} + missing ${summary.cameraMissingAccessory}`;
assert.ok(doc.includes(reconciliation), 'camera reconciliation text must match the live audit');
assert.ok(affiliateDoc.includes(reconciliation), 'affiliate coverage camera reconciliation must match the live audit');
assert.ok(
  spec.includes(`**${summary.cameraBasic} basic = ${summary.cameraDetail} detail + ${summary.cameraDetailExcluded} reviewed exclusions + ${summary.cameraMissingAccessory} missing accessory detail**`),
  'ManualFinder spec camera reconciliation must match the live audit'
);
assert.ok(
  spec.includes(`across ${summary.cameraTotal} canonical camera-category records; ${summary.cameraNonActionable} maker/index rows are non-actionable`),
  'ManualFinder spec camera total/non-actionable counts must match the live audit'
);

const makers = new Set([
  ...Object.keys(summary.cameraBasicByMaker),
  ...Object.keys(summary.cameraDetailByMaker),
  ...Object.keys(summary.cameraDetailExcludedByMaker),
  ...Object.keys(summary.cameraMissingAccessoryByMaker)
]);
for (const maker of makers) {
  const basic = summary.cameraBasicByMaker[maker] || 0;
  const detail = summary.cameraDetailByMaker[maker] || 0;
  const excluded = summary.cameraDetailExcludedByMaker[maker] || 0;
  const missing = summary.cameraMissingAccessoryByMaker[maker] || 0;
  assert.ok(
    doc.includes(`| ${maker} | ${basic} | ${detail} | ${excluded} | ${missing} |`),
    `${maker} camera coverage row must match the live audit`
  );
}

for (const [maker, count] of Object.entries(summary.cameraNonActionableByMaker)) {
  assert.ok(
    doc.includes(`- ${maker}: ${count}`),
    `${maker} non-actionable camera count must match the live audit`
  );
}

assert.ok(
  doc.includes(`The current baseline is not complete: \`${summary.cameraMissingAccessory}\` actionable records remain missing accessory detail.`),
  'camera completion statement must match the live missing count'
);

const nikonBasic = summary.cameraBasicByMaker.Nikon || 0;
const nikonDetail = summary.cameraDetailByMaker.Nikon || 0;
const nikonExcluded = summary.cameraDetailExcludedByMaker.Nikon || 0;
const nikonMissing = summary.cameraMissingAccessoryByMaker.Nikon || 0;
assert.ok(
  doc.includes(`Nikon camera ${nikonBasic} = detail ${nikonDetail} + reviewed exclusion ${nikonExcluded} + missing ${nikonMissing}`),
  'Nikon camera completion line must match the live audit'
);
assert.ok(
  affiliateDoc.includes(`Nikon camera ${nikonBasic} = detail ${nikonDetail} + reviewed exclusion ${nikonExcluded} + missing ${nikonMissing}`),
  'affiliate coverage Nikon completion line must match the live audit'
);
assert.ok(
  spec.includes(`**${nikonDetail} detail + ${nikonExcluded} reviewed exclusions + ${nikonMissing} missing**`),
  'ManualFinder spec Nikon completion values must match the live audit'
);

const djiBasic = summary.cameraBasicByMaker.DJI || 0;
const djiDetail = summary.cameraDetailByMaker.DJI || 0;
const djiExcluded = summary.cameraDetailExcludedByMaker.DJI || 0;
const djiMissing = summary.cameraMissingAccessoryByMaker.DJI || 0;
const djiReconciliation = `DJI camera ${djiBasic} = detail ${djiDetail} + reviewed exclusion ${djiExcluded} + missing ${djiMissing}`;
assert.ok(doc.includes(djiReconciliation), 'DJI camera progress line must match the live audit');
assert.ok(affiliateDoc.includes(djiReconciliation), 'affiliate coverage DJI progress line must match the live audit');
assert.ok(
  spec.includes(`**${djiBasic} basic = ${djiDetail} detail + ${djiExcluded} reviewed exclusions + ${djiMissing} missing accessory detail**`),
  'ManualFinder spec DJI progress values must match the live audit'
);

for (const path of [
  'affiliate-nikon-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave1.js',
  'affiliate-dji-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave3.js',
  'affiliate-dji-camera-accessories-wave4.js',
  'affiliate-dji-camera-accessories-wave5.js',
  'affiliate-dji-camera-accessories-wave6.js',
  'affiliate-dji-camera-accessories-wave7.js',
  'affiliate-camera-detail-exclusions.js',
  'CAMERA_ACCESSORY_COVERAGE.md',
  'tests/nikon-camera-accessory-wave2.test.mjs',
  'tests/dji-osmo-action-accessory-wave1.test.mjs',
  'tests/dji-air-accessory-wave2.test.mjs',
  'tests/dji-mini-accessory-wave3.test.mjs',
  'tests/dji-mavic3-accessory-wave4.test.mjs',
  'tests/dji-air2-accessory-wave5.test.mjs',
  'tests/dji-compact-power-wave6.test.mjs',
  'tests/dji-mini2-accessory-wave7.test.mjs',
  'tests/camera-accessory-coverage.test.mjs',
  'tests/camera-accessory-doc-sync.test.mjs'
]) {
  assert.ok(spec.includes(path), `ManualFinder spec implementation evidence must include ${path}`);
}

console.log('ManualFinder camera accessory documentation sync audit passed.');