// Dependency-free ZIP STORE (no compression, UTF-8 filenames, CRC32).
// Only accepts flat safe basenames and raw Uint8Array data; no ZIP64.
export const MAX_ZIP_BYTES = 48 * 1024 * 1024;
const encoder = new TextEncoder();
const TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let bit = 0; bit < 8; bit++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  TABLE[n] = c >>> 0;
}
function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
export function crc32(bytes) {
  if (!(bytes instanceof Uint8Array)) fail('invalid_zip_content');
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.byteLength; i++) {
    crc = TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function safeEntryName(name) {
  if (typeof name !== 'string' || !name || name === '.' || name === '..' ||
      /[\/\\\x00-\x1f\x7f]/.test(name) || name.length > 160) fail('invalid_zip_filename');
  const encoded = encoder.encode(name);
  if (encoded.length === 0 || encoded.length > 1024) fail('invalid_zip_filename');
  return encoded;
}
function writeHeader(view, offset, signature, version, flag, method, crc, byteLength, nameBytes) {
  // Local file header: 30 bytes
  view.setUint32(offset, signature, true);
  view.setUint16(offset + 4, version, true);
  view.setUint16(offset + 6, flag, true);
  view.setUint16(offset + 8, method, true);
  view.setUint16(offset + 10, 0, true);
  view.setUint16(offset + 12, 0x21, true); // 1980-01-01
  view.setUint32(offset + 14, crc, true);
  view.setUint32(offset + 18, byteLength, true);
  view.setUint32(offset + 22, byteLength, true);
  view.setUint16(offset + 26, nameBytes, true);
  view.setUint16(offset + 28, 0, true);
}
/**
 * Return a standards-conforming ZIP containing only these flat entries.
 * The caller should keep total payload bounded before calling.
 */
export function createZipStore(entries, { maxArchiveBytes = MAX_ZIP_BYTES } = {}) {
  if (!Array.isArray(entries) || !entries.length || entries.length > 64) {
    fail('invalid_zip_entries');
  }
  if (!Number.isSafeInteger(maxArchiveBytes) || maxArchiveBytes <= 0 ||
      maxArchiveBytes > MAX_ZIP_BYTES) fail('invalid_zip_budget');
  const seen = new Set();
  const records = entries.map(entry => {
    const name = entry && entry.name;
    const nameBytes = safeEntryName(name);
    if (seen.has(name)) fail('duplicate_zip_filename');
    seen.add(name);
    if (!(entry.bytes instanceof Uint8Array)) fail('invalid_zip_content');
    return {
      nameBytes, bytes: entry.bytes, size: entry.bytes.byteLength,
      checksum: crc32(entry.bytes), localOffset: 0
    };
  });
  let localSize = 0;
  let centralSize = 0;
  for (const entry of records) {
    entry.localOffset = localSize;
    localSize += 30 + entry.nameBytes.byteLength + entry.size;
    centralSize += 46 + entry.nameBytes.byteLength;
    if (!Number.isSafeInteger(localSize) || localSize + centralSize + 22 > maxArchiveBytes) {
      fail('zip_too_large');
    }
  }
  const total = localSize + centralSize + 22;
  if (total > maxArchiveBytes || total >= 0xffffffff) fail('zip_too_large');
  const archive = new Uint8Array(total);
  const view = new DataView(archive.buffer);
  let cursor = 0;
  for (const entry of records) {
    writeHeader(view, cursor, 0x04034b50, 20, 0x0800, 0, entry.checksum,
      entry.size, entry.nameBytes.byteLength);
    cursor += 30;
    archive.set(entry.nameBytes, cursor);
    cursor += entry.nameBytes.length;
    archive.set(entry.bytes, cursor);
    cursor += entry.size;
  }
  if (cursor !== localSize) fail('zip_internal_offset');
  const centralOffset = cursor;
  for (const entry of records) {
    view.setUint32(cursor, 0x02014b50, true);
    view.setUint16(cursor + 4, 20, true);
    view.setUint16(cursor + 6, 20, true);
    view.setUint16(cursor + 8, 0x0800, true); // UTF-8 filename
    view.setUint16(cursor + 10, 0, true); // STORE method
    view.setUint16(cursor + 12, 0, true);
    view.setUint16(cursor + 14, 0x21, true);
    view.setUint32(cursor + 16, entry.checksum, true);
    view.setUint32(cursor + 20, entry.size, true);
    view.setUint32(cursor + 24, entry.size, true);
    view.setUint16(cursor + 28, entry.nameBytes.length, true);
    view.setUint16(cursor + 30, 0, true);
    view.setUint16(cursor + 32, 0, true);
    view.setUint16(cursor + 34, 0, true);
    view.setUint16(cursor + 36, 0, true);
    view.setUint32(cursor + 38, 0, true);
    view.setUint32(cursor + 42, entry.localOffset, true);
    cursor += 46;
    archive.set(entry.nameBytes, cursor);
    cursor += entry.nameBytes.length;
  }
  const directorySize = cursor - centralOffset;
  view.setUint32(cursor, 0x06054b50, true);
  view.setUint16(cursor + 4, 0, true);
  view.setUint16(cursor + 6, 0, true);
  view.setUint16(cursor + 8, records.length, true);
  view.setUint16(cursor + 10, records.length, true);
  view.setUint32(cursor + 12, directorySize, true);
  view.setUint32(cursor + 16, centralOffset, true);
  view.setUint16(cursor + 20, 0, true);
  if (cursor + 22 !== archive.byteLength) fail('zip_internal_offset');
  return archive;
}
