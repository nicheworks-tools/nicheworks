const LANGUAGE_STORAGE_KEY = 'pdf2csv-local-lang';

const I18N = {
  ja: {
    'index.title': 'PDF2CSV Local（ローカル完結PDF→CSV変換）',
    'index.subtitle': '銀行明細・請求書PDFをCSV/Excel向けに整形するローカル変換ツールです。',
    'index.note.local': '※ローカル完結で動作します。PDFは外部に送信されません。',
    'index.note.usage': '使い方は <a href="./usage.html">使い方ページ</a> をご覧ください。',
    'index.section.input': 'PDF入力',
    'index.section.settings': '抽出設定',
    'index.section.preview': 'ページプレビュー',
    'index.label.drag': 'PDFをドラッグ＆ドロップ',
    'index.label.status': 'ステータス',
    'index.label.range': 'ページ範囲',
    'index.label.output': '出力形式',
    'index.mode.label': 'モード',
    'index.mode.auto': 'Auto',
    'index.mode.manual': 'Manual',
    'index.mode.notice': 'Manualは次タスクで実装予定です。',
    'index.settings.rowTolerance': '行の近接判定 (px)',
    'index.settings.colGap': '列のギャップ判定 (px)',
    'index.settings.header': '先頭行をヘッダー扱い',
    'index.settings.extract': '抽出開始',
    'index.settings.extractNote': '⏳ 解析は数秒かかる場合があります。',
    'index.settings.weakWarning': '抽出結果が少ないため、Manualモードの使用を検討してください。',
    'index.settings.resultSummary': '抽出結果: -',
    'index.drop.title': 'ここにPDFをドロップ',
    'index.drop.sub': 'またはクリックして選択',
    'index.drop.hint': '対応: PDF / 30MBまで',
    'index.drop.aria': 'PDFをドロップまたはクリックして選択',
    'index.status.filename': 'ファイル名',
    'index.status.pages': 'ページ数',
    'index.status.size': 'サイズ',
    'index.range.placeholder': '例: 1-3,5,7-9',
    'index.range.hint': '空欄なら全ページ',
    'index.output.csv': 'CSV',
    'index.output.excel': 'Excel',
    'index.action.analyze': '解析開始',
    'index.action.note': '⏳ この処理は最大3秒ほどかかる場合があります。',
    'index.preview.placeholder': 'PDFを読み込むとプレビューが表示されます。',
    'index.note.donate': 'このツールが役に立ったら、開発継続のご支援をお願いします。',
    'index.related.label': '関連ツール:',
    'common.adSlot': '広告枠（準備中）',
    'common.footer.disclaimer': '当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。',
    'usage.title': '使い方',
    'usage.subtitle': 'PDF2CSV Localの操作手順を簡潔にまとめます。',
    'usage.section.title': '準備中',
    'usage.section.body': 'このページは後続タスクで具体的な手順を追加します。',
    'usage.back': '← ツール本体へ戻る',
    'howto.title': '変換のコツ',
    'howto.subtitle': '変換精度を高めるためのポイントを整理します。',
    'howto.section.title': '準備中',
    'howto.section.body': '詳細な手順や注意点は後続タスクで追加します。',
    'howto.back': '← ツール本体へ戻る',
    'faq.title': 'FAQ',
    'faq.subtitle': 'よくある質問と回答をまとめます。',
    'faq.section.title': '準備中',
    'faq.section.body': 'FAQ項目は後続タスクで追加します。',
    'faq.back': '← ツール本体へ戻る',
    'meta.index.title': 'PDF2CSV Local｜PDF明細・請求書をCSV/Excel変換 | NicheWorks',
    'meta.index.desc': 'PDFの明細書・請求書をブラウザ内でCSV/Excelに変換するローカル完結ツール。アップロード内容は外部送信しません。',
    'meta.usage.title': '使い方｜PDF2CSV Local | NicheWorks',
    'meta.usage.desc': 'PDF2CSV Localの基本的な使い方ガイド。PDFを読み込んでCSV/Excelに変換する流れを簡潔にまとめます。',
    'meta.howto.title': '変換のコツ｜PDF2CSV Local | NicheWorks',
    'meta.howto.desc': 'PDF2CSV Localで精度良く変換するためのコツをまとめる予定です。現在は枠のみ用意しています。',
    'meta.faq.title': 'FAQ｜PDF2CSV Local | NicheWorks',
    'meta.faq.desc': 'PDF2CSV Localに関するよくある質問をまとめる予定です。現在は枠のみ用意しています。',
    'error.notPdf.what': 'PDFファイルではありません。',
    'error.notPdf.how': '拡張子が .pdf のファイルを選択してください。',
    'error.tooLarge.what': 'ファイルサイズが上限を超えています。',
    'error.tooLarge.how': '30MB以下のPDFで再度お試しください。',
    'error.loadFailed.what': 'PDFの読み込みに失敗しました。',
    'error.loadFailed.how': 'ファイルが破損していないか確認してください。',
    'error.encrypted.what': '暗号化されたPDFは読み込めません。',
    'error.encrypted.how': 'パスワードのかかっていないPDFを用意してください。',
    'error.rangeInvalid.what': 'ページ範囲の入力が正しくありません。',
    'error.rangeInvalid.how': '例: 1-3,5,7-9 のように入力してください。',
    'error.rangeOut.what': 'ページ範囲がPDFのページ数を超えています。',
    'error.rangeOut.how': '1〜最終ページの範囲で指定してください。',
    'error.needPdf.what': 'PDFを読み込んでください。',
    'error.needPdf.how': 'PDFを選択してからページ範囲を指定してください。'
  },
  en: {
    'index.title': 'PDF2CSV Local',
    'index.subtitle': 'Convert bank statements or invoices from PDF to CSV/Excel locally in your browser.',
    'index.note.local': 'Runs locally in your browser. PDFs are not uploaded.',
    'index.note.usage': 'See <a href="./usage.html">Usage</a> for step-by-step guidance.',
    'index.section.input': 'PDF input',
    'index.section.preview': 'Page preview',
    'index.label.drag': 'Drag & drop PDF',
    'index.label.status': 'Status',
    'index.label.range': 'Page range',
    'index.label.output': 'Output format',
    'index.mode.label': 'Mode',
    'index.mode.auto': 'Auto',
    'index.mode.manual': 'Manual',
    'index.mode.notice': 'Manual mode will be implemented in the next task.',
    'index.settings.rowTolerance': 'Row proximity (px)',
    'index.settings.colGap': 'Column gap (px)',
    'index.settings.header': 'Treat first row as header',
    'index.settings.extract': 'Extract',
    'index.settings.extractNote': '⏳ Extraction may take a few seconds.',
    'index.settings.weakWarning': 'Extraction looks sparse. Consider using Manual mode.',
    'index.settings.resultSummary': 'Extraction result: -',
    'index.drop.title': 'Drop PDF here',
    'index.drop.sub': 'or click to select',
    'index.drop.hint': 'Supported: PDF / up to 30MB',
    'index.drop.aria': 'Drop a PDF or click to choose a file',
    'index.status.filename': 'File name',
    'index.status.pages': 'Pages',
    'index.status.size': 'Size',
    'index.range.placeholder': 'e.g. 1-3,5,7-9',
    'index.range.hint': 'Leave blank for all pages',
    'index.output.csv': 'CSV',
    'index.output.excel': 'Excel',
    'index.action.analyze': 'Start analysis',
    'index.action.note': '⏳ This may take up to 3 seconds.',
    'index.preview.placeholder': 'Load a PDF to see the preview here.',
    'index.note.donate': 'If this tool helps, please consider supporting development.',
    'index.related.label': 'Related tools:',
    'common.adSlot': 'Ad slot (coming soon)',
    'common.footer.disclaimer': 'This site may include ads. We do not guarantee the accuracy of posted information. Please confirm official sources.',
    'usage.title': 'Usage',
    'usage.subtitle': 'Quick guide to using PDF2CSV Local.',
    'usage.section.title': 'Coming soon',
    'usage.section.body': 'Detailed steps will be added in a later task.',
    'usage.back': '← Back to the tool',
    'howto.title': 'How-to tips',
    'howto.subtitle': 'Tips to improve conversion accuracy will be added here.',
    'howto.section.title': 'Coming soon',
    'howto.section.body': 'Detailed tips will be added in a later task.',
    'howto.back': '← Back to the tool',
    'faq.title': 'FAQ',
    'faq.subtitle': 'Frequently asked questions will be listed here.',
    'faq.section.title': 'Coming soon',
    'faq.section.body': 'FAQ entries will be added in a later task.',
    'faq.back': '← Back to the tool',
    'meta.index.title': 'PDF2CSV Local｜PDF Statements & Invoices to CSV/Excel | NicheWorks',
    'meta.index.desc': 'Convert PDF statements or invoices to CSV/Excel locally in your browser. Files are never uploaded.',
    'meta.usage.title': 'Usage｜PDF2CSV Local | NicheWorks',
    'meta.usage.desc': 'Basic usage guide for PDF2CSV Local. Learn the simple flow for converting PDFs to CSV/Excel.',
    'meta.howto.title': 'Tips｜PDF2CSV Local | NicheWorks',
    'meta.howto.desc': 'Tips to improve PDF2CSV Local conversion accuracy will be added. Placeholder only for now.',
    'meta.faq.title': 'FAQ｜PDF2CSV Local | NicheWorks',
    'meta.faq.desc': 'Frequently asked questions for PDF2CSV Local will be added. Placeholder content for now.',
    'error.notPdf.what': 'This is not a PDF file.',
    'error.notPdf.how': 'Choose a file with the .pdf extension.',
    'error.tooLarge.what': 'File size exceeds the limit.',
    'error.tooLarge.how': 'Please use a PDF smaller than 30MB.',
    'error.loadFailed.what': 'Failed to load the PDF.',
    'error.loadFailed.how': 'Check that the file is not corrupted.',
    'error.encrypted.what': 'Encrypted PDFs are not supported.',
    'error.encrypted.how': 'Please provide a PDF without a password.',
    'error.rangeInvalid.what': 'The page range is invalid.',
    'error.rangeInvalid.how': 'Use a format like 1-3,5,7-9.',
    'error.rangeOut.what': 'The page range exceeds the PDF length.',
    'error.rangeOut.how': 'Select pages within the document range.',
    'error.needPdf.what': 'Please load a PDF first.',
    'error.needPdf.how': 'Select a PDF before entering a page range.'
  }
};

