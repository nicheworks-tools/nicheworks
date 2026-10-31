// Build a local-only ZIP archive of valid batch outputs and a safe status report.
// A browser UI can save `bytes` as application/zip once an entitlement is verified.
import { runBatch } from './batch-core.mjs';
import { createZipStore } from './zip-store.mjs';

export const MAX_BATCH_OUTPUT_BYTES = 32 * 1024 * 1024;
const encoder = new TextEncoder();

export async function buildBatchArchive(files, preset, codec, options = {}) {
  const entries = [];
  let aggregateBytes = 0;
  const report = await runBatch(files, preset, codec, {
    signal: options.signal,
    stopOnError: options.stopOnError === true,
    onOutput({ name, bytes }) {
      if (aggregateBytes + bytes.byteLength > MAX_BATCH_OUTPUT_BYTES) {
        const error = new Error('archive_budget_exceeded');
        error.code = 'archive_budget_exceeded';
        throw error;
      }
      // We only retain outputs that have already completed full validation.
      entries.push({ name, bytes });
      aggregateBytes += bytes.byteLength;
    }
  });
  const manifest = {
    schemaVersion: 'nicheworks.csv-tidy-batch-report.v1',
    accepted: report.accepted,
    rejected: report.rejected,
    cancelled: report.cancelled,
    files: report.files
  };
  const manifestBytes = encoder.encode(JSON.stringify(manifest, null, 2) + '\n');
  if (manifestBytes.byteLength > 64 * 1024) {
    const error = new Error('report_too_large');
    error.code = 'report_too_large';
    throw error;
  }
  entries.push({ name: 'csv-tidy-report.json', bytes: manifestBytes });
  const zip = createZipStore(entries);
  return {
    name: 'csv-tidy-batch.zip',
    mimeType: 'application/zip',
    bytes: zip,
    report: manifest
  };
}
