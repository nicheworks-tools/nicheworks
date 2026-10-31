// CSV Tidy Pro: pure, local-only mapping preset contract.
// This module does not parse CSV, mutate the Free editor, store data or authorize purchases.
export const PRESET_VERSION = 'nicheworks.csv-tidy-pro-preset.v1';
export const MAX_PRESET_BYTES = 256 * 1024;
export const MAX_SOURCE_COLUMNS = 4096;

const INPUT_ENCODINGS = new Set(['auto', 'utf-8', 'shift_jis']);
const INPUT_DELIMITERS = new Set(['auto', ',', 'tab', ';']);
const OUTPUT_DELIMITERS = new Set(['input', 'comma', 'tab', 'semi']);
const DIRECTIONS = new Set(['zen2han', 'han2zen']);
const NEWLINES = new Set(['lf', 'crlf']);
const SCOPES = new Set(['all', 'selected']);
const QUOTE_POLICIES = new Set(['auto', 'always']);

function fail(code, detail = '') {
  const error = new Error(detail || code);
  error.code = code;
  throw error;
}
function object(value, context, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_' + context);
  const actual = Object.keys(value).sort().join('|');
  const expected = keys.slice().sort().join('|');
  if (actual !== expected) fail('invalid_' + context, context + ': unexpected/missing keys');
  return value;
}
function string(value, context, maxLength, allowEmpty = true) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > maxLength) {
    fail('invalid_' + context);
  }
  return value;
}
function boolean(value, context) {
  if (typeof value !== 'boolean') fail('invalid_' + context);
  return value;
}
function choice(value, allowed, context) {
  if (!allowed.has(value)) fail('invalid_' + context);
  return value;
}
function width(value) {
  if (!Number.isInteger(value) || value <= 0 || value > MAX_SOURCE_COLUMNS) {
    fail('invalid_source_width');
  }
  return value;
}
function validateSource(input) {
  const src = object(input, 'source', ['hasHeader', 'width', 'sourceHeaders']);
  const hasHeader = boolean(src.hasHeader, 'header_mode');
  const count = width(src.width);
  if (hasHeader !== Array.isArray(src.sourceHeaders)) fail('invalid_source_headers');
  if (hasHeader && src.sourceHeaders.length !== count) fail('invalid_source_headers');
  const sourceHeaders = hasHeader
    ? src.sourceHeaders.map(header => string(header, 'header_name', 8192))
    : null;
  return { hasHeader, width: count, sourceHeaders };
}
function validateColumns(columns, sourceWidth) {
  if (!Array.isArray(columns) || columns.length !== sourceWidth) fail('invalid_columns');
  const positions = new Set();
  const orders = new Set();
  const clean = columns.map(column => {
    object(column, 'column', ['srcIndex', 'order', 'name', 'excluded', 'cleanApply']);
    if (!Number.isInteger(column.srcIndex) || column.srcIndex < 0 || column.srcIndex >= sourceWidth ||
        positions.has(column.srcIndex)) fail('invalid_column_position');
    if (!Number.isInteger(column.order) || column.order < 0 || column.order >= sourceWidth ||
        orders.has(column.order)) fail('invalid_column_order');
    positions.add(column.srcIndex);
    orders.add(column.order);
    return {
      srcIndex: column.srcIndex,
      order: column.order,
      name: string(column.name, 'column_name', 8192),
      excluded: boolean(column.excluded, 'column_exclusion'),
      cleanApply: boolean(column.cleanApply, 'column_cleaning_selection')
    };
  });
  return clean.sort((a, b) => a.srcIndex - b.srcIndex);
}
function validateCleaning(value) {
  object(value, 'cleaning', ['scope', 'trim', 'normSpaces', 'zenHan']);
  const z = object(value.zenHan, 'zen_han', ['enabled', 'dir', 'targetHeader', 'targetData']);
  return {
    scope: choice(value.scope, SCOPES, 'cleaning_scope'),
    trim: boolean(value.trim, 'trim'),
    normSpaces: boolean(value.normSpaces, 'norm_spaces'),
    zenHan: {
      enabled: boolean(z.enabled, 'zen_han_enabled'),
      dir: choice(z.dir, DIRECTIONS, 'zen_han_direction'),
      targetHeader: boolean(z.targetHeader, 'zen_han_header'),
      targetData: boolean(z.targetData, 'zen_han_data')
    }
  };
}
function validateInputOptions(value) {
  object(value, 'input_options', ['encoding', 'delimiter']);
  return {
    encoding: choice(value.encoding, INPUT_ENCODINGS, 'input_encoding'),
    delimiter: choice(value.delimiter, INPUT_DELIMITERS, 'input_delimiter')
  };
}
function validateOutput(value) {
  object(value, 'output', ['delimiter', 'quotePolicy', 'newline', 'bom']);
  return {
    delimiter: choice(value.delimiter, OUTPUT_DELIMITERS, 'output_delimiter'),
    quotePolicy: choice(value.quotePolicy, QUOTE_POLICIES, 'quote_policy'),
    newline: choice(value.newline, NEWLINES, 'output_newline'),
    bom: boolean(value.bom, 'output_bom')
  };
}

