(function (global) {
  'use strict';
  var PRODUCT = 'okj.toolkit_pro';
  var FEATURE = 'okj.ocr.crop';
  var MAX_IMAGE_BYTES = 15 * 1024 * 1024;
  var MAX_OUTPUT_SIDE = 4096;
  var MAX_OUTPUT_PIXELS = 12000000;

  function allowed(gate) {
    return !!(gate && gate.active === true &&
      gate.productId === PRODUCT && gate.featureId === FEATURE);
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }
  function normalizeRect(rect) {
    if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(finite)) return null;
    var x = clamp(rect.x, 0, 1), y = clamp(rect.y, 0, 1);
    var right = clamp(rect.x + rect.width, 0, 1);
    var bottom = clamp(rect.y + rect.height, 0, 1);
    if (right <= x || bottom <= y) return null;
    return { x: x, y: y, width: right - x, height: bottom - y };
  }
  function rectFromDrag(a, b) {
    if (![a?.x, a?.y, b?.x, b?.y].every(finite)) return null;
    var x = clamp(Math.min(a.x, b.x), 0, 1), y = clamp(Math.min(a.y, b.y), 0, 1);
    var right = clamp(Math.max(a.x, b.x), 0, 1), bottom = clamp(Math.max(a.y, b.y), 0, 1);
    return normalizeRect({ x: x, y: y, width: right - x, height: bottom - y });
  }
  function pixels(rect, imageWidth, imageHeight) {
    var box = normalizeRect(rect);
    if (!box || !Number.isInteger(imageWidth) || !Number.isInteger(imageHeight) ||
      imageWidth <= 0 || imageHeight <= 0) return null;
    var x = Math.floor(box.x * imageWidth);
    var y = Math.floor(box.y * imageHeight);
    var right = Math.ceil((box.x + box.width) * imageWidth);
    var bottom = Math.ceil((box.y + box.height) * imageHeight);
    var width = Math.min(imageWidth - x, right - x);
    var height = Math.min(imageHeight - y, bottom - y);
    if (width < 4 || height < 4) return null;
    return { x: x, y: y, width: width, height: height };
  }
  function validateSource(file) {
    if (!file || typeof file.type !== 'string' ||
      !/^image\/(png|jpeg|webp|gif|bmp)$/i.test(file.type)) return 'unsupported_file';
    if (!finite(file.size) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) return 'file_size';
    return null;
  }
  function makePreviewSize(width, height) {
    if (!finite(width) || !finite(height) || width <= 0 || height <= 0) return null;
    var scale = Math.min(1, 900 / width, 580 / height);
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
  }
  // The caller provides the decoded same-origin image and browser canvas constructor.
  // This function never contacts an API and rejects an unverified feature gate.
  async function createCropBlob(image, rect, gate, canvasFactory) {
    if (!allowed(gate)) return { ok: false, error: 'pro_required' };
    var width = image?.naturalWidth, height = image?.naturalHeight;
    var region = pixels(rect, width, height);
    if (!region) return { ok: false, error: 'invalid_selection' };
    if (typeof canvasFactory !== 'function') return { ok: false, error: 'canvas_unavailable' };
    var canvas = canvasFactory();
    if (!canvas || typeof canvas.getContext !== 'function' || typeof canvas.toBlob !== 'function') {
      return { ok: false, error: 'canvas_unavailable' };
    }
    var scale = Math.min(1, MAX_OUTPUT_SIDE / region.width, MAX_OUTPUT_SIDE / region.height,
      Math.sqrt(MAX_OUTPUT_PIXELS / (region.width * region.height)));
    canvas.width = Math.max(1, Math.round(region.width * scale));
    canvas.height = Math.max(1, Math.round(region.height * scale));
    var ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx || typeof ctx.drawImage !== 'function') return { ok: false, error: 'canvas_unavailable' };
    try {
      ctx.drawImage(image, region.x, region.y, region.width, region.height,
        0, 0, canvas.width, canvas.height);
      var blob = await new Promise(function(resolve) {
        canvas.toBlob(resolve, 'image/png');
      });
      if (!blob || blob.size <= 0) return { ok: false, error: 'encode_failed' };
      return { ok: true, blob: blob, sourcePixels: region,
        outputPixels: {width:canvas.width,height:canvas.height} };
    } catch (_error) {
      return { ok: false, error: 'encode_failed' };
    }
  }
  global.OldKanjiCropEngine = {
    PRODUCT: PRODUCT, FEATURE: FEATURE, MAX_IMAGE_BYTES: MAX_IMAGE_BYTES,
    allowed: allowed, normalizeRect: normalizeRect, rectFromDrag: rectFromDrag,
    pixels: pixels, validateSource: validateSource, makePreviewSize: makePreviewSize,
    createCropBlob: createCropBlob
  };
})(window);
