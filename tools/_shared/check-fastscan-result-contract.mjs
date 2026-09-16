import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const app = read('tools/inci-fastscan/js/app.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const spec = read('tools/inci-fastscan/SPEC.md');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

// Exact match-route metadata remains available internally for QA and alias debugging.
for (const token of ['match_kind', 'matched_name', 'shared_alias', 'classifyExactMatch']) {
  check(matcher.includes(token), `matcher missing detailed route token: ${token}`);
}

// Public results must explain ingredients instead of surfacing matching-engine internals as the product value.
for (const token of ['主な役割', '情報未登録', 'ROLE_LABELS', 'ROLE_DESCRIPTIONS', 'ingredientDescription']) {
  check(ui.includes(token), `role-first public result contract missing: ${token}`);
}
check(ui.includes('INCI'), 'FastScan may retain INCI as useful ingredient identity context');
check(!ui.includes('function getMatchRouteLabel'), 'public result UI must not restore match-route rendering');
check(!ui.includes('rt("matchRoute"'), 'public result UI must not render match-route labels');
check(!ui.includes('rt("matchedName"'), 'public result UI must not render matched-name debug detail');
check(ui.includes('renderSuggestions'), 'near-match suggestion rendering must remain available');
check(ui.includes('候補は自動置換しません'), 'suggestions must remain explicitly non-auto-applied');
check(!ui.includes('一般的に使用'), 'old safety-framed common label must not remain in result UI');
check(!ui.includes('注意して確認'), 'old safety-framed caution label must not remain in result UI');

// FastScan JP/EN must behave like one bilingual workflow, including dynamic rerendering of existing results.
for (const token of [
  'safeStorageGet("inci-fastscan-lang")',
  'safeStorageSet("inci-fastscan-lang", currentLang)',
  'browserLang.startsWith("ja") ? "ja" : "en"',
  'document.documentElement.lang = currentLang',
  'if (lastFastResults) renderResults(document.getElementById("fast-results"), lastFastResults, currentLang)',
  'if (lastJbResults) renderResults(document.getElementById("jb-results"), lastJbResults, currentLang)',
  'function setupJapaneseCheck()'
]) {
  check(app.includes(token), `FastScan bilingual/current Japanese matching contract missing: ${token}`);
}
check(!app.includes('setupJBTranslator'), 'obsolete Japanese-translator runtime naming returned');

if (failures.length) {
  console.error(`FastScan result contract check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('FastScan role-first result and bilingual contract check passed');
