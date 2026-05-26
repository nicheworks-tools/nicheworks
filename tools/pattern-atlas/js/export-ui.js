import { renderPatternSvg } from './renderers/index.js';

const cleanSvgForExport = (svg) => svg.replace(/<rect width="100%" height="100%" fill="transparent"\/>/, '');
const safeName = (value) => String(value || 'pattern').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'pattern';
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const getExportState = (root) => {
  const row = root.querySelector('.pa-export-row');
  const selects = row ? Array.from(row.querySelectorAll('select')) : [];
  const format = selects[0]?.value || 'svg';
  const size = Number(selects[1]?.value || 512);
  const button = row?.querySelector('button');
  return { row, format, size: Number.isFinite(size) ? size : 512, button };
};

const svgToPngBlob = async (svg, width) => new Promise((resolve, reject) => {
  const viewBox = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  const sourceWidth = Number(viewBox?.[1] || width);
  const sourceHeight = Number(viewBox?.[2] || width);
  const height = Math.max(1, Math.round(width * (sourceHeight / sourceWidth)));
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (pngBlob) resolve(pngBlob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('SVG image load failed'));
  };
  image.src = url;
});

export function setupSvgExport({ root, patterns, isJapanese }) {
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  let currentPattern = patterns[0];

  const refreshControls = () => {
    const { format, button } = getExportState(root);
    if (!button) return;
    const enabled = format === 'svg' || format === 'png';
    button.disabled = !enabled;
    button.textContent = format === 'png'
      ? (isJapanese ? 'PNGをダウンロード' : 'Download PNG')
      : (isJapanese ? 'SVGをダウンロード' : 'Download SVG');
    button.title = enabled ? '' : (isJapanese ? 'CSS出力は後続PRで実装します' : 'CSS export will be implemented later');
  };

  const exportSvgString = () => cleanSvgForExport(renderPatternSvg(currentPattern));

  const downloadSvg = () => {
    if (!currentPattern) return;
    const blob = new Blob([exportSvgString()], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `pattern-atlas-${safeName(currentPattern.slug)}.svg`);
  };

  const downloadPng = async () => {
    if (!currentPattern) return;
    const { size } = getExportState(root);
    const blob = await svgToPngBlob(exportSvgString(), size);
    downloadBlob(blob, `pattern-atlas-${safeName(currentPattern.slug)}.png`);
  };

  root.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (card) {
      currentPattern = patternMap.get(card.dataset.paPatternId) || currentPattern;
      requestAnimationFrame(refreshControls);
      return;
    }

    const button = event.target.closest('.pa-export-row button');
    if (!button || button.disabled) return;
    const { format } = getExportState(root);
    if (format === 'png') await downloadPng();
    else if (format === 'svg') downloadSvg();
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
