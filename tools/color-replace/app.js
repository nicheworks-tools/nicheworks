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
const resultSummary = document.getElementById('resultSummary');
const toastEl = document.getElementById('toast');
const langButtons = document.querySelectorAll('.lang-button');

const sourceCanvas = document.createElement('canvas');
const sourceCtx = sourceCanvas.getContext('2d');

const MAX_MEGAPIXELS = 4;
const MAX_FRAME_TIME = 12;

let baseImageData = null;
let processing = false;
let scaleRatio = 1;
let hasResult = false;
let toastTimer = null;
let summaryState = { mode: 'empty', data: null };

const defaults = {
  src: '#ff0000',
  dst: '#00ff00',
  tolerance: 20,
};

const i18n = {
  ja: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description: '画像内の指定色をクリックで取得し、許容範囲を調整して別の色に置換できるブラウザツールです。',
    adTop: '広告枠（上）',
    adBottom: '広告枠（下）',
    langJa: '日本語',
    langEn: 'English',
    quickIntro: 'PNG/JPEG/WebP画像を読み込み、画像上で選んだ色を別の色に置換してPNGで保存できます。',
    step1: '画像を選ぶ',
    step2: '変えたい色を画像上でクリック',
    step3: '置換後の色と許容範囲を調整',
    step4: '置換を適用',
    step5: 'PNGで保存',
    privacyNote: '画像の読み込み・色置換処理はブラウザ内で行います。画像ファイルはアップロードしません。ただしページ表示のため広告・解析タグは読み込まれます。',
    outputNote: '入力：PNG / JPEG / WebP。出力：PNGのみ。Canvas経由のため、EXIFなどのメタデータは保持されない場合があります。',
    uploadLabel: '画像をアップロード',
    localNote: '画像処理はブラウザ内で行います。画像ファイルはアップロードしません。',
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
    saveHint: '置換を適用すると保存できます。',
    alphaNote: 'RGB値を置換し、透明度は基本的に維持します。ただし背景色や画像ビューアによって見え方が変わる場合があります。',
    support: '応援リンク',
    ofuse: 'OFUSEで応援',
    kofi: 'Ko-fiで支援',
    internalLinks: '関連ツール',
    linkCompression: 'Image Compression Inspector',
    linkExif: 'EXIF Cleaner Mini',
    linkConverter: 'WebP/AVIF Converter',
    linkRedact: 'Image Redact',
    linkStitcher: 'Screenshot Stitcher',
    disclaimer: '画像の読み込み・色置換処理はブラウザ内で行います。画像ファイルはアップロードしません。ただしページ表示のため広告・解析タグは読み込まれます。',
    privacy: 'プライバシー',
    contact: 'お問い合わせ',
    faqTitle: 'よくある質問',
    faqUploadQ: '画像はアップロードされますか？',
    faqUploadA: 'いいえ。画像の読み込みと色置換処理はブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれます。',
    faqOriginalQ: '元画像は変更されますか？',
    faqOriginalA: 'いいえ。元画像ファイルは変更せず、置換後のPNGを新しく保存します。',
    faqLargeQ: '大きい画像はそのまま保存されますか？',
    faqLargeA: 'いいえ。大きい画像は処理負荷を下げるため最大4MP程度に縮小され、保存画像も縮小後サイズになります。',
    faqFormatQ: 'JPEGやWebPで保存できますか？',
    faqFormatA: '初期版ではPNG保存のみです。',
    faqAlphaQ: '透明部分は維持されますか？',
    faqAlphaA: '透明度は基本的に維持しますが、見え方は背景や画像ビューアによって変わる場合があります。',
    scaleNote: '画像が大きいため {width}×{height} に縮小して処理します。保存されるPNGもこのサイズです。元解像度を維持したい用途には向きません。',
    summary: '変更：{changed} px / {rate}%（全{total} px）｜対象色：{src} → {dst}｜許容範囲：{tolerance}',
    noMatch: '対象色が見つかりませんでした。許容範囲を上げるか、画像上で色を再取得してください。',
    stale: '設定を変更しました。保存するにはもう一度「置換を適用」してください。',
    fileReadError: 'ファイルを読み込めませんでした。PNG/JPEG/WebPを選んでください。',
    imageLoadError: '画像を読み込めませんでした。PNG/JPEG/WebPを選んでください。',
    canvasError: '画像を処理できませんでした。画像サイズや形式を確認してください。',
    exportError: 'PNGを書き出せませんでした。別の画像で試してください。',
    applyFirst: '先に画像を読み込み、置換を適用してください。',
    done: '置換を適用しました。',
  },
  en: {
    toolLabel: 'Color Utility',
    title: 'Color Replace Lite',
    description: 'Pick a color from an image, replace it with tolerance, and export the result as PNG in your browser.',
    adTop: 'Ad space (top)',
    adBottom: 'Ad space (bottom)',
    langJa: '日本語',
    langEn: 'English',
    quickIntro: 'Load a PNG, JPEG, or WebP image, pick a color on the image, replace it, and save the result as PNG.',
    step1: 'Choose an image',
    step2: 'Click the color you want to replace',
    step3: 'Adjust the new color and tolerance',
    step4: 'Apply replacement',
    step5: 'Save as PNG',
    privacyNote: 'Image loading and color replacement run in your browser. The image file is not uploaded. Ads and analytics tags may load for the page itself.',
    outputNote: 'Input: PNG / JPEG / WebP. Output: PNG only. EXIF and other metadata may not be preserved because the result is exported through Canvas.',
    uploadLabel: 'Upload image',
    localNote: 'Image processing runs in your browser. The image file is not uploaded.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    pickTip: 'Click to pick a color',
    srcColorLabel: 'Source color',
    dstColorLabel: 'Replacement color',
    toleranceLabel: 'Tolerance',
    apply: 'Apply replacement',
    applying: 'Processing...',
    reset: 'Reset',
    download: 'Save PNG',
    saveHint: 'Apply replacement before saving.',
    alphaNote: 'RGB values are replaced while transparency is generally preserved. Appearance can still vary by background color or image viewer.',
    support: 'Support',
    ofuse: 'Support on OFUSE',
    kofi: 'Support on Ko-fi',
    internalLinks: 'Related tools',
    linkCompression: 'Image Compression Inspector',
    linkExif: 'EXIF Cleaner Mini',
    linkConverter: 'WebP/AVIF Converter',
    linkRedact: 'Image Redact',
    linkStitcher: 'Screenshot Stitcher',
    disclaimer: 'Image loading and color replacement run in your browser. The image file is not uploaded. Ads and analytics tags may load for the page itself.',
    privacy: 'Privacy',
    contact: 'Contact',
    faqTitle: 'FAQ',
    faqUploadQ: 'Is my image uploaded?',
    faqUploadA: 'No. Image loading and color replacement run in your browser. Ads and analytics tags may load for the page itself.',
    faqOriginalQ: 'Is the original image changed?',
    faqOriginalA: 'No. The original file is not modified. A new PNG file is saved after replacement.',
    faqLargeQ: 'Are large images saved at the original size?',
    faqLargeA: 'No. Large images are downscaled to about 4MP to reduce processing load, and the saved PNG uses that downscaled size.',
    faqFormatQ: 'Can I save as JPEG or WebP?',
    faqFormatA: 'The initial version saves PNG only.',
    faqAlphaQ: 'Is transparency preserved?',
    faqAlphaA: 'Transparency is generally preserved, but the appearance can vary by background color or image viewer.',
    scaleNote: 'This image is large, so it is processed at {width}×{height}. The saved PNG uses the same size. This is not suitable when you need to keep the original resolution.',
    summary: 'Changed: {changed} px / {rate}% ({total} px total) | Color: {src} → {dst} | Tolerance: {tolerance}',
    noMatch: 'No matching color was found. Increase the tolerance or pick the color again from the image.',
    stale: 'Settings changed. Apply replacement again before saving.',
    fileReadError: 'Could not read the file. Please choose a PNG, JPEG, or WebP image.',
    imageLoadError: 'Could not load the image. Please choose a PNG, JPEG, or WebP image.',
    canvasError: 'Could not process the image. Check the image size or format.',
    exportError: 'Could not export the PNG. Try another image.',
    applyFirst: 'Load an image and apply replacement first.',
    done: 'Replacement applied.',
  },
};

