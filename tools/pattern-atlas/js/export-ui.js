import { renderPatternSvg } from './renderers/index.js';

const cleanSvgForExport = (svg) => svg.replace(/<rect width="100%" height="100%" fill="transparent"\/>/, '');
const safeName = (value) => String(value || 'pattern').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'pattern';

export function setupSvgExport({ root, patterns, isJapanese }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  let currentPattern = patterns[0];

  const refreshControls = () => {
    const row = root.querySelector('.pa-export-row');
    if (!row) return;
    const format = row.querySelector('select');
    const button = row.querySelector('button');
    if (!button) return;
    const isSvg = !format || format.value === 'svg';
    button.disabled = !isSvg;
    button.textContent = isJapanese ? 'SVGをダウンロード' : 'Download SVG';
    button.title = isSvg ? '' : (isJapanese ? 'PNG/CSS出力は後続PRで実装します' : 'PNG/CSS export will be implemented later');
  };

  const downloadSvg = () => {
    if (!currentPattern) return;
    const svg = cleanSvgForExport(renderPatternSvg(currentPattern));
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pattern-atlas-${safeName(currentPattern.slug)}.svg`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  root.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (card) {
      currentPattern = patternMap.get(card.dataset.paPatternId) || currentPattern;
      requestAnimationFrame(refreshControls);
      return;
    }

    const button = event.target.closest('.pa-export-row button');
    if (button && !button.disabled) {
      downloadSvg();
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.closest('.pa-export-row')) refreshControls();
  });

  root.addEventListener('pattern-atlas:colors-change', (event) => {
    currentPattern = event.detail?.pattern || currentPattern;
    refreshControls();
  });

  requestAnimationFrame(refreshControls);
}
