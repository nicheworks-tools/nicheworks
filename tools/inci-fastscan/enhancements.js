(function enhanceFastScan(root) {
  'use strict';

  function extendRoleTaxonomy() {
    if (typeof ROLE_LABELS === 'undefined' || typeof ROLE_DESCRIPTIONS === 'undefined') return;
    ROLE_LABELS['plant extract'] = { ja: '植物エキス', en: 'Plant extract' };
    ROLE_DESCRIPTIONS['plant extract'] = { ja: '植物から得られたエキス成分です。', en: 'A plant-derived extract ingredient.' };
  }

  const workflows = [
    {
      fileId: 'ocr-file-fast',
      textareaId: 'fast-input',
      statusId: 'fast-ocr-status',
      progressId: 'fast-ocr-progress',
      resetId: 'btn-fast-reset',
      lang: 'en'
    },
    {
      fileId: 'ocr-file',
      textareaId: 'jb-input',
      statusId: 'jb-ocr-status',
      progressId: 'jb-ocr-progress',
      resetId: 'btn-jb-reset',
      lang: 'ja'
    }
  ];

  function textFor(lang, ja, en) {
    return lang === 'ja' ? ja : en;
  }

  function setBilingualText(el, ja, en) {
    if (!el) return;
    el.dataset.ja = ja;
    el.dataset.en = en;
    el.setAttribute('data-lang-text', '');
    el.textContent = document.documentElement.lang === 'en' ? en : ja;
  }

  function syncRoleFirstCopy() {
    const dictStatus = document.getElementById('dict-status');
    if (dictStatus) dictStatus.hidden = true;

    setBilingualText(
      document.querySelector('.tool-hero-lead'),
      '商品ラベルの写真をOCRで読み取り、文字を確認したあと、それぞれの成分の主な役割と説明を確認できます。写真がなくてもテキスト貼り付けで利用できます。',
      'Scan a product label with OCR, review the recognized text, then see the main role and explanation for each ingredient. You can also paste text directly.'
    );
    setBilingualText(
      document.querySelector('.tool-hero-sub'),
      'OCR結果は必ず目視確認してください。成分の役割を理解するための参考ツールで、濃度や製品全体の安全性を判定するものではありません。',
      'Always review OCR text visually. This is a reference tool for understanding ingredient roles; it does not determine concentration or overall product safety.'
    );

    const purposeItems = [...document.querySelectorAll('.purpose-item')];
    if (purposeItems[1]) {
      setBilingualText(purposeItems[1].querySelector('strong'), 'OCR後', 'After OCR');
      setBilingualText(purposeItems[1].querySelector('span'), '認識文字を確認・修正', 'Review and edit recognized text');
    }
    if (purposeItems[2]) {
      setBilingualText(purposeItems[2].querySelector('strong'), '結果', 'Results');
      setBilingualText(purposeItems[2].querySelector('span'), '各成分の役割と説明を確認', 'See ingredient roles and explanations');
    }

    const fastIntro = document.querySelector('#tab-fast-panel .workspace-intro');
    setBilingualText(fastIntro?.querySelector('h2'), 'INCI / 英語成分の役割を確認', 'Understand INCI / English ingredients');
    setBilingualText(fastIntro?.querySelector('p:not(.eyebrow)'), '写真モードではOCR結果を目視で修正してから、各成分の役割と説明を確認します。', 'In photo mode, review and edit the OCR text before checking each ingredient’s role and explanation.');

    const jpIntro = document.querySelector('#tab-jb-panel .workspace-intro');
    setBilingualText(jpIntro?.querySelector('h2'), '日本語の全成分表示から役割を確認', 'Understand a Japanese ingredient label');
    setBilingualText(jpIntro?.querySelector('p:not(.eyebrow)'), '日本語の成分名や別名を認識し、それぞれの主な役割と説明を表示します。機械翻訳ではありません。', 'Recognize Japanese ingredient names and aliases, then show their main roles and explanations. This is not machine translation.');

    setBilingualText(document.getElementById('btn-fast-check'), '成分の役割を確認', 'Explain ingredients');
    setBilingualText(document.getElementById('btn-jb-check'), '成分の役割を確認', 'Explain ingredients');

    const fastShortcut = document.querySelector('#tab-fast-panel .shortcut-note');
    const jpShortcut = document.querySelector('#tab-jb-panel .shortcut-note');
    setBilingualText(fastShortcut, '⌘ / Ctrl + Enter でも確認できます。', 'You can also use Cmd / Ctrl + Enter.');
    setBilingualText(jpShortcut, '⌘ / Ctrl + Enter でも確認できます。', 'You can also use Cmd / Ctrl + Enter.');

    const guide = document.querySelector('.guide');
    setBilingualText(document.getElementById('guide-title'), '結果で分かること', 'What the results tell you');
    setBilingualText(
      guide?.querySelector('p:not(.notice)'),
      '各成分について、主な役割と簡単な説明を表示します。情報を確認できない表記には、OCRや表記ゆれを見直すための候補を表示することがあります。候補は自動で置き換えません。',
      'For each ingredient, the tool shows its main role and a short explanation. When information is unavailable, it may show spelling or OCR candidates for review; suggestions are never applied automatically.'
    );

    const ocrFlow = guide?.querySelector('.guide-card');
    const steps = ocrFlow ? [...ocrFlow.querySelectorAll('li')] : [];
    if (steps[2]) setBilingualText(steps[2], '認識文字を目視修正してから、成分の役割を確認。', 'Review the recognized text, then check ingredient roles.');
  }

  function setupWorkflow(config) {
    const fileInput = document.getElementById(config.fileId);
    const textarea = document.getElementById(config.textareaId);
    const status = document.getElementById(config.statusId);
    const progress = document.getElementById(config.progressId);
    const reset = document.getElementById(config.resetId);
    if (!fileInput || !textarea || !status) return;

    const fileRow = fileInput.closest('.file-row') || fileInput.parentElement;
    const ocrBox = fileInput.closest('.ocr-box') || fileRow?.parentElement;
    if (!fileRow || !ocrBox) return;

    const preview = document.createElement('div');
    preview.className = 'ocr-image-preview';
    preview.hidden = true;
    preview.innerHTML = `
      <img alt="${textFor(config.lang, 'OCR対象画像のプレビュー', 'Preview of image selected for OCR')}" />
      <div class="ocr-image-preview-meta">
        <span class="ocr-image-preview-label"></span>
        <button type="button" class="ocr-image-clear">${textFor(config.lang, '画像を外す', 'Remove image')}</button>
      </div>`;
    fileRow.insertAdjacentElement('afterend', preview);

    const reviewHint = document.createElement('div');
    reviewHint.className = 'ocr-review-hint';
    reviewHint.hidden = true;
    reviewHint.setAttribute('role', 'status');
    reviewHint.textContent = textFor(
      config.lang,
      'OCR結果が入力欄に入りました。商品ラベルと見比べて誤認識を修正してから「成分の役割を確認」を押してください。',
      'OCR text is now editable above. Compare it with the label, correct any misreads, then explain the ingredients.'
    );
    status.insertAdjacentElement('afterend', reviewHint);

    const image = preview.querySelector('img');
    const label = preview.querySelector('.ocr-image-preview-label');
    const clear = preview.querySelector('.ocr-image-clear');
    let objectUrl = null;

    function clearPreview({ clearInput = false } = {}) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      preview.hidden = true;
      image.removeAttribute('src');
      label.textContent = '';
      reviewHint.hidden = true;
      if (clearInput) fileInput.value = '';
    }

    function updatePreview() {
      clearPreview();
      const file = fileInput.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      objectUrl = URL.createObjectURL(file);
      image.src = objectUrl;
      const kb = Math.max(1, Math.round(file.size / 1024));
      label.textContent = textFor(config.lang, `選択画像 · ${kb} KB`, `Selected image · ${kb} KB`);
      preview.hidden = false;
    }

    function updateReviewHint() {
      const hasText = Boolean(textarea.value.trim());
      const progressComplete = progress ? Number(progress.value || 0) >= 100 : false;
      const statusText = status.textContent.trim();
      const likelyCompleted = progressComplete || /完了|complete|done|recognized|認識/i.test(statusText);
      reviewHint.hidden = !(hasText && likelyCompleted);
    }

    fileInput.addEventListener('change', updatePreview);
    clear.addEventListener('click', () => clearPreview({ clearInput: true }));
    reset?.addEventListener('click', () => clearPreview({ clearInput: true }));
    textarea.addEventListener('input', updateReviewHint);

    const statusObserver = new MutationObserver(updateReviewHint);
    statusObserver.observe(status, { childList: true, characterData: true, subtree: true, attributes: true });
    if (progress) {
      const progressObserver = new MutationObserver(updateReviewHint);
      progressObserver.observe(progress, { attributes: true, attributeFilter: ['value', 'hidden'] });
    }
  }

  function init() {
    extendRoleTaxonomy();
    syncRoleFirstCopy();
    for (const workflow of workflows) setupWorkflow(workflow);
    document.addEventListener('click', (event) => {
      if (event.target?.matches('.nw-lang-switch button[data-lang]')) queueMicrotask(syncRoleFirstCopy);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);