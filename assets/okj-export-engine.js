(function (global) {
  'use strict';

  var EXPORT_SCHEMA_VERSION = 'okj-export-v1';
  var DEFAULT_PRODUCT_ID = 'okj.toolkit_pro';
  var SUPPORTED_FEATURE_IDS = {
    'okj.exportCsv': true,
    'okj.exportMarkdown': true,
    'okj.exportJson': true,
    'okj.report': true
  };

  function normalizeString(value) {
    return typeof value === 'string' ? value : '';
  }

  function normalizeStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map(function (item) { return normalizeString(item); }).filter(Boolean);
  }

  function normalizeDetectedOldKanji(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map(function (item) {
        var source = item || {};
        var count = Number.isFinite(source.count) ? Math.max(0, Math.floor(source.count)) : 0;
        return {
          old: normalizeString(source.old),
          modern: normalizeStringArray(source.modern),
          count: count
        };
      })
      .filter(function (item) { return item.old.length > 0; });
  }

  function normalizeHistoryRecord(value) {
    var source = value || {};
    return {
      id: normalizeString(source.id),
      createdAt: normalizeString(source.createdAt),
      sourceType: source.sourceType === 'manual' ? 'manual' : 'image',
      sourceLabel: normalizeString(source.sourceLabel),
      ocrText: normalizeString(source.ocrText),
      detectedOldKanji: normalizeDetectedOldKanji(source.detectedOldKanji),
      notes: normalizeString(source.notes),
      tags: normalizeStringArray(source.tags),
      schemaVersion: normalizeString(source.schemaVersion)
    };
  }

  function normalizeCollectionRecord(value) {
    var source = value || {};
    var normalizedSource = source.source;
    if (normalizedSource !== 'manual' && normalizedSource !== 'reference') {
      normalizedSource = 'ocr';
    }

    return {
      id: normalizeString(source.id),
      createdAt: normalizeString(source.createdAt),
      old: normalizeString(source.old),
      modern: normalizeStringArray(source.modern),
      source: normalizedSource,
      notes: normalizeString(source.notes),
      tags: normalizeStringArray(source.tags),
      schemaVersion: normalizeString(source.schemaVersion)
    };
  }

  function normalizeExportInput(input) {
    var source = input || {};
    return {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      historyRecords: Array.isArray(source.historyRecords)
        ? source.historyRecords.map(normalizeHistoryRecord)
        : [],
      collectionRecords: Array.isArray(source.collectionRecords)
        ? source.collectionRecords.map(normalizeCollectionRecord)
        : [],
      detectedOldKanji: normalizeDetectedOldKanji(source.detectedOldKanji),
      ocrText: normalizeString(source.ocrText),
      modernPreview: normalizeString(source.modernPreview),
      sourceLabel: normalizeString(source.sourceLabel),
      createdAt: normalizeString(source.createdAt)
    };
  }

  function canExport(gate, featureId) {
    if (!gate || gate.active !== true) return false;
    if (gate.productId !== DEFAULT_PRODUCT_ID) return false;
    if (featureId && gate.featureId !== featureId) return false;
    return !!SUPPORTED_FEATURE_IDS[gate.featureId];
  }

  function denyResponse() {
    return { ok: false, error: 'pro_required' };
  }

  function escapeCsv(value) {
    var text = normalizeString(value);
    var escaped = text.replace(/"/g, '""');
    if (/[",\n\r]/.test(escaped)) {
      return '"' + escaped + '"';
    }
    return escaped;
  }

  function buildCsvExport(input, gate) {
    if (!canExport(gate, 'okj.exportCsv')) return denyResponse();

    var normalized = normalizeExportInput(input);
    var lines = [
      'schemaVersion,createdAt,sourceLabel,ocrText,modernPreview,detectedOldKanjiCount,historyRecordCount,collectionRecordCount',
      [
        escapeCsv(normalized.schemaVersion),
        escapeCsv(normalized.createdAt),
        escapeCsv(normalized.sourceLabel),
        escapeCsv(normalized.ocrText),
        escapeCsv(normalized.modernPreview),
        String(normalized.detectedOldKanji.length),
        String(normalized.historyRecords.length),
        String(normalized.collectionRecords.length)
      ].join(',')
    ];

    normalized.detectedOldKanji.forEach(function (item) {
      lines.push([
        'detectedOldKanji',
        escapeCsv(item.old),
        escapeCsv(item.modern.join('|')),
        String(item.count)
      ].join(','));
    });

    return {
      ok: true,
      filename: 'old-kanji-export.csv',
      mimeType: 'text/csv;charset=utf-8',
      content: lines.join('\n')
    };
  }

  function escapeMarkdown(value) {
    return normalizeString(value).replace(/[<>&]/g, function (char) {
      return char === '<' ? '&lt;' : char === '>' ? '&gt;' : '&amp;';
    });
  }

  function buildMarkdownExport(input, gate) {
    if (!canExport(gate, 'okj.exportMarkdown')) return denyResponse();

    var normalized = normalizeExportInput(input);
    var detectedLines = normalized.detectedOldKanji.map(function (item) {
      var modern = item.modern.length ? item.modern.join(', ') : '(none)';
      return '- ' + escapeMarkdown(item.old) + ' → ' + escapeMarkdown(modern) + ' (count: ' + item.count + ')';
    });

    var content = [
      '# Old Kanji Export',
      '',
      '- Schema: ' + escapeMarkdown(normalized.schemaVersion),
      '- Created At: ' + escapeMarkdown(normalized.createdAt),
      '- Source Label: ' + escapeMarkdown(normalized.sourceLabel),
      '',
      '## OCR Text',
      '',
      '```',
      escapeMarkdown(normalized.ocrText),
      '```',
      '',
      '## Detected Old Kanji',
      ''
    ];

    if (detectedLines.length > 0) {
      content = content.concat(detectedLines);
    } else {
      content.push('- (none)');
    }

    content = content.concat([
      '',
      '## Summaries',
      '',
      '- History records: ' + normalized.historyRecords.length,
      '- Collection records: ' + normalized.collectionRecords.length
    ]);

    return {
      ok: true,
      filename: 'old-kanji-export.md',
      mimeType: 'text/markdown;charset=utf-8',
      content: content.join('\n')
    };
  }

  function buildJsonExport(input, gate) {
    if (!canExport(gate, 'okj.exportJson')) return denyResponse();

    var normalized = normalizeExportInput(input);
    return {
      ok: true,
      filename: 'old-kanji-export.json',
      mimeType: 'application/json;charset=utf-8',
      content: JSON.stringify(normalized, null, 2)
    };
  }

  global.OldKanjiExportEngine = {
    normalizeExportInput: normalizeExportInput,
    buildCsvExport: buildCsvExport,
    buildMarkdownExport: buildMarkdownExport,
    buildJsonExport: buildJsonExport,
    canExport: canExport
  };
})(window);
