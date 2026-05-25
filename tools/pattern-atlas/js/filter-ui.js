import { regions } from './data/regions.js';
import { categories } from './data/categories.js';
import { useCases } from './data/use-cases.js';

export function setupPatternFilters({ root, patterns, isJapanese }) {
  const searchInput = root.querySelector('[data-pa-search]');
  const resultCount = root.querySelector('[data-pa-results-count]');
  const selects = Array.from(root.querySelectorAll('.pa-filter-row .pa-select'));
  const [regionSelect, categorySelect, useSelect] = selects;
  const resetButton = root.querySelector('.pa-filter-row .pa-button');
  const resultsSection = root.querySelector('#list-title')?.closest('.pa-section');

  const mapLabels = (items) => new Map(items.map((item) => [item.id, isJapanese ? item.nameJa : item.nameEn]));
  const labels = {
    region: mapLabels(regions),
    category: mapLabels(categories),
    use: mapLabels(useCases)
  };
  const labelFor = (id, map) => map.get(id) || id;
  const unique = (values, map) => [...new Set(values)].sort((a, b) => labelFor(a, map).localeCompare(labelFor(b, map), isJapanese ? 'ja' : 'en'));

  const setOptions = (select, ids, map, allLabel) => {
    if (!select) return;
    select.replaceChildren(new Option(allLabel, 'all'), ...ids.map((id) => new Option(labelFor(id, map), id)));
  };

  setOptions(regionSelect, unique(patterns.flatMap((p) => p.regions), labels.region), labels.region, isJapanese ? '地域: すべて' : 'Region: All');
  setOptions(categorySelect, unique(patterns.flatMap((p) => p.categories), labels.category), labels.category, isJapanese ? '分類: すべて' : 'Category: All');
  setOptions(useSelect, unique(patterns.flatMap((p) => p.useCases), labels.use), labels.use, isJapanese ? '用途: すべて' : 'Use: All');

  let empty = root.querySelector('[data-pa-empty]');
  if (!empty && resultsSection) {
    empty = document.createElement('p');
    empty.className = 'pa-muted';
    empty.dataset.paEmpty = '';
    empty.textContent = isJapanese ? '該当する模様がありません。検索語を減らすか、フィルタを解除してください。' : 'No patterns found. Try fewer keywords or reset filters.';
    empty.hidden = true;
    resultsSection.append(empty);
  }

  const hasValue = (source, value) => value === 'all' || source.split(' ').includes(value);
  const update = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const region = regionSelect?.value || 'all';
    const category = categorySelect?.value || 'all';
    const use = useSelect?.value || 'all';
    let visible = 0;

    root.querySelectorAll('[data-pa-card]').forEach((card) => {
      const match = (!query || (card.dataset.paSearch || '').toLowerCase().includes(query))
        && hasValue(card.dataset.paRegions || '', region)
        && hasValue(card.dataset.paCategories || '', category)
        && hasValue(card.dataset.paUses || '', use);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (resultCount) resultCount.textContent = isJapanese ? `${visible}件` : `${visible} patterns`;
    if (empty) empty.hidden = visible !== 0;
  };

  const reset = () => {
    if (searchInput) searchInput.value = '';
    [regionSelect, categorySelect, useSelect].forEach((select) => {
      if (select) select.value = 'all';
    });
    update();
  };

  searchInput?.addEventListener('input', update);
  [regionSelect, categorySelect, useSelect].forEach((select) => select?.addEventListener('change', update));
  resetButton?.addEventListener('click', reset);
  update();
}