let currentLang = 'ja';

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || i18n.ja[key] || key;
}

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
  renderResultSummary();
  setButtonsDisabled(processing);
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

function formatNumber(value) {
  return Number(value).toLocaleString(currentLang === 'ja' ? 'ja-JP' : 'en-US');
}

function formatRate(value) {
  if (value > 0 && value < 0.01) return '<0.01';
  return value.toFixed(value >= 10 ? 1 : 2);
}

function showToast(message) {
  if (!toastEl) {
    return;
  }
  toastEl.textContent = message;
  toastEl.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3200);
}

function renderResultSummary() {
  if (!resultSummary) return;
  if (summaryState.mode === 'empty') {
    resultSummary.textContent = '';
    resultSummary.classList.remove('warning');
    return;
  }

  resultSummary.classList.toggle('warning', summaryState.mode !== 'result');

  if (summaryState.mode === 'stale') {
    resultSummary.textContent = t('stale');
    return;
  }

  if (summaryState.mode === 'noMatch') {
    resultSummary.textContent = t('noMatch');
    return;
  }

  const data = summaryState.data;
  resultSummary.textContent = t('summary')
    .replace('{changed}', formatNumber(data.changedPixels))
    .replace('{total}', formatNumber(data.totalPixels))
    .replace('{rate}', formatRate(data.rate))
    .replace('{src}', data.srcHex)
    .replace('{dst}', data.dstHex)
    .replace('{tolerance}', String(data.tolerance));
}