/** Return a normalized clone, rejecting unknown fields and malformed mappings. */
export function validatePreset(value) {
  object(value, 'preset', ['schemaVersion', 'label', 'source', 'columns', 'input', 'cleaning', 'output']);
  if (value.schemaVersion !== PRESET_VERSION) fail('unsupported_preset_version');
  const source = validateSource(value.source);
  const preset = {
    schemaVersion: PRESET_VERSION,
    label: string(value.label, 'preset_label', 120, false),
    source,
    columns: validateColumns(value.columns, source.width),
    input: validateInputOptions(value.input),
    cleaning: validateCleaning(value.cleaning),
    output: validateOutput(value.output)
  };
  if (new TextEncoder().encode(JSON.stringify(preset)).length > MAX_PRESET_BYTES) {
    fail('preset_too_large');
  }
  return preset;
}

/** Capture a named local mapping without CSV rows or file contents. */
export function capturePreset({ label, source, columns, input, cleaning, output }) {
  return validatePreset({
    schemaVersion: PRESET_VERSION, label, source, columns, input, cleaning, output
  });
}

/** Persist only the explicit allow-listed, versioned preset model. */
export function serializePreset(value) {
  return JSON.stringify(validatePreset(value), null, 2) + '\n';
}

/** Import a JSON preset; never execute code or accept a new schema silently. */
export function deserializePreset(json) {
  if (typeof json !== 'string' || new TextEncoder().encode(json).length > MAX_PRESET_BYTES) {
    fail('preset_too_large');
  }
  let value;
  try { value = JSON.parse(json); }
  catch { fail('invalid_preset_json'); }
  return validatePreset(value);
}

/**
 * Produce a new, positional application plan. This function does not mutate the
 * currently loaded CSV or attempt to repair mismatched headers/columns.
 */
export function planPresetApplication(rawPreset, actualSource) {
  const preset = validatePreset(rawPreset);
  const actual = validateSource(actualSource);
  if (actual.hasHeader !== preset.source.hasHeader) {
    return { ok: false, code: 'header_mode_mismatch' };
  }
  if (actual.width !== preset.source.width) {
    return { ok: false, code: 'column_width_mismatch', expected: preset.source.width, actual: actual.width };
  }
  if (actual.hasHeader) {
    for (let index = 0; index < actual.width; index++) {
      if (actual.sourceHeaders[index] !== preset.source.sourceHeaders[index]) {
        return { ok: false, code: 'source_header_mismatch', column: index + 1 };
      }
    }
  }
  return {
    ok: true,
    columns: preset.columns.map(col => ({ ...col })),
    input: { ...preset.input },
    cleaning: { ...preset.cleaning, zenHan: { ...preset.cleaning.zenHan } },
    output: { ...preset.output }
  };
}
