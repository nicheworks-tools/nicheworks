# Pattern Dictionary — canonical 100 v1

Pattern Dictionary is the bilingual NicheWorks visual dictionary at:

`https://nicheworks.app/tools/pattern-dictionary/`

It helps users identify a pattern when they recognize the look but do not know the formal name. The product supports visual browsing, vague Japanese/English description search, Visual Autocomplete, confidence-aware ranking, related/confusable navigation, comparison, bilingual detail pages, and maintained Amazon.co.jp affiliate handoff.

## Current production state

Canonical v1 is complete and frozen at exactly **100 published pattern IDs**.

- **100** canonical runtime records.
- **100** verified-publication production records.
- **100** deterministic 1536×1536 PNG Reference Images.
- **100/100** source-review coverage.
- **100/100** Reference Image accuracy-audit coverage.
- Image-accuracy decisions: **13 corrected / 37 representative-accepted / 50 accepted / 0 unresolved**.
- **200** static detail pages: 100 Japanese + 100 English.
- All 200 detail pages are `index,follow` and registered in the root sitemap.
- **264** maintained search regression cases.
- **72** maintained comparison guides.
- **305** active maintained Amazon.co.jp commerce-intent links.
- Desktop and mobile Chromium QA has passed after canonical-100 publication and the Reference Image correction audit.

The canonical 100 must not be silently expanded. Any future 101+ catalog requires a new versioned expansion plan.

## Product behavior

Users can enter through either path:

1. **Visual browse** — inspect the image grid and filter by visual family.
2. **Description search** — describe appearance, color, use, culture, or an approximate name in Japanese or English.

Search and ranking run client-side against maintained static data. Low-confidence queries return nearby candidates and confidence wording rather than fabricating certainty. Search interpretation chips expose recognized cues and can be removed before reranking.

The product also exposes similar/common-confusion relationships and two-pattern comparison guidance.

## Canonical data

Primary runtime/publication data lives under `data/`:

- `patterns.json` — 100 canonical pattern identities and runtime fields.
- `production-content.json` — verified bilingual publication content.
- `source-verification.json` — terminology/source-review ledger.
- `reference-images.json` — Reference Image publication manifest.
- `reference-image-accuracy-audit.json` — 100-entry visual-accuracy audit.
- `search-dictionary.json` — maintained search interpretation vocabulary.
- `compare-guides.json` — maintained comparison guidance.
- `affiliate-config.json` — fixed Amazon.co.jp commerce-intent mappings.
- `canonical-100-expansion.json` — closed canonical-100 publication/freeze state.

Historical Wave 2–5 staging ledgers and generators remain implementation evidence, but they are not the current product-state contract. Current state is defined by the canonical publication files above and the tool specification.

## Terminology/source boundary

Source review is complete for all 100 terms. Some records are deliberately `qualified` because the term denotes a broader weave, technique, textile tradition, style, material effect, or overlapping naming convention rather than one universal fixed motif.

A qualified term is not an unfinished record. Its copy and imagery must explicitly avoid claiming that one representative rendering is the only correct form.

Examples include broad terms such as Shibori, Batik, Sashiko, Adire, Kuba cloth, Tie-dye, Marbling, and related technique/tradition categories.

## Reference Images

Every canonical ID has one deterministic 1536×1536 PNG under `assets/reference/`.

The image-accuracy audit is separate from structural image verification. A valid PNG with the correct dimensions is not automatically an accurate recognition reference.

`data/reference-image-accuracy-audit.json` uses three decisions:

- `accepted` — materially matches the maintained recognition structure;
- `representative-accepted` — defensible representative cue for a broad/non-universal term;
- `corrected` — a prior published render was capable of misleading recognition and was replaced.

The current audit has **0 unresolved** records.

## Search

Search runs entirely in the browser against same-origin static data. User search text is not intentionally sent to an external AI/search service.

The maintained regression set covers exact names, aliases, mixed Japanese/English expressions, natural-language visual descriptions, typo handling, confidence behavior, and zero/weak-result behavior.