const languageButtons = document.querySelectorAll('[data-lang]');

const applyTranslations = (lang) => {
  const translations = I18N[lang];
  if (!translations) {
    return;
  }

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n-key]').forEach((el) => {
    const key = el.dataset.i18nKey;
    const value = translations[key];
    if (value === undefined) {
      return;
    }

    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, value);
      return;
    }

    if (el.dataset.i18nHtml === 'true') {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  languageButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  updateResultSummary(extractionState.rows, extractionState.meta.columnCount || 0);
};

const normalizeLanguage = (lang) => (lang && lang.toLowerCase().startsWith('ja') ? 'ja' : 'en');

const getInitialLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'ja' || stored === 'en') {
    return stored;
  }
  return normalizeLanguage(navigator.language || 'ja');
};

const setLanguage = (lang) => {
  const normalized = lang === 'ja' ? 'ja' : 'en';
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  applyTranslations(normalized);
};

languageButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

const MAX_FILE_SIZE = 30 * 1024 * 1024;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const statusName = document.getElementById('statusName');
const statusPages = document.getElementById('statusPages');
const statusSize = document.getElementById('statusSize');
const pageRangeInput = document.getElementById('pageRange');
const errorBox = document.getElementById('errorBox');
const errorWhat = document.getElementById('errorWhat');
const errorHow = document.getElementById('errorHow');
const previewCanvas = document.getElementById('pdfPreview');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const extractButton = document.getElementById('extractButton');
const previewArea = previewCanvas?.closest('.preview-area');
const rowToleranceInput = document.getElementById('rowTolerance');
const colGapThresholdInput = document.getElementById('colGapThreshold');
const headerToggle = document.getElementById('headerToggle');
const modeNotice = document.getElementById('modeNotice');
const weakWarning = document.getElementById('weakWarning');
const resultSummary = document.getElementById('resultSummary');
const modeInputs = document.querySelectorAll('input[name="extractMode"]');

