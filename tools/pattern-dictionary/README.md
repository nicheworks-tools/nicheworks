# Pattern Dictionary — canonical 20 verified publication

Production implementation for the fixed 20-pattern visual dictionary: visual discovery, ambiguous search, bilingual static detail pages, comparison guidance, reviewed Reference Images, and publication validation.

## Current state

- The canonical set is fixed at 20 patterns and includes Kilim; Yagasuri is outside this 20-pattern scope.
- Source verification is complete for all 20 terms: 17 are verified and 3 (`moroccan-trellis`, `ikat`, `kilim`) remain qualified with explicit scope notes.
- `data/production-content.json` is at `verified-publication` and contains JA/EN definitions, distinguishing features, common uses, color contracts, term scope, qualification notes, and verified review state for all 20 records.
- All 20 primary Reference Images are deterministic 1536×1536 PNGs under `assets/reference/`, structurally reviewed, publication-verified, and runtime-wired.
- Broad or technique/category terms use representative recognition references and do not claim one uniquely canonical motif.
- JA/EN top pages provide visual browsing, client-side ambiguous search, Visual Autocomplete, interpretation chips, confidence handling, typo tolerance, zero-result handling, and comparison.
- Search regressions cover the required natural-language Top1 cases plus mixed JA/EN, typo, confidence, and zero-result cases.
- Six canonical comparison guides are implemented, including Argyle vs the generic Diamond family without adding a non-canonical dictionary record.
- 20 JA + 20 EN static detail URLs exist under `patterns/{id}/` and `en/patterns/{id}/`; all 40 are `index,follow` after the publication contract passed and are listed in the root sitemap.
- All 40 detail pages carry canonical JA/EN hreflang pairs, Open Graph and Twitter metadata, absolute production Reference Image social previews, apple-touch icon metadata, and JSON-LD containing both `WebPage` and `WebApplication` identity.
- The 40-page detail surface passes the repository-wide indexable URL identity, head metadata cardinality, language metadata, internal-link, structured-data, and strict SEO audits.
- Desktop and 390px mobile Chromium QA passed for browse, search, bilingual detail routes, comparison, horizontal overflow, and the disabled affiliate flow.
- Amazon search-link metadata exists for all 20 patterns, but commerce remains safely disabled until a real Amazon Associates tracking ID is configured. No placeholder or invented tracking ID is used.
- User search text is processed client-side only.
- Expansion beyond the canonical 20 and any Pattern Atlas integration remain explicitly out of scope for this publication.

## Validation

Run from the repository root:

```bash
node --check tools/pattern-dictionary/app.js
node tools/pattern-dictionary/tests/source-verification-test.mjs
node tools/pattern-dictionary/tests/production-content-test.mjs
node tools/pattern-dictionary/tests/reference-image-test.mjs
node tools/pattern-dictionary/tests/search-test.mjs
node tools/pattern-dictionary/tests/compare-test.mjs
node tools/pattern-dictionary/tests/affiliate-test.mjs
node tools/pattern-dictionary/tests/browse-mobile-test.mjs
node tools/pattern-dictionary/tests/validate.mjs
node tools/pattern-dictionary/tests/publication-test.mjs
node tools/pattern-dictionary/tests/seo-detail-test.mjs
node scripts/check-seo-indexable-url-identity.mjs
node scripts/check-seo-head-metadata-cardinality.mjs
node scripts/check-seo-language-metadata-integrity.mjs
node scripts/check-seo-internal-link-integrity.mjs
node scripts/check-seo-structured-data-integrity.mjs
node scripts/audit-seo.mjs --strict
```

The publication contract requires all 20 production records and Reference Images to be verified, preserves the three qualified term scopes, requires all 40 detail pages to be indexable, rejects stale pre-publication messaging, and keeps the indexable detail surface compliant with the repository-wide SEO contracts.

## Commerce activation

Amazon affiliate links must remain disabled until the real Associates tracking ID is available. When configured, links stay below dictionary content, use pattern-specific search queries rather than invented SKUs, and render with the required disclosure and sponsored/nofollow relationship attributes.
