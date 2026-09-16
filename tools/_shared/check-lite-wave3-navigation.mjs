import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/app.js', 'utf8');
const js = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/enhancements.js', 'utf8');
const css = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/enhancements.css', 'utf8');
const html = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/index.html', 'utf8');

for (const required of [
  'liteCategoryFilter',
  'button.dataset.liteCategory',
  'rowCategoryMatches',
  '表示中をコピー',
  'Copy visible',
  '情報未登録をコピー',
  'Copy unavailable',
  'navigator.clipboard.writeText',
  'nw-lite-languagechange'
]) {
  assert.ok(js.includes(required), `Lite wave 3 navigation missing: ${required}`);
}

assert.ok(js.includes("activeFilter = 'all'"), 'status filter must retain an all state');
assert.ok(js.includes("activeCategory = 'all'"), 'category filter must retain an all state');
assert.ok(js.includes("(row.dataset.category || '') === activeCategory"), 'category filtering must use the row category dataset');
assert.ok(app.includes('row.dataset.category = item.match ? categoryLabel(item.match.category)'), 'result rows must expose role/category data for filtering');
assert.ok(app.includes('row.dataset.resultKind = item.statusKey;'), 'result rows must expose status data for filtering');
assert.ok(app.includes('ROLE_DESCRIPTIONS'), 'Lite must expose role descriptions rather than dictionary status as user value');
assert.ok(!js.includes('辞書認識率'), 'dictionary coverage must not return to the Lite public UI');
assert.ok(html.includes('data-lang="ja"') && html.includes('data-lang="en"'), 'Lite must expose JP/EN UI language controls');
assert.ok(app.includes("currentLang = lang === 'en' ? 'en' : 'ja'"), 'Lite runtime must switch dynamic result language');
assert.ok(app.includes("safeStorageSet('cosmetic-lite-lang', currentLang)"), 'Lite must persist the selected UI language locally');
assert.ok(app.includes("safeStorageGet('cosmetic-lite-lang')"), 'Lite must restore the stored UI language when available');
assert.ok(app.includes("browserLang.startsWith('ja') ? 'ja' : 'en'"), 'Lite must fall back to browser language when no stored preference exists');
assert.ok(app.includes('refreshDictionaryStatus();'), 'Lite language changes must refresh internal data readiness state');
assert.ok(app.includes('renderSummary(lastItems);'), 'Lite language changes must rerender the existing summary without rerunning analysis');
assert.ok(app.includes('renderTable(lastItems);'), 'Lite language changes must rerender existing result rows without rerunning analysis');
assert.ok(app.includes("document.dispatchEvent(new CustomEvent('nw-lite-languagechange'"), 'Lite runtime must notify enhancement UI after language changes');
assert.ok(js.includes("document.addEventListener('nw-lite-languagechange', update);"), 'Lite enhancements must rerender filters after language changes');
assert.ok(css.includes('.lite-filter-row'), 'Lite filter-row styling missing');
assert.ok(css.includes('.lite-copy-actions'), 'Lite copy-action styling missing');

console.log('Lite role-first navigation regression checks passed');