let pdfDoc = null;
let currentFile = null;
let renderedPage = null;

const extractionState = {
  settings: {
    mode: 'auto',
    rowTolerance: 4,
    colGapThreshold: 14,
    header: true
  },
  rows: [],
  meta: {},
  warnings: []
};

window.pdf2csvState = extractionState;

const initialMode = Array.from(modeInputs).find((input) => input.checked)?.value;
extractionState.settings.mode = initialMode === 'manual' ? 'manual' : 'auto';

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.worker.min.js';
}

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const translate = (key) => {
  const lang = document.documentElement.lang || 'ja';
  return I18N[lang]?.[key] ?? key;
};

const normalizeText = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

const showError = (whatKey, howKey) => {
  errorWhat.textContent = translate(whatKey);
  errorHow.textContent = translate(howKey);
  errorBox.hidden = false;
};

const clearError = () => {
  errorBox.hidden = true;
  errorWhat.textContent = '';
  errorHow.textContent = '';
};

const resetStatus = () => {
  statusName.textContent = '-';
  statusPages.textContent = '-';
  statusSize.textContent = '-';
};

const resetPreview = () => {
  const context = previewCanvas.getContext('2d');
  context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCanvas.width = 0;
  previewCanvas.height = 0;
  previewArea?.classList.remove('has-preview');
  previewPlaceholder.hidden = false;
};

