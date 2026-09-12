import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const spec = read('tools/inci-fastscan/SPEC.md');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const token of ['match_kind', 'matched_name', 'shared_alias', 'classifyExactMatch']) {
  check(matcher.includes(token), `matcher missing detailed route token: ${token}`);
}
for (const token of ['照合方法', '辞書一致', '追加確認', '安全性・刺激性・製品適合性の判定ではありません']) {
  check(ui.includes(token), `result UI missing neutral detail text: ${token}`);
}
for (const route of ['canonical', 'jp', 'alias', 'shared_alias']) {
  check(spec.includes(route), `SPEC missing match route: ${route}`);
}
check(ui.includes('renderSuggestions'), 'near-match suggestion rendering must remain available');
check(ui.includes('候補は自動置換しません'), 'suggestions must remain explicitly non-auto-applied');
check(!ui.includes('一般的に使用'), 'old safety-framed common label must not remain in result UI');
check(!ui.includes('注意して確認'), 'old safety-framed caution label must not remain in result UI');

if (failures.length) {
  console.error(`FastScan result contract check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('FastScan detailed result contract check passed');
