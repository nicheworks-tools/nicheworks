import './prompt-autoload.js';
import { renderPatternSvg } from './renderers/index.js';

const cleanSvgForExport = (svg) => svg.replace(/<rect width="100%" height="100%" fill="transparent"\/>/, '');
const safeName = (value) => String(value || 'pattern').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'pattern';
const svgDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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

const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const confirmCulturalWarning = (root, pattern, isJapanese) => new Promise((resolve) => {
  if (!pattern?.exportSafety?.requireWarning) {
    resolve(true);
    return;
  }

  root.querySelector('[data-pa-export-warning]')?.remove();
  const name = isJapanese ? pattern.nameJa : pattern.nameEn;
  const panel = create('div', 'pa-notice');
  panel.dataset.paExportWarning = '';

  const title = create('strong', '', isJapanese ? '出力前の確認' : 'Before export');
  const body = create('p', '', isJapanese
    ? `${name} には文化的・宗教的・民族的背景が含まれる可能性があります。この出力素材は文化的認証素材・公式な歴史復元素材ではありません。商用利用や公的利用では追加確認してください。`
    : `${name} may have cultural, religious, or ethnic context. This export is not a culturally certified asset or an official historical reproduction. Review additional sources before commercial or public use.`);

  const label = create('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  label.append(checkbox, document.createTextNode(isJapanese ? ' 上記を理解しました' : ' I understand this notice'));

  const actions = create('div', 'pa-card-actions');
  const cancel = create('button', 'pa-button', isJapanese ? 'キャンセル' : 'Cancel');
  const proceed = create('button', 'pa-button pa-button-primary', isJapanese ? '理解して出力' : 'Export with notice');
  cancel.type = 'button';
  proceed.type = 'button';
  proceed.disabled = true;
  actions.append(cancel, proceed);
  panel.append(title, body, label, actions);

  checkbox.addEventListener('change', () => {
    proceed.disabled = !checkbox.checked;
  });
  cancel.addEventListener('click', () => {
    panel.remove();
    resolve(false);
  });
  proceed.addEventListener('click', () => {
    panel.remove();
    resolve(true);
  });

  const row = root.querySelector('.pa-export-row');
  if (row) row.before(panel);
  else root.append(panel);
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

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
    const enabled = format === 'svg' || format === 'png' || format === 'css';
    button.disabled = !enabled;
    if (format === 'png') button.textContent = isJapanese ? 'PNGをダウンロード' : 'Download PNG';
    else if (format === 'css') button.textContent = isJapanese ? 'CSSをダウンロード' : 'Download CSS';
    else button.textContent = isJapanese ? 'SVGをダウンロード' : 'Download SVG';
    button.title = '';
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

  const downloadCss = () => {
    if (!currentPattern) return;
    const name = safeName(currentPattern.slug);
    const svg = exportSvgString();
    const css = `.pattern-atlas-${name} {\n  background-image: url("${svgDataUri(svg)}");\n  background-repeat: repeat;\n  background-size: ${currentPattern.tile?.width || 180}px ${currentPattern.tile?.height || 160}px;\n}\n`;
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
    downloadBlob(blob, `pattern-atlas-${name}.css`);
  };

  root.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-pa-card]');
    if (card) {
      currentPattern = patternMap.get(card.dataset.paPatternId) || currentPattern;
      root.querySelector('[data-pa-export-warning]')?.remove();
      requestAnimationFrame(refreshControls);
      return;
    }

    const button = event.target.closest('.pa-export-row button');
    if (!button || button.disabled) return;
    if (!(await confirmCulturalWarning(root, currentPattern, isJapanese))) return;
    const { format } = getExportState(root);
    if (format === 'png') await downloadPng();
    else if (format === 'css') downloadCss();
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
