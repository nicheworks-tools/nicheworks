# Pattern Dictionary — canonical 20 productionization

20-pattern repository-backed implementation for visual discovery, search, static detail, comparison, and production-data validation.

## Current state

- The canonical set is fixed at 20 patterns and includes Kilim; Yagasuri is outside this 20-pattern scope.
- Source verification is complete for all 20 terms: 17 are verified and 3 (`moroccan-trellis`, `ikat`, `kilim`) are qualified with explicit scope notes.
- `data/production-content.json` contains researched JA/EN definitions, distinguishing features, common uses, color contracts, term scope, and qualification notes.
- All 20 records are currently `image_ready`.
- All 20 primary Reference Image candidates are deterministic 1536×1536 PNGs under `assets/reference/` and are wired into the runtime.
- Broad or technique/category terms use representative recognition references and do not claim one uniquely canonical motif.
- JA/EN top pages provide visual browsing, client-side ambiguous search, Visual Autocomplete, interpretation chips, confidence handling, and comparison.
- 20 JA + 20 EN static detail URLs exist under `patterns/{id}/` and `en/patterns/{id}/`.
- Detail pages intentionally remain `noindex,follow` until image candidates pass structural visual review and the publication contract is complete.
- Micro-pattern visual cues remain separate from primary Reference Images.
- Amazon commerce UI is still a placeholder; no affiliate URLs are connected yet.
- User search text is processed client-side only.

## Validation

Run from the repository root:

```bash
node tools/pattern-dictionary/tests/source-verification-test.mjs
node tools/pattern-dictionary/tests/production-content-test.mjs
node tools/pattern-dictionary/tests/validate.mjs
node tools/pattern-dictionary/tests/search-test.mjs
node tools/pattern-dictionary/tests/reference-image-test.mjs
node --check tools/pattern-dictionary/app.js
```

Current search smoke set: 12/12 expectations pass; Houndstooth and Kilim include Top1-locked regression cases. The Reference Image contract verifies all 20 manifest entries, PNG dimensions, `image_ready` state, policy flags, production-data linkage, and runtime wiring.

## Before publication

1. Visually review all 20 Reference Image candidates for structural correctness and misidentification risk; advance only accepted images to `reviewed` / `verified`.
2. Expand search-quality coverage for Top1/Top3, zero-result, confidence, mixed JA/EN, typos, and natural visual descriptions.
3. Re-run desktop/tablet/mobile browser QA with the production data and Reference Images.
4. Finalize Compare/Browse/mobile UX and detail-page copy review.
5. Add Amazon affiliate search links only after verifying the current Amazon Associates requirements and only below dictionary content.
6. Remove `noindex` only from detail pages that satisfy the full publication contract.
7. Publish the canonical 20 before considering expansion toward 100 patterns.
