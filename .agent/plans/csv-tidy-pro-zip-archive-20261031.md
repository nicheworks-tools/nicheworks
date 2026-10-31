# ExecPlan — CSV Tidy Pro ZIP archive and per-file report

## Goal
Finish the offline batch output transport: combine only valid CSV byte results into one ZIP with a bounded machine-readable per-file report. No NPM package, no upload, no billing/Free UI change.

## Files and scope
- New `tools/csv-tidy/pro/zip-store.mjs`: deterministic ZIP STORE writer (UTF-8 names, CRC32, central directory, filename sanitization, no Zip64).
- New `tools/csv-tidy/pro/batch-archive.mjs`: turn production-codec batch output into a bounded ZIP and metadata report.
- New `tools/csv-tidy/tests/pro-batch-archive.mjs`: actual production codec, independent Python `zipfile` and `csv.reader` reparse, invalid-file isolation, archive limit behavior.
- New `.github/workflows/csv-tidy-pro-batch-archive.yml` plus this ExecPlan and PRO-SPEC status.

## Contracts
- Never include the raw source CSV in archive, only valid transformed CSV and a `csv-tidy-report.json` with file name, output name, accepted/rejected status, safe failure code, counts.
- Deduplicate output names predictably via batch index, no path traversal/unsafe ZIP paths or overwritten duplicate entries.
- ZIP is generated locally, with a 32 MiB collective output cap; each individual input/output cap stays as in batch-core (4 MiB input, 16 MiB output).
- Reject unsafe file-entry names and all unsupported structures. Correct CRC32/central-directory offsets are verified via independent Python.
- Do not silently discard invalid file statuses; report includes all attempted files.
- Do not alter Free core, public UI, payment configuration or existing checkouts.

## Follow-on gate
Browser adapter, licensed customer UI and purchase recovery remain unimplemented until separately tested. Product is still unpurchasable. No merge until all focused and repository CI pass.
