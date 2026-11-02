/* Browser-local photo preparation, shared by both FastScan OCR modes. */
(function initFastScanImagePrep(root) {
  'use strict';

  function normalizeQuarterTurns(turns) {
    const value = Number(turns);
    return Number.isInteger(value) ? ((value % 4) + 4) % 4 : 0;
  }

  function clampPercentage(value, maximum = 90) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, parsed)) : 0;
  }

  function normalizeCrop(crop) {
    const left = clampPercentage(crop?.left);
    const right = Math.min(clampPercentage(crop?.right), 90 - left);
    const top = clampPercentage(crop?.top);
    const bottom = Math.min(clampPercentage(crop?.bottom), 90 - top);
    return { left, right, top, bottom };
  }

  function normalizeContrast(contrastPercent) {
    const value = Number(contrastPercent);
    return Number.isFinite(value) ? Math.max(100, Math.min(180, value)) : 100;
  }

  function normalizeDeskewDegrees(value) {
    const angle = Number(value);
    return Number.isFinite(angle) ? Math.max(-12, Math.min(12, Math.round(angle))) : 0;
  }

  // Opt-in browser enhancement. Offline sharp experiments informed this option,
  // but canvas interpolation is NOT identical to sharp's Lanczos kernel.
  // No per-image selection or hidden ingredient correction occurs here.
  function enhanceFastScanCanvas(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || typeof ctx.getImageData !== 'function' || typeof ctx.putImageData !== 'function') {
      throw new Error('Local image enhancement is unsupported in this browser.');
    }
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const values = pixels.data;
    const histogram = new Uint32Array(256);
    let count = 0;
    for (let i = 0; i < values.length; i += 4) {
      if (values[i + 3] < 128) continue;
      // Integer RGB luma estimate avoids unpredictable browser CSS filters.
      const gray = (77 * values[i] + 150 * values[i + 1] + 29 * values[i + 2]) >> 8;
      histogram[gray] += 1;
      count += 1;
    }
    if (!count) throw new Error('Image contains no visible pixels.');

    // A fixed 1%/99% histogram contrast stretch, independent of OCR output.
    const cutoff = Math.max(1, Math.floor(count * 0.01));
    let low = 0;
    let accumulated = 0;
    while (low < 255 && (accumulated += histogram[low]) < cutoff) low += 1;
    let high = 255;
    accumulated = 0;
    while (high > 0 && (accumulated += histogram[high]) < cutoff) high -= 1;
    const span = high - low;
    for (let i = 0; i < values.length; i += 4) {
      let gray = (77 * values[i] + 150 * values[i + 1] + 29 * values[i + 2]) >> 8;
      if (values[i + 3] < 128) gray = 255;
      else if (span >= 16) gray = Math.max(0, Math.min(255, Math.round((gray - low) * 255 / span)));
      values[i] = gray;
      values[i + 1] = gray;
      values[i + 2] = gray;
      values[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);

    const enlarge = Math.max(1, Math.min(2, 3072 / Math.max(canvas.width, canvas.height)));
    if (enlarge <= 1.001) return canvas;
    const enlarged = document.createElement('canvas');
    enlarged.width = Math.max(1, Math.round(canvas.width * enlarge));
    enlarged.height = Math.max(1, Math.round(canvas.height * enlarge));
    const enlargedCtx = enlarged.getContext('2d');
    if (!enlargedCtx) throw new Error('Local image enlargement is unavailable.');
    enlargedCtx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in enlargedCtx) enlargedCtx.imageSmoothingQuality = 'high';
    enlargedCtx.drawImage(canvas, 0, 0, enlarged.width, enlarged.height);
    return enlarged;
  }

  async function prepareFastScanOcrImage(file, quarterTurns = 0, options = {}) {
    if (!file) throw new Error('An OCR image is required.');
    const enhanceForOcr = options.enhanceForOcr === true;
    const turns = normalizeQuarterTurns(quarterTurns);
    const crop = normalizeCrop(options.crop);
    const contrast = normalizeContrast(options.contrastPercent);
    const deskewDegrees = normalizeDeskewDegrees(options.deskewDegrees);
    const deskewRadians = deskewDegrees * Math.PI / 180;
    const hasCrop = Object.values(crop).some(value => value > 0);
    if (!turns && !hasCrop && contrast === 100 && deskewDegrees === 0 && !enhanceForOcr) return file;

    const imageUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('Could not decode the selected image.'));
        element.src = imageUrl;
      });

      const naturalWidth = image.naturalWidth || image.width;
      const naturalHeight = image.naturalHeight || image.height;
      if (!naturalWidth || !naturalHeight) throw new Error('Invalid image dimensions.');

      // Include the rotated bounding rectangle in the memory cap: a small
      // deskew can otherwise enlarge a 4096px phone photo past the canvas limit.
      const cos = Math.abs(Math.cos(deskewRadians));
      const sin = Math.abs(Math.sin(deskewRadians));
      const baseWidth = turns % 2 ? naturalHeight : naturalWidth;
      const baseHeight = turns % 2 ? naturalWidth : naturalHeight;
      const naturalBoxWidth = baseWidth * cos + baseHeight * sin;
      const naturalBoxHeight = baseWidth * sin + baseHeight * cos;
      // Enhanced phone photos are capped at 3072px before pixel inspection
      // and enlargement to bound canvas/image-data memory.
      const memoryCap = enhanceForOcr ? 3072 : 4096;
      const scale = Math.min(1, memoryCap / Math.max(naturalBoxWidth, naturalBoxHeight));
      const width = Math.max(1, Math.floor(naturalWidth * scale));
      const height = Math.max(1, Math.floor(naturalHeight * scale));
      const rotatedWidth = turns % 2 ? height : width;
      const rotatedHeight = turns % 2 ? width : height;
      const boxWidth = deskewDegrees ? Math.ceil(rotatedWidth * cos + rotatedHeight * sin) : rotatedWidth;
      const boxHeight = deskewDegrees ? Math.ceil(rotatedWidth * sin + rotatedHeight * cos) : rotatedHeight;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(boxWidth * (1 - (crop.left + crop.right) / 100)));
      canvas.height = Math.max(1, Math.round(boxHeight * (1 - (crop.top + crop.bottom) / 100)));

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Image processing is unavailable.');
      if (contrast !== 100) {
        if (!('filter' in ctx)) throw new Error('Contrast adjustment is unavailable in this browser.');
        ctx.filter = 'contrast(' + contrast + '%)';
      }

      // Small-angle rotation creates corner triangles. Fill them white rather
      // than handing transparent/black pixels to Tesseract. Do not crop the
      // original photo to conceal corners: retain its full rotated bounding box.
      if (deskewDegrees) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // Crop edges are relative to the deskewed, expanded preview box.
      // The same preparation routine is used by the preview and OCR worker.
      ctx.translate(
        boxWidth / 2 - boxWidth * crop.left / 100,
        boxHeight / 2 - boxHeight * crop.top / 100
      );
      ctx.rotate(turns * Math.PI / 2 + deskewRadians);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);

      const outputCanvas = enhanceForOcr ? enhanceFastScanCanvas(canvas) : canvas;
      return await new Promise((resolve, reject) => {
        outputCanvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Could not prepare the cropped image.'));
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  root.prepareFastScanOcrImage = prepareFastScanOcrImage;
})(typeof globalThis !== 'undefined' ? globalThis : this);
