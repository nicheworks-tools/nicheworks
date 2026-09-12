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
- Free: 500 rows/file, 5 MB/file, basic 1:1 reconciliation, exact date or ±1 day, CSV export.
- Reconcile Pro: ¥3,980 one-time, larger files, advanced amount/sign rules, 1:n / n:1, XLSX report, saved profiles.
- Reconcile Pro purchase also grants the existing shared `nicheworks_pro` entitlement.
- Shared Pro purchase does not grant Reconcile Pro.
- No user account, cloud transaction storage, AI matching, OCR, PDF input, or bank API in v1.
- Pro browser safety cap is currently 100 MB/file; row count has no fixed Pro cap and remains browser-memory dependent.

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
- Add Pro amount/sign modes to the pure engine and fixtures.
- Use a sorted amount index with binary-range lookup for 1:1 candidates rather than a full Cartesian scan.
- Bound grouped search by a node budget and degrade to candidate/manual review if the search is truncated.
- Keep Web Worker migration conditional on real browser profiling rather than adding complexity pre-emptively.

### Wave C — XLSX and local Pro profiles

- Select a pinned, locally vendored browser XLSX parser/writer only after reviewing repository dependency policy and license.
- Add worksheet selection, Excel dates/numbers, and XLSX report export.
- Do not fetch the library from a CDN at runtime.
- Add browser-local saved reconciliation profiles for parser settings, column mappings, and matching rules only.
- Add versioned JSON profile import/export.
- Never persist transaction rows or file bytes in profiles.

### Wave D — billing integration (separate PR)

- Add product-specific entitlement `reconcile_pro_v1`.
- Reconcile purchase grants both `reconcile_pro_v1` and `nicheworks_pro`.
- Shared Pro purchase grants only `nicheworks_pro`.
- Reuse the server-side Stripe/D1 billing foundation rather than URL-only unlocking.
- Keep transaction files completely outside billing requests.
- Replace the isolated branch's hard `proEnabled=false` state with the entitlement adapter only in this integration wave.

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
- [x] Implement XLSX adapter, worksheet selection, report workbook generator, and fake-API tests.
- [x] Implement local Pro profile store, schema validation, JSON import/export, and tests.
- [x] Wire advanced Pro rule/profile/report UI behind a hard entitlement lock.
- [x] Update Reconcile specification and usage documentation to match the branch.
- [ ] Vendor and verify the pinned SheetJS browser build; this is the remaining isolated Wave C blocker.
- [ ] Run final browser validation with the real XLSX vendor present.
- [ ] Complete billing integration in a separate PR.
- [ ] Complete publication integration in a separate PR.

## Discoveries and current evidence

- No existing SheetJS/XLSX browser dependency was found in the repository.
- SheetJS CE 0.20.3 is the selected version for the final local vendor integration; runtime CDN loading is forbidden.
- The adapter currently expects `tools/reconcile/vendor/xlsx.full.min.js`; this path is not considered complete until the vendored file is verified and committed.
- Exact/tolerance 1:1 matching was changed from full Cartesian scanning to a sorted amount index with binary-range lookup.
- Synthetic exact-match benchmark in the development environment after indexing: 10,000 rows ~59 ms; 20,000 rows ~105 ms; 50,000 rows ~212 ms. These numbers are development evidence, not a public performance guarantee.
- Group matching is bounded to maximum group size 5 and a default 50,000-node search budget; hitting the budget yields a review candidate instead of auto-resolving an incomplete search.
- The profile store uses schema version 1, stores at most 20 profiles, and persists configuration only under `nw_reconcile_profiles_v1`.
- Profile-store unit tests cover normalization, update-without-duplication, versioned export/import, invalid-schema rejection, bounds clamping, removal, and clearing.
- XLSX adapter tests use an API-compatible fake and cover worksheet parsing and workbook/report construction without claiming real-vendor browser validation.

## Validation

Wave A/B acceptance:
- two CSV files can be loaded locally;
- amount mapping is mandatory;
- exact and ±1-day matching is deterministic;
- duplicate and ambiguous candidate cases never auto-pick an arbitrary row;
- same reference with conflicting amount is a conflict outside the configured amount tolerance;
- unmatched rows are separated by side;
- result search/filter does not mutate reconciliation results;
- CSV export contains status, row references, normalized values, and reason;
- grouped matching is bounded and safely degrades to candidate;
- source files stay inside the declared isolated scope.

Wave C acceptance before it can be marked complete:
- real pinned XLSX vendor is committed locally, not loaded from a runtime CDN;
- CSV behavior remains unchanged after vendor addition;
- XLSX A/B load through the same semantic mapping path;
- multi-sheet selection rebuilds the selected side deterministically;
- Pro XLSX report exports the seven defined sheets;
- profile save/load/import/export never stores transaction rows;
- browser validation passes with the real vendor build;
- all Node fixtures pass.

## Recovery and merge discipline

Do not merge the isolated branch while its public landing is intentionally absent from registry/sitemap. Before any PR targeting main, rebase/merge current main into the branch or split publication changes into a current-main integration branch, then satisfy all current repository contracts.
