import { patterns } from './data/patterns-all.js';

const root = document.querySelector('[data-tool="pattern-atlas"]');

if (root) {
  const isJapanese = document.documentElement.lang === 'ja';
  const searchInput = root.querySelector('[data-pa-search]');
  const resultCount = root.querySelector('[data-pa-results-count]');
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

  const previewClassFor = (pattern) => {
    if (pattern.rendererType === 'knot') return 'pa-pattern-sample knot';
    if (pattern.rendererType === 'grid' || pattern.rendererType === 'diamond-repeat' || pattern.rendererType === 'stripe') return 'pa-pattern-sample alt';
    return 'pa-pattern-sample';
  };

  const createCard = (pattern) => {
    const card = createElement('article', 'pa-card');
    card.dataset.paCard = '';
    card.dataset.paSearch = buildSearchText(pattern);

    const preview = createElement('div', 'pa-pattern-preview');
    const sample = createElement('div', previewClassFor(pattern));
    sample.setAttribute('aria-hidden', 'true');
    preview.append(sample);

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

  const updateResults = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const cards = Array.from(root.querySelectorAll('[data-pa-card]'));
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.paSearch || '').toLowerCase();
      const show = !query || haystack.includes(query);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      const unit = resultCount.dataset.paUnit || (isJapanese ? 'patterns' : 'patterns');
      resultCount.textContent = `${visible} ${unit}`;
    }
  };

  renderCards();
  searchInput?.addEventListener('input', updateResults);
  updateResults();
}