The current maintained search contract contains **264 cases**.

## Comparison

Pattern Dictionary maintains **72** comparison guides for high-confusion pairs and related distinctions. Comparison guidance must preserve ambiguity when appearance alone cannot honestly establish a unique name.

## Affiliate contract

Amazon.co.jp affiliate navigation is active only after explicit user action.

- Tracking ID: `nicheworks09-22`.
- Shared helper: `/assets/amazon-affiliate.js`.
- Current maintained offers: **305**.
- Destinations come only from fixed mappings in `data/affiliate-config.json`.
- User free text, autocomplete text, cue chips, and other user state are never forwarded into Amazon queries.
- Pattern Dictionary does not expose live price, stock, rating, review, or delivery data.

## Public routes

Japanese:

- `/tools/pattern-dictionary/`
- `/tools/pattern-dictionary/patterns/{id}/`
- `/tools/pattern-dictionary/search.html`
- `/tools/pattern-dictionary/compare.html`

English:

- `/tools/pattern-dictionary/en/`
- `/tools/pattern-dictionary/en/patterns/{id}/`
- `/tools/pattern-dictionary/en/search.html`
- `/tools/pattern-dictionary/en/compare.html`

Landing pages and all 200 detail pages are publication surfaces. Search and compare are `noindex,follow` utilities.

## Privacy

Search, ranking, filtering, and comparison run client-side. The tool has no account system and no server-side pattern-search history. Query history is not persisted in `localStorage` or `sessionStorage`.

Common NicheWorks analytics, advertising, and support behavior still applies.

## Non-goals in canonical v1

- No image-upload identification.
- No runtime AI/API dependency for search.
- No downloadable pattern asset library.
- No pattern generator.
- No live retailer-data fetch.
- No silent expansion beyond 100.
- Pattern Atlas remains a separate product.

## Validation

Run from the repository root:

```bash
node --check tools/pattern-dictionary/app.js
node tools/pattern-dictionary/tests/canonical-100-test.mjs
node tools/pattern-dictionary/tests/production-content-test.mjs
node tools/pattern-dictionary/tests/source-verification-test.mjs
node tools/pattern-dictionary/tests/reference-image-test.mjs
node tools/pattern-dictionary/tests/reference-image-accuracy-audit-test.mjs
node tools/pattern-dictionary/tests/publication-test.mjs
node tools/pattern-dictionary/tests/search-test.mjs
node tools/pattern-dictionary/tests/compare-test.mjs
node tools/pattern-dictionary/tests/affiliate-test.mjs
node tools/pattern-dictionary/tests/seo-detail-test.mjs
node tools/pattern-dictionary/tests/browse-mobile-test.mjs
node tools/pattern-dictionary/tests/validate.mjs
node tools/pattern-dictionary/tests/wave2-production-content-test.mjs
node tools/pattern-dictionary/tests/wave2-source-verification-test.mjs
node tools/pattern-dictionary/tests/wave3-source-verification-test.mjs
node tools/pattern-dictionary/tests/wave4-source-verification-test.mjs
node tools/pattern-dictionary/tests/wave5-source-verification-test.mjs
node scripts/check-seo-indexable-url-identity.mjs
node scripts/check-seo-head-metadata-cardinality.mjs
node scripts/check-seo-language-metadata-integrity.mjs
node scripts/check-seo-internal-link-integrity.mjs
node scripts/check-seo-structured-data-integrity.mjs
node scripts/audit-seo.mjs --strict
```

`tests/publication-test.mjs` also enforces that the current specifications and README describe canonical-100 v1 rather than the retired 20-pattern prototype state.

## Specification sources

- Tool-local specification: `tools/pattern-dictionary/SPEC.md`
- Repository tool specification: `docs/tools/pattern-dictionary.md`
- Common NicheWorks specification: `common-spec/spec-ja.md`

The tool-local and repository specifications must describe the same current publication state.
