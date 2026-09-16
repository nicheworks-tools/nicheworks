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
  '未分類をコピー',
  'Copy unclassified',
  'navigator.clipboard.writeText',
  'nw-lite-languagechange'
]) {
  assert.ok(js.includes(required), `Lite wave 3 navigation missing: ${required}`);
}

assert.ok(js.includes("activeFilter = 'all'"), 'status filter must retain an all state');
assert.ok(js.includes("activeCategory = 'all'"), 'category filter must retain an all state');
assert.ok(js.includes("(row.dataset.category || '') === activeCategory"), 'category filtering must use the row category dataset');
assert.ok(app.includes('row.dataset.category = categoryLabel(item.match?.category);'), 'result rows must expose normalized category data for filtering');
assert.ok(app.includes('row.dataset.resultKind = item.statusKey;'), 'result rows must expose status data for filtering');
assert.ok(html.includes('data-lang="ja"') && html.includes('data-lang="en"'), 'Lite must expose JP/EN UI language controls');
assert.ok(app.includes("currentLang = lang === 'en' ? 'en' : 'ja'"), 'Lite runtime must switch dynamic result language');
assert.ok(css.includes('.lite-filter-row'), 'Lite filter-row styling missing');
assert.ok(css.includes('.lite-copy-actions'), 'Lite copy-action styling missing');

console.log('Lite wave 3 navigation regression checks passed');
