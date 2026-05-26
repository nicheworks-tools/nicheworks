import { renderPatternSvg } from './renderers/index.js';

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TRANSPARENT = 'transparent';
const cloneColors = (pattern) => ({ ...(pattern.defaultColors || {}) });
const isHex = (value) => HEX_RE.test(String(value || '').trim());
const isTransparent = (value) => String(value || '').trim().toLowerCase() === TRANSPARENT;
const isValidColorValue = (value) => isHex(value) || isTransparent(value);
const slotLabel = (slot, isJapanese) => {
  const labels = {
    background: ['Background', '背景'],
    primary: ['Main pattern', '主模様'],
    secondary: ['Sub pattern', '副模様'],
    accent: ['Accent', 'アクセント'],
    line: ['Line', '線'],
    highlight: ['Highlight', 'ハイライト']
  };
  const pair = labels[slot] || [slot, slot];
  return isJapanese ? `${pair[1]} (${slot})` : `${pair[0]} (${slot})`;
};

const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const toPickerValue = (value) => {
  const next = String(value || '').trim();
  if (isTransparent(next)) return '#000000';
  if (next.length === 4) return `#${next[1]}${next[1]}${next[2]}${next[2]}${next[3]}${next[3]}`;
  return isHex(next) ? next : '#000000';
};

export function setupColorEditor({ root, patterns, isJapanese }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  let selected = patterns[0];
  let colors = cloneColors(selected);

  const currentPattern = () => ({ ...selected, defaultColors: colors });

  const updatePreview = () => {
    const current = currentPattern();
    root.querySelectorAll('.pa-large-preview .pa-svg-preview').forEach((box) => {
      box.innerHTML = renderPatternSvg(current);
    });
    const cardBox = root.querySelector(`[data-pa-card][data-pa-pattern-id="${selected.id}"] .pa-svg-preview`);
    if (cardBox) cardBox.innerHTML = renderPatternSvg(current);
    root.dispatchEvent(new CustomEvent('pattern-atlas:colors-change', { detail: { pattern: current } }));
  };

  const render = () => {
    const section = root.querySelector('#detail-title')?.closest('.pa-section');
    if (!section || !selected) return;
    section.querySelector('[data-pa-color-editor]')?.remove();

    const panel = create('div', 'pa-use-preview');
    panel.dataset.paColorEditor = '';
    panel.append(create('h3', 'pa-card-title', isJapanese ? '色編集' : 'Color editor'));
    panel.append(create('p', 'pa-muted', isJapanese ? '各パーツごとに色または transparent を指定できます。透過部分は市松背景で確認できます。' : 'Set a color or transparent for each part. Transparent areas are shown over the checkerboard preview.'));

    selected.colorSlots.forEach((slot) => {
      const row = create('div', 'pa-color-row');
      const label = create('label', '', slotLabel(slot, isJapanese));
      const picker = document.createElement('input');
      picker.type = 'color';
      picker.value = toPickerValue(colors[slot]);
      const text = create('input', 'pa-input');
      text.value = isValidColorValue(colors[slot]) ? String(colors[slot]).trim() : '#000000';
      text.setAttribute('aria-label', `${slot} color or transparent`);
      const transparentButton = create('button', 'pa-button', isJapanese ? '透過' : 'Transparent');
      transparentButton.type = 'button';

      const apply = (value) => {
        const next = String(value || '').trim();
        if (!isValidColorValue(next)) {
          text.setAttribute('aria-invalid', 'true');
          return;
        }
        text.removeAttribute('aria-invalid');
        colors[slot] = isTransparent(next) ? TRANSPARENT : next;
        text.value = colors[slot];
        picker.value = toPickerValue(colors[slot]);
        updatePreview();
      };

      picker.addEventListener('input', () => apply(picker.value));
      text.addEventListener('input', () => apply(text.value));
      transparentButton.addEventListener('click', () => apply(TRANSPARENT));
      row.append(label, picker, text, transparentButton);
      panel.append(row);
    });

    const reset = create('button', 'pa-button', isJapanese ? '初期色に戻す' : 'Reset colors');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      colors = cloneColors(selected);
      render();
      updatePreview();
    });
    panel.append(reset);

    const previewPanel = section.querySelector('[data-pa-preview-panel]');
    if (previewPanel) previewPanel.before(panel);
    else section.append(panel);
  };

  root.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (!card) return;
    selected = patternMap.get(card.dataset.paPatternId) || selected;
    colors = cloneColors(selected);
    render();
    requestAnimationFrame(updatePreview);
  });

  render();
  requestAnimationFrame(updatePreview);
}