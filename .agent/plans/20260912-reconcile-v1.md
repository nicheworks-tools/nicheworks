# NicheWorks Reconcile v1 — isolated implementation plan

This ExecPlan is a living document.

## Purpose / Big Picture

Build NicheWorks Reconcile in parallel with ongoing SEO and existing-tool quality work without modifying shared publication, SEO, billing, or common-spec files. The product reconciles two transaction CSV/XLSX datasets locally in the browser and classifies exact matches, tolerant matches, ambiguous candidates, unmatched rows, duplicates, and conflicts.

## Branch and isolation

- Branch: `feat/reconcile-v1-20260912`
- Initial base: main after SEO PR #507.
- Allowed implementation scope in the isolated phase:
  - `.agent/plans/20260912-reconcile-v1.md`
  - `tools/reconcile/**`
- Explicitly deferred / forbidden during isolated implementation:
  - `tools/tools-index.json`
  - `tools/tool-spec-manifest.json`
  - `sitemap.xml`
  - `.github/workflows/**`
  - `scripts/check-seo-*.mjs`
  - `common-spec/**`
  - `config/billing/**`
  - `functions/api/billing/**`
  - `functions/api/pro/**`

Publication and billing integration will be separate later PRs after rebasing onto the then-current main.

## Fixed product decisions

- Product: NicheWorks Reconcile.
- Primary path: `/tools/reconcile/`.
- Browser-local transaction processing only.
- Final v1 inputs: CSV + XLSX.
- Free: 500 rows/file, basic 1:1 reconciliation, exact date or ±1 day, CSV export.
- Reconcile Pro: ¥3,980 one-time, larger files, advanced tolerances, 1:n / n:1, XLSX report, saved profiles.
- Reconcile Pro purchase also grants the existing shared `nicheworks_pro` entitlement.
- Shared Pro purchase does not grant Reconcile Pro.
- No user account, cloud transaction storage, AI matching, OCR, PDF input, or bank API in v1.

## Implementation waves

### Wave A — local CSV reconciliation core

- Create the dedicated UI from the approved HTML mock direction.
- Implement UTF-8 / Shift_JIS CSV decoding and delimiter detection without external runtime dependencies.
- Implement header selection and semantic column mapping.
- Implement deterministic amount/date/reference normalization.
- Implement exact, tolerant, candidate, A-only, B-only, duplicate, and conflict states.
- Implement result summary/filter/search.
- Implement CSV export.
- Add deterministic Node fixtures for the pure engine.
- Keep Pro-only controls visibly disabled until entitlement integration.

### Wave B — scale and advanced matching

- Add bounded 1:n and n:1 matching up to group size 5.
- Add Pro amount/date/sign modes to the pure engine and fixtures.
- Move heavy reconciliation work to a Web Worker if profiling justifies it.
- Confirm defined row/file limits and graceful memory handling.

### Wave C — XLSX

- Select a pinned, locally vendored browser XLSX parser/writer only after reviewing repository dependency policy and license.
- Add worksheet selection, Excel dates/numbers, and XLSX report export.
- Do not fetch the library from a CDN at runtime.

### Wave D — billing integration (separate PR)

- Add product-specific entitlement `reconcile_pro_v1`.
- Reconcile purchase grants both `reconcile_pro_v1` and `nicheworks_pro`.
- Shared Pro purchase grants only `nicheworks_pro`.
- Reuse the server-side Stripe/D1 billing foundation rather than URL-only unlocking.
- Keep transaction files completely outside billing requests.

### Wave E — publication integration (separate PR)

After rebasing on current main:
- add Reconcile to `tools/tools-index.json`;
- add/update tool spec manifest according to the merged specification contract;
- add sitemap/public URL identity;
- run all current SEO/publication contracts;
- remove development-only noindex state and publish canonical metadata.

## Progress

- [x] Reviewed repository AGENTS rules.
- [x] Confirmed isolated branch strategy.
- [x] Created dedicated branch.
- [x] Complete Wave A CSV core and deterministic fixtures.
- [x] Complete Wave B advanced engine and grouped-search safety guard.
- [ ] Complete Wave C.
- [ ] Complete billing integration.
- [ ] Complete publication integration.

## Discoveries and current evidence

- No existing SheetJS/XLSX browser dependency was found in the repository.
- SheetJS CE 0.20.3 is the current official standalone release; final integration should vendor a pinned copy rather than depend on a runtime CDN.
- Exact/tolerance 1:1 matching was changed from full Cartesian scanning to a sorted amount index with binary-range lookup.
- Synthetic exact-match benchmark in the development environment after indexing: 10,000 rows ~59 ms; 20,000 rows ~105 ms; 50,000 rows ~212 ms. These numbers are development evidence, not a public performance guarantee.
- Group matching is bounded to maximum group size 5 and a default 50,000-node search budget; hitting the budget yields a review candidate instead of auto-resolving an incomplete search.

## Validation

Wave A acceptance:
- two CSV files can be loaded locally;
- amount mapping is mandatory;
- exact and ±1-day matching is deterministic;
- duplicate and ambiguous candidate cases never auto-pick an arbitrary row;
- same reference with conflicting amount is a conflict;
- unmatched rows are separated by side;
- result search/filter does not mutate reconciliation results;
- CSV export contains status, row references, normalized values, and reason;
- test fixtures pass in Node;
- source files stay inside the declared isolated scope.

## Recovery and merge discipline

Do not merge the isolated branch while its public landing is intentionally absent from registry/sitemap. Before any PR targeting main, rebase/merge current main into the branch or split publication changes into a current-main integration branch, then satisfy all current repository contracts.
