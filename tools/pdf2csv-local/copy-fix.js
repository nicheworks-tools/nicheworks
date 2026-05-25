(() => {
  const COPY = {
    ja: {
      title: 'PDF2CSV Local',
      subtitle: 'PDF内のテキスト表をCSV/Excel向けに抽出するブラウザ内処理ツールです。',
      local: '※PDF内容は外部送信されません。ただし、PDF解析ライブラリの読み込みに外部CDNを使用する場合があります。',
      dropHint: '対応: 文字を選択できるPDF / 30MBまで。画像スキャンPDF・写真PDF・OCRが必要なPDFは非対応です。',
      modeNotice: 'Autoで列が崩れる場合は、Manualで表エリアだけを選択して再抽出してください。',
      manualHint: 'プレビュー上で表の範囲だけをドラッグ選択し、Re-extractで再抽出してください。',
      weakWarning: '抽出結果が少ないため、画像スキャンPDFの可能性があります。このツールはOCRに対応していません。文字を選択できるPDFか確認し、Manualモードも試してください。',
      noResultWhat: '抽出できる文字が見つかりませんでした。',
      noResultHow: '画像スキャンPDF・写真PDF・OCRが必要なPDFの可能性があります。文字を選択できるPDFか確認してください。',
      rangePlaceholder: '例: 1-3,5,7-9',
      libraryLoadWhat: 'PDF解析ライブラリを読み込めませんでした。',
      libraryLoadHow: 'ネットワーク制限やCDNブロックの可能性があります。ページを再読み込みするか、通信制限のない環境で再度お試しください。PDF内容は外部送信されません。'
    },
    en: {
      title: 'PDF2CSV Local',
      subtitle: 'Extract text-based PDF tables for CSV/Excel export in your browser.',
      local: 'PDF contents are not uploaded. The PDF parsing library may be loaded from an external CDN.',
      dropHint: 'Supported: selectable-text PDFs / up to 30MB. Scanned image PDFs, photo PDFs, and OCR-required PDFs are not supported.',
      modeNotice: 'If Auto breaks columns, switch to Manual and select only the table area before re-extracting.',
      manualHint: 'Drag only around the table area in the preview, then re-extract.',
      weakWarning: 'Extraction looks sparse. This may be a scanned image PDF. OCR is not supported. Check whether the PDF has selectable text and try Manual mode.',
      noResultWhat: 'No extractable text was found.',
      noResultHow: 'This may be a scanned image PDF, photo PDF, or a PDF that requires OCR. Use a PDF with selectable text.',
      rangePlaceholder: 'e.g. 1-3,5,7-9',
      libraryLoadWhat: 'The PDF parsing library could not be loaded.',
      libraryLoadHow: 'A network restriction or CDN block may be preventing the tool from loading. Reload the page or try again on an unrestricted connection. PDF contents are not uploaded.'
    }
  };

  const getLang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.textContent = value;
  };

  const setAttr = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };

  const showError = (whatText, howText) => {
    const box = document.getElementById('errorBox');
    const what = document.getElementById('errorWhat');
    const how = document.getElementById('errorHow');
    if (!box || !what || !how) return;
    what.textContent = whatText;
    how.textContent = howText;
    box.hidden = false;
  };

  const syncCustomBlocks = () => {
    const lang = getLang();
    document.querySelectorAll('[data-p2c-lang], [data-p2c-output-help]').forEach((el) => {
      const target = el.getAttribute('data-p2c-lang') || el.getAttribute('data-p2c-output-help');
      el.hidden = target !== lang;
    });

    const t = COPY[lang];
    setText('[data-i18n-key="index.title"]', t.title);
    setText('[data-i18n-key="index.subtitle"]', t.subtitle);
    setText('[data-i18n-key="index.note.local"]', t.local);
    setText('[data-i18n-key="index.drop.hint"]', t.dropHint);
    setText('#modeNotice', t.modeNotice);
    setText('[data-i18n-key="index.manual.hint"]', t.manualHint);
    setText('#weakWarning p', t.weakWarning);
    setAttr('#pageRange', 'placeholder', t.rangePlaceholder);

    const what = document.getElementById('errorWhat');
    const how = document.getElementById('errorHow');
    const noResultTexts = [
      '抽出結果がありません。',
      'No extraction results found.'
    ];
    if (what && how && noResultTexts.includes(what.textContent.trim())) {
      what.textContent = t.noResultWhat;
      how.textContent = t.noResultHow;
    }
  };

  const installLanguageHooks = () => {
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => setTimeout(syncCustomBlocks, 0));
    });
  };

  const observeErrors = () => {
    const box = document.getElementById('errorBox');
    if (!box) return;
    const observer = new MutationObserver(() => syncCustomBlocks());
    observer.observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  };

  const checkLibraryLoad = () => {
    if (!document.getElementById('dropZone')) return;
    const t = COPY[getLang()];
    const pdfJsLoaded = Boolean(window.pdfjsLib);
    if (!pdfJsLoaded) {
      showError(t.libraryLoadWhat, t.libraryLoadHow);
      const extractButton = document.getElementById('extractButton');
      const downloadCsvButton = document.getElementById('downloadCsv');
      const downloadXlsxButton = document.getElementById('downloadXlsx');
      if (extractButton) extractButton.disabled = true;
      if (downloadCsvButton) downloadCsvButton.disabled = true;
      if (downloadXlsxButton) downloadXlsxButton.disabled = true;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    syncCustomBlocks();
    installLanguageHooks();
    observeErrors();
  });

  window.addEventListener('load', () => {
    syncCustomBlocks();
    checkLibraryLoad();
  });
})();
