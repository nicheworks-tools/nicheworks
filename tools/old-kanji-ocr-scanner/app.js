const i18n = {
  ja: {
    title: '旧字体OCRスキャナー',
    lead: '画像やスマホ撮影画像から旧字体・異体字を確認するためのOCR入口です。',
    inputHeading: '画像を選択',
    inputHelp: '看板、碑文、古い資料、古地図、紙面の写真などを1枚読み込めます。',
    previewHeading: '画像プレビュー',
    fileNameLabel: 'ファイル名',
    fileSizeLabel: 'サイズ',
    fileTypeLabel: '種類',
    removeImage: '画像を削除',
    ocrHeading: 'OCR結果',
    ocrButton: 'OCRを実行する',
    ocrIdleText: '画像を選択するとOCRを実行できます。',
    ocrBusyText: 'OCR処理中です…',
    ocrCompleteText: 'OCRが完了しました。結果は必要に応じて手動で修正できます。',
    ocrFailedText: 'OCRに失敗しました。画像を変えるか、手動入力欄に文字を入力してください。',
    ocrNoImageText: '先に画像を選択してください。',
    ocrEmptyText: 'OCR結果が空でした。必要に応じて手動入力してください。',
    ocrUnsupportedText: 'この画像形式はサポートされていません。別の画像を選択してください。',
    ocrEngineLoading: 'OCRエンジンを読み込み中です。',
    ocrAnalyzing: '画像を解析中です。',
    ocrRecognizing: 'テキストを認識中です。',
    ocrLangNote: '初期版では日本語OCRを想定しています。旧字体や異体字は誤認識される場合があります。',
    resultHeading: 'OCR結果テキスト',
    resultLabel: 'OCR結果テキスト',
    resultHelp: 'OCR結果は必要に応じて手動修正してください。OCR前は手動入力欄としても使えます。',
    copyButton: 'OCR結果をコピー',
    copied: 'コピーしました',
    privacyNote: '画像と入力内容はこの画面内で扱い、外部OCR APIには送信しません。OCRエンジンのスクリプトや解析用データ、アクセス解析、広告タグが読み込まれる場合があります。',
    accuracyHeading: 'OCR利用時の注意',
    accuracyText: '旧字体、異体字、縦書き、かすれた文字、崩し字、古い看板や碑文はOCRで正しく読み取れない場合があります。OCR結果は必ず目視で確認し、必要に応じて手動修正してください。',
    proNote: '無料版では1枚の画像確認を想定しています。複数画像OCR、履歴保存、トリミング、レポート出力は Old Kanji Toolkit Pro の対象予定です。'
  },
  en: {
    title: 'Old Kanji OCR Scanner',
    lead: 'An OCR entry point for checking old or variant kanji from images or smartphone photos.',
    inputHeading: 'Choose image',
    inputHelp: 'Load one image, such as a sign, inscription, old document, old map, or printed page photo.',
    previewHeading: 'Image preview',
    fileNameLabel: 'File name',
    fileSizeLabel: 'Size',
    fileTypeLabel: 'Type',
    removeImage: 'Remove image',
    ocrHeading: 'OCR result',
    ocrButton: 'Run OCR',
    ocrIdleText: 'Choose an image to run OCR.',
    ocrBusyText: 'Running OCR…',
    ocrCompleteText: 'OCR is complete. You can manually correct the result if needed.',
    ocrFailedText: 'OCR failed. Try another image or enter text manually.',
    ocrNoImageText: 'Please choose an image first.',
    ocrEmptyText: 'OCR returned empty text. Please enter text manually if needed.',
    ocrUnsupportedText: 'This image type is not supported. Please choose another image.',
    ocrEngineLoading: 'Loading OCR engine.',
    ocrAnalyzing: 'Analyzing image.',
    ocrRecognizing: 'Recognizing text.',
    ocrLangNote: 'The initial version assumes Japanese OCR. Old or variant kanji may be misread.',
    resultHeading: 'OCR result text',
    resultLabel: 'OCR result text',
    resultHelp: 'Manually correct the OCR result if needed. Before OCR, this area can be used for manual input.',
    copyButton: 'Copy OCR result',
    copied: 'Copied',
    privacyNote: 'Images and text are handled in this page and are not sent to an external OCR API. OCR engine scripts or data files, analytics, and ad tags may be loaded.',
    accuracyHeading: 'OCR accuracy note',
    accuracyText: 'Old kanji, variant kanji, vertical writing, faded text, cursive forms, old signs, and inscriptions may not be read correctly by OCR. Always visually confirm the OCR result and correct it manually if needed.',
    proNote: 'The free version is intended for checking one image. Multiple-image OCR, saved history, crop tools, and report exports are planned for Old Kanji Toolkit Pro.'
  }
};

let currentObjectUrl = null;
let currentLang = 'ja';
let ocrBusy = false;
let copyToastTimer = null;

function setLang(lang) {
  const locale = i18n[lang] ? lang : 'ja';
  currentLang = locale;
  document.documentElement.lang = locale;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (i18n[locale][key]) {
      element.textContent = i18n[locale][key];
    }
  });

  document.getElementById('lang-ja').classList.toggle('active', locale === 'ja');
  document.getElementById('lang-en').classList.toggle('active', locale === 'en');
}

