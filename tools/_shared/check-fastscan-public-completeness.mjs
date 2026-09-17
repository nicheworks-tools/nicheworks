import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const enhancements = read('tools/inci-fastscan/enhancements.js');
const webUi = read('tools/inci-fastscan/js/web_ui.js');
const index = read('tools/inci-fastscan/index.html');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const token of [
  'function hasPublicRoleExplanation',
  'function normalizePublicResults',
  'publicSemanticIncomplete: true',
  'safety: undefined',
  'note_short: undefined',
  'function enforcePublicResultContract',
  'root.renderResults = wrappedRender',
  '__nwPublicCompleteness',
  "ja: '情報不足'",
  "en: 'Information incomplete'"
]) {
  check(enhancements.includes(token), `FastScan public completeness contract missing: ${token}`);
}

check(
  enhancements.includes("bilingualRoleEntry(ROLE_LABELS[key]) && bilingualRoleEntry(ROLE_DESCRIPTIONS[key])"),
  'FastScan must require bilingual role label and bilingual role explanation before exposing a complete public result'
);
check(
  enhancements.includes("if (!key || key === 'general') return false;"),
  'FastScan must keep missing/general role categories incomplete'
);
check(
  !enhancements.includes('return item.note_short'),
  'FastScan public completeness layer must not use note_short as the role explanation'
);
check(
  webUi.includes('if (lang === "en" && item?.note_short) return item.note_short;'),
  'FastScan legacy renderer changed unexpectedly; public completeness layer should neutralize note_short before rendering'
);
check(
  webUi.includes('const reviewState = isReviewState(r.safety) ? "review" : "matched";'),
  'FastScan legacy renderer changed unexpectedly; public completeness layer should neutralize legacy safety before rendering'
);

const webUiPos = index.indexOf('js/web_ui.js');
const appPos = index.indexOf('js/app.js');
const enhancementPos = index.indexOf('enhancements.js');
check(webUiPos >= 0 && appPos > webUiPos && enhancementPos > appPos, 'FastScan runtime order must load web_ui, then app, then public completeness enhancements');

if (failures.length) {
  console.error(`FastScan public completeness gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  public_complete_requires_bilingual_role_and_explanation: true,
  unsupported_semantics_become_incomplete: true,
  legacy_safety_public_state_neutralized: true,
  note_short_not_used_as_role_explanation: true
}, null, 2));
