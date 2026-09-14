import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/enhancements.js', 'utf8');
const css = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/enhancements.css', 'utf8');

for (const required of [
  'liteCategoryFilter',
  'button.dataset.liteCategory',
  'rowCategoryMatches',
  '表示中をコピー',
  '未分類をコピー',
  'navigator.clipboard.writeText',
  '分類で結果を絞り込む'
]) {
  assert.ok(js.includes(required), `Lite wave 3 navigation missing: ${required}`);
}

assert.ok(js.includes("activeFilter = 'all'"), 'status filter must retain an all state');
assert.ok(js.includes("activeCategory = 'all'"), 'category filter must retain an all state');
assert.ok(js.includes("row.textContent.includes(`分類: ${activeCategory}`)"), 'category filtering must use rendered dictionary classification');
assert.ok(css.includes('.lite-filter-row'), 'Lite filter-row styling missing');
assert.ok(css.includes('.lite-copy-actions'), 'Lite copy-action styling missing');

console.log('Lite wave 3 navigation regression checks passed');
