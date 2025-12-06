const beforeCanvas = document.getElementById('beforeCanvas');
const afterCanvas = document.getElementById('afterCanvas');
const beforeCtx = beforeCanvas.getContext('2d');
const afterCtx = afterCanvas.getContext('2d');
const hiddenCanvas = document.createElement('canvas');
const hiddenCtx = hiddenCanvas.getContext('2d');
const originalCanvas = document.createElement('canvas');
const originalCtx = originalCanvas.getContext('2d');

const imageInput = document.getElementById('imageInput');
const downloadBtn = document.getElementById('downloadBtn');
const resetAllBtn = document.getElementById('resetAll');
const toleranceInput = document.getElementById('tolerance');
const toleranceValue = document.getElementById('toleranceValue');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const tabButtons = document.querySelectorAll('.tab-button');
const canvasArea = document.querySelector('.canvas-area');
const langButtons = document.querySelectorAll('.lang-button');

const fromPreview = document.getElementById('fromPreview');
const toPreview = document.getElementById('toPreview');
const fromPicker = document.getElementById('fromPicker');
const toPicker = document.getElementById('toPicker');
const fromHex = document.getElementById('fromHex');
const toHex = document.getElementById('toHex');
const fromR = document.getElementById('fromR');
const fromG = document.getElementById('fromG');
const fromB = document.getElementById('fromB');
const toR = document.getElementById('toR');
const toG = document.getElementById('toG');
const toB = document.getElementById('toB');
const fromPreset = document.getElementById('fromPreset');
const toPreset = document.getElementById('toPreset');

let currentImageData = null;
let originalImageData = null;
let zoomScale = 1;
const defaults = {
  from: '#ff0000',
  to: '#00ff00',
  tolerance: 60,
  zoom: 1,
};

