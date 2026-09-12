# Tool Specification — NicheWorks Reconcile

- Slug: `reconcile`
- Public URL target: `https://nicheworks.app/tools/reconcile/`
- Specification status: `implementation-draft`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Reconcile two transaction datasets locally in the browser and isolate exact matches, tolerant matches, ambiguous candidates, conflicts, duplicates, and unmatched records so users can focus manual review on exceptions.

## Current branch contract

The isolated implementation branch contains the complete CSV reconciliation flow, the advanced matching engine, the XLSX adapter/report layer, and a local saved-profile subsystem. Public billing and publication integration are intentionally absent.

CSV input is operational. XLSX parsing/export code is present, including worksheet selection and seven-sheet report generation, but the pinned SheetJS vendor file is not yet committed. Therefore XLSX remains unavailable in the browser until that vendor file is added.

Reconcile Pro controls are rendered but locked because no entitlement adapter is connected on this isolated branch. The code path for amount tolerance, sign modes, grouped matching, larger files, XLSX export, and saved profiles is already wired behind that lock.

## Inputs

### Free core

- CSV file A and CSV file B.
- XLSX file A and XLSX file B once the pinned local XLSX vendor is present.
- Encoding selection for CSV: Auto / UTF-8 / Shift_JIS.
- Delimiter selection for CSV: Auto / comma / tab / semicolon.
- Header row 1–20.
- Required Amount mapping on both sides.
- Optional Date, Reference, and Description mappings.
- Date tolerance 0 or ±1 day.
- Ambiguous date interpretation mode: reject ambiguous / MDY / DMY.
- Free file cap: 500 parsed rows and 5 MB per file.

### Reconcile Pro engine contract

- CSV cap: 100,000 parsed rows and 50 MB per file.
- XLSX cap: 50,000 parsed rows and 25 MB per file.
- Amount tolerance >= 0.
- Sign mode: normal / invert B / ignore sign.
- Optional 1:n and n:1 matching.
- Group size bounded to 2–5 rows.
- Group-search safety budget defaults to 50,000 visited nodes in the engine; a truncated search becomes a review candidate instead of an automatic match.
- 1:1 candidate-graph safety budget defaults to 100,000 acceptable A↔B edges and is hard-clamped to at most 500,000. The engine stops before partial automatic resolution if the graph exceeds the budget.
- File/row caps are product safety limits, not claims about theoretical browser capacity.

## Normalization behavior

- Text and references use Unicode NFKC normalization so full-width identifiers and digits are handled consistently.
- Amount parsing supports ordinary signs, accounting parentheses, trailing minus notation, common currency symbols/codes, comma thousands separators, and unambiguous decimal-comma forms such as `1234,56` / `1.234,56`.
- Malformed or materially ambiguous amount strings are rejected instead of being coerced to a number.
- Dates accept ISO-like YMD and explicit MDY/DMY modes. Ambiguous day/month input is rejected in Auto mode.
- Valid date-time suffixes may follow a parsed calendar date; arbitrary text glued directly onto a date is not accepted.

## Matching behavior

The engine is deterministic and explanation-first. It does not use AI or probabilistic auto-resolution.

1. Normalize amount, date, reference, and description fields.
2. Detect invalid amounts and invalid/ambiguous dates without silently coercing them to zero or an arbitrary date.
3. Detect uniquely identifiable same-reference amount conflicts using the configured amount tolerance.
4. Prefer exact non-empty Reference relationships before lower-information fallback matching.
5. Search 1:1 candidates using indexed amount lookup instead of a full Cartesian scan.
6. Require date/reference compatibility when both mapped sides provide those fields.
7. Auto-accept a 1:1 pair only when the relationship is mutually unique; a row is never awarded to whichever A-side row happens to appear first.
8. Recompute mutual uniqueness after accepted pairs so resolvable chains collapse deterministically.
9. Emit unresolved competing rows as candidate, including the case where multiple A rows claim the same sole B candidate.
10. Count acceptable 1:1 candidate edges while building each graph. If the configured edge budget is exceeded, abort the reconciliation with `candidate_graph_too_large` before accepting a partial graph; the UI tells the user to narrow the match space with Date and/or Transaction ID / Reference.
11. When Pro grouped matching is enabled, search bounded 1:n and n:1 combinations up to five members.
12. If grouped search exceeds the node budget, emit candidate and require manual review.
13. Preserve unmatched rows as a_only / b_only and surface duplicate signatures separately.

## CSV row identity

Blank physical rows may be skipped for reconciliation, but the retained records keep their original source row numbers. Result row references therefore continue to point to the actual source-file rows even when blank lines occur between transactions or the selected header is below row 1.

## Outputs

- File previews.
- Worksheet selector for multi-sheet XLSX sources.
- Result summary counts.
- Deterministic status rows: exact_match, tolerant_match, candidate, a_only, b_only, duplicate, conflict.
- Per-result relation (1:1 / 1:n / n:1 / unmatched/candidate relation).
- Source row references, normalized amount/date, and human-readable reason.
- Filtered/searched result table.
- UTF-8 BOM CSV export.
- Pro XLSX report adapter with sheets: Summary, Matches, Candidates, A Only, B Only, Duplicates, Conflicts.

## Saved profiles

Reconcile Pro profiles are browser-local configuration records.

Stored:
- CSV parser settings: encoding, delimiter, header row.
- File A/B column mappings.
- Matching settings: date tolerance, amount tolerance, date mode, sign mode, grouped matching, maximum group size.
- Profile metadata: local id, name, created/updated timestamps.

Not stored:
- transaction rows;
- uploaded file bytes;
- result rows;
- account or payment data.

