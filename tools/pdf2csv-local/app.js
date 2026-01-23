const STORAGE_KEY = 'nw-pdf2csv-lang';
const languageButtons = document.querySelectorAll('[data-lang]');
const i18nTargets = document.querySelectorAll('[data-i18n]');
const i18nHtmlTargets = document.querySelectorAll('[data-i18n-html]');
const i18nAttrTargets = document.querySelectorAll('[data-i18n-attr]');

const I18N = {
  ja: {
    common: {
      langJa: 'JP',
      langEn: 'EN',
      backToTool: '← ツール本体へ戻る',
      footerDisclaimer:
        '当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。',
      footerTagline: '© NicheWorks — Small Web Tools for Boring Tasks',
      relatedTools: '関連ツール:',
    },
    index: {
      pageTitle: 'PDF2CSV Local｜PDF明細・請求書をCSV/Excel変換 | NicheWorks',
      description:
        'PDFの明細書・請求書をブラウザ内でCSV/Excelに変換するローカル完結ツール。アップロード内容は外部送信しません。',
      heroTitle: 'PDF2CSV Local（ローカル完結PDF→CSV変換）',
      heroSubtitle: '銀行明細・請求書PDFをCSV/Excel向けに整形するローカル変換ツールです。',
      noteLocal: '※ローカル完結で動作します。PDFは外部に送信されません。',
      noteUsage:
        '使い方は <a href="./usage.html">使い方ページ</a> をご覧ください。',
      pdfInputTitle: 'PDF入力（準備中）',
      pdfDropLabel: 'PDFをドラッグ＆ドロップ',
      pdfDropHint: 'アップロードUI・解析UIは後続タスクで実装予定',
      outputFormatLabel: '出力形式',
      outputCsv: 'CSV',
      outputExcel: 'Excel',
      outputPreviewTitle: '出力プレビュー（準備中）',
      outputPreviewHint: 'テーブル表示は後続タスクで実装予定',
      donateText: 'このツールが役に立ったら、開発継続のご支援をお願いします。',
    },
    usage: {
      pageTitle: '使い方｜PDF2CSV Local | NicheWorks',
      description: 'PDF2CSV Localの基本的な使い方ガイド。PDFを読み込んでCSV/Excelに変換する流れを簡潔にまとめます。',
      heroTitle: '使い方',
      heroSubtitle: 'PDF2CSV Localの操作手順を簡潔にまとめます。',
      sectionTitle: '準備中',
      sectionBody: 'このページは後続タスクで具体的な手順を追加します。',
    },
    howto: {
      pageTitle: '変換のコツ｜PDF2CSV Local | NicheWorks',
      description: 'PDF2CSV Localで精度良く変換するためのコツをまとめる予定です。現在は枠のみ用意しています。',
      heroTitle: '変換のコツ',
      heroSubtitle: '変換精度を高めるためのポイントを整理します。',
      sectionTitle: '準備中',
      sectionBody: '詳細な手順や注意点は後続タスクで追加します。',
    },
    faq: {
      pageTitle: 'FAQ｜PDF2CSV Local | NicheWorks',
      description: 'PDF2CSV Localに関するよくある質問をまとめる予定です。現在は枠のみ用意しています。',
      heroTitle: 'FAQ',
      heroSubtitle: 'よくある質問と回答をまとめます。',
      sectionTitle: '準備中',
      sectionBody: 'FAQ項目は後続タスクで追加します。',
    },
  },
  en: {
    common: {
      langJa: 'JP',
      langEn: 'EN',
      backToTool: '← Back to tool',
      footerDisclaimer:
        'This site may include ads. We do not guarantee the accuracy of listed information. Please verify with official sources.',
      footerTagline: '© NicheWorks — Small Web Tools for Boring Tasks',
      relatedTools: 'Related tools:',
    },
    index: {
      pageTitle: 'PDF2CSV Local | Convert PDF statements & invoices to CSV/Excel | NicheWorks',
      description:
        'Convert PDF statements and invoices to CSV/Excel locally in your browser. Files never leave your device.',
      heroTitle: 'PDF2CSV Local (Local PDF → CSV)',
      heroSubtitle: 'Local conversion tool for bank statements and invoice PDFs to CSV/Excel.',
      noteLocal: 'Runs locally in your browser. PDFs are not uploaded.',
      noteUsage: 'See the <a href="./usage.html">Usage page</a> for step-by-step guidance.',
      pdfInputTitle: 'PDF input (coming soon)',
      pdfDropLabel: 'Drag & drop PDF',
      pdfDropHint: 'Upload and parsing UI will be implemented in a later task.',
      outputFormatLabel: 'Output format',
      outputCsv: 'CSV',
      outputExcel: 'Excel',
      outputPreviewTitle: 'Output preview (coming soon)',
      outputPreviewHint: 'Table view will be implemented in a later task.',
      donateText: 'If this tool helps, please consider supporting development.',
    },
    usage: {
      pageTitle: 'Usage | PDF2CSV Local | NicheWorks',
      description: 'Quick guide to PDF2CSV Local. Learn how to load PDFs and export CSV/Excel output.',
      heroTitle: 'Usage',
      heroSubtitle: 'Quick guide to using PDF2CSV Local.',
      sectionTitle: 'Coming soon',
      sectionBody: 'Detailed steps will be added in a later task.',
    },
    howto: {
      pageTitle: 'Tips | PDF2CSV Local | NicheWorks',
      description: 'Tips for higher accuracy in PDF2CSV Local. This page is a placeholder for now.',
      heroTitle: 'How-to tips',
      heroSubtitle: 'Tips to improve conversion accuracy will be added here.',
      sectionTitle: 'Coming soon',
      sectionBody: 'Detailed tips will be added in a later task.',
    },
    faq: {
      pageTitle: 'FAQ | PDF2CSV Local | NicheWorks',
      description: 'FAQ for PDF2CSV Local. This page is currently a placeholder.',
      heroTitle: 'FAQ',
      heroSubtitle: 'Frequently asked questions will be listed here.',
      sectionTitle: 'Coming soon',
      sectionBody: 'FAQ entries will be added in a later task.',
    },
  },
};

const resolveKey = (lang, key) => {
  return key.split('.').reduce((acc, part) => (acc && acc[part] ? acc[part] : null), I18N[lang]);
};

const setLanguage = (lang) => {
  const normalizedLang = lang === 'ja' ? 'ja' : 'en';
  localStorage.setItem(STORAGE_KEY, normalizedLang);
  document.documentElement.lang = normalizedLang;

  i18nTargets.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = resolveKey(normalizedLang, key);
    if (value) {
      el.textContent = value;
    }
  });

  i18nHtmlTargets.forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const value = resolveKey(normalizedLang, key);
    if (value) {
      el.innerHTML = value;
    }
  });

  i18nAttrTargets.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const attrName = el.getAttribute('data-i18n-attr');
    const value = resolveKey(normalizedLang, key);
    if (value && attrName) {
      el.setAttribute(attrName, value);
    }
  });

  languageButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === normalizedLang);
  });
};

const getInitialLang = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ja' || stored === 'en') {
    return stored;
  }
  return navigator.language && navigator.language.startsWith('ja') ? 'ja' : 'en';
};

languageButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

setLanguage(getInitialLang());

// PDF -> CSV conversion logic will be implemented in subsequent tasks.
