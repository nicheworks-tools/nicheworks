(function attachPhotoQaRunner(root) {
  'use strict';
  const byId = id => document.getElementById(id);
  const imageInput = byId('qa-image');
  const referenceInput = byId('qa-reference');
  const lang = byId('qa-language');
  const status = byId('qa-status');
  const preview = byId('qa-preview');
  const recognized = byId('qa-recognized');
  const baselineButton = byId('qa-baseline');
  const adjustedButton = byId('qa-adjusted');
  const copyButton = byId('qa-copy');
  const baselineResult = byId('qa-baseline-result');
  const adjustedResult = byId('qa-adjusted-result');
  const deltaResult = byId('qa-delta');
  const correction = byId('qa-correction');
  const bench = root.NWFastScanPhotoMetrics;

  const previous = { baseline: null, adjusted: null };
  let previewUrl = '';
  let revision = 0;
  let busy = false;

  function setStatus(message) {
    status.textContent = message;
  }

  function pct(value) {
    return (100 * value).toFixed(2) + '%';
  }

  function display(report) {
    if (!report) return 'No result yet.';
    const m = report.metrics;
    return 'CER ' + pct(m.characterErrorRate) +
      ' (' + m.characterEdits + ' edits / ' + m.referenceCharacters + ' reference characters)' +
      '\nExact ingredient recall ' + pct(m.exactIngredientRecall) +
      ' (' + m.exactIngredientHits + '/' + m.referenceIngredients + ')' +
      '\nExact ingredient precision ' + pct(m.exactIngredientPrecision) +
      ' (' + m.exactIngredientHits + '/' + m.recognizedIngredients + ')' +
      '\nOCR duration ' + report.durationMs + ' ms';
  }

  function render() {
    baselineResult.textContent = display(previous.baseline);
    adjustedResult.textContent = display(previous.adjusted);
    const diff = bench.pairedChange(previous.baseline?.metrics, previous.adjusted?.metrics);
    deltaResult.textContent = diff
      ? 'Adjusted minus baseline: CER ' + (diff.characterErrorRateChange >= 0 ? '+' : '') +
        pct(diff.characterErrorRateChange) + ' points; exact ingredient recall ' +
        (diff.exactIngredientRecallChange >= 0 ? '+' : '') +
        pct(diff.exactIngredientRecallChange) + ' points.'
      : 'Run baseline and adjusted OCR on the same photo and reference to see a comparison.';
    copyButton.disabled = !(previous.baseline || previous.adjusted);
  }

  function resetScores() {
    previous.baseline = null;
    previous.adjusted = null;
    render();
    recognized.value = '';
    revision += 1;
  }

  function readAdjustments() {
    const quarterTurns = Number(byId('qa-turns').value);
    const deskewDegrees = Number(byId('qa-tilt').value);
    const contrastPercent = Number(byId('qa-contrast').value);
    const crop = {};
    for (const edge of ['left', 'right', 'top', 'bottom']) {
      crop[edge] = Number(byId('qa-crop-' + edge).value);
    }
    if (crop.left + crop.right > 90 || crop.top + crop.bottom > 90) {
      throw new Error('Combined crop on each axis must leave at least 10% of the photo.');
    }
    return { quarterTurns, deskewDegrees, contrastPercent, crop };
  }

  async function showPreparedPreview(file, options, expectedRevision) {
    const prepared = await root.prepareFastScanOcrImage(file, options.quarterTurns, options);
    if (expectedRevision !== revision) return;
    const next = URL.createObjectURL(prepared);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = next;
    preview.src = next;
    preview.hidden = false;
  }

  async function run(kind) {
    if (busy) return;
    const file = imageInput.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setStatus('Choose a local photo of an actual ingredient label first.');
      return;
    }
    if (!referenceInput.value.trim()) {
      setStatus('Transcribe the reference label from the original packaging first.');
      return;
    }
    if (typeof root.runOCR !== 'function' ||
        typeof root.prepareFastScanOcrImage !== 'function' ||
        typeof root.postProcessOcrText !== 'function') {
      setStatus('The FastScan OCR library is unavailable. Check connectivity to its library CDN.');
      return;
    }
    if (!root.Tesseract) {
      setStatus('Tesseract.js did not load. The OCR script and language model require network access.');
      return;
    }

    let options;
    try {
      options = kind === 'baseline'
        ? { quarterTurns: 0, deskewDegrees: 0, contrastPercent: 100,
            crop: { left: 0, right: 0, top: 0, bottom: 0 } }
        : readAdjustments();
    } catch (error) {
      setStatus(error.message);
      return;
    }
    busy = true;
    baselineButton.disabled = true;
    adjustedButton.disabled = true;
    const runRevision = revision;
    const selectedLanguage = lang.value === 'jpn+eng' ? 'jpn+eng' : 'eng';
    const sourceReference = referenceInput.value;
    try {
      setStatus('Running ' + kind + ' OCR locally…');
      await showPreparedPreview(file, options, runRevision);
      const started = performance.now();
      const raw = await root.runOCR(file, selectedLanguage, update => {
        if (runRevision !== revision) return;
        const progress = Number.isFinite(update.progress) ? ' ' + Math.round(update.progress * 100) + '%' : '';
        setStatus('Running ' + kind + ' OCR: ' + (update.status || 'working') + progress);
      }, options);
      const durationMs = Math.round(performance.now() - started);
      if (runRevision !== revision) {
        setStatus('Photo, reference or settings changed during OCR. Discarded the stale result.');
        return;
      }
      const processed = root.postProcessOcrText(raw, {
        langHint: selectedLanguage === 'jpn+eng' ? 'jp' : 'en'
      });
      const split = root.NWCosmeticIngredientParser?.splitIngredients;
      const metrics = bench.score(sourceReference, processed, split);
      previous[kind] = { metrics, durationMs, options, lang: selectedLanguage };
      recognized.value = processed;
      setStatus(kind + ' OCR complete. Compare the recognized text against the package.');
      render();
    } catch (error) {
      if (runRevision === revision) setStatus('OCR benchmark failed: ' + (error?.message || String(error)));
    } finally {
      busy = false;
      baselineButton.disabled = false;
      adjustedButton.disabled = false;
    }
  }

  async function copyReport() {
    const toExport = Object.fromEntries(Object.entries(previous).filter(([, item]) => item)
      .map(([key, item]) => [key, item]));
    const documentToExport = {
      schema: 'fastscan-photo-qa-v1',
      generatedAt: new Date().toISOString(),
      scoring: 'NFKC lowercase tokenized-ingredient CER (separator-insensitive, numeric locants preserved) plus non-deduplicated exact ingredient recall/precision',
      originalImageUploaded: false,
      rawPhotoOrIngredientTextIncluded: false,
      runs: toExport,
      difference: bench.pairedChange(previous.baseline?.metrics, previous.adjusted?.metrics)
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(documentToExport, null, 2));
      setStatus('Metrics-only JSON copied. The photo and ingredient text are not in the report.');
    } catch {
      setStatus('Could not copy the metrics report. Use browser clipboard permissions.');
    }
  }

  imageInput.addEventListener('change', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    preview.hidden = true;
    preview.removeAttribute('src');
    resetScores();
    setStatus('Selected a new local photo. Transcribe its reference list before running OCR.');
  });
  referenceInput.addEventListener('input', resetScores);
  lang.addEventListener('change', resetScores);
  correction.addEventListener('input', resetScores);
  baselineButton.addEventListener('click', () => void run('baseline'));
  adjustedButton.addEventListener('click', () => void run('adjusted'));
  copyButton.addEventListener('click', () => void copyReport());
  byId('qa-tilt').addEventListener('input', event => {
    byId('qa-tilt-label').textContent = event.target.value + '°';
    resetScores();
  });
  byId('qa-contrast').addEventListener('input', event => {
    byId('qa-contrast-label').textContent = event.target.value + '%';
    resetScores();
  });
  window.addEventListener('pagehide', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
