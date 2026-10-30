/* Local-only photo rotation shared by the INCI and Japanese OCR modes. */
(function initFastScanImagePrep(root) {
  'use strict';

  function normalizeQuarterTurns(turns) {
    const value = Number(turns);
    return Number.isInteger(value) ? ((value % 4) + 4) % 4 : 0;
  }

  async function prepareFastScanOcrImage(file, quarterTurns = 0) {
    if (!file) throw new Error('An OCR image is required.');
    const turns = normalizeQuarterTurns(quarterTurns);
    if (turns === 0) return file;

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

      // Bound canvas memory on high-resolution phone photos without enlarging
      // small type or inventing pixels before the OCR engine runs.
      const scale = Math.min(1, 4096 / Math.max(naturalWidth, naturalHeight));
      const width = Math.max(1, Math.round(naturalWidth * scale));
      const height = Math.max(1, Math.round(naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = turns % 2 === 1 ? height : width;
      canvas.height = turns % 2 === 1 ? width : height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Image processing is unavailable.');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(turns * Math.PI / 2);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);

      return await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Could not prepare the rotated image.'));
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  root.prepareFastScanOcrImage = prepareFastScanOcrImage;
})(typeof globalThis !== 'undefined' ? globalThis : this);
