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

  async function prepareFastScanOcrImage(file, quarterTurns = 0, options = {}) {
    if (!file) throw new Error('An OCR image is required.');
    const turns = normalizeQuarterTurns(quarterTurns);
    const crop = normalizeCrop(options.crop);
    const contrast = normalizeContrast(options.contrastPercent);
    const hasCrop = Object.values(crop).some(value => value > 0);
    if (!turns && !hasCrop && contrast === 100) return file;

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

      // Cap peak image/canvas memory for smartphone photos. Never upload pixels.
      const scale = Math.min(1, 4096 / Math.max(naturalWidth, naturalHeight));
      const width = Math.max(1, Math.round(naturalWidth * scale));
      const height = Math.max(1, Math.round(naturalHeight * scale));
      const rotatedWidth = turns % 2 ? height : width;
      const rotatedHeight = turns % 2 ? width : height;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(rotatedWidth * (1 - (crop.left + crop.right) / 100)));
      canvas.height = Math.max(1, Math.round(rotatedHeight * (1 - (crop.top + crop.bottom) / 100)));

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Image processing is unavailable.');
      if (contrast !== 100) {
        if (!('filter' in ctx)) throw new Error('Contrast adjustment is unavailable in this browser.');
        ctx.filter = 'contrast(' + contrast + '%)';
      }

      // Crop coordinates are percentages of the already-rotated preview,
      // so the processed OCR pixels always match the displayed preview.
      ctx.translate(
        rotatedWidth / 2 - rotatedWidth * crop.left / 100,
        rotatedHeight / 2 - rotatedHeight * crop.top / 100
      );
      ctx.rotate(turns * Math.PI / 2);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);

      return await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
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