Profile rules:
- localStorage key: `nw_reconcile_profiles_v1`;
- schema version: 1;
- maximum 20 profiles;
- import/export format: versioned JSON bundle `nicheworks-reconcile-profile-bundle`;
- imported values are sanitized and numeric bounds are clamped before storage;
- saved date tolerance is clamped to the public 0/±1-day contract;
- applying a profile to files that do not contain saved column names clears those missing mappings and warns the user instead of silently substituting another column.

## XLSX dependency contract

- SheetJS Community Edition is pinned to version `0.20.3`.
- Use the browser `xlsx.mini.min.js` build, not the full build, because Reconcile only requires XLSX read/write and does not need the legacy-format/codepage surface of the full bundle.
- Runtime CDN loading is not permitted; the final script must be committed locally at `tools/reconcile/vendor/xlsx.mini.min.js`.
- Two independent GitHub vendor copies were verified to contain identical bytes: Git blob SHA `5bf1c223ce4bd59685ba711b77dce6da7a9747b8`, size `279523` bytes.
- Recorded SHA-256 for the selected 0.20.3 mini build: `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`.
- `xlsx-adapter.mjs` rejects a loaded runtime whose reported `XLSX.version` is not exactly `0.20.3`.
- Apache-2.0 attribution/license requirements are preserved under `tools/reconcile/vendor/`.

## State and persistence

Transaction rows and reconciliation results remain in page memory and disappear on reload. The shared language preference uses `localStorage` key `nw_lang`. Saved profiles use `nw_reconcile_profiles_v1` and contain configuration only.

## Privacy and network behavior

Transaction file contents are processed locally. The isolated implementation contains no API call that transmits parsed transaction rows. Runtime CDN loading is not allowed for XLSX; the final browser parser/writer must be a pinned local vendor file. Suite-wide analytics/advertising and billing requests are intentionally not added on this branch until publication/billing integration is performed against the then-current shared contracts.

## Language mode

Bilingual single-page JA/EN UI.

## Layout class

`pc-oriented`. Wide file previews, column mapping, advanced rules, result summary, and result tables are primary. Mobile remains functional through stacking and horizontally scrollable tables.

## Product boundary / non-goals

v1 does not include accounts, cloud transaction storage, AI matching, OCR, PDF input, bank/Open Banking APIs, QuickBooks/Xero APIs, team workspaces, or server-side reconciliation.

## Billing boundary

The isolated branch hard-locks Pro controls. Billing integration is a separate later PR and must use the shared server-side Stripe/D1 entitlement foundation. A Reconcile Pro purchase is intended to grant both product entitlement `reconcile_pro_v1` and shared `nicheworks_pro`; shared Pro alone does not grant Reconcile Pro. URL-only purchase redirects are not accepted as the durable entitlement mechanism.

## Acceptance criteria

- Two valid CSVs up to the Free limits load without sending transaction rows to a server.
- Free files above 500 rows or 5 MB are rejected.
- Pro CSV files above 100,000 rows or 50 MB are rejected; Pro XLSX files above 50,000 rows or 25 MB are rejected.
- Amount mapping is mandatory and invalid amounts are not silently converted to zero.
- Common Japanese/international financial amount notations covered by the normalization contract parse deterministically.
- Ambiguous/malformed amount and date values are rejected rather than guessed.
- An exact mutually unique 1:1 match is classified exact_match.
- A mutually unique match inside enabled tolerances is classified tolerant_match.
- Multiple acceptable matches produce candidate rather than arbitrary selection.
- Multiple A rows competing for the same sole B row remain candidates; input row ordering cannot assign that B row arbitrarily.
- Exact Reference matches may resolve before blank-reference fallback rows, and reversing the A row order does not change the resulting match/candidate counts.
- Same reference with an amount difference outside tolerance is conflict when that reference identifies a unique A/B pair.
- Unaccepted rows remain side-specific unmatched records.
- Duplicate signatures are surfaced separately.
- Physical source row numbers survive skipped blank rows and non-row-1 headers.
- Running the same data/mapping/settings produces the same result ordering and classifications.
- Result filtering/search does not mutate the reconciliation result.
- CSV export includes status, relation, source row references, normalized amount/date, and reason.
- A pathological dense 1:1 candidate graph stops before partial automatic matching when its edge budget is exceeded.
- A dense same-amount dataset with unique exact References can still resolve through the Reference-priority path without triggering the generic candidate graph limit.
- Grouped matching never searches beyond the configured safety budget without degrading to manual review.
- Saved profiles never contain transaction rows or file bytes.
- Invalid profile JSON/schema is rejected; imported options are normalized before persistence.
- Pro controls remain unavailable until a real entitlement adapter enables them.
- XLSX browser behavior is not declared complete until the pinned local vendor file is committed and browser-tested.

## Implementation evidence

- `tools/reconcile/index.html`
- `tools/reconcile/app.mjs`
- `tools/reconcile/parser.mjs`
- `tools/reconcile/normalize.mjs`
- `tools/reconcile/reconcile-engine.mjs`
- `tools/reconcile/export.mjs`
- `tools/reconcile/xlsx-adapter.mjs`
- `tools/reconcile/rules-store.mjs`
- `tools/reconcile/vendor/README.md`
- `tools/reconcile/vendor/LICENSE.sheetjs`
- `tools/reconcile/vendor/NOTICE.sheetjs.txt`
- `tools/reconcile/tests/normalize.test.mjs`
- `tools/reconcile/tests/parser.test.mjs`
- `tools/reconcile/tests/reconcile-engine.test.mjs`
- `tools/reconcile/tests/xlsx-adapter.test.mjs`
- `tools/reconcile/tests/rules-store.test.mjs`
