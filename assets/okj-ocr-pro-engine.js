(function (global) {
  'use strict';
  var PRODUCT_ID = 'okj.toolkit_pro';
  var BATCH_FEATURE = 'okj.ocr.batch';
  var MAX_FILES = 10;
  var MAX_FILE_SIZE = 15 * 1024 * 1024;

  function allowed(gate) {
    return Boolean(gate && gate.active === true &&
      gate.productId === PRODUCT_ID && gate.featureId === BATCH_FEATURE);
  }

  function validateFiles(files) {
    if (!Array.isArray(files) || files.length === 0) return 'no_files';
    if (files.length > MAX_FILES) return 'too_many_files';
    for (var i = 0; i < files.length; i += 1) {
      var file = files[i];
      if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/')) return 'unsupported_file';
      if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_FILE_SIZE) return 'invalid_file_size';
    }
    return null;
  }

  // Local-only sequential OCR. The caller supplies the browser Tesseract recognizer.
  // This module never uploads content or sends analytics/network requests.
  async function runBatch(files, gate, recognize, onProgress) {
    if (!allowed(gate)) return { ok: false, error: 'pro_required', results: [] };
    var error = validateFiles(files);
    if (error) return { ok: false, error: error, results: [] };
    if (typeof recognize !== 'function') return { ok: false, error: 'ocr_unavailable', results: [] };

    var results = [];
    for (var i = 0; i < files.length; i += 1) {
      var file = files[i];
      if (typeof onProgress === 'function') onProgress({ index: i, total: files.length, status: 'processing' });
      try {
        var output = await recognize(file, 'jpn', {
          logger: function (event) {
            if (typeof onProgress === 'function' && typeof event?.progress === 'number') {
              onProgress({ index: i, total: files.length, status: 'processing', progress: event.progress });
            }
          }
        });
        results.push({
          name: String(file.name || 'image-' + (i + 1)),
          status: 'success',
          text: typeof output?.data?.text === 'string' ? output.data.text : ''
        });
      } catch (_error) {
        results.push({ name: String(file.name || 'image-' + (i + 1)), status: 'error', text: '' });
      }
      if (typeof onProgress === 'function') onProgress({ index: i + 1, total: files.length, status: 'complete' });
    }
    return { ok: true, results: results };
  }
  global.OldKanjiProOcr = {
    PRODUCT_ID: PRODUCT_ID,
    MAX_FILES: MAX_FILES,
    MAX_FILE_SIZE: MAX_FILE_SIZE,
    allowed: allowed,
    validateFiles: validateFiles,
    runBatch: runBatch
  };
})(window);
