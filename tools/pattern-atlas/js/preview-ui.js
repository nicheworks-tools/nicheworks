import { renderPatternSvg } from './renderers/index.js';

const encodeSvg = (value) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;

const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function setupPatternPreviews({ root, patterns, isJapanese }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  let selected = patterns[0];
  let mode = 'single';

  const makeButton = (label, value) => {
    const button = create('button', value === mode ? 'pa-button pa-button-primary' : 'pa-button', label);
    button.type = 'button';
    button.dataset.paPreviewMode = value;
    return button;
  };

  const renderModePreview = (box, pattern) => {
    box.replaceChildren();
    const svg = renderPatternSvg(pattern);
    const uri = encodeSvg(svg);

    if (mode === 'single') {
      const preview = create('div', 'pa-svg-preview pa-svg-preview-large');
      preview.innerHTML = svg;
      box.append(preview);
      return;
    }

    if (mode === 'tile-2' || mode === 'tile-4') {
      const count = mode === 'tile-2' ? 2 : 4;
      const grid = create('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = `repeat(${count}, minmax(0, 1fr))`;
      grid.style.gap = '4px';
      for (let index = 0; index < count * count; index += 1) {
        const cell = create('div');
        cell.style.minHeight = count === 2 ? '92px' : '46px';
        cell.style.backgroundImage = `url("${uri}")`;
        cell.style.backgroundSize = 'cover';
        cell.style.border = '1px solid #deded8';
        grid.append(cell);
      }
      box.append(grid);
      return;
    }

    const useCase = create('div', 'pa-use-preview-box');
    useCase.style.backgroundImage = `url("${uri}")`;
    useCase.style.backgroundRepeat = 'repeat';
    useCase.style.backgroundSize = mode === 'website' ? '120px auto' : '90px auto';
    useCase.style.minHeight = mode === 'poster' ? '240px' : '160px';
    if (mode === 'card') useCase.style.maxWidth = '360px';
    box.append(useCase);
  };

  const render = () => {
    const section = root.querySelector('#detail-title')?.closest('.pa-section');
    if (!section || !selected) return;
    section.querySelector('[data-pa-preview-panel]')?.remove();

    const panel = create('div', 'pa-use-preview');
    panel.dataset.paPreviewPanel = '';

    const title = create('h3', 'pa-card-title', isJapanese ? 'プレビュー' : 'Preview');
    const tabs = create('div', 'pa-preview-tabs');
    [
      [isJapanese ? '単体' : 'Single', 'single'],
      ['2×2', 'tile-2'],
      ['4×4', 'tile-4'],
      [isJapanese ? 'Web背景' : 'Website', 'website'],
      [isJapanese ? 'ポスター' : 'Poster', 'poster'],
      [isJapanese ? '布地' : 'Fabric', 'fabric'],
      [isJapanese ? 'カード' : 'Card', 'card']
    ].forEach(([label, value]) => tabs.append(makeButton(label, value)));

    const box = create('div');
    box.style.marginTop = '12px';
    renderModePreview(box, selected);

    panel.append(title, tabs, box);
    const notice = section.querySelector('.pa-notice');
    if (notice) notice.before(panel);
    else section.append(panel);
  };

  root.addEventListener('click', (event) => {
    const modeButton = event.target.closest('[data-pa-preview-mode]');
    if (modeButton) {
      mode = modeButton.dataset.paPreviewMode;
      render();
      return;
    }

    const card = event.target.closest('[data-pa-card]');
    if (!card) return;
    selected = patternMap.get(card.dataset.paPatternId) || selected;
    render();
  });

  render();
}