const i18n = {
  ja: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description:
      'スポイトで拾った色を別の色に置き換えるブラウザツール。HEX/RGB同期、ズーム、PNG保存に対応します。',
    adTop: '広告枠（上）',
    adBottom: '広告枠（下）',
    langJa: '日本語',
    langEn: 'English',
    uploadLabel: '画像をアップロード',
    beforeTab: 'Before',
    afterTab: 'After',
    beforeLabel: '変換前（ズーム可）',
    beforeNote: 'クリックでスポイト',
    zoomLabel: 'ズーム',
    afterLabel: '変換後',
    afterNote: '許容範囲でリアルタイム反映',
    fromColor: '置換対象の色 (From)',
    toColor: '置換後の色 (To)',
    resetSection: 'リセット',
    pickerLabel: 'カラーピッカー',
    hexLabel: 'HEX',
    rgbLabel: 'RGB',
    presetLabel: 'プリセット',
    presetRed: '赤',
    presetGreen: '緑',
    presetBlue: '青',
    presetWhite: '白',
    presetBlack: '黒',
    toleranceLabel: '置換許容範囲',
    download: 'PNGで保存',
    resetAll: '全体リセット',
    support: '応援リンク',
    ofuse: 'OFUSEで応援',
    kofi: 'Ko-fiで支援',
    internalLinks: '関連ツール',
    linkCompression: '画像圧縮チェッカー',
    linkExif: 'Exifクリーナー',
    linkConverter: 'WebP/AVIF変換',
    disclaimer: 'このツールはすべてローカルで処理され、画像はサーバーへ送信されません。',
    privacy: 'プライバシー',
    contact: 'お問い合わせ',
  },
  en: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description:
      'Replace picked colors in your image right in the browser. Supports HEX/RGB sync, zoom preview, and PNG export.',
    adTop: 'Ad space (top)',
    adBottom: 'Ad space (bottom)',
    langJa: '日本語',
    langEn: 'English',
    uploadLabel: 'Upload image',
    beforeTab: 'Before',
    afterTab: 'After',
    beforeLabel: 'Before (zoomable)',
    beforeNote: 'Click to pick color',
    zoomLabel: 'Zoom',
    afterLabel: 'After',
    afterNote: 'Live preview with tolerance',
    fromColor: 'Source color (From)',
    toColor: 'Target color (To)',
    resetSection: 'Reset',
    pickerLabel: 'Color picker',
    hexLabel: 'HEX',
    rgbLabel: 'RGB',
    presetLabel: 'Preset',
    presetRed: 'Red',
    presetGreen: 'Green',
    presetBlue: 'Blue',
    presetWhite: 'White',
    presetBlack: 'Black',
    toleranceLabel: 'Tolerance',
    download: 'Save as PNG',
    resetAll: 'Reset all',
    support: 'Support',
    ofuse: 'Support on OFUSE',
    kofi: 'Support on Ko-fi',
    internalLinks: 'Related tools',
    linkCompression: 'Image compression checker',
    linkExif: 'Exif cleaner',
    linkConverter: 'WebP/AVIF converter',
    disclaimer: 'All processing stays in your browser. Images are never uploaded.',
    privacy: 'Privacy',
    contact: 'Contact',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const r = normalized[0] + normalized[0];
    const g = normalized[1] + normalized[1];
    const b = normalized[2] + normalized[2];
    return {
      r: parseInt(r, 16),
      g: parseInt(g, 16),
      b: parseInt(b, 16),
    };
  }
  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => clamp(parseInt(v, 10) || 0, 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function updatePreview(section, hex) {
  const preview = section === 'from' ? fromPreview : toPreview;
  preview.style.backgroundColor = hex;
}

function syncFromHex(hex) {
  const rgb = hexToRgb(hex);
  fromHex.value = hex;
  fromPicker.value = hex;
  fromR.value = rgb.r;
  fromG.value = rgb.g;
  fromB.value = rgb.b;
  updatePreview('from', hex);
}

function syncToHex(hex) {
  const rgb = hexToRgb(hex);
  toHex.value = hex;
  toPicker.value = hex;
  toR.value = rgb.r;
  toG.value = rgb.g;
  toB.value = rgb.b;
  updatePreview('to', hex);
}

function syncFromRgb() {
  const hex = rgbToHex(fromR.value, fromG.value, fromB.value);
  syncFromHex(hex);
}

function syncToRgb() {
  const hex = rgbToHex(toR.value, toG.value, toB.value);
  syncToHex(hex);
}

function applyI18n(lang) {
  const dict = i18n[lang];
  if (!dict) return;
  document.documentElement.lang = lang === 'ja' ? 'ja' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

function setLanguage(lang) {
  langButtons.forEach((btn) => {
    btn.classList.toggle('primary', btn.getAttribute('data-lang') === lang);
  });
  applyI18n(lang);
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalCanvas.width = img.naturalWidth;
      originalCanvas.height = img.naturalHeight;
      originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
      originalCtx.drawImage(img, 0, 0);
      originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

      hiddenCanvas.width = img.naturalWidth;
      hiddenCanvas.height = img.naturalHeight;
      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      hiddenCtx.drawImage(img, 0, 0);

      currentImageData = null;
      renderBeforeCanvas();
      clearAfterCanvas();
      applyReplacement();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderBeforeCanvas() {
  if (!originalImageData) {
    beforeCtx.clearRect(0, 0, beforeCanvas.width, beforeCanvas.height);
    return;
  }
  const targetWidth = originalImageData.width * zoomScale;
  const targetHeight = originalImageData.height * zoomScale;
  beforeCanvas.width = targetWidth;
  beforeCanvas.height = targetHeight;
  beforeCtx.clearRect(0, 0, targetWidth, targetHeight);
  beforeCtx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);
}

function clearAfterCanvas() {
  afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
}

function applyReplacement() {
  if (!originalImageData) return;
  const fromColor = hexToRgb(fromHex.value || defaults.from);
  const toColor = hexToRgb(toHex.value || defaults.to);
  const tolerance = parseInt(toleranceInput.value, 10) || defaults.tolerance;

  const dataCopy = new Uint8ClampedArray(originalImageData.data);
  const processed = new ImageData(dataCopy, originalImageData.width, originalImageData.height);
  for (let i = 0; i < processed.data.length; i += 4) {
    const r = processed.data[i];
    const g = processed.data[i + 1];
    const b = processed.data[i + 2];
    const dist = Math.abs(r - fromColor.r) + Math.abs(g - fromColor.g) + Math.abs(b - fromColor.b);
    if (dist <= tolerance) {
      processed.data[i] = toColor.r;
      processed.data[i + 1] = toColor.g;
      processed.data[i + 2] = toColor.b;
    }
  }

  hiddenCanvas.width = processed.width;
  hiddenCanvas.height = processed.height;
  hiddenCtx.putImageData(processed, 0, 0);
  afterCanvas.width = processed.width;
  afterCanvas.height = processed.height;
  afterCtx.putImageData(processed, 0, 0);
  currentImageData = processed;
}

function pickColor(event) {
  if (!originalImageData) return;
  const rect = beforeCanvas.getBoundingClientRect();
  const scaleX = originalImageData.width / rect.width;
  const scaleY = originalImageData.height / rect.height;
  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);
  const index = (y * originalImageData.width + x) * 4;
  const data = originalImageData.data;
  const hex = rgbToHex(data[index], data[index + 1], data[index + 2]);
  syncFromHex(hex);
  applyReplacement();
}

let pinchStartDistance = null;
let pinchStartScale = zoomScale;

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    pinchStartDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    pinchStartScale = zoomScale;
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2 && pinchStartDistance) {
    e.preventDefault();
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    const ratio = currentDistance / pinchStartDistance;
    zoomScale = clamp(pinchStartScale * ratio, 0.5, 5);
    zoomSlider.value = zoomScale.toFixed(2);
    zoomValue.textContent = `${zoomScale.toFixed(1)}x`;
    renderBeforeCanvas();
  }
}

