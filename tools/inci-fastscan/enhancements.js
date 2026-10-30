(function enhanceFastScan(root) {
  'use strict';

  function extendRoleTaxonomy() {
    if (typeof ROLE_LABELS === 'undefined' || typeof ROLE_DESCRIPTIONS === 'undefined') return;
    ROLE_LABELS['plant extract'] = { ja: '植物エキス', en: 'Plant extract' };
    ROLE_DESCRIPTIONS['plant extract'] = { ja: '植物から得られたエキス成分です。', en: 'A plant-derived extract ingredient.' };
  }

  function bilingualRoleEntry(value) {
    return Boolean(value && typeof value.ja === 'string' && value.ja.trim() && typeof value.en === 'string' && value.en.trim());
  }

  function hasPublicRoleExplanation(result) {
    if (!result?.found || typeof ROLE_LABELS === 'undefined' || typeof ROLE_DESCRIPTIONS === 'undefined') return false;
    const key = String(result.category || '').trim().toLowerCase();
    if (!key || key === 'general') return false;
    return bilingualRoleEntry(ROLE_LABELS[key]) && bilingualRoleEntry(ROLE_DESCRIPTIONS[key]);
  }

  function normalizePublicResults(results) {
    if (!Array.isArray(results)) return [];
    return results.map((result) => {
      if (!result?.found) return result;
      if (!hasPublicRoleExplanation(result)) {
        return {
          ...result,
          found: false,
          safety: undefined,
          note_short: undefined,
          publicSemanticIncomplete: true
        };
      }
      return {
        ...result,
        safety: undefined,
        note_short: undefined
      };
    });
  }

  function syncIncompleteResultCopy() {
    if (typeof RESULT_TEXT === 'undefined') return;
    RESULT_TEXT.unknown = { ja: '情報不足', en: 'Information incomplete' };
    RESULT_TEXT.filterUnknown = { ja: '情報不足', en: 'Information incomplete' };
    RESULT_TEXT.unknownLabel = { ja: '情報不足', en: 'Information incomplete' };
    RESULT_TEXT.unknownMany = {
      ja: '役割・説明情報が不足している成分が多いです。OCRの誤認識、区切り、表記ゆれ、または未整理の成分情報を確認してください。',
      en: 'Role or explanation information is incomplete for many items. Check OCR mistakes, separators, spelling variants, or ingredient information that is not yet fully covered.'
    };
    RESULT_TEXT.unknownReason = {
      ja: 'この表記または役割・説明情報を十分に確認できませんでした。OCRの読み違い、表記ゆれ、または未登録・未整理の成分情報である可能性があります。',
      en: 'Complete role or explanation information is not available for this spelling. It may be an OCR error, spelling variant, or ingredient information that is not yet fully covered.'
    };
  }

  function enforcePublicResultContract() {
    const baseRender = root.renderResults;
    if (typeof baseRender !== 'function' || baseRender.__nwPublicCompleteness === true) return;
    const wrappedRender = function renderPublicResults(container, results, lang) {
      return baseRender(container, normalizePublicResults(results), lang);
    };
    wrappedRender.__nwPublicCompleteness = true;
    root.renderResults = wrappedRender;
  }

  const rotationState = Object.create(null);
  const prepState = Object.create(null);
  root.fastScanImageRotation = fileId => rotationState[fileId] || 0;
  root.fastScanImageOptions = fileId => {
    const state = prepState[fileId] || { crop: { left: 0, right: 0, top: 0, bottom: 0 }, contrastPercent: 100 };
    return {
      quarterTurns: rotationState[fileId] || 0,
      crop: { ...state.crop },
      contrastPercent: state.contrastPercent
    };
  };

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

    const uiLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'ja';
    const edges = [
      { name: 'left', ja: '左端', en: 'Left edge' },
      { name: 'right', ja: '右端', en: 'Right edge' },
      { name: 'top', ja: '上端', en: 'Top edge' },
      { name: 'bottom', ja: '下端', en: 'Bottom edge' }
    ];
    const cropControls = edges.map(edge =>
      '<label class="ocr-image-control">' +
      '<span data-lang-text data-ja="' + edge.ja + '" data-en="' + edge.en + '">' +
      textFor(uiLanguage(), edge.ja, edge.en) + '</span>' +
      '<input type="range" data-ocr-crop="' + edge.name + '" min="0" max="90" step="5" value="0">' +
      '<output>0%</output></label>'
    ).join('');

    const preview = document.createElement('div');
    preview.className = 'ocr-image-preview';
    preview.hidden = true;
    preview.innerHTML =
      '<img alt="' + textFor(uiLanguage(), 'OCR対象画像のプレビュー', 'Image selected for OCR') + '" />' +
      '<div class="ocr-image-preview-meta"><span class="ocr-image-preview-label"></span>' +
      '<button type="button" class="ocr-image-clear">' +
      textFor(uiLanguage(), '画像を外す', 'Remove image') + '</button></div>' +
      '<div class="ocr-image-rotate-controls" role="group" aria-label="Image rotation">' +
      '<button type="button" data-ocr-rotate="-1" data-lang-text data-ja="左へ90°回転" data-en="Rotate 90° left">' +
      textFor(uiLanguage(), '左へ90°回転', 'Rotate 90° left') + '</button>' +
      '<button type="button" data-ocr-rotate="1" data-lang-text data-ja="右へ90°回転" data-en="Rotate 90° right">' +
      textFor(uiLanguage(), '右へ90°回転', 'Rotate 90° right') + '</button></div>' +
      '<details class="ocr-image-adjustments"><summary><span data-lang-text ' +
      'data-ja="切り抜き・コントラスト" data-en="Crop and contrast">' +
      textFor(uiLanguage(), '切り抜き・コントラスト', 'Crop and contrast') + '</span></summary>' +
      '<p data-lang-text data-ja="各辺から除く割合を調整します。変更後の画像でOCRします。" ' +
      'data-en="Trim image edges by percentage. OCR uses the processed preview.">' +
      textFor(uiLanguage(), '各辺から除く割合を調整します。変更後の画像でOCRします。',
        'Trim image edges by percentage. OCR uses the processed preview.') + '</p>' +
      '<div class="ocr-image-crop-controls">' + cropControls + '</div>' +
      '<label class="ocr-image-control"><span data-lang-text data-ja="文字コントラスト" data-en="Text contrast">' +
      textFor(uiLanguage(), '文字コントラスト', 'Text contrast') + '</span>' +
      '<input type="range" data-ocr-contrast min="100" max="180" step="10" value="100">' +
      '<output>100%</output></label>' +
      '<button type="button" class="ocr-image-adjust-reset" data-lang-text ' +
      'data-ja="補正をリセット" data-en="Reset adjustments">' +
      textFor(uiLanguage(), '補正をリセット', 'Reset adjustments') + '</button></details>';
    fileRow.insertAdjacentElement('afterend', preview);

    const reviewHint = document.createElement('div');
    reviewHint.className = 'ocr-review-hint';
    reviewHint.hidden = true;
    reviewHint.setAttribute('role', 'status');
    reviewHint.textContent = textFor(
      uiLanguage(),
      'OCR結果をラベルと見比べて修正してから、成分の役割を確認してください。',
      'Compare OCR text with the label and correct errors before explaining ingredients.'
    );
    status.insertAdjacentElement('afterend', reviewHint);

    const image = preview.querySelector('img');
    const label = preview.querySelector('.ocr-image-preview-label');
    const clear = preview.querySelector('.ocr-image-clear');
    const cropSliders = [...preview.querySelectorAll('[data-ocr-crop]')];
    const contrastSlider = preview.querySelector('[data-ocr-contrast]');
    let objectUrl = null;
    let previewVersion = 0;
    let previewTimer = null;
    prepState[config.fileId] = { crop: { left: 0, right: 0, top: 0, bottom: 0 }, contrastPercent: 100 };

    function readControls() {
      const crop = {};
      for (const slider of cropSliders) crop[slider.dataset.ocrCrop] = Number(slider.value);
      prepState[config.fileId] = { crop, contrastPercent: Number(contrastSlider.value) };
      for (const slider of [...cropSliders, contrastSlider]) {
        slider.nextElementSibling.textContent = slider.value + '%';
      }
    }

    function resetControls({ resetContrast = true } = {}) {
      for (const slider of cropSliders) slider.value = '0';
      if (resetContrast) contrastSlider.value = '100';
      readControls();
    }

    function clearPreview({ clearInput = false, resetRotation = false } = {}) {
      previewVersion += 1;
      if (previewTimer !== null) clearTimeout(previewTimer);
      previewTimer = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      preview.hidden = true;
      image.removeAttribute('src');
      label.textContent = '';
      reviewHint.hidden = true;
      if (resetRotation) {
        rotationState[config.fileId] = 0;
        resetControls();
      }
      if (clearInput) fileInput.value = '';
    }

    function markOcrTextStale() {
      if (!textarea.value.trim()) return;
      if (progress) {
        progress.value = 0;
        progress.hidden = true;
      }
      status.hidden = false;
      status.textContent = textFor(
        uiLanguage(),
        '画像を変更しました。以前のOCR文字は残っています。新しい画像でOCRを再実行してください。',
        'Image settings changed. Previous OCR text remains; run OCR again for the updated image.'
      );
      reviewHint.hidden = true;
    }

    async function updatePreview() {
      clearPreview();
      const requestId = previewVersion;
      const file = fileInput.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const options = root.fastScanImageOptions(config.fileId);

      try {
        if (typeof root.prepareFastScanOcrImage !== 'function') {
          throw new Error('Image processing is unavailable.');
        }
        const imageBlob = await root.prepareFastScanOcrImage(file, options.quarterTurns, options);
        if (requestId !== previewVersion) return;
        objectUrl = URL.createObjectURL(imageBlob);
        image.src = objectUrl;

        const kb = Math.max(1, Math.round(file.size / 1024));
        const trimmed = Object.values(options.crop).some(value => value > 0);
        const adjustments = (trimmed ? ' / Crop' : '') +
          (options.contrastPercent !== 100 ? ' / ' + options.contrastPercent + '% contrast' : '');
        label.textContent = textFor(
          uiLanguage(),
          '選択画像 · ' + kb + ' KB · 回転 ' + options.quarterTurns * 90 + '°' + adjustments,
          'Selected image · ' + kb + ' KB · rotated ' + options.quarterTurns * 90 + '°' + adjustments
        );
        preview.hidden = false;
      } catch (error) {
        if (requestId !== previewVersion) return;
        label.textContent = textFor(
          uiLanguage(),
          '画像補正に失敗しました。補正を戻すか画像を選び直してください。',
          'Image preparation failed. Reset adjustments or choose another image.'
        );
        preview.hidden = false;
      }
    }

    function schedulePreview() {
      if (previewTimer !== null) clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        previewTimer = null;
        void updatePreview();
      }, 180);
    }

    function updateReviewHint() {
      const hasText = Boolean(textarea.value.trim());
      const progressComplete = progress && !progress.hidden && Number(progress.value || 0) >= 100;
      const statusText = status.textContent.trim();
      const likelyCompleted = progressComplete || /完了|complete|done|recognized|認識/i.test(statusText);
      reviewHint.hidden = !(hasText && likelyCompleted);
    }

    fileInput.addEventListener('change', () => {
      rotationState[config.fileId] = 0;
      resetControls();
      markOcrTextStale();
      void updatePreview();
    });
    preview.querySelectorAll('[data-ocr-rotate]').forEach(button => {
      button.addEventListener('click', () => {
        if (!fileInput.files?.[0]) return;
        const step = Number(button.dataset.ocrRotate);
        rotationState[config.fileId] = ((rotationState[config.fileId] || 0) + step + 4) % 4;
        // Crop is defined in rotated-image coordinates; changing orientation resets its edges.
        resetControls({ resetContrast: false });
        markOcrTextStale();
        void updatePreview();
      });
    });
    cropSliders.forEach(slider => {
      slider.addEventListener('input', () => {
        const opposite = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[slider.dataset.ocrCrop];
        const other = cropSliders.find(item => item.dataset.ocrCrop === opposite);
        slider.value = String(Math.min(Number(slider.value), 90 - Number(other.value)));
        readControls();
        markOcrTextStale();
        schedulePreview();
      });
    });
    contrastSlider.addEventListener('input', () => {
      readControls();
      markOcrTextStale();
      schedulePreview();
    });
    preview.querySelector('.ocr-image-adjust-reset').addEventListener('click', () => {
      resetControls();
      markOcrTextStale();
      void updatePreview();
    });
    clear.addEventListener('click', () => clearPreview({ clearInput: true, resetRotation: true }));
    reset?.addEventListener('click', () => clearPreview({ clearInput: true, resetRotation: true }));
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
    syncIncompleteResultCopy();
    enforcePublicResultContract();
    syncRoleFirstCopy();
    for (const workflow of workflows) setupWorkflow(workflow);
    document.addEventListener('click', (event) => {
      if (event.target?.matches('.nw-lang-switch button[data-lang]')) queueMicrotask(syncRoleFirstCopy);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);