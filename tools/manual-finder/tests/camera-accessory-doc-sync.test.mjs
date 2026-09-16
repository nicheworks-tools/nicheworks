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

assert.ok(
  doc.includes(
    `camera basic ${summary.cameraBasic} = detail ${summary.cameraDetail} + reviewed exclusion ${summary.cameraDetailExcluded} + missing ${summary.cameraMissingAccessory}`
  ),
  'camera reconciliation text must match the live audit'
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

console.log('ManualFinder camera accessory documentation sync audit passed.');