function handleTouchEnd() {
  pinchStartDistance = null;
}

function handleTabClick(e) {
  const target = e.target.getAttribute('data-tab');
  tabButtons.forEach((btn) => btn.classList.toggle('active', btn.getAttribute('data-tab') === target));
  canvasArea.setAttribute('data-view', target);
}

function resetSection(section) {
  if (section === 'from') {
    syncFromHex(defaults.from);
  } else {
    syncToHex(defaults.to);
  }
  applyReplacement();
}

function resetAll() {
  syncFromHex(defaults.from);
  syncToHex(defaults.to);
  toleranceInput.value = defaults.tolerance;
  toleranceValue.textContent = defaults.tolerance;
  zoomScale = defaults.zoom;
  zoomSlider.value = defaults.zoom;
  zoomValue.textContent = `${defaults.zoom.toFixed(1)}x`;
  originalImageData = null;
  currentImageData = null;
  beforeCtx.clearRect(0, 0, beforeCanvas.width, beforeCanvas.height);
  afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
  hiddenCanvas.width = 0;
  hiddenCanvas.height = 0;
}

function downloadImage() {
  if (!hiddenCanvas.width || !hiddenCanvas.height) return;
  const link = document.createElement('a');
  link.href = hiddenCanvas.toDataURL('image/png');
  link.download = 'color-replaced.png';
  link.click();
}

function initializeLang() {
  const userLang = navigator.language && navigator.language.startsWith('en') ? 'en' : 'ja';
  setLanguage(userLang);
}

// Event bindings
imageInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) {
    loadImage(file);
  }
});

beforeCanvas.addEventListener('click', pickColor);
beforeCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
beforeCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
beforeCanvas.addEventListener('touchend', handleTouchEnd);
beforeCanvas.addEventListener('touchcancel', handleTouchEnd);

toleranceInput.addEventListener('input', (e) => {
  toleranceValue.textContent = e.target.value;
  applyReplacement();
});

zoomSlider.addEventListener('input', (e) => {
  zoomScale = parseFloat(e.target.value);
  zoomValue.textContent = `${zoomScale.toFixed(1)}x`;
  renderBeforeCanvas();
});

[...document.querySelectorAll('[data-section-reset]')].forEach((btn) => {
  btn.addEventListener('click', () => resetSection(btn.getAttribute('data-section-reset')));
});

fromHex.addEventListener('input', () => {
  const value = fromHex.value.startsWith('#') ? fromHex.value : `#${fromHex.value}`;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    syncFromHex(value.toLowerCase());
    applyReplacement();
  }
});

toHex.addEventListener('input', () => {
  const value = toHex.value.startsWith('#') ? toHex.value : `#${toHex.value}`;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    syncToHex(value.toLowerCase());
    applyReplacement();
  }
});

fromPicker.addEventListener('input', () => {
  syncFromHex(fromPicker.value);
  applyReplacement();
});

toPicker.addEventListener('input', () => {
  syncToHex(toPicker.value);
  applyReplacement();
});

[fromR, fromG, fromB].forEach((el) => el.addEventListener('input', () => {
  syncFromRgb();
  applyReplacement();
}));

[toR, toG, toB].forEach((el) => el.addEventListener('input', () => {
  syncToRgb();
  applyReplacement();
}));

fromPreset.addEventListener('change', () => {
  syncFromHex(fromPreset.value);
  applyReplacement();
});

toPreset.addEventListener('change', () => {
  syncToHex(toPreset.value);
  applyReplacement();
});

downloadBtn.addEventListener('click', downloadImage);
resetAllBtn.addEventListener('click', resetAll);

tabButtons.forEach((btn) => btn.addEventListener('click', handleTabClick));

langButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    setLanguage(lang);
  }),
);

initializeLang();
syncFromHex(defaults.from);
syncToHex(defaults.to);
toleranceValue.textContent = defaults.tolerance;
zoomValue.textContent = `${defaults.zoom.toFixed(1)}x`;
