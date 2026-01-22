const imageFile = document.getElementById('imageFile');
const canvasBefore = document.getElementById('canvasBefore');
const canvasAfter = document.getElementById('canvasAfter');
const ctxBefore = canvasBefore.getContext('2d');
const ctxAfter = canvasAfter.getContext('2d');
const srcColorInput = document.getElementById('srcColor');
const dstColorInput = document.getElementById('dstColor');
const toleranceInput = document.getElementById('tolerance');
const toleranceVal = document.getElementById('toleranceVal');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const scaleNote = document.getElementById('scaleNote');
const langButtons = document.querySelectorAll('.lang-button');

const sourceCanvas = document.createElement('canvas');
const sourceCtx = sourceCanvas.getContext('2d');

const MAX_MEGAPIXELS = 4;
const MAX_FRAME_TIME = 12;

let baseImageData = null;
let processing = false;
let scaleRatio = 1;
let hasResult = false;

const defaults = {
  src: '#ff0000',
  dst: '#00ff00',
  tolerance: 20,
};

const i18n = {
  ja: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description: '指定した色を許容範囲で置換し、PNGとして保存できるブラウザツールです。',
    adTop: '広告枠（上）',
    adBottom: '広告枠（下）',
    langJa: '日本語',
    langEn: 'English',
    uploadLabel: '画像をアップロード',
    localNote: 'Local-only. Image stays on your device.',
    beforeLabel: '変換前',
    afterLabel: '変換後',
    pickTip: 'クリックで色を取得',
    srcColorLabel: '置換対象の色',
    dstColorLabel: '置換後の色',
    toleranceLabel: '許容範囲',
    apply: '置換を適用',
    applying: '処理中...',
    reset: 'リセット',
    download: 'PNGで保存',
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
    scaleNote: '画像が大きいため {width}×{height} に縮小してプレビューします（ダウンロードも同サイズ）。',
  },
  en: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description: 'Replace a specific color with tolerance and export a PNG directly in the browser.',
    adTop: 'Ad space (top)',
    adBottom: 'Ad space (bottom)',
    langJa: '日本語',
    langEn: 'English',
    uploadLabel: 'Upload image',
    localNote: 'Local-only. Image stays on your device.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    pickTip: 'Click to pick a color',
    srcColorLabel: 'Source color',
    dstColorLabel: 'Target color',
    toleranceLabel: 'Tolerance',
    apply: 'Apply',
    applying: 'Processing...',
    reset: 'Reset',
    download: 'Download PNG',
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
    scaleNote: 'Image is large, preview is downscaled to {width}×{height} (download matches).',
  },
};

let currentLang = 'ja';

function applyI18n(lang) {
  const dict = i18n[lang] || i18n.ja;
  document.documentElement.lang = lang === 'en' ? 'en' : 'ja';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  currentLang = lang;
  updateScaleNote();
}

