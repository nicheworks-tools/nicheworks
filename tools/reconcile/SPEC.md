# Tool Specification — NicheWorks Reconcile

- Slug: `reconcile`
- Public URL: `https://nicheworks.app/tools/reconcile/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Reconcile two transaction datasets locally in the browser and isolate exact matches, tolerant matches, ambiguous candidates, conflicts, duplicates, and unmatched records so users can focus manual review on exceptions rather than comparing rows by hand.

## Current functional contract

- Accept two CSV or XLSX transaction files and map Amount plus optional Date, Reference, and Description columns on each side.
- Parse CSV with Auto / UTF-8 / Shift_JIS encoding, Auto / comma / tab / semicolon delimiter, and header rows 1–20.
- Read XLSX through the locally vendored SheetJS CE `0.20.3` mini build and allow deterministic worksheet selection.
- Normalize text/reference values with Unicode NFKC, parse supported financial amount formats deterministically, and reject malformed or materially ambiguous values rather than guessing.
- Parse ISO-like dates and explicit MDY/DMY modes; Auto mode rejects ambiguous day/month input.
- Detect same-side duplicate signatures first and reserve duplicate-member rows so one source row cannot appear in multiple primary outcomes.
- Resolve unique same-reference conflicts and exact Reference relationships before lower-information fallback matching.
- Auto-accept 1:1 matches only when the relationship is mutually unique. Competing rows remain `candidate` instead of being assigned by input order.
- Classify results as `exact_match`, `tolerant_match`, `candidate`, `a_only`, `b_only`, `duplicate`, or `conflict`.
- Preserve physical source row numbers across blank rows and non-row-1 headers.
- Bound ordinary candidate graphs and grouped matching searches so pathological inputs stop or degrade to manual review rather than partially auto-resolving.
- Provide result counts, status filtering, text search, CSV audit export, and a seven-sheet XLSX report implementation.
- Reconcile Pro enables amount tolerance, sign modes, larger limits, 1:n / n:1 matching, XLSX report export, and saved profiles only after server verification of product `reconcile.pro_v1` with feature `reconcile_pro_v1`.
- A Reconcile Pro purchase is ¥3,980 JPY one-time and grants both `reconcile_pro_v1` and shared `nicheworks_pro`. A shared NicheWorks Pro entitlement by itself must not unlock Reconcile Pro.
- Store saved profile configuration locally only while Reconcile Pro is active; profile code never stores transaction rows or uploaded file bytes.

### Matching safety bounds

- Generic 1:1 candidate graph default budget: `100000` acceptable A↔B edges; hard clamp: `500000`.
- Group matching maximum group size: 5 rows.
- Group search default budget: `50000` visited nodes.
- Exceeding the generic candidate graph budget raises `candidate_graph_too_large` before partial automatic matching.
- Exceeding the grouped-search budget produces a review candidate instead of auto-accepting an incomplete search.

### XLSX dependency contract

- SheetJS Community Edition version: `0.20.3`.
- Vendored file: `tools/reconcile/vendor/xlsx.mini.min.js`.
- Runtime CDN loading is not permitted.
- Expected size: `279523` bytes.
- Expected SHA-256: `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`.
- Expected Git blob SHA: `5bf1c223ce4bd59685ba711b77dce6da7a9747b8`.
- `xlsx-adapter.mjs` also rejects a runtime whose reported `XLSX.version` is not exactly `0.20.3`.
- Apache-2.0 attribution and provenance files remain under `tools/reconcile/vendor/`.

## Inputs

- File A and File B, each CSV or XLSX.
- CSV encoding selection: Auto / UTF-8 / Shift_JIS.
- CSV delimiter selection: Auto / comma / tab / semicolon.
- Header row: 1–20.
- Required Amount mapping for both sides.
- Optional Date, Reference, and Description mappings for both sides.
- Date tolerance: 0 or ±1 day.
- Ambiguous date mode: Auto/reject ambiguous, MDY, or DMY.
- Reconcile Pro engine configuration after verified entitlement: non-negative amount tolerance, `normal` / `invert_b` / `ignore_sign`, optional 1:n / n:1 matching, and maximum group size 2–5.

## Outputs

- File metadata and previews.
- Worksheet selectors for multi-sheet XLSX files.
- Reconciliation summary counts.
- Deterministic result table with status, relation, A/B source row references, normalized amount/date, and human-readable reason.
- Filtered/searched views that do not mutate the underlying reconciliation result.
- UTF-8 BOM CSV audit export containing status, relation, source rows, normalized values, reason, and selected original identifying values from both sides.
- Reconcile Pro XLSX report with `Summary`, `Matches`, `Candidates`, `A Only`, `B Only`, `Duplicates`, and `Conflicts` sheets. The Summary records source filenames, selected mappings, and active reconciliation settings.
- Versioned JSON import/export for saved profile configuration while Reconcile Pro is active.

## State and persistence

- Parsed transaction rows, file bytes, and reconciliation results remain in page memory and disappear on reload.
- Shared language preference uses `localStorage` key `nw_lang`.
- The shared billing adapter may store only the verified product-scoped Stripe Checkout Session ID under `nicheworks:billing:session:reconcile.pro_v1`; that identifier is re-verified against the server and is never accepted as proof of entitlement by itself.
- Saved profile implementation uses `localStorage` key `nw_reconcile_profiles_v1`, schema version 1, maximum 20 profiles, and stores configuration only.
- Saved profiles contain parser settings, column mappings, matching options, local profile id/name, and timestamps; they do not contain transaction rows, uploaded file bytes, result rows, account data, or payment data.
- Profile JSON uses bundle type `nicheworks-reconcile-profile-bundle`; imported options are validated, sanitized, and bounded before persistence.

## Privacy and network behavior

- Transaction files and parsed transaction rows are processed locally in the browser.
- Reconcile does not send transaction contents to a NicheWorks API or third-party reconciliation service.
- The XLSX parser/writer is vendored locally; there is no runtime SheetJS CDN fetch.
- The public page follows suite-wide GA4, AdSense, and Cloudflare Analytics behavior. Those services receive ordinary page/advertising telemetry under the common site contract, not uploaded transaction files or parsed reconciliation rows from Reconcile.
- Checkout creation sends only product/return-path billing context to the NicheWorks billing API. Entitlement restoration sends the product ID plus Stripe Checkout Session ID. Neither request contains uploaded transaction rows, descriptions, amounts, references, mappings, or file contents.
- Paid access is enabled only after the server confirms an active entitlement created from a verified Stripe webhook. URL parameters, redirects, and localStorage do not directly unlock Reconcile Pro.

## Language mode

Bilingual single-page. Japanese and English UI copy share the same public URL and are switched client-side using the common `nw_lang` preference.

## Layout class

`pc-oriented` — two-file previews, column mapping, advanced rules, and result tables are the primary interaction. Narrow screens remain supported through stacking and horizontally scrollable tables.

## Limits and non-goals

- Free cap: 500 parsed rows and 5 MB per file for CSV or XLSX.
- Reconcile Pro cap: CSV 100,000 parsed rows / 50 MB per file; XLSX 50,000 parsed rows / 25 MB per file. These limits are implemented product safety bounds, not theoretical browser-capacity claims.
- Reconcile Pro remains locked whenever product-specific entitlement verification is unavailable, fails, has been revoked/refunded/disputed, or does not include `reconcile_pro_v1`.
- v1 does not include user accounts, cloud transaction storage, AI/probabilistic matching, OCR, PDF input, bank/Open Banking APIs, QuickBooks/Xero APIs, team workspaces, or server-side reconciliation.
- The tool is not an accounting system and does not certify that a financial ledger is complete or legally/audit compliant.

## Acceptance criteria

- Two valid CSV/XLSX files within Free limits load without transmitting their transaction contents.
- Free files above 500 rows or 5 MB are rejected.
- Amount mapping is mandatory and invalid amounts are not silently converted to zero.
- Supported Japanese/international amount notations and configured date formats normalize deterministically; ambiguous or malformed inputs are rejected rather than guessed.
- Exact and tolerant 1:1 matches are accepted only when mutually unique; competing candidates are not assigned by input order.
- Same-reference unique pairs outside amount tolerance become `conflict`.
- A duplicate signature group is emitted once and duplicate-member rows do not simultaneously appear under another primary status.
- Each source row belongs to at most one primary reconciliation outcome.
- Physical source row references survive skipped blank rows and alternate header rows.
- Re-running identical data, mappings, and settings produces the same classification/order.
- Result filtering/search does not mutate reconciliation results.
- Dense candidate graphs stop before partial automatic resolution when the edge budget is exceeded.
- Bounded grouped matching degrades to manual review when its search budget is exhausted.
- CSV audit export includes the defined reconciliation context and selected original A/B identifying values.
- The committed XLSX vendor passes fixed byte/hash/version checks plus real-vendor write/read and seven-sheet report re-read tests.
- Saved profile serialization never contains transaction rows or uploaded file bytes.
- Reconcile Pro controls unlock only when server verification for product `reconcile.pro_v1` includes feature `reconcile_pro_v1`; `nicheworks_pro` alone is insufficient.
- Failed/unavailable entitlement verification fails closed without changing Free reconciliation behavior.
- Japanese/English switching preserves the current reconciliation state and the wide result workflow remains usable with mobile stacking/scrolling.

## Implementation evidence

- `tools/reconcile/index.html`
- `tools/reconcile/development.html`
- `tools/reconcile/app.mjs`
- `tools/reconcile/styles.css`
- `tools/reconcile/parser.mjs`
- `tools/reconcile/normalize.mjs`
- `tools/reconcile/reconcile-engine.mjs`
- `tools/reconcile/export.mjs`
- `tools/reconcile/xlsx-adapter.mjs`
- `tools/reconcile/rules-store.mjs`
- `tools/reconcile/usage.html`
- `assets/nw-pro-entitlement.js`
- `functions/api/billing/create-checkout-session.js`
- `functions/api/billing/entitlement.js`
- `config/billing/products.json`
- `tools/reconcile/vendor/README.md`
- `tools/reconcile/vendor/LICENSE.sheetjs`
- `tools/reconcile/vendor/NOTICE.sheetjs.txt`
- `tools/reconcile/vendor/xlsx.mini.min.js`
- `tools/reconcile/tests/export.test.mjs`
- `tools/reconcile/tests/normalize.test.mjs`
- `tools/reconcile/tests/parser.test.mjs`
- `tools/reconcile/tests/reconcile-engine.test.mjs`
- `tools/reconcile/tests/rules-store.test.mjs`
- `tools/reconcile/tests/xlsx-adapter.test.mjs`
- `tools/reconcile/tests/xlsx-real-vendor.test.mjs`