function handleImageSelection(event) {
  const [file] = event.target.files || [];
  if (!file) {
    clearImage();
    return;
  }

  if (!file.type || !file.type.startsWith('image/')) {
    setOcrStatus('ocrUnsupportedText');
    clearImage();
    return;
  }

  renderImagePreview(file);
  setOcrStatus('ocrIdleText');
  setOcrProgress(null);
  document.getElementById('run-ocr').disabled = false;
}

function renderImagePreview(file) {
  const previewPanel = document.getElementById('preview-panel');
  const previewImage = document.getElementById('preview-image');

  revokeCurrentObjectUrl();
  currentObjectUrl = URL.createObjectURL(file);

  previewImage.src = currentObjectUrl;
  previewImage.alt = file.name;

  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-size').textContent = formatFileSize(file.size);
  document.getElementById('file-type').textContent = file.type || '-';

  previewPanel.hidden = false;
}

function clearImage() {
  revokeCurrentObjectUrl();

  const input = document.getElementById('image-input');
  const previewPanel = document.getElementById('preview-panel');
  const previewImage = document.getElementById('preview-image');

  input.value = '';
  previewImage.removeAttribute('src');
  previewImage.alt = '';
  document.getElementById('file-name').textContent = '';
  document.getElementById('file-size').textContent = '';
  document.getElementById('file-type').textContent = '';
  previewPanel.hidden = true;

  setOcrBusy(false);
  setOcrProgress(null);
  setOcrStatus('ocrIdleText');
  document.getElementById('run-ocr').disabled = true;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  return `${(kb / 1024).toFixed(2)} MB`;
}

function updateManualLinks() {
  const text = document.getElementById('manual-text').value.trim();
  const links = document.querySelectorAll('#manual-links a');

  links.forEach((link) => {
    const baseHref = link.dataset.baseHref;
    link.href = `${baseHref}?q=${text ? encodeURIComponent(text) : ''}`;
  });
}

function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

async function runOcr() {
  if (ocrBusy) return;

  const input = document.getElementById('image-input');
  const [file] = input.files || [];

  if (!file) {
    setOcrStatus('ocrNoImageText');
    return;
  }

  if (!file.type || !file.type.startsWith('image/')) {
    setOcrStatus('ocrUnsupportedText');
    return;
  }

  if (typeof Tesseract === 'undefined') {
    setOcrStatus('ocrFailedText');
    return;
  }

  setOcrBusy(true);
  setOcrStatus('ocrBusyText');
  setOcrProgress(0);

  try {
    const result = await Tesseract.recognize(file, 'jpn', {
      logger: (event) => {
        if (!event || typeof event !== 'object') return;

        if (event.status && event.status.includes('loading')) {
          setOcrStatus('ocrEngineLoading');
        } else if (event.status && event.status.includes('initializing')) {
          setOcrStatus('ocrAnalyzing');
        } else if (event.status && event.status.includes('recognizing')) {
          setOcrStatus('ocrRecognizing');
        }

        if (typeof event.progress === 'number') {
          setOcrProgress(event.progress);
        }
      }
    });

    const text = (result && result.data && typeof result.data.text === 'string')
      ? result.data.text.trim()
      : '';

    updateResultText(text);

    if (text) {
      setOcrStatus('ocrCompleteText');
    } else {
      setOcrStatus('ocrEmptyText');
    }
  } catch (error) {
    setOcrStatus('ocrFailedText');
  } finally {
    setOcrBusy(false);
  }
}

function setOcrStatus(messageKeyOrText) {
  const status = document.getElementById('ocr-status');
  status.textContent = i18n[currentLang][messageKeyOrText] || messageKeyOrText || '';
}

function setOcrProgress(value) {
  const progress = document.getElementById('ocr-progress');
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.max(0, Math.min(1, value));
    progress.textContent = `${Math.round(clamped * 100)}%`;
  } else {
    progress.textContent = '';
  }
}

function setOcrBusy(isBusy) {
  ocrBusy = Boolean(isBusy);
  document.getElementById('image-input').disabled = ocrBusy;
  document.getElementById('run-ocr').disabled = ocrBusy || !document.getElementById('image-input').files[0];
  document.getElementById('remove-image').disabled = ocrBusy;
}

async function copyOcrText() {
  const text = document.getElementById('manual-text').value;
  if (!text) return;

  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch (error) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', 'readonly');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    copied = document.execCommand('copy');
    document.body.removeChild(helper);
  }

  if (copied) {
    const toast = document.getElementById('copy-toast');
    toast.textContent = i18n[currentLang].copied;
    if (copyToastTimer) window.clearTimeout(copyToastTimer);
    copyToastTimer = window.setTimeout(() => {
      toast.textContent = '';
    }, 1500);
  }
}

function updateResultText(text) {
  const textarea = document.getElementById('manual-text');
  textarea.value = text || '';
  updateManualLinks();
}

document.addEventListener('DOMContentLoaded', () => {
  setLang('ja');
  updateManualLinks();
  setOcrStatus('ocrIdleText');

  document.getElementById('lang-ja').addEventListener('click', () => setLang('ja'));
  document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
  document.getElementById('image-input').addEventListener('change', handleImageSelection);
  document.getElementById('remove-image').addEventListener('click', clearImage);
  document.getElementById('manual-text').addEventListener('input', updateManualLinks);
  document.getElementById('run-ocr').addEventListener('click', runOcr);
  document.getElementById('copy-ocr').addEventListener('click', copyOcrText);
  window.addEventListener('beforeunload', revokeCurrentObjectUrl);
});
