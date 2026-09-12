export const PROFILE_SCHEMA_VERSION = 1;
export const PROFILE_STORAGE_KEY = 'nw_reconcile_profiles_v1';
export const PROFILE_BUNDLE_KIND = 'nicheworks-reconcile-profile-bundle';
export const MAX_PROFILES = 20;

const DATE_MODES = new Set(['auto', 'mdy', 'dmy']);
const SIGN_MODES = new Set(['normal', 'invert_b', 'ignore_sign']);
const ENCODINGS = new Set(['auto', 'utf-8', 'shift_jis']);
const DELIMITERS = new Set(['auto', ',', '\t', ';']);

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cleanString(value, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

function safeId(value) {
  const cleaned = cleanString(value, 120).replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  return cleaned || '';
}

function mapping(input = {}) {
  return {
    amount: cleanString(input.amount),
    date: cleanString(input.date),
    reference: cleanString(input.reference),
    description: cleanString(input.description)
  };
}

function parserSettings(input = {}) {
  const delimiter = input.delimiter === 'tab' ? '\t' : input.delimiter;
  return {
    encoding: ENCODINGS.has(input.encoding) ? input.encoding : 'auto',
    delimiter: DELIMITERS.has(delimiter) ? delimiter : 'auto',
    headerRow: Math.round(clampNumber(input.headerRow, 1, 20, 1))
  };
}

function matchingOptions(input = {}) {
  return {
    dateToleranceDays: Math.round(clampNumber(input.dateToleranceDays, 0, 31, 0)),
    amountTolerance: clampNumber(input.amountTolerance, 0, 1_000_000_000_000, 0),
    dateMode: DATE_MODES.has(input.dateMode) ? input.dateMode : 'auto',
    signMode: SIGN_MODES.has(input.signMode) ? input.signMode : 'normal',
    groupMatching: Boolean(input.groupMatching),
    maxGroupSize: Math.round(clampNumber(input.maxGroupSize, 2, 5, 5))
  };
}

function nowIso(now) {
  const date = now instanceof Date ? now : new Date(now ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function makeId(now = Date.now()) {
  const stamp = typeof now === 'number' ? now : new Date(now).getTime();
  const entropy = Math.random().toString(36).slice(2, 10);
  return `profile-${Number.isFinite(stamp) ? stamp : Date.now()}-${entropy}`;
}

export function normalizeProfile(input = {}, { now = Date.now(), preserveId = true } = {}) {
  const createdAt = nowIso(input.createdAt || now);
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    id: preserveId && safeId(input.id) ? safeId(input.id) : makeId(now),
    name: cleanString(input.name, 80) || 'Untitled profile',
    createdAt,
    updatedAt: nowIso(now),
    config: {
      parser: parserSettings(input.config?.parser),
      mappingA: mapping(input.config?.mappingA),
      mappingB: mapping(input.config?.mappingB),
      options: matchingOptions(input.config?.options)
    }
  };
}

function parseStored(storage) {
  if (!storage || typeof storage.getItem !== 'function') return [];
  try {
    const parsed = JSON.parse(storage.getItem(PROFILE_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeProfile(item, { now: item.updatedAt || item.createdAt || Date.now(), preserveId: true }));
  } catch {
    return [];
  }
}

function writeStored(storage, profiles) {
  if (!storage || typeof storage.setItem !== 'function') throw new Error('profile_storage_unavailable');
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

export function createProfileStore(storage) {
  return {
    list() {
      return parseStored(storage).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    save(input, { now = Date.now() } = {}) {
      const profiles = parseStored(storage);
      const requestedId = safeId(input?.id);
      const existingIndex = requestedId ? profiles.findIndex((item) => item.id === requestedId) : -1;
      const existing = existingIndex >= 0 ? profiles[existingIndex] : null;
      const normalized = normalizeProfile({
        ...input,
        id: existing?.id || requestedId,
        createdAt: existing?.createdAt || input?.createdAt
      }, { now, preserveId: Boolean(existing?.id || requestedId) });
      if (existingIndex >= 0) profiles.splice(existingIndex, 1);
      profiles.unshift(normalized);
      writeStored(storage, profiles.slice(0, MAX_PROFILES));
      return normalized;
    },

    remove(id) {
      const target = safeId(id);
      const profiles = parseStored(storage);
      const next = profiles.filter((item) => item.id !== target);
      writeStored(storage, next);
      return next.length !== profiles.length;
    },

    clear() {
      writeStored(storage, []);
    },

    exportBundle({ now = Date.now() } = {}) {
      return JSON.stringify({
        kind: PROFILE_BUNDLE_KIND,
        version: PROFILE_SCHEMA_VERSION,
        exportedAt: nowIso(now),
        profiles: this.list()
      }, null, 2);
    },

    importBundle(text, { replace = false, now = Date.now() } = {}) {
      let parsed;
      try {
        parsed = JSON.parse(String(text ?? ''));
      } catch {
        throw new Error('profile_bundle_invalid_json');
      }
      if (parsed?.kind !== PROFILE_BUNDLE_KIND || parsed?.version !== PROFILE_SCHEMA_VERSION || !Array.isArray(parsed.profiles)) {
        throw new Error('profile_bundle_invalid_schema');
      }
      const incoming = parsed.profiles.slice(0, MAX_PROFILES).map((item, index) => normalizeProfile(item, {
        now: new Date(new Date(now).getTime() + index),
        preserveId: true
      }));
      const base = replace ? [] : parseStored(storage);
      const byId = new Map(base.map((item) => [item.id, item]));
      for (const profile of incoming) byId.set(profile.id, profile);
      const merged = [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_PROFILES);
      writeStored(storage, merged);
      return { imported: incoming.length, total: merged.length, replaced: Boolean(replace) };
    }
  };
}
