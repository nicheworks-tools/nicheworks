const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const colorLines = (pattern) => pattern.colorSlots
  .map((slot) => `${slot}: ${pattern.defaultColors?.[slot] || 'not specified'}`)
  .join('\n');

const makePrompt = (pattern, isJapanese) => isJapanese
  ? `文様名: ${pattern.nameJa} / ${pattern.nameEn}\n分類: ${pattern.categories.join(', ')}\n地域: ${pattern.regions.join(', ')}\n用途: ${pattern.useCases.join(', ')}\n色:\n${colorLines(pattern)}\n\nこの文様を参考に、繰り返し可能な現代的パターン素材を作成してください。文化的背景に配慮し、公式な歴史復元や認証素材として扱わないでください。`
  : `Pattern: ${pattern.nameEn} / ${pattern.nameJa}\nCategories: ${pattern.categories.join(', ')}\nRegion: ${pattern.regions.join(', ')}\nUse cases: ${pattern.useCases.join(', ')}\nColors:\n${colorLines(pattern)}\n\nCreate a modern repeating pattern asset inspired by this pattern. Treat it as a contextual modern reconstruction, not an official historical or certified asset.`;

export function setupPromptCopy({ root, patterns, isJapanese }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  let selected = patterns[0];

  const render = () => {
    const section = root.querySelector('#detail-title')?.closest('.pa-section');
    if (!section || !selected) return;
    section.querySelector('[data-pa-prompt-panel]')?.remove();

    const panel = create('div', 'pa-use-preview');
    panel.dataset.paPromptPanel = '';
    panel.append(create('h3', 'pa-card-title', isJapanese ? 'AI依頼文' : 'AI prompt'));

    const textarea = create('textarea', 'pa-input');
    textarea.rows = 8;
    textarea.value = makePrompt(selected, isJapanese);
    textarea.readOnly = true;

    const status = create('p', 'pa-muted');
    const button = create('button', 'pa-button pa-button-primary', isJapanese ? 'コピー' : 'Copy');
    button.type = 'button';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        status.textContent = isJapanese ? 'コピーしました。' : 'Copied.';
      } catch (error) {
        textarea.focus();
        textarea.select();
        status.textContent = isJapanese ? '手動でコピーしてください。' : 'Select and copy manually.';
      }
    });

    panel.append(textarea, button, status);
    const exportRow = section.querySelector('.pa-export-row');
    if (exportRow) exportRow.before(panel);
    else section.append(panel);
  };

  root.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (!card) return;
    selected = patternMap.get(card.dataset.paPatternId) || selected;
    render();
  });

  root.addEventListener('pattern-atlas:colors-change', (event) => {
    selected = event.detail?.pattern || selected;
    render();
  });

  render();
}