const updateExtractButton = () => {
  const rangeResult = validateRange(pageRangeInput.value.trim());
  const isAuto = extractionState.settings.mode === 'auto';
  const valid = Boolean(pdfDoc) && rangeResult.valid && isAuto;
  if (extractButton) {
    extractButton.disabled = !valid;
  }
};

const validateRange = (value) => {
  if (!value) {
    if (!pdfDoc) {
      return { valid: false, error: { what: 'error.needPdf.what', how: 'error.needPdf.how' } };
    }
    return { valid: true, pages: Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1) };
  }

  if (!pdfDoc) {
    return { valid: false, error: { what: 'error.needPdf.what', how: 'error.needPdf.how' } };
  }

  const normalized = value.replace(/\s+/g, '');
  if (!/^[0-9,-]+$/.test(normalized)) {
    return { valid: false, error: { what: 'error.rangeInvalid.what', how: 'error.rangeInvalid.how' } };
  }

  const segments = normalized.split(',').filter(Boolean);
  const pages = [];

  for (const segment of segments) {
    if (segment.includes('-')) {
      const [startRaw, endRaw] = segment.split('-');
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (!start || !end || start > end) {
        return { valid: false, error: { what: 'error.rangeInvalid.what', how: 'error.rangeInvalid.how' } };
      }
      if (end > pdfDoc.numPages) {
        return { valid: false, error: { what: 'error.rangeOut.what', how: 'error.rangeOut.how' } };
      }
      for (let page = start; page <= end; page += 1) {
        pages.push(page);
      }
    } else {
      const page = Number.parseInt(segment, 10);
      if (!page) {
        return { valid: false, error: { what: 'error.rangeInvalid.what', how: 'error.rangeInvalid.how' } };
      }
      if (page > pdfDoc.numPages) {
        return { valid: false, error: { what: 'error.rangeOut.what', how: 'error.rangeOut.how' } };
      }
      pages.push(page);
    }
  }

  if (!pages.length) {
    return { valid: false, error: { what: 'error.rangeInvalid.what', how: 'error.rangeInvalid.how' } };
  }

  const uniquePages = Array.from(new Set(pages));
  uniquePages.sort((a, b) => a - b);

  return { valid: true, pages: uniquePages };
};

const updateModeUI = () => {
  const isAuto = extractionState.settings.mode === 'auto';
  if (modeNotice) {
    modeNotice.hidden = isAuto;
  }
  updateExtractButton();
};

