(function (global) {
  'use strict';

  var REPORT_SCHEMA_VERSION = 'okj-report-v1';
  var DEFAULT_PRODUCT_ID = 'okj.toolkit_pro';
  var REPORT_FEATURE_ID = 'okj.report';

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

  function normalizeReportInput(input) {
    var source = input || {};
    return {
      title: normalizeString(source.title) || 'Old Kanji OCR Report',
      sourceLabel: normalizeString(source.sourceLabel),
      ocrText: normalizeString(source.ocrText),
      modernPreview: normalizeString(source.modernPreview),
      detectedOldKanji: normalizeDetectedOldKanji(source.detectedOldKanji),
      historyRecords: Array.isArray(source.historyRecords) ? source.historyRecords.map(normalizeHistoryRecord) : [],
      collectionRecords: Array.isArray(source.collectionRecords) ? source.collectionRecords.map(normalizeCollectionRecord) : [],
      notes: normalizeString(source.notes),
      createdAt: normalizeString(source.createdAt)
    };
  }

  function canBuildReport(gate) {
    if (!gate || gate.active !== true) return false;
    if (gate.productId !== DEFAULT_PRODUCT_ID) return false;
    return gate.featureId === REPORT_FEATURE_ID;
  }

  function denyResponse() {
    return { ok: false, error: 'pro_required' };
  }

  function escapeMarkdown(value) {
    return normalizeString(value).replace(/[<>&]/g, function (char) {
      return char === '<' ? '&lt;' : char === '>' ? '&gt;' : '&amp;';
    });
  }

  function buildMarkdownReport(input, gate) {
    if (!canBuildReport(gate)) return denyResponse();

    var normalized = normalizeReportInput(input);
    var detectedSummary = normalized.detectedOldKanji.map(function (item) {
      var modern = item.modern.length > 0 ? item.modern.join(', ') : '(none)';
      return '- ' + escapeMarkdown(item.old) + ' → ' + escapeMarkdown(modern) + ' (count: ' + item.count + ')';
    });

    var sections = [
      '# ' + escapeMarkdown(normalized.title),
      '',
      '## Metadata',
      '',
      '- Created At: ' + escapeMarkdown(normalized.createdAt),
      '- Source Label: ' + escapeMarkdown(normalized.sourceLabel),
      '',
      '## OCR Text',
      '',
      '```',
      escapeMarkdown(normalized.ocrText),
      '```',
      '',
      '## Modern Preview',
      '',
      escapeMarkdown(normalized.modernPreview) || '(none)',
      '',
      '## Detected Old-Kanji Summary',
      ''
    ];

    if (detectedSummary.length > 0) {
      sections = sections.concat(detectedSummary);
    } else {
      sections.push('- (none)');
    }

    sections = sections.concat([
      '',
      '## History Summary',
      '',
      '- Record count: ' + normalized.historyRecords.length,
      '',
      '## Collection Summary',
      '',
      '- Record count: ' + normalized.collectionRecords.length,
      '',
      '## Notes',
      '',
      escapeMarkdown(normalized.notes) || '(none)',
      '',
      '## Disclaimer',
      '',
      'This report is generated from OCR/collection data and must be verified manually before archival or publication.'
    ]);

    return {
      ok: true,
      filename: 'old-kanji-report.md',
      mimeType: 'text/markdown;charset=utf-8',
      content: sections.join('\n')
    };
  }

  function buildJsonReport(input, gate) {
    if (!canBuildReport(gate)) return denyResponse();

    var normalized = normalizeReportInput(input);
    return {
      ok: true,
      filename: 'old-kanji-report.json',
      mimeType: 'application/json;charset=utf-8',
      content: JSON.stringify({
        schemaVersion: REPORT_SCHEMA_VERSION,
        generatedAt: new Date().toISOString(),
        report: normalized
      }, null, 2)
    };
  }

  global.OldKanjiReportEngine = {
    normalizeReportInput: normalizeReportInput,
    buildMarkdownReport: buildMarkdownReport,
    buildJsonReport: buildJsonReport,
    canBuildReport: canBuildReport
  };
})(window);
