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
- Reconcile Pro CSV cap: 100,000 parsed rows and 50 MB/file.
- Reconcile Pro XLSX cap: 50,000 parsed rows and 25 MB/file.
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
- Preserve physical source row numbers even when blank rows are skipped.
- Implement result summary/filter/search.
- Implement CSV export.
- Add deterministic Node fixtures for parser, normalization, and the pure engine.
- Keep Pro-only controls visibly disabled until entitlement integration.

### Wave B — scale and advanced matching

- Add bounded 1:n and n:1 matching up to group size 5.
- Add Pro amount/sign modes to the pure engine and fixtures.
- Use indexed amount lookup for 1:1 candidates rather than a full Cartesian scan.
- Resolve exact Reference relationships first, then fallback relationships.
- Auto-match 1:1 only when the pair is mutually unique; competing rows remain candidates instead of being assigned by A-side input order.
- Bound generic 1:1 candidate graphs to 100,000 acceptable A↔B edges by default; abort before partial auto-resolution when the graph exceeds the configured safety limit.
- Bound grouped search by a node budget and degrade to candidate/manual review if the search is truncated.
- Keep Web Worker migration conditional on real browser profiling rather than adding complexity pre-emptively.

### Wave C — XLSX and local Pro profiles

- Pin SheetJS Community Edition `0.20.3` browser mini build (`xlsx.mini.min.js`).
- Vendor it locally; do not fetch the library from a CDN at runtime.
- Verify exact bytes before commit: size `279523`, SHA-256 `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`.
- Preserve Apache-2.0 license and provenance notice in `tools/reconcile/vendor/`.
- Add worksheet selection, Excel dates/numbers, and XLSX report export.
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
- [x] Preserve real source row numbers across blank data rows/header offsets.
- [x] Harden Unicode/currency/date normalization for financial exports.
- [x] Complete Wave B advanced engine and grouped-search safety guard.
- [x] Replace order-sensitive greedy 1:1 matching with Reference-priority + mutual-uniqueness resolution.
- [x] Add 1:1 candidate-graph edge budget and dense-candidate regression fixtures.
- [x] Restore the fixed v1 Free/Pro row and byte limits in the UI and documentation.
- [x] Implement XLSX adapter, worksheet selection, report workbook generator, and fake-API tests.
- [x] Select SheetJS CE 0.20.3 mini build and pin exact size/SHA-256 provenance.
- [x] Point the adapter at `tools/reconcile/vendor/xlsx.mini.min.js` and retain the runtime `0.20.3` version guard.
- [x] Add Apache-2.0 license and SheetJS vendor provenance notice.
- [x] Implement local Pro profile store, schema validation, JSON import/export, and tests.
- [x] Clamp imported/saved profile date tolerance to the public 0/±1-day contract.
- [x] Warn when a saved profile references columns missing from the currently loaded files instead of silently substituting other columns.
- [x] Wire advanced Pro rule/profile/report UI behind a hard entitlement lock.
- [x] Update Reconcile specification and usage documentation to match the branch.
- [ ] Commit the checksum-verified `xlsx.mini.min.js` bytes; this is the remaining isolated Wave C blocker.
- [ ] Run final browser validation with the real XLSX vendor present.
- [ ] Complete billing integration in a separate PR.
- [ ] Complete publication integration in a separate PR.

## Discoveries and current evidence