function setSummary(mode, data = null) {
  summaryState = { mode, data };
  renderResultSummary();
}

function setButtonsDisabled(isDisabled) {
  applyBtn.disabled = isDisabled || !baseImageData;
  resetBtn.disabled = isDisabled;
  downloadBtn.disabled = isDisabled || !hasResult;
  applyBtn.textContent = isDisabled ? t('applying') : t('apply');
}

function updateScaleNote() {
  if (!scaleNote) return;
  if (scaleRatio < 1 && baseImageData) {
    scaleNote.textContent = t('scaleNote')
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

function clearAfterCanvas() {
  ctxAfter.clearRect(0, 0, canvasAfter.width, canvasAfter.height);
}

function markResultStale() {
  if (!baseImageData || !hasResult) return;
  hasResult = false;
  clearAfterCanvas();
  setSummary('stale');
  setButtonsDisabled(false);
}

function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast(t('imageLoadError'));
    return;
  }

  const reader = new FileReader();
  processing = true;
  hasResult = false;
  setSummary('empty');
  setButtonsDisabled(true);

  reader.onerror = () => {
    processing = false;
    baseImageData = null;
    setButtonsDisabled(false);
    showToast(t('fileReadError'));
  };

  reader.onload = (event) => {
    const img = new Image();

    img.onerror = () => {
      processing = false;
      baseImageData = null;
      clearCanvases();
      updateScaleNote();
      setButtonsDisabled(false);
      showToast(t('imageLoadError'));
    };

    img.onload = () => {
      try {
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
        processing = false;
        hasResult = false;
        setSummary('empty');
        updateScaleNote();
        setButtonsDisabled(false);
      } catch (error) {
        processing = false;
        baseImageData = null;
        clearCanvases();
        updateScaleNote();
        setButtonsDisabled(false);
        showToast(t('canvasError'));
      }
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

function applyReplacement() {
  if (!baseImageData || processing) {
    showToast(t('applyFirst'));
    return;
  }

  processing = true;
  hasResult = false;
  setButtonsDisabled(true);

  const srcHex = srcColorInput.value || defaults.src;
  const dstHex = dstColorInput.value || defaults.dst;
  const src = hexToRgb(srcHex);
  const dst = hexToRgb(dstHex);
  const tolerance = Number.parseInt(toleranceInput.value, 10) || defaults.tolerance;
  const maxDistance = Math.sqrt(3 * 255 * 255);
  const threshold = (tolerance / 100) * maxDistance;

  const data = new Uint8ClampedArray(baseImageData.data);
  const total = data.length;
  const totalPixels = baseImageData.width * baseImageData.height;
  let changedPixels = 0;
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
        changedPixels += 1;
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

    try {
      const output = new ImageData(data, baseImageData.width, baseImageData.height);
      canvasAfter.width = output.width;
      canvasAfter.height = output.height;
      ctxAfter.putImageData(output, 0, 0);
      processing = false;
      hasResult = changedPixels > 0;
      const rate = totalPixels > 0 ? (changedPixels / totalPixels) * 100 : 0;
      if (changedPixels > 0) {
        setSummary('result', { changedPixels, totalPixels, rate, srcHex, dstHex, tolerance });
        showToast(t('done'));
      } else {
        setSummary('noMatch');
        showToast(t('noMatch'));
      }
      setButtonsDisabled(false);
    } catch (error) {
      processing = false;
      hasResult = false;
      setButtonsDisabled(false);
      showToast(t('canvasError'));
    }
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
  markResultStale();
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
  setSummary('empty');
  clearCanvases();
  updateScaleNote();
  setButtonsDisabled(false);
}

function downloadImage() {
  if (!hasResult || !canvasAfter.width || !canvasAfter.height) {
    showToast(t('applyFirst'));
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = canvasAfter.toDataURL('image/png');
    link.download = 'color-replaced.png';
    link.click();
  } catch (error) {
    showToast(t('exportError'));
  }
}

imageFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  loadImage(file);
});

canvasBefore.addEventListener('click', pickColor);

toleranceInput.addEventListener('input', (event) => {
  toleranceVal.textContent = event.target.value;
  markResultStale();
});

srcColorInput.addEventListener('input', markResultStale);
dstColorInput.addEventListener('input', markResultStale);

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
