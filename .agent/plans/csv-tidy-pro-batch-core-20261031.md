# ExecPlan — CSV Tidy Pro batch engine (2026-10-31)

## Scope
Implement a *non-UI*, locally executed, sequential multi-CSV processing engine in `tools/csv-tidy/pro/batch-core.mjs`, plus its tests, new CI and Pro-spec status. No Free UI or behavior changes. No Stripe checkout or Pro unlock changes.

## Reuse strategy
The engine receives a six-function *injected pure codec* (guessEncoding, decodeArrayBuffer, guessDelimiter, parseCSV, stringifyCSV, convertZenHan) that can be provided by the existing production CSV Tidy logic. This avoids reimplementing the strict parser/serializer and makes it possible to independently compare against existing Free output in Node tests. A browser adapter exposing that codec is a subsequent integration task, not part of this scope.

## Invariants
1. Validate the preset once and each file independently; capture no global CSV state.
2. Parse strict quotes, exact logical row widths, fatal decoding and delimiter ambiguity using the production codec; failures yield no output.
3. Apply precise source-position mapping and cleaning per column; preserve duplicate/empty headers and empty records. Reject header/width mismatch without auto-correction.
4. Process files sequentially with a bounded per-file input and output. Release bytes/results after output callback. No CSV payload is ever sent to network/server/logs.
5. Every file report is bounded and contains only the file's sanitized basename, status, code, counts and output basename; no cell values.
6. No output callback on invalid or mismatched input. Other files continue unless caller requests stop/cancel. A failed export callback is reported as a failure.
7. Output bytes must be independently CSV-reparsed, not only checked by production parser.

## Files
- `.agent/plans/csv-tidy-pro-batch-core-20261031.md` (this plan).
- `tools/csv-tidy/pro/batch-core.mjs` (new).
- `tools/csv-tidy/tests/pro-batch-core.mjs` (new, real production codec via test harness).
- `.github/workflows/csv-tidy-pro-batch-core.yml` (new scoped CI).
- `tools/csv-tidy/PRO-SPEC.md` (append status).

## Acceptance
Strict data integrity tests, per-file failure isolation and production-codec equivalence pass. Existing CSV Tidy browser acceptance, Pro product checkout-disabled checks and all repo PR CI pass. Leave checkout disabled and do not expose unfinished functionality as a purchasable product. Merge only after checks pass.
