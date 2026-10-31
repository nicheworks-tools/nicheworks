/* Deterministic, client-only OCR accuracy measurements. No telemetry. */
(function attachFastScanPhotoMetrics(root) {
  'use strict';

  function normalizedText(value) {
    return String(value || '').normalize('NFKC')
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function levenshtein(left, right) {
    const a = Array.from(String(left || ''));
    const b = Array.from(String(right || ''));
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const rows = a.length >= b.length ? a : b;
    const cols = a.length >= b.length ? b : a;
    let previous = Array.from({ length: cols.length + 1 }, (_, i) => i);
    for (let i = 1; i <= rows.length; i += 1) {
      const next = new Array(cols.length + 1);
      next[0] = i;
      for (let j = 1; j <= cols.length; j += 1) {
        const substitute = previous[j - 1] + (rows[i - 1] === cols[j - 1] ? 0 : 1);
        next[j] = Math.min(previous[j] + 1, next[j - 1] + 1, substitute);
      }
      previous = next;
    }
    return previous[cols.length];
  }

  function ingredients(value, splitIngredients) {
    const tokens = typeof splitIngredients === 'function'
      ? splitIngredients(value, { dedupe: false })
      : String(value || '').replace(/(\d),(?=\d)/g, '$1\uE010')
          .split(/[\n,、，;；]+/)
          .map(token => token.replaceAll('\uE010', ','));
    return (Array.isArray(tokens) ? tokens : [])
      .map(normalizedText)
      .filter(Boolean);
  }

  function score(referenceText, recognizedText, splitIngredients) {
    // The OCR postprocessor intentionally converts ingredient separators
    // (commas, Japanese commas, line breaks) into line-delimited tokens.
    // Compare identically normalized ingredient sequences, otherwise a
    // perfect OCR read of a comma-separated label would register false
    // character edits purely because of that delimiter conversion.
    // Numeric locant commas inside names (e.g. 1,2-Hexanediol) are preserved
    // by the shared parser and remain part of the measured text.
    const referenceTokens = ingredients(referenceText, splitIngredients);
    const predictedTokens = ingredients(recognizedText, splitIngredients);
    const reference = normalizedText(referenceTokens.join('\n'));
    const predicted = normalizedText(predictedTokens.join('\n'));
    if (!reference) throw new Error('A transcribed reference label is required.');
    if (Array.from(reference).length > 5000 || Array.from(predicted).length > 5000) {
      throw new Error('Limit each OCR comparison to 5000 normalized characters.');
    }

    const referenceChars = Array.from(reference).length;
    const recognizedChars = Array.from(predicted).length;
    const editDistance = levenshtein(reference, predicted);
    const referenceCounts = new Map();
    for (const token of referenceTokens) {
      referenceCounts.set(token, (referenceCounts.get(token) || 0) + 1);
    }
    let exactHits = 0;
    for (const token of predictedTokens) {
      if ((referenceCounts.get(token) || 0) > 0) {
        exactHits += 1;
        referenceCounts.set(token, referenceCounts.get(token) - 1);
      }
    }
    return {
      referenceCharacters: referenceChars,
      recognizedCharacters: recognizedChars,
      characterEdits: editDistance,
      characterErrorRate: editDistance / referenceChars,
      referenceIngredients: referenceTokens.length,
      recognizedIngredients: predictedTokens.length,
      exactIngredientHits: exactHits,
      exactIngredientRecall: referenceTokens.length ? exactHits / referenceTokens.length : 0,
      exactIngredientPrecision: predictedTokens.length ? exactHits / predictedTokens.length : 0
    };
  }

  function pairedChange(baseline, adjusted) {
    if (!baseline || !adjusted) return null;
    return {
      characterErrorRateChange: adjusted.characterErrorRate - baseline.characterErrorRate,
      exactIngredientRecallChange: adjusted.exactIngredientRecall - baseline.exactIngredientRecall
    };
  }

  root.NWFastScanPhotoMetrics = Object.freeze({
    normalizedText, levenshtein, ingredients, score, pairedChange
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
