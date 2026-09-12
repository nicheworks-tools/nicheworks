(function enhanceFastScan(root) {
  'use strict';

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
      'OCR結果が入力欄に入りました。商品ラベルと見比べて誤認識を修正してから「日本語成分名を照合」を押してください。',
      'OCR text is now editable above. Compare it with the label, correct any misreads, then run ingredient matching.'
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
    for (const workflow of workflows) setupWorkflow(workflow);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