const syncSettingsFromUI = () => {
  if (rowToleranceInput) {
    const value = Number.parseInt(rowToleranceInput.value, 10);
    extractionState.settings.rowTolerance = Number.isFinite(value) ? Math.max(0, value) : 4;
  }
  if (colGapThresholdInput) {
    const value = Number.parseInt(colGapThresholdInput.value, 10);
    extractionState.settings.colGapThreshold = Number.isFinite(value) ? Math.max(0, value) : 14;
  }
  if (headerToggle) {
    extractionState.settings.header = headerToggle.checked;
  }
};

const setWeakWarning = (visible) => {
  if (weakWarning) {
    weakWarning.hidden = !visible;
  }
};

function updateResultSummary(rows, maxColumns) {
  if (!resultSummary) {
    return;
  }
  const rowCount = rows.length;
  const columnCount = maxColumns ?? 0;
  const lang = document.documentElement.lang || 'ja';
  if (lang === 'ja') {
    resultSummary.textContent = `抽出結果: ${rowCount}行 / ${columnCount}列`;
  } else {
    resultSummary.textContent = `Extraction result: ${rowCount} rows / ${columnCount} cols`;
  }
}

const groupItemsByRow = (items, rowTolerance) => {
  const textItems = items
    .map((item) => {
      const transform = item.transform || [];
      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      const text = normalizeText(item.str);
      const width = item.width ?? 0;
      return { x, y, text, width };
    })
    .filter((item) => item.text.length > 0);

  if (!textItems.length) {
    return [];
  }

  textItems.sort((a, b) => {
    if (b.y !== a.y) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const rows = [];

  for (const item of textItems) {
    let targetRow = null;
    for (const row of rows) {
      if (Math.abs(item.y - row.y) <= rowTolerance) {
        targetRow = row;
        break;
      }
    }
    if (!targetRow) {
      rows.push({ y: item.y, items: [item], count: 1 });
    } else {
      targetRow.items.push(item);
      targetRow.y = (targetRow.y * targetRow.count + item.y) / (targetRow.count + 1);
      targetRow.count += 1;
    }
  }

  rows.sort((a, b) => b.y - a.y);
  return rows;
};

const buildCellsFromRow = (rowItems, colGapThreshold) => {
  const sorted = [...rowItems].sort((a, b) => a.x - b.x);
  const cells = [];
  let parts = [];
  let prevEnd = null;

  sorted.forEach((item) => {
    const text = normalizeText(item.text);
    if (!text) {
      return;
    }
    if (prevEnd !== null && item.x - prevEnd > colGapThreshold) {
      const joined = normalizeText(parts.join(' '));
      if (joined) {
        cells.push(joined);
      }
      parts = [];
    }
    parts.push(text);
    const end = item.x + (item.width || 0);
    prevEnd = prevEnd === null ? end : Math.max(prevEnd, end);
  });

  if (parts.length) {
    const joined = normalizeText(parts.join(' '));
    if (joined) {
      cells.push(joined);
    }
  }

  return cells;
};

const extractRowsFromItems = (items, rowTolerance, colGapThreshold) => {
  const groupedRows = groupItemsByRow(items, rowTolerance);
  return groupedRows
    .map((row) => buildCellsFromRow(row.items, colGapThreshold))
    .filter((row) => row.length > 0);
};

const extractRowsFromPages = async (pages, settings) => {
  const allRows = [];
  for (const pageNumber of pages) {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const rows = extractRowsFromItems(textContent.items || [], settings.rowTolerance, settings.colGapThreshold);
    allRows.push(...rows);
  }
  return allRows;
};

const runExtraction = async () => {
  syncSettingsFromUI();
  updateExtractButton();
  if (extractionState.settings.mode !== 'auto') {
    return;
  }

  const rangeResult = validateRange(pageRangeInput.value.trim());
  if (!rangeResult.valid) {
    showError(rangeResult.error.what, rangeResult.error.how);
    return;
  }

  if (!pdfDoc) {
    showError('error.needPdf.what', 'error.needPdf.how');
    return;
  }

  clearError();
  setWeakWarning(false);

  try {
    const rows = await extractRowsFromPages(rangeResult.pages, extractionState.settings);
    extractionState.rows = rows;
    extractionState.meta = {
      pages: rangeResult.pages,
      rowCount: rows.length,
      header: extractionState.settings.header,
      mode: extractionState.settings.mode
    };
    const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);
    extractionState.meta.columnCount = maxColumns;

    const weak = rows.length < 2 || maxColumns < 2;
    extractionState.warnings = weak ? ['weak-extraction'] : [];
    setWeakWarning(weak);
    updateResultSummary(rows, maxColumns);
  } catch (error) {
    showError('error.loadFailed.what', 'error.loadFailed.how');
  }
};

const renderPreview = async (pageNumber) => {
  if (!pdfDoc) {
    return;
  }

  renderedPage = pageNumber;
  const page = await pdfDoc.getPage(pageNumber);
  const initialViewport = page.getViewport({ scale: 1 });
  const maxWidth = 620;
  const scale = Math.min(1.6, maxWidth / initialViewport.width);
  const viewport = page.getViewport({ scale });
  const context = previewCanvas.getContext('2d');

  previewCanvas.width = viewport.width;
  previewCanvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  previewArea?.classList.add('has-preview');
  previewPlaceholder.hidden = true;
};

const updateRangeAndPreview = async () => {
  const rangeValue = pageRangeInput.value.trim();
  if (!pdfDoc) {
    clearError();
    resetPreview();
    updateExtractButton();
    return;
  }

  const result = validateRange(rangeValue);
  if (!result.valid) {
    showError(result.error.what, result.error.how);
    updateExtractButton();
    return;
  }

  clearError();
  updateExtractButton();

  const firstPage = result.pages[0];
  if (firstPage && firstPage !== renderedPage) {
    try {
      await renderPreview(firstPage);
    } catch (error) {
      showError('error.loadFailed.what', 'error.loadFailed.how');
    }
  }
};

const updateStatus = (file, pages) => {
  statusName.textContent = file?.name ?? '-';
  statusPages.textContent = pages ? `${pages}` : '-';
  statusSize.textContent = file ? formatBytes(file.size) : '-';
};

const handleFileError = (whatKey, howKey) => {
  pdfDoc = null;
  currentFile = null;
  renderedPage = null;
  resetStatus();
  resetPreview();
  extractionState.rows = [];
  extractionState.meta = {};
  extractionState.warnings = [];
  setWeakWarning(false);
  updateResultSummary([], 0);
  showError(whatKey, howKey);
  updateExtractButton();
};

const loadPdf = async (file) => {
  if (!file) {
    return;
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    handleFileError('error.notPdf.what', 'error.notPdf.how');
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    handleFileError('error.tooLarge.what', 'error.tooLarge.how');
    return;
  }

  clearError();
  resetPreview();
  updateStatus(file, null);
  extractionState.rows = [];
  extractionState.meta = {};
  extractionState.warnings = [];
  setWeakWarning(false);
  updateResultSummary([], 0);

  if (!window.pdfjsLib) {
    handleFileError('error.loadFailed.what', 'error.loadFailed.how');
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
    const doc = await loadingTask.promise;
    pdfDoc = doc;
    currentFile = file;
    updateStatus(file, doc.numPages);
    await updateRangeAndPreview();
  } catch (error) {
    const message = error?.message ?? '';
    if (error?.name === 'PasswordException' || /password/i.test(message)) {
      handleFileError('error.encrypted.what', 'error.encrypted.how');
    } else {
      handleFileError('error.loadFailed.what', 'error.loadFailed.how');
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    fileInput.files = event.dataTransfer.files;
    loadPdf(file);
  }
};

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', handleDrop);

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
    loadPdf(file);
  }
});

modeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    extractionState.settings.mode = input.value === 'manual' ? 'manual' : 'auto';
    updateModeUI();
  });
});

rowToleranceInput?.addEventListener('input', () => {
  syncSettingsFromUI();
});

colGapThresholdInput?.addEventListener('input', () => {
  syncSettingsFromUI();
});

headerToggle?.addEventListener('change', () => {
  syncSettingsFromUI();
});

pageRangeInput.addEventListener('input', () => {
  updateRangeAndPreview();
});

extractButton.addEventListener('click', () => {
  runExtraction();
});

applyTranslations(getInitialLanguage());
syncSettingsFromUI();
updateModeUI();
updateResultSummary([], 0);
