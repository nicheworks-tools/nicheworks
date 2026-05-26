(function (global) {
  'use strict';

  var HISTORY_SCHEMA_VERSION = 'okj-ocr-history-v1';
  var COLLECTION_SCHEMA_VERSION = 'okj-old-kanji-collection-v1';
  var HISTORY_STORAGE_KEY = 'okj.scanHistory.v1';
  var COLLECTION_STORAGE_KEY = 'okj.oldKanjiCollection.v1';
  var MAX_PERSISTED_RECORDS = 100;

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

  function isActiveGate(gate) {
    return !!(gate && gate.active === true);
  }

  function canPersistHistory(gate) {
    return isActiveGate(gate);
  }

  function canPersistCollection(gate) {
    return isActiveGate(gate);
  }

  function getStorage() {
    if (!global || !global.localStorage) return null;
    return global.localStorage;
  }

  function safeParseArray(value) {
    if (typeof value !== 'string' || value.length === 0) return [];
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function safeListRecords(storageKey, normalizeRecord) {
    var storage = getStorage();
    if (!storage) {
      return { ok: false, error: 'persistence_disabled', records: [] };
    }

    var records = safeParseArray(storage.getItem(storageKey));
    return {
      ok: true,
      records: records.map(function (record) { return normalizeRecord(record); })
    };
  }

  function safeSaveRecord(storageKey, normalizeRecord, input, gate) {
    if (!isActiveGate(gate)) {
      return { ok: false, error: 'pro_required' };
    }

    var storage = getStorage();
    if (!storage) {
      return { ok: false, error: 'persistence_disabled' };
    }

    var normalized = normalizeRecord(input);
    var existing = safeParseArray(storage.getItem(storageKey)).map(function (record) {
      return normalizeRecord(record);
    });
    existing.unshift(normalized);
    if (existing.length > MAX_PERSISTED_RECORDS) {
      existing = existing.slice(0, MAX_PERSISTED_RECORDS);
    }

    try {
      storage.setItem(storageKey, JSON.stringify(existing));
      return { ok: true, record: normalized, total: existing.length };
    } catch (_error) {
      return { ok: false, error: 'persistence_disabled' };
    }
  }

  function safeClearRecords(storageKey, gate) {
    if (!isActiveGate(gate)) {
      return { ok: false, error: 'pro_required' };
    }

    var storage = getStorage();
    if (!storage) {
      return { ok: false, error: 'persistence_disabled' };
    }

    try {
      storage.removeItem(storageKey);
      return { ok: true };
    } catch (_error) {
      return { ok: false, error: 'persistence_disabled' };
    }
  }

  function saveHistoryRecord(input, gate) {
    return safeSaveRecord(HISTORY_STORAGE_KEY, normalizeHistoryRecord, input, gate);
  }

  function saveCollectionRecord(input, gate) {
    return safeSaveRecord(COLLECTION_STORAGE_KEY, normalizeCollectionRecord, input, gate);
  }

  function listHistoryRecords(gate) {
    if (!isActiveGate(gate)) return { ok: false, error: 'pro_required', records: [] };
    return safeListRecords(HISTORY_STORAGE_KEY, normalizeHistoryRecord);
  }

  function listCollectionRecords(gate) {
    if (!isActiveGate(gate)) return { ok: false, error: 'pro_required', records: [] };
    return safeListRecords(COLLECTION_STORAGE_KEY, normalizeCollectionRecord);
  }

  function clearHistoryRecords(gate) {
    return safeClearRecords(HISTORY_STORAGE_KEY, gate);
  }

  function clearCollectionRecords(gate) {
    return safeClearRecords(COLLECTION_STORAGE_KEY, gate);
  }

  global.OldKanjiHistoryCollection = {
    createHistoryRecord: createHistoryRecord,
    createCollectionRecord: createCollectionRecord,
    normalizeHistoryRecord: normalizeHistoryRecord,
    normalizeCollectionRecord: normalizeCollectionRecord,
    canPersistHistory: canPersistHistory,
    canPersistCollection: canPersistCollection,
    saveHistoryRecord: saveHistoryRecord,
    saveCollectionRecord: saveCollectionRecord,
    listHistoryRecords: listHistoryRecords,
    listCollectionRecords: listCollectionRecords,
    clearHistoryRecords: clearHistoryRecords,
    clearCollectionRecords: clearCollectionRecords
  };
})(window);
