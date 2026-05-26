import { patterns } from './data/patterns-all.js';
import { setupPatternFilters } from './filter-ui.js';
import { setupPatternDetail } from './detail-ui.js';
import { setupDetailSvgPreview } from './detail-svg-preview.js';
import { renderPatternSvg } from './renderers/index.js';

const root = document.querySelector('[data-tool="pattern-atlas"]');

if (root) {
  const isJapanese = document.documentElement.lang === 'ja';
  const grid = root.querySelector('.pa-card-grid');

  const getText = (pattern, enKey, jaKey) => isJapanese ? pattern[jaKey] : pattern[enKey];

  const buildSearchText = (pattern) => [
    pattern.nameEn,
    pattern.nameJa,
    ...pattern.aliasesEn,
    ...pattern.aliasesJa,
    ...pattern.regions,
    ...pattern.cultures,
    ...pattern.categories,
    ...pattern.motifs,
    ...pattern.useCases,
    pattern.summaryEn,
    pattern.summaryJa
  ].join(' ').toLowerCase();

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const createSvgPreview = (pattern, className = 'pa-svg-preview') => {
    const wrapper = createElement('div', className);
    wrapper.innerHTML = renderPatternSvg(pattern);
    return wrapper;
  };

  const createCard = (pattern) => {
    const card = createElement('article', 'pa-card');
    card.dataset.paCard = '';
    card.dataset.paPatternId = pattern.id;
    card.dataset.paSearch = buildSearchText(pattern);
    card.dataset.paRegions = pattern.regions.join(' ');
    card.dataset.paCategories = pattern.categories.join(' ');
    card.dataset.paUses = pattern.useCases.join(' ');

    const preview = createElement('div', 'pa-pattern-preview');
    preview.append(createSvgPreview(pattern));

    const body = createElement('div', 'pa-card-body');
    const title = createElement('h3', 'pa-card-title', getText(pattern, 'nameEn', 'nameJa'));
    const meta = createElement('p', 'pa-card-meta', `${pattern.regions.join(', ')} / ${pattern.categories.join(', ')}`);
    const note = createElement('p', 'pa-card-note', getText(pattern, 'summaryEn', 'summaryJa'));

    const tags = createElement('div', 'pa-tag-row');
    [pattern.cautionLevel, pattern.rendererType].forEach((tagText) => tags.append(createElement('span', 'pa-tag', tagText)));

    const actions = createElement('div', 'pa-card-actions');
    actions.append(
      createElement('button', 'pa-button', isJapanese ? '詳細' : 'Detail'),
      createElement('button', 'pa-button pa-button-primary', isJapanese ? '編集' : 'Edit')
    );
    actions.querySelectorAll('button').forEach((button) => button.type = 'button');

    body.append(title, meta, note, tags, actions);
    card.append(preview, body);
    return card;
  };

  const renderCards = () => {
    if (!grid) return;
    grid.replaceChildren(...patterns.map(createCard));
  };

  renderCards();
  setupPatternFilters({ root, patterns, isJapanese });
  setupPatternDetail({ root, patterns, isJapanese });
  setupDetailSvgPreview({ root, patterns });
}
