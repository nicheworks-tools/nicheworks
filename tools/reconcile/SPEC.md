# Tool Specification — NicheWorks Reconcile

- Slug: `reconcile`
- Public URL target: `https://nicheworks.app/tools/reconcile/`
- Specification status: `implementation-draft`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Reconcile two transaction datasets locally in the browser and isolate exact matches, tolerant matches, ambiguous candidates, conflicts, duplicates, and unmatched records so users can focus manual review on exceptions.

## Current functional contract

On this isolated development branch, the implemented contract is CSV-only: load two CSV files, select semantic columns, run deterministic 1:1 matching, filter/search results, and export the reconciliation result CSV. Final v1 additionally requires XLSX and Reconcile Pro integration before publication.

## Inputs

- CSV file A and CSV file B.
- Encoding selection: Auto / UTF-8 / Shift_JIS.
- Delimiter selection: Auto / comma / tab / semicolon.
- Header row 1–20.
- Required Amount mapping on both sides.
- Optional Date, Reference, and Description mappings.
- Date tolerance 0 or ±1 day in the current Free core.
- Ambiguous date interpretation mode.

## Outputs

- File previews.
- Result summary counts.
- Deterministic status rows: exact_match, tolerant_match, candidate, a_only, b_only, duplicate, conflict.
- Filtered/searched result table.
- UTF-8 BOM CSV export.

## State and persistence

Transaction rows remain in memory and disappear on reload. The shared language preference uses `localStorage` key `nw_lang`. No transaction rows are stored in localStorage.

## Privacy and network behavior

CSV file contents are processed locally. The isolated implementation contains no API call that transmits parsed transaction rows. Suite-wide analytics/advertising are intentionally not added on this branch until publication integration is performed against the then-current common/SEO contracts.

## Language mode

Bilingual single-page JA/EN UI.

## Layout class

`pc-oriented`. Wide file previews, column mapping, result summary and result tables are primary. Mobile remains functional through stacking and horizontally scrollable tables.

## Limits and non-goals

Current isolated Free core is limited to 500 rows and 5 MB per CSV. XLSX, 1:n/n:1, Pro amount tolerance, sign modes, billing, accounts, cloud storage, AI matching, OCR, PDF and bank APIs are not part of the current implementation wave.

## Acceptance criteria

- Two valid CSVs up to the Free limits load without sending transaction rows to a server.
- Amount mapping is mandatory and invalid amounts are not silently converted to zero.
- An exact unique 1:1 match is classified exact_match.
- A unique match inside the enabled date tolerance is classified tolerant_match.
- Multiple acceptable matches produce candidate rather than arbitrary selection.
- Same reference with different amount is conflict.
- Unaccepted rows remain side-specific unmatched records.
- Duplicate signatures are surfaced separately.
- Running the same data/mapping/settings produces the same result ordering and classifications.
- Result filtering/search does not mutate the reconciliation result.
- CSV export includes status, relation, source row references, normalized amount/date, and reason.

## Implementation evidence

- `tools/reconcile/index.html`
- `tools/reconcile/app.mjs`
- `tools/reconcile/parser.mjs`
- `tools/reconcile/normalize.mjs`
- `tools/reconcile/reconcile-engine.mjs`
- `tools/reconcile/export.mjs`
- `tools/reconcile/tests/reconcile-engine.test.mjs`
