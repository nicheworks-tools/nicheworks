// CSV Tidy Pro — isolated sequential batch conversion core.
// No DOM, network, storage, authentication or Stripe behavior.
// The injected codec is the production Free CSV Tidy parser/serializer/width converter.
import { validatePreset, planPresetApplication } from './preset-core.mjs';

export const BATCH_LIMITS = Object.freeze({
  maxFiles: 32,
  maxFileBytes: 4 * 1024 * 1024,
  maxOutputBytes: 16 * 1024 * 1024
});

const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
const encoder = new TextEncoder();
const REQUIRED_CODEC = [
  'guessEncoding', 'decodeArrayBuffer', 'guessDelimiter',
  'parseCSV', 'stringifyCSV', 'convertZenHan'
];

function reject(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
function checkCodec(codec) {
  if (!codec || REQUIRED_CODEC.some(name => typeof codec[name] !== 'function')) {
    reject('codec_unavailable');
  }
}
function safeName(input) {
  let name = String(input ?? '').replace(/[\/\\:*?"<>|\x00-\x1f\x7f]/g, '_').trim();
  if (name.length > 128) name = name.slice(0, 128);
  return name || 'unnamed.csv';
}
function reportName(input, index) {
  const base = safeName(input).replace(/\.csv$/i, '');
  return String(index + 1).padStart(3, '0') + '-' + base + '.tidy.csv';
}
function asBuffer(bytes) {
  if (bytes instanceof ArrayBuffer) return bytes;
  if (ArrayBuffer.isView(bytes)) {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }
  reject('invalid_file_bytes');
}
async function readBytes(file) {
  if (!file || typeof file !== 'object') reject('invalid_file');
  if (typeof file.size === 'number' && file.size > BATCH_LIMITS.maxFileBytes) {
    reject('input_too_large');
  }
  const bytes = file.bytes === undefined
    ? (typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : undefined)
    : file.bytes;
  const buffer = asBuffer(bytes);
  if (buffer.byteLength > BATCH_LIMITS.maxFileBytes) reject('input_too_large');
  return buffer;
}
function resolvedDelimiter(selection, inputDelimiter) {
  const value = selection === 'input' ? inputDelimiter
    : selection === 'comma' ? ','
    : selection === 'tab' ? '\t'
    : selection === 'semi' ? ';' : null;
  if (![',', '\t', ';'].includes(value)) reject('invalid_output_delimiter');
  return value;
}
function transformValue(value, config, isHeader, convertZenHan) {
  let text = String(value ?? '');
  if (config.trim) text = text.trim();
  if (config.normSpaces) text = text.replace(/[ \t]{2,}/g, ' ');
  if (config.zenHan.enabled &&
      (isHeader ? config.zenHan.targetHeader : config.zenHan.targetData)) {
    text = convertZenHan(text, config.zenHan.dir);
  }
  return text;
}
function classifyError(error) {
  const code = String(error && error.code || '').trim();
  // Never put exception messages, CSV headers, cell values or raw bytes in reports.
  return /^[a-z][a-z0-9_]{1,63}$/.test(code) ? code : 'processing_failed';
}
function checkRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) reject('empty_input');
  const count = rows[0].length;
  if (!Number.isInteger(count) || count < 1) reject('invalid_source_width');
  for (let i = 0; i < rows.length; i++) {
    if (!Array.isArray(rows[i]) || rows[i].length !== count) {
      reject('inconsistent_fields');
    }
  }
  return count;
}

/**
 * Process exactly one file without mutating the Free UI or preset.
 * The result owns its bytes; callers should deliver them and release the result.
 */
export async function convertOne(file, rawPreset, codec) {
  checkCodec(codec);
  const preset = validatePreset(rawPreset);
  const sourceBuffer = await readBytes(file);
  const encoding = preset.input.encoding === 'auto'
    ? codec.guessEncoding(sourceBuffer) : preset.input.encoding;
  const rawText = codec.decodeArrayBuffer(sourceBuffer, encoding);
  let delimiter = preset.input.delimiter === 'auto'
    ? codec.guessDelimiter(rawText) : preset.input.delimiter;
  if (delimiter === 'tab') delimiter = '\t';

  const rows = codec.parseCSV(rawText, delimiter);
  const inputWidth = checkRows(rows);
  const actualSource = {
    hasHeader: preset.source.hasHeader,
    width: inputWidth,
    sourceHeaders: preset.source.hasHeader ? rows[0].slice() : null
  };
  const plan = planPresetApplication(preset, actualSource);
  if (!plan.ok) reject(plan.code);

  const mapped = plan.columns
    .filter(col => !col.excluded)
    .sort((a, b) => a.order - b.order);
  if (!mapped.length) reject('no_output_columns');
  const cleanFor = col => plan.cleaning.scope === 'all' || col.cleanApply;
  const clean = (value, col, isHeader) => cleanFor(col)
    ? transformValue(value, plan.cleaning, isHeader, codec.convertZenHan) : String(value ?? '');
  const outputRows = [];
  if (preset.source.hasHeader) {
    outputRows.push(mapped.map(col => clean(col.name, col, true)));
  }
  for (let i = preset.source.hasHeader ? 1 : 0; i < rows.length; i++) {
    const src = rows[i];
    outputRows.push(mapped.map(col => clean(src[col.srcIndex], col, false)));
  }

  const outputDelimiter = resolvedDelimiter(plan.output.delimiter, delimiter);
  const csv = codec.stringifyCSV(
    outputRows, outputDelimiter, plan.output.newline, plan.output.quotePolicy
  );
  if (typeof csv !== 'string') reject('invalid_serializer_output');
  const encoded = encoder.encode(csv);
  const length = encoded.byteLength + (plan.output.bom ? UTF8_BOM.byteLength : 0);
  if (length > BATCH_LIMITS.maxOutputBytes) reject('output_too_large');

  const result = new Uint8Array(length);
  const prefix = plan.output.bom ? UTF8_BOM.byteLength : 0;
  if (prefix) result.set(UTF8_BOM);
  result.set(encoded, prefix);
  return {
    bytes: result,
    inputRows: rows.length - (preset.source.hasHeader ? 1 : 0),
    outputColumns: mapped.length,
    inputEncoding: encoding,
    inputDelimiter: delimiter,
    outputDelimiter
  };
}

/**
 * Invoke onOutput({name,bytes,index}) for each valid result, one at a time.
 * Only metadata is retained in reports; invalid files NEVER call onOutput.
 */
export async function runBatch(files, rawPreset, codec, { onOutput, signal, stopOnError = false } = {}) {
  checkCodec(codec);
  const preset = validatePreset(rawPreset);
  if (!Array.isArray(files) || !files.length || files.length > BATCH_LIMITS.maxFiles) {
    reject('invalid_batch_size');
  }
  if (typeof onOutput !== 'function') reject('output_handler_required');
  const outcomes = [];
  let sent = 0;
  for (let index = 0; index < files.length; index++) {
    if (signal && signal.aborted) {
      outcomes.push({ index, name: safeName(files[index] && files[index].name),
        status: 'cancelled', code: 'cancelled' });
      continue;
    }
    const inputName = safeName(files[index] && files[index].name);
    const outputName = reportName(inputName, index);
    let result;
    try {
      result = await convertOne(files[index], preset, codec);
      if (signal && signal.aborted) reject('cancelled');
    } catch (error) {
      const code = classifyError(error);
      outcomes.push({ index, name: inputName,
        status: code === 'cancelled' ? 'cancelled' : 'rejected', code });
      if (stopOnError) break;
      continue;
    }
    try {
      await onOutput({ name: outputName, bytes: result.bytes, index });
      sent++;
      outcomes.push({
        index, name: inputName, outputName,
        status: 'ok', inputRows: result.inputRows, outputColumns: result.outputColumns,
        byteLength: result.bytes.byteLength
      });
    } catch (error) {
      const code = error && error.code === 'archive_budget_exceeded'
        ? 'archive_budget_exceeded' : 'output_delivery_failed';
      outcomes.push({ index, name: inputName, status: 'rejected', code });
      if (stopOnError) break;
    }
    result = null;
  }
  return {
    files: outcomes,
    accepted: sent,
    rejected: outcomes.filter(item => item.status === 'rejected').length,
    cancelled: outcomes.filter(item => item.status === 'cancelled').length
  };
}
