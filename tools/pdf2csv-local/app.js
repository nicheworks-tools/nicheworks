const LANGUAGE_STORAGE_KEY = 'pdf2csv-local-lang';

const I18N = {
  ja: {
    'index.title': 'PDF2CSV Local（ローカル完結PDF→CSV変換）',
    'index.subtitle': '銀行明細・請求書PDFをCSV/Excel向けに整形するローカル変換ツールです。',
    'index.note.local': '※ローカル完結で動作します。PDFは外部に送信されません。',
    'index.note.usage': '使い方は <a href="./usage.html">使い方ページ</a> をご覧ください。',
    'index.section.input': 'PDF入力（準備中）',
    'index.section.preview': '出力プレビュー（準備中）',
    'index.label.drag': 'PDFをドラッグ＆ドロップ',
    'index.label.output': '出力形式',
    'index.placeholder.upload': 'アップロードUI・解析UIは後続タスクで実装予定',
    'index.placeholder.preview': 'テーブル表示は後続タスクで実装予定',
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
    'meta.faq.desc': 'PDF2CSV Localに関するよくある質問をまとめる予定です。現在は枠のみ用意しています。'
  },
  en: {
    'index.title': 'PDF2CSV Local',
    'index.subtitle': 'Convert bank statements or invoices from PDF to CSV/Excel locally in your browser.',
    'index.note.local': 'Runs locally in your browser. PDFs are not uploaded.',
    'index.note.usage': 'See <a href="./usage.html">Usage</a> for step-by-step guidance.',
    'index.section.input': 'PDF input (coming soon)',
    'index.section.preview': 'Output preview (coming soon)',
    'index.label.drag': 'Drag & drop PDF',
    'index.label.output': 'Output format',
    'index.placeholder.upload': 'Upload/analysis UI will be implemented in a later task.',
    'index.placeholder.preview': 'Table preview will be implemented in a later task.',
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
    'meta.faq.desc': 'Frequently asked questions for PDF2CSV Local will be added. Placeholder content for now.'
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

applyTranslations(getInitialLanguage());

// PDF -> CSV conversion logic will be implemented in subsequent tasks.
