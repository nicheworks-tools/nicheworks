# Pattern Dictionary — canonical 20 verified publication

Production implementation for the fixed 20-pattern visual dictionary: visual discovery, exact-name/alias search, ambiguous description search, bilingual static detail pages, comparison guidance, reviewed Reference Images, publication validation, and an Amazon Associates activation contract.

## Current state

- The canonical set is fixed at 20 patterns and includes Kilim; Yagasuri is outside this 20-pattern scope.
- Source verification is complete for all 20 terms: 17 are verified and 3 (`moroccan-trellis`, `ikat`, `kilim`) remain qualified with explicit scope notes.
- `data/production-content.json` is at `verified-publication` and contains JA/EN definitions, distinguishing features, common uses, color contracts, term scope, qualification notes, and verified review state for all 20 records.
- All 20 primary Reference Images are deterministic 1536×1536 PNGs under `assets/reference/`, structurally reviewed, publication-verified, and runtime-wired.
- Broad or technique/category terms use representative recognition references and do not claim one uniquely canonical motif.
- JA/EN top pages provide visual browsing, client-side exact-name/alias search, ambiguous-description search, Visual Autocomplete, interpretation chips, confidence handling, typo tolerance, zero-result handling, and comparison.
- Search regressions cover the required natural-language Top1 cases plus exact names, mixed JA/EN, typo, confidence, and zero-result cases.
- Six canonical comparison guides are implemented, including Argyle vs the generic Diamond family without adding a non-canonical dictionary record.
- 20 JA + 20 EN static detail URLs exist under `patterns/{id}/` and `en/patterns/{id}/`; all 40 are `index,follow` after the publication contract passed and are listed in the root sitemap.
- All 40 detail pages carry canonical JA/EN hreflang pairs, Open Graph and Twitter metadata, absolute production Reference Image social previews, apple-touch icon metadata, and JSON-LD containing both `WebPage` and `WebApplication` identity.
- The 40-page detail surface passes the repository-wide indexable URL identity, head metadata cardinality, language metadata, internal-link, structured-data, and strict SEO audits.
- Desktop and 390px mobile Chromium QA passed for browse, search, bilingual detail routes, comparison, horizontal overflow, and the disabled affiliate flow.
- Amazon search-link metadata exists for all 20 patterns. The public affiliate surface stays hidden until a real Amazon Associates tracking ID is configured; no placeholder or invented tracking ID is committed.
- `scripts/activate-amazon-affiliate.mjs` performs deterministic activation from one real tracking ID. `tests/affiliate-activation-test.mjs` tests the full ACTIVE path against an isolated temporary fixture, so no fake ID touches production config.
- User search text is processed client-side only.
- Expansion beyond the canonical 20 and any Pattern Atlas integration remain explicitly out of scope until the canonical-20 commerce activation gate is closed.

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
node tools/pattern-dictionary/tests/affiliate-activation-test.mjs
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

## Canonical-20 commerce completion gate

The canonical 20 are not considered commercially complete until Amazon Associates is activated with the real NicheWorks tracking ID and all 20 pattern search links are checked in production. Until that credential exists, affiliate UI remains hidden rather than exposing unfinished-status copy.

Activation is intentionally one-command and fail-closed:

```bash
node tools/pattern-dictionary/scripts/activate-amazon-affiliate.mjs <REAL_TRACKING_ID>
node tools/pattern-dictionary/tests/affiliate-test.mjs --require-active
```

The activation script refuses an invalid-looking ID, refuses an unexpected marketplace/provider, requires exactly 20 bilingual query records, sets `enabled=true`, and writes the real tracking ID into `data/affiliate-config.json`. The active contract then requires all 20 patterns / 40 JA+EN generated Amazon.co.jp search URLs to carry the tracking tag, while runtime links remain below dictionary content with the required Associates disclosure and `sponsored nofollow noopener` relationship attributes.

After activation, the release is not complete until production QA confirms all 20 canonical detail pages expose the Amazon.co.jp search action and representative JA/EN links resolve with the expected tracking tag.
