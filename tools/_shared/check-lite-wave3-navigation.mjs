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
  '情報不足をコピー',
  'Copy incomplete',
  'navigator.clipboard.writeText',
  'nw-lite-languagechange'
]) {
  assert.ok(js.includes(required), `Lite answer-first navigation missing: ${required}`);
}

assert.ok(js.includes("activeFilter = 'all'"), 'status filter must retain an all state');
assert.ok(js.includes("activeCategory = 'all'"), 'category filter must retain an all state');
assert.ok(js.includes("(row.dataset.category || '') === activeCategory"), 'category filtering must use the row category dataset');
assert.ok(js.includes("filterBar.hidden = rows.length < 2"), 'single-result view must hide redundant filters');
assert.ok(js.includes("summaryBox.hidden = rowCount < 2"), 'single-result view must hide redundant aggregate summary');
assert.ok(js.includes('arrangeAnswerFirstLayout'), 'Lite must explicitly maintain answer-first result layout');
assert.ok(js.includes("unknownPanel.insertAdjacentElement('afterend', affiliateSlot)"), 'affiliate slot must remain after useful result/supporting content');

assert.ok(app.includes('row.dataset.category = item.statusKey === \'matched\''), 'result rows must expose role/category data only for complete results');
assert.ok(app.includes("? (item.match ? categoryLabel(item.match.category) : localized(item.flags[0]?.label))"), 'complete result rows must expose their supported role/category');
assert.ok(app.includes('row.dataset.resultKind = item.statusKey;'), 'result rows must expose public completeness state for filtering');
assert.ok(app.includes('ROLE_DESCRIPTIONS'), 'Lite must expose role descriptions rather than dictionary status as user value');
assert.ok(app.includes('function hasBilingualRoleExplanation'), 'Lite must validate bilingual role explanation completeness');
assert.ok(app.includes('function hasPublicExplanation'), 'Lite must not equate raw dictionary recognition with a complete public explanation');
assert.ok(!js.includes('辞書認識率'), 'dictionary coverage must not return to the Lite public UI');

const tableAt = html.indexOf('id="itemsTable"');
const summaryAt = html.indexOf('id="summaryBox"');
const affiliateAt = html.indexOf('id="amazonAffiliateSlot"');
assert.ok(tableAt >= 0 && summaryAt > tableAt, 'ingredient-level answer table must precede aggregate summary');
assert.ok(tableAt >= 0 && affiliateAt > tableAt, 'ingredient-level answer table must precede affiliate content');
assert.ok(html.includes('役割の説明') && html.includes('Role explanation'), 'result table must label role-level explanation explicitly');

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

console.log('Lite answer-first navigation regression checks passed');