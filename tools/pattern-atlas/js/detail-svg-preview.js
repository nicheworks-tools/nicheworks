import { renderPatternSvg } from './renderers/index.js';

export function setupDetailSvgPreview({ root, patterns }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  const setPreview = (pattern) => {
    const box = root.querySelector('.pa-large-preview');
    if (!box || !pattern) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'pa-svg-preview pa-svg-preview-large';
    wrapper.innerHTML = renderPatternSvg(pattern);
    box.replaceChildren(wrapper);
  };

  root.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (!card) return;
    setPreview(patternMap.get(card.dataset.paPatternId));
  });

  setPreview(patterns[0]);
}
