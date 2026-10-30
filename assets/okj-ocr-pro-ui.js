(function () {
  'use strict';
  var PRODUCT = 'okj.toolkit_pro';
  var t = {
    ja: {
      heading: 'Old Kanji Toolkit Pro — OCR作業',
      local: '処理と履歴保存はこのブラウザ内のみです。別の端末とは同期されません。',
      batch: '複数画像を一括OCR（最大10枚）',
      run: '順番にOCRを実行',
      history: '現在のOCR結果を履歴に保存',
      saved: '保存済みのOCR履歴',
      batchSave: '一括OCR結果を履歴に保存',
      restore: 'この結果を通常のOCR編集欄で開く',
      empty: '履歴はまだありません。',
      noText: '保存するテキストがありません。',
      savedOk: 'ブラウザに保存しました。',
      unavailable: '利用権利を確認できません。再度確認してください。',
      running: 'OCR処理中',
      done: '一括OCRが完了しました。内容を目視で確認してください。',
      error: 'OCRに失敗しました。',
      too_many_files: '画像は10枚までです。',
      unsupported_file: '画像以外のファイルは処理できません。',
      invalid_file_size: '画像は1枚15MB以下で選択してください。',
      no_files: '先に画像を選択してください。',
      ocr_unavailable: 'OCRエンジンが利用できません。'
    },
    en: {
      heading: 'Old Kanji Toolkit Pro — OCR workspace',
      local: 'OCR and saved history stay in this browser only. They are not synced across devices.',
      batch: 'Batch OCR images (up to 10)',
      run: 'Recognize images sequentially',
      history: 'Save current OCR text to history',
      saved: 'Saved OCR history',
      batchSave: 'Save batch results to history',
      restore: 'Open in the regular OCR editor',
      empty: 'No saved scans yet.',
      noText: 'No OCR text to save.',
      savedOk: 'Saved in this browser.',
      unavailable: 'Entitlement could not be verified. Please retry.',
      running: 'Running OCR',
      done: 'Batch OCR complete. Review the text manually.',
      error: 'OCR failed.',
      too_many_files: 'Choose at most 10 images.',
      unsupported_file: 'Only image files are supported.',
      invalid_file_size: 'Each image must be 15 MB or less.',
      no_files: 'Choose images first.',
      ocr_unavailable: 'OCR engine unavailable.'
    }
  };

  function language() { return document.documentElement.lang === 'en' ? 'en' : 'ja'; }
  function message(key) { return t[language()][key] || key; }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function currentGate(featureId) {
    return window.NicheWorksProEntitlement.getFeatureState({ productId: PRODUCT, featureId: featureId });
  }

  async function mount() {
    var bridge = window.NicheWorksProEntitlement;
    var engine = window.OldKanjiProOcr;
    var history = window.OldKanjiHistoryCollection;
    if (!bridge || !engine || !history) return;
    var state = await bridge.refreshProState({ productId: PRODUCT });
    if (!state.active) return; // No paid UI or purchase CTA is shown to Free visitors.

    var hasBatch = currentGate('okj.ocr.batch').active;
    var hasHistory = currentGate('okj.history').active;
    if (!hasBatch && !hasHistory) return;
    var anchor = document.getElementById('copy-actions');
    if (!anchor || document.getElementById('okj-pro-ocr-phase1')) return;
    var panel = el('section', 'okj-pro-ocr-phase1');
    panel.id = 'okj-pro-ocr-phase1';
    panel.setAttribute('aria-label', 'Old Kanji Toolkit Pro');
    var heading = el('h2', '', message('heading'));
    var notice = el('p', 'okj-pro-privacy', message('local'));
    panel.append(heading, notice);
    var status = el('p', 'okj-pro-status', '');
    status.setAttribute('aria-live', 'polite');
    var batchInput, batchButton, batchSave, batchHeading;
    var batchResults = [];

    function verifiedHistoryGate() {
      return currentGate('okj.history');
    }
    async function recheck(featureId) {
      return bridge.refreshProState({ productId: PRODUCT, featureId: featureId });
    }
    function inform(text) { status.textContent = text; }
    function openEditor(text) {
      var editor = document.getElementById('manual-text');
      editor.value = text;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function renderHistoryList() {
      if (!hasHistory) return;
      var output = document.getElementById('okj-pro-history-list');
      output.textContent = '';
      var read = history.listHistoryRecords(verifiedHistoryGate());
      var records = read.ok ? read.records : [];
      if (!records.length) { output.append(el('p', '', message('empty'))); return; }
      records.forEach(function (record) {
        var item = el('div', 'okj-pro-record');
        var label = el('span', '', (record.createdAt || '') + ' · ' + (record.sourceLabel || '') + ' · ' + record.ocrText.slice(0, 60));
        var open = el('button', '', message('restore'));
        open.type = 'button';
        open.addEventListener('click', function () { openEditor(record.ocrText); });
        item.append(label, open); output.append(item);
      });
    }

    if (hasBatch) {
      batchHeading = el('h3', '', message('batch'));
      batchInput = el('input', '', '');
      batchInput.type = 'file'; batchInput.accept = 'image/*'; batchInput.multiple = true;
      batchInput.setAttribute('aria-label', 'Batch OCR image files');
      batchButton = el('button', '', message('run'));
      batchButton.type = 'button';
      var resultArea = el('div', 'okj-pro-batch-results', '');
      resultArea.id = 'okj-pro-batch-results';
      panel.append(batchHeading, batchInput, batchButton, resultArea);
      batchButton.addEventListener('click', async function () {
        batchButton.disabled = true; batchResults = []; resultArea.textContent = '';
        try {
          var authorized = await recheck('okj.ocr.batch');
          if (!authorized.active) { inform(message('unavailable')); return; }
          var files = Array.from(batchInput.files || []);
          var result = await engine.runBatch(files, authorized,
            function (file, lang, options) { return window.Tesseract.recognize(file, lang, options); },
            function (progress) {
              inform(message('running') + ' ' + (progress.index + (progress.status === 'processing' ? 1 : 0)) + '/' + progress.total);
            });
          if (!result.ok) { inform(message(result.error)); return; }
          batchResults = result.results;
          batchResults.forEach(function (entry) {
            var block = el('div', 'okj-pro-record');
            block.append(el('strong', '', entry.name + ' — ' + entry.status));
            if (entry.status === 'success') {
              var textarea = el('textarea', '');
              textarea.value = entry.text; textarea.rows = 5;
              textarea.addEventListener('input', function () { entry.text = textarea.value; });
              var open = el('button', '', message('restore'));
              open.type = 'button'; open.addEventListener('click', function () { openEditor(entry.text); });
              block.append(textarea, open);
            }
            resultArea.append(block);
          });
          if (batchSave) batchSave.hidden = !batchResults.some(function (r) { return r.status === 'success'; });
          inform(message('done'));
        } catch (_error) { inform(message('error')); }
        finally { batchButton.disabled = false; }
      });
    }

    if (hasHistory) {
      var saveSingle = el('button', '', message('history'));
      saveSingle.type = 'button'; saveSingle.id = 'okj-pro-save-current';
      saveSingle.addEventListener('click', async function () {
        var verified = await recheck('okj.history');
        if (!verified.active) { inform(message('unavailable')); return; }
        var value = document.getElementById('manual-text').value;
        if (!value.trim()) { inform(message('noText')); return; }
        var fileLabel = document.getElementById('file-name')?.textContent || 'Manual OCR';
        var result = history.saveHistoryRecord({ ocrText: value, sourceLabel: fileLabel, sourceType: fileLabel === 'Manual OCR' ? 'manual' : 'image' }, verified);
        inform(result.ok ? message('savedOk') : message('error')); renderHistoryList();
      });
      panel.append(saveSingle);

      if (hasBatch) {
        batchSave = el('button', '', message('batchSave'));
        batchSave.type = 'button'; batchSave.hidden = true;
        batchSave.addEventListener('click', async function () {
          var verified = await recheck('okj.history');
          if (!verified.active) { inform(message('unavailable')); return; }
          var saved = 0;
          batchResults.filter(function (x) { return x.status === 'success'; }).forEach(function (x) {
            if (history.saveHistoryRecord({ sourceType: 'image', sourceLabel: x.name, ocrText: x.text }, verified).ok) saved += 1;
          });
          inform(saved ? message('savedOk') : message('error'));
          renderHistoryList();
        });
        panel.append(batchSave);
      }
      panel.append(el('h3', '', message('saved')));
      var listing = el('div', 'okj-pro-history-list');
      listing.id = 'okj-pro-history-list';
      panel.append(listing);
    }
    panel.append(status);
    anchor.insertAdjacentElement('afterend', panel);
    if (hasHistory) renderHistoryList();
    function localize() {
      heading.textContent = message('heading'); notice.textContent = message('local');
      if (batchHeading) { batchHeading.textContent = message('batch'); batchButton.textContent = message('run'); }
      var save = document.getElementById('okj-pro-save-current');
      if (save) save.textContent = message('history');
      if (batchSave) batchSave.textContent = message('batchSave');
      panel.querySelectorAll('.okj-pro-record button').forEach(function (b) { b.textContent = message('restore'); });
    }
    ['lang-ja','lang-en'].forEach(function (id) {
      document.getElementById(id)?.addEventListener('click', function () { queueMicrotask(localize); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
