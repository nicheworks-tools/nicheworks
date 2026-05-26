(function (global) {
  'use strict';

  var HISTORY_SCHEMA_VERSION = 'okj-ocr-history-v1';
  var COLLECTION_SCHEMA_VERSION = 'okj-old-kanji-collection-v1';

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    return prefix + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function normalizeString(value, fallback) {
    return typeof value === 'string' ? value : fallback;
  }

  function normalizeStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(function (item) { return typeof item === 'string' && item.length > 0; });
  }

  function normalizeDetectedOldKanji(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map(function (item) {
        var old = normalizeString(item && item.old, '');
        var modern = normalizeStringArray(item && item.modern);
        var count = Number.isFinite(item && item.count) ? Math.max(0, Math.floor(item.count)) : 0;
        return { old: old, modern: modern, count: count };
      })
      .filter(function (item) { return item.old.length > 0; });
  }

  function normalizeHistoryRecord(input) {
    var record = input || {};
    var sourceType = record.sourceType === 'manual' ? 'manual' : 'image';

    return {
      id: normalizeString(record.id, createId('okj-history-')),
      createdAt: normalizeString(record.createdAt, nowIso()),
      sourceType: sourceType,
      sourceLabel: normalizeString(record.sourceLabel, ''),
      ocrText: normalizeString(record.ocrText, ''),
      detectedOldKanji: normalizeDetectedOldKanji(record.detectedOldKanji),
      notes: normalizeString(record.notes, ''),
      tags: normalizeStringArray(record.tags),
      schemaVersion: HISTORY_SCHEMA_VERSION
    };
  }

  function normalizeCollectionRecord(input) {
    var record = input || {};
    var source = (record.source === 'manual' || record.source === 'reference') ? record.source : 'ocr';

    return {
      id: normalizeString(record.id, createId('okj-collection-')),
      createdAt: normalizeString(record.createdAt, nowIso()),
      old: normalizeString(record.old, ''),
      modern: normalizeStringArray(record.modern),
      source: source,
      notes: normalizeString(record.notes, ''),
      tags: normalizeStringArray(record.tags),
      schemaVersion: COLLECTION_SCHEMA_VERSION
    };
  }

  function createHistoryRecord(input) {
    return normalizeHistoryRecord(input);
  }

  function createCollectionRecord(input) {
    return normalizeCollectionRecord(input);
  }

  global.OldKanjiHistoryCollection = {
    createHistoryRecord: createHistoryRecord,
    createCollectionRecord: createCollectionRecord,
    normalizeHistoryRecord: normalizeHistoryRecord,
    normalizeCollectionRecord: normalizeCollectionRecord
  };
})(window);