function setLanguage(lang) {
  langButtons.forEach((btn) => {
    btn.classList.toggle('primary', btn.getAttribute('data-lang') === lang);
  });
  applyI18n(lang);
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  if (value.length === 3) {
    return {
      r: parseInt(value[0] + value[0], 16),
      g: parseInt(value[1] + value[1], 16),
      b: parseInt(value[2] + value[2], 16),
    };
  }
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

function setButtonsDisabled(isDisabled) {
  applyBtn.disabled = isDisabled;
  resetBtn.disabled = isDisabled;
  downloadBtn.disabled = isDisabled || !hasResult;
  if (isDisabled) {
    applyBtn.textContent = i18n[currentLang].applying;
  } else {
    applyBtn.textContent = i18n[currentLang].apply;
  }
}

function updateScaleNote() {
  if (!scaleNote) return;
  if (scaleRatio < 1 && baseImageData) {
    const template = i18n[currentLang].scaleNote;
    scaleNote.textContent = template
      .replace('{width}', baseImageData.width)
      .replace('{height}', baseImageData.height);
  } else {
    scaleNote.textContent = '';
  }
}

function clearCanvases() {
  ctxBefore.clearRect(0, 0, canvasBefore.width, canvasBefore.height);
  ctxAfter.clearRect(0, 0, canvasAfter.width, canvasAfter.height);
  canvasBefore.width = 0;
  canvasBefore.height = 0;
  canvasAfter.width = 0;
  canvasAfter.height = 0;
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const megapixels = (img.naturalWidth * img.naturalHeight) / 1_000_000;
      scaleRatio = megapixels > MAX_MEGAPIXELS ? Math.sqrt(MAX_MEGAPIXELS / megapixels) : 1;
      const width = Math.max(1, Math.round(img.naturalWidth * scaleRatio));
      const height = Math.max(1, Math.round(img.naturalHeight * scaleRatio));

      sourceCanvas.width = width;
      sourceCanvas.height = height;
      sourceCtx.clearRect(0, 0, width, height);
      sourceCtx.drawImage(img, 0, 0, width, height);
      baseImageData = sourceCtx.getImageData(0, 0, width, height);

      canvasBefore.width = width;
      canvasBefore.height = height;
      ctxBefore.clearRect(0, 0, width, height);
      ctxBefore.drawImage(img, 0, 0, width, height);

      canvasAfter.width = width;
      canvasAfter.height = height;
      ctxAfter.clearRect(0, 0, width, height);
      hasResult = false;
      updateScaleNote();
      setButtonsDisabled(false);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function applyReplacement() {
  if (!baseImageData || processing) return;
  processing = true;
  setButtonsDisabled(true);

  const src = hexToRgb(srcColorInput.value || defaults.src);
  const dst = hexToRgb(dstColorInput.value || defaults.dst);
  const tolerance = Number.parseInt(toleranceInput.value, 10) || defaults.tolerance;
  const maxDistance = Math.sqrt(3 * 255 * 255);
  const threshold = (tolerance / 100) * maxDistance;

  const data = new Uint8ClampedArray(baseImageData.data);
  const total = data.length;
  let i = 0;

  const step = () => {
    const start = performance.now();
    while (i < total) {
      const dr = data[i] - src.r;
      const dg = data[i + 1] - src.g;
      const db = data[i + 2] - src.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= threshold) {
        data[i] = dst.r;
        data[i + 1] = dst.g;
        data[i + 2] = dst.b;
      }
      i += 4;
      if (performance.now() - start > MAX_FRAME_TIME) {
        break;
      }
    }

    if (i < total) {
      requestAnimationFrame(step);
      return;
    }

    const output = new ImageData(data, baseImageData.width, baseImageData.height);
    canvasAfter.width = output.width;
    canvasAfter.height = output.height;
    ctxAfter.putImageData(output, 0, 0);
    processing = false;
    hasResult = true;
    setButtonsDisabled(false);
  };

  requestAnimationFrame(step);
}

function pickColor(event) {
  if (!baseImageData) return;
  const rect = canvasBefore.getBoundingClientRect();
  const scaleX = canvasBefore.width / rect.width;
  const scaleY = canvasBefore.height / rect.height;
  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);
  if (x < 0 || y < 0 || x >= baseImageData.width || y >= baseImageData.height) return;
  const idx = (y * baseImageData.width + x) * 4;
  const data = baseImageData.data;
  const hex = `#${[data[idx], data[idx + 1], data[idx + 2]]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
  srcColorInput.value = hex;
}

function resetAll() {
  srcColorInput.value = defaults.src;
  dstColorInput.value = defaults.dst;
  toleranceInput.value = defaults.tolerance;
  toleranceVal.textContent = String(defaults.tolerance);
  imageFile.value = '';
  baseImageData = null;
  scaleRatio = 1;
  processing = false;
  hasResult = false;
  clearCanvases();
  updateScaleNote();
  setButtonsDisabled(false);
}

function downloadImage() {
  if (!canvasAfter.width || !canvasAfter.height) return;
  const link = document.createElement('a');
  link.href = canvasAfter.toDataURL('image/png');
  link.download = 'color-replaced.png';
  link.click();
}

imageFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  loadImage(file);
});

canvasBefore.addEventListener('click', pickColor);

toleranceInput.addEventListener('input', (event) => {
  toleranceVal.textContent = event.target.value;
});

applyBtn.addEventListener('click', applyReplacement);
resetBtn.addEventListener('click', resetAll);
downloadBtn.addEventListener('click', downloadImage);

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setLanguage(btn.getAttribute('data-lang'));
  });
});

const initialLang = navigator.language && navigator.language.startsWith('en') ? 'en' : 'ja';
setLanguage(initialLang);
resetAll();
