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
    ocrText: 'OCR機能は次のPRで接続します。この画面では、画像の読み込みとプレビューまで確認できます。',
    ocrButton: 'OCRを実行する（準備中）',
    manualHeading: '手動で文字を入力',
    manualLabel: '手動で文字を入力',
    manualHelp: 'OCR接続前でも、気になる旧字体を手入力して関連ツールで確認できます。',
    privacyNote: '画像と入力内容はこの画面内で扱い、OCR用の外部APIには送信しません。アクセス解析や広告タグが読み込まれる場合があります。',
    accuracyHeading: 'OCR利用時の注意',
    accuracyText: '旧字体、異体字、縦書き、かすれた文字、崩し字、古い看板や碑文はOCRで正しく読み取れない場合があります。正式な氏名、地名、住所、戸籍、登記、契約、行政手続きでは、必ず原資料や登録字体を確認してください。',
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
    ocrText: 'OCR will be connected in the next PR. This page currently verifies image loading and preview only.',
    ocrButton: 'Run OCR (coming soon)',
    manualHeading: 'Enter text manually',
    manualLabel: 'Enter text manually',
    manualHelp: 'Before OCR is connected, you can manually enter characters and check them in related tools.',
    privacyNote: 'Images and text are handled in this page and are not sent to an external OCR API. Analytics or ad tags may be loaded on the page.',
    accuracyHeading: 'OCR accuracy note',
    accuracyText: 'Old kanji, variant kanji, vertical writing, faded text, cursive forms, old signs, and inscriptions may not be read correctly by OCR. For official names, places, addresses, family registers, registrations, contracts, or administrative use, always confirm the original source and registered glyph.',
    proNote: 'The free version is intended for checking one image. Multiple-image OCR, saved history, crop tools, and report exports are planned for Old Kanji Toolkit Pro.'
  }
};

let currentObjectUrl = null;

function setLang(lang) {
  const locale = i18n[lang] ? lang : 'ja';
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

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
}

function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
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
}

function handleImageSelection(event) {
  const [file] = event.target.files || [];
  if (!file) {
    clearImage();
    return;
  }

  renderImagePreview(file);
}

function updateManualLinks() {
  const text = document.getElementById('manual-text').value.trim();
  const links = document.querySelectorAll('#manual-links a');

  links.forEach((link) => {
    const baseHref = link.dataset.baseHref;
    link.href = text ? `${baseHref}?q=${encodeURIComponent(text)}` : `${baseHref}?q=`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setLang('ja');
  updateManualLinks();

  document.getElementById('lang-ja').addEventListener('click', () => setLang('ja'));
  document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
  document.getElementById('image-input').addEventListener('change', handleImageSelection);
  document.getElementById('remove-image').addEventListener('click', clearImage);
  document.getElementById('manual-text').addEventListener('input', updateManualLinks);
  window.addEventListener('beforeunload', revokeCurrentObjectUrl);
});
