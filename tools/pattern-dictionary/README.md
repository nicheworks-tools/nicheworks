# Pattern Dictionary — repository vertical slice

20-pattern repository-backed implementation for search, visual browse, static detail, and comparison validation.

## Current state

- 20 canonical prototype records under `data/patterns.json`.
- The canonical prototype set includes Kilim; Yagasuri is outside this 20-pattern slice.
- JA/EN top pages with image-backed visual browsing.
- Client-side ambiguous search, Visual Autocomplete, interpretation chips, confidence handling, and comparison.
- 20 JA + 20 EN static detail URLs under `patterns/{id}/` and `en/patterns/{id}/`.
- Static detail pages intentionally remain `noindex,follow` while records are `prototype-curated`.
- Micro-pattern visual cues are used in top-page filters.
- Pattern images are generated DEV placeholders, not final verified Reference Images.
- Amazon commerce UI is present only as a placeholder; no affiliate URLs are connected yet.
- User search text is processed client-side only.

## Validation

Run from the repository root:

```bash
node tools/pattern-dictionary/tests/validate.mjs
node tools/pattern-dictionary/tests/search-test.mjs
node --check tools/pattern-dictionary/app.js
```

Current search smoke set: 12/12 expectations pass; Houndstooth and Kilim include Top1-locked regression cases. This is a vertical-slice check, not a final search-quality benchmark.

## Before publication

1. Research and source-verify the 20 prototype records.
2. Replace DEV placeholders with verified high-quality primary PNG Reference Images.
3. Expand search-quality cases substantially.
4. Re-run desktop/tablet/mobile browser QA after production data/image replacement.
5. Remove `noindex` only from records that satisfy the publication contract.
6. Add Amazon affiliate URLs only after the dictionary experience itself is ready.