- No existing SheetJS/XLSX browser dependency was found in the repository.
- SheetJS CE 0.20.3 mini build is selected because Reconcile only needs XLSX read/write and not the legacy-format/codepage surface of the full build.
- Two independent public GitHub vendor copies of the selected mini build have identical bytes: size `279523` and Git blob SHA `5bf1c223ce4bd59685ba711b77dce6da7a9747b8`.
- Recorded SHA-256 for those bytes is `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`.
- Runtime CDN loading is forbidden. The adapter now expects `tools/reconcile/vendor/xlsx.mini.min.js` and rejects a runtime whose `XLSX.version` is not exactly `0.20.3`.
- Apache-2.0 license and a vendor provenance notice are already committed under `tools/reconcile/vendor/`; only the verified JS payload remains to be added.
- The current execution environment cannot directly clone/download external GitHub/CDN bytes through its shell because outbound DNS is unavailable. Cross-repository Git object SHA reuse was also rejected by GitHub. An unverified or retyped vendor payload is deliberately not being committed.
- CSV physical row identity previously shifted after blank lines because the data array was filtered before source-row numbering. The parser now attaches source-row identity before filtering; dedicated fixtures cover blank rows and non-row-1 headers.
- Text/reference normalization now uses Unicode NFKC. Amount fixtures cover full-width Japanese values, accounting parentheses, Unicode/trailing minus, common currency symbols/codes, US-style thousands/decimal notation, European decimal-comma notation, and malformed inputs.
- 1:1 matching previously processed A rows greedily, which allowed a shared sole B candidate to be assigned to whichever A row appeared first. The engine now resolves exact Reference relationships first and only auto-accepts mutually unique pairs; unresolved competition is emitted as candidate.
- Dense same-value 1:1 graphs can create a quadratic number of acceptable edges even with indexed amount lookup. The engine now counts graph edges and throws `candidate_graph_too_large` before partial automatic matching once the configured budget is exceeded. A regression fixture forces a 20×20 dense graph over a 100-edge limit, while a 20×20 same-amount dataset with unique References still resolves as 20 exact matches.
- The UI converts `candidate_graph_too_large` into a JA/EN action message telling the user to add Date and/or Transaction ID / Reference mappings.
- The order-independence fixture reverses A-side rows in a Reference-priority case and verifies identical status counts.
- Synthetic exact-match benchmark after the mutual-uniqueness change in the development environment: 10,000 rows ~116.5 ms; 20,000 rows ~161.6 ms; 50,000 rows ~406.1 ms. These figures are development evidence, not a public performance guarantee.
- Group matching is bounded to maximum group size 5 and a default 50,000-node search budget; hitting the budget yields a review candidate instead of auto-resolving an incomplete search.
- The profile store uses schema version 1, stores at most 20 profiles, and persists configuration only under `nw_reconcile_profiles_v1`.
- Profile-store unit tests cover normalization, update-without-duplication, versioned export/import, invalid-schema rejection, bounds clamping, removal, and clearing.
- XLSX adapter tests use an API-compatible fake and cover worksheet parsing and workbook/report construction without claiming real-vendor browser validation.

## Validation

Wave A/B acceptance:
- two CSV files can be loaded locally;
- Free rejects files above 500 rows or 5 MB;
- Pro CSV rejects files above 100,000 rows or 50 MB;
- Pro XLSX rejects files above 50,000 rows or 25 MB;
- amount mapping is mandatory;
- exact and ±1-day matching is deterministic;
- common supported financial amount notations normalize predictably and malformed values are not silently guessed;
- physical CSV row references remain correct across blank lines and alternate header rows;
- duplicate and ambiguous candidate cases never auto-pick an arbitrary row;
- competing A rows cannot win the same sole B row solely because of input order;
- exact Reference relationships may resolve before blank-reference fallback candidates;
- dense generic candidate graphs stop before partial resolution when the edge budget is exceeded;
- unique exact References avoid unnecessary generic candidate-graph explosion;
- same reference with conflicting amount is a conflict outside the configured amount tolerance when the reference identifies a unique pair;
- unmatched rows are separated by side;
- result search/filter does not mutate reconciliation results;
- CSV export contains status, row references, normalized values, and reason;
- grouped matching is bounded and safely degrades to candidate;
- source files stay inside the declared isolated scope.

Wave C acceptance before it can be marked complete:
- exact checksum-verified `xlsx.mini.min.js` is committed locally, not loaded from a runtime CDN;
- vendor bytes match size `279523` and SHA-256 `0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939`;
- Apache-2.0 license/attribution files remain present;
- CSV behavior remains unchanged after vendor addition;
- XLSX A/B load through the same semantic mapping path;
- multi-sheet selection rebuilds the selected side deterministically;
- Pro XLSX report exports the seven defined sheets;
- profile save/load/import/export never stores transaction rows;
- browser validation passes with the real vendor build;
- all Node fixtures pass.

## Recovery and merge discipline

Do not merge the isolated branch while its public landing is intentionally absent from registry/sitemap. Before any PR targeting main, rebase/merge current main into the branch or split publication changes into a current-main integration branch, then satisfy all current repository contracts.
