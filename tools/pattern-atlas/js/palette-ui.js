import { palettes } from './data/palettes.js';

const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function setupPalettePresets({ root, isJapanese }) {
  const render = () => {
    const editor = root.querySelector('[data-pa-color-editor]');
    if (!editor || editor.querySelector('[data-pa-palette-row]')) return;

    const row = create('div', 'pa-palette-row');
    row.dataset.paPaletteRow = '';

    palettes.forEach((palette) => {
      const button = create('button', 'pa-button', isJapanese ? palette.nameJa : palette.nameEn);
      button.type = 'button';
      button.dataset.paPalette = palette.id;
      row.append(button);
    });

    const title = editor.querySelector('.pa-card-title');
    if (title) title.after(row);
    else editor.prepend(row);
  };

  const apply = (paletteId) => {
    const palette = palettes.find((item) => item.id === paletteId);
    const editor = root.querySelector('[data-pa-color-editor]');
    if (!palette || !editor) return;

    editor.querySelectorAll('.pa-color-row').forEach((row) => {
      const slot = row.querySelector('label')?.textContent?.trim();
      const value = palette.colors[slot];
      if (!slot || !value) return;
      const picker = row.querySelector('input[type="color"]');
      const text = row.querySelector('input.pa-input');
      if (picker) picker.value = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value;
      if (text) {
        text.value = value;
        text.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  };

  root.addEventListener('click', (event) => {
    const paletteButton = event.target.closest('[data-pa-palette]');
    if (paletteButton) {
      apply(paletteButton.dataset.paPalette);
      return;
    }
    if (event.target.closest('[data-pa-card]')) requestAnimationFrame(render);
  });

  render();
}
