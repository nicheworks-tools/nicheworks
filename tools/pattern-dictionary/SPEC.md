# Tool Specification — Pattern Dictionary

- Japanese name: `模様辞典`
- English name: `Pattern Dictionary`
- Slug: `pattern-dictionary`
- Public URL: `https://nicheworks.app/tools/pattern-dictionary/`
- Specification status: `complete`
- Publication contract: `canonical-100-v1`
- Common specification: `common-spec/spec-ja.md`
- Current dataset: `100 verified-publication patterns`
- Product class: `static browser visual dictionary / discovery tool`
- Monetization class: `AFFILIATE` (active Amazon.co.jp maintained-intent links)

## Purpose

Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who recognize a pattern but do not know its formal name. It supports two equal discovery paths: visual browsing and vague Japanese/English natural-language description.

The product identifies a maintained pattern identity, exposes nearby/confusable patterns, provides bilingual dictionary detail pages, and offers explicit downstream Amazon links based only on maintained canonical commerce intents. It is not an asset marketplace, pattern generator, image-classification service, or live retailer-data product. Pattern Atlas remains a separate product.

## Current functional contract

The canonical v1 catalog is complete and frozen at exactly **100 published pattern IDs**.

- `data/patterns.json`: 100 canonical runtime records.
- `data/production-content.json`: 100 `verified-publication` records.
- `data/source-verification.json`: source-review state for all 100 terms; broad technique/style/tradition/material terms remain explicitly `qualified` where one universal motif would be misleading.
- `data/reference-images.json`: 100 deterministic 1536×1536 PNG Reference Images in `verified-publication` state.
- `data/reference-image-accuracy-audit.json`: complete 100-entry accuracy audit; 13 corrected, 37 representative-accepted, 50 accepted, 0 unresolved.
- Static detail surface: 100 Japanese + 100 English detail pages = **200 indexable detail URLs**.
- Search regression set: **264 maintained cases**.
- Comparison guidance: **72 maintained guides**.
- Amazon commerce layer: **305 maintained active Amazon.co.jp offers**, using fixed canonical queries and the shared NicheWorks Associates tag.

Search, filtering, ranking, autocomplete, and comparison run client-side against the maintained static dataset. Pattern IDs are language-independent. Japanese and English labels, aliases, search vocabulary, descriptions, relationships, and routes resolve to the same identity.

Search performs maintained weighted matching across names, aliases, descriptive terms, motif/geometry/family cues, culture/use terms, and other canonical vocabulary. Visual Autocomplete provides image-backed candidates. Search interpretation chips expose recognized cues and allow cue removal before reranking. Low-confidence searches must not fabricate certainty; they return nearby maintained candidates and confidence wording.

Every canonical ID has one deterministic 1536×1536 PNG Reference Image under `assets/reference/`. These images are recognition references, not claims that every real-world example has one exact appearance. Accuracy review is separately recorded as `accepted`, `representative-accepted`, or `corrected`, and the current audit has **0 unresolved** records.

Source verification is complete for all 100 terms. A `qualified` state is not an unfinished research flag: it marks terms where the name denotes a broader weave, technique, textile tradition, style, material effect, or overlapping naming convention that cannot honestly be reduced to one universal fixed repeat. User-facing copy and imagery must preserve that boundary.

Amazon affiliate navigation is active and downstream of identification. Provider is Amazon.co.jp, tracking ID is `nicheworks09-22`, and the shared helper is `/assets/amazon-affiliate.js`. Destinations come only from maintained canonical mappings in `data/affiliate-config.json`. User free text, autocomplete text, search chips, or other user state must never be forwarded into Amazon queries.

Future growth beyond 100 is not part of this contract. Any 101+ expansion requires a new versioned expansion plan rather than silently extending the canonical-100 dataset.

## Inputs

User-visible inputs are:

- free-form Japanese or English text describing appearance, color, use, culture, or an approximate name;
- visual family filter selection on the landing page;
- pattern-card or Visual Autocomplete candidate selection;
- removal of recognized search cues before reranking;
- two canonical pattern IDs for comparison;
- Japanese/English navigation.

The current tool does **not** accept image upload, account credentials, payment input, or user-supplied retailer queries.

Canonical runtime inputs are static same-origin files, principally:

- `tools/pattern-dictionary/data/patterns.json`
- `tools/pattern-dictionary/data/search-dictionary.json`
- `tools/pattern-dictionary/data/production-content.json`
- `tools/pattern-dictionary/data/source-verification.json`
- `tools/pattern-dictionary/data/reference-images.json`
- `tools/pattern-dictionary/data/compare-guides.json`
- `tools/pattern-dictionary/data/affiliate-config.json`

## Outputs

The tool produces:

- a bilingual image-backed 100-pattern browse grid;
- Visual Autocomplete candidates;
- ranked search candidates with confidence and matched cues;
- 200 static Japanese/English detail pages;
- maintained names, aliases, definitions, uses, recognition cues, source scope, and relationships;
- similar/common-confusion navigation;
- two-pattern comparison output backed by maintained comparison guidance;
- explicit fixed-query Amazon.co.jp affiliate links on detail surfaces.

It does not output downloadable pattern assets, generated pattern files, live Amazon product results, prices, stock, ratings, review counts, or delivery claims.

## State and persistence

Pattern search, ranking, filtering, autocomplete, comparison, and rendering run in the browser against static same-origin data. Query/search state may be represented in the page URL where applicable.

The implementation does not persist pattern queries, selections, or search history in `localStorage` or `sessionStorage`. The tool has no user account, server-side search history, or user-specific database state.

Canonical records, publication state, source-review state, image-review state, comparison guidance, and affiliate mappings live in repository-controlled static files. Missing or malformed canonical state must fail validation before publication rather than being silently reconstructed at runtime.

## Privacy and network behavior

Pattern search text, filtering, ranking, and comparison are processed locally in the browser against same-origin static data. Pattern Dictionary does not intentionally transmit the user's search text to an external AI/search service or to Amazon.

Affiliate navigation occurs only after an explicit user click on a maintained commerce action. User free text, autocomplete text, cue chips, and other search state are never used to construct Amazon destinations.

The page still follows NicheWorks common analytics, advertising, and support behavior; those common resources must not be described as absent.

## Language mode

`separate JA/EN pages`

Japanese root: `/tools/pattern-dictionary/`.

English root: `/tools/pattern-dictionary/en/`.

Japanese detail routes use `/tools/pattern-dictionary/patterns/{id}/`; English detail routes use `/tools/pattern-dictionary/en/patterns/{id}/`. Language switching on a detail page must preserve the canonical pattern ID. Mixed-language search vocabulary is allowed.

Landing pages and all 200 detail pages are publication surfaces. Detail pages are `index,follow`, present in the root sitemap, and paired with canonical/hreflang relationships. Search and compare are query/selection-dependent utilities and remain `noindex,follow`.

## Layout class

`hybrid`

Desktop uses a wide visual-discovery layout with an equal-square pattern grid, search/autocomplete, filters, detail surfaces, and comparison. Tablet target is 768px. Mobile verification targets are 390px and 320px.

Search, autocomplete, filters, cue chips, detail navigation, affiliate actions, and compare must work without a precision pointer. Page-level horizontal overflow is not allowed at supported widths. Filter rows may horizontally scroll where intentional. Interactive controls require usable keyboard focus, and Reference Images require meaningful alt text tied to the maintained pattern identity.

## Limits and non-goals

- Canonical v1 is frozen at 100 patterns.
- No image-upload identification is implemented.
- No runtime AI/API dependency is required for search.
- No downloadable asset or pattern-generator behavior belongs to this tool.
- No live retailer data is fetched.
- Pattern Atlas remains independent.
- Qualified technique/tradition/style terms are representative categories, not claims of one universal motif.
- Pattern Dictionary makes no price, inventory, rating, review, delivery, or product-quality claim about Amazon results.

Unknown or weak queries must degrade to nearby maintained candidates or an explicit low-confidence/zero-result state. Runtime code must not invent names, relationships, source states, affiliate queries, or imagery to fill missing canonical data.

## Acceptance criteria

- [x] Exactly 100 unique canonical IDs are published.
- [x] Visual browsing and ambiguous JA/EN text search are both primary discovery paths.
- [x] Visual Autocomplete and cue-removal reranking are implemented.
- [x] All 100 IDs have Japanese and English static detail routes.
- [x] All 200 detail pages are `index,follow` and present in the sitemap.
- [x] All 100 IDs have verified-publication 1536×1536 Reference Images.
- [x] A complete 100-entry image-accuracy audit exists with 0 unresolved records.
- [x] Qualified source terms preserve representative/non-universal wording.
- [x] Similar/confusable relationships and two-pattern compare resolve canonical IDs.
- [x] Maintained search regressions and comparison guides pass.
- [x] Amazon affiliate links use fixed canonical mappings; free text is never forwarded.
- [x] Desktop/mobile Chromium QA has passed after canonical-100 publication and image correction.
- [x] Future expansion beyond 100 requires a new versioned plan.

## Implementation evidence

Primary implementation and data:

- `tools/pattern-dictionary/index.html`
- `tools/pattern-dictionary/en/index.html`
- `tools/pattern-dictionary/search.html`
- `tools/pattern-dictionary/en/search.html`
- `tools/pattern-dictionary/compare.html`
- `tools/pattern-dictionary/en/compare.html`
- `tools/pattern-dictionary/app.js`
- `tools/pattern-dictionary/style.css`
- `tools/pattern-dictionary/data/patterns.json`
- `tools/pattern-dictionary/data/production-content.json`
- `tools/pattern-dictionary/data/source-verification.json`
- `tools/pattern-dictionary/data/reference-images.json`
- `tools/pattern-dictionary/data/reference-image-accuracy-audit.json`
- `tools/pattern-dictionary/data/search-dictionary.json`
- `tools/pattern-dictionary/data/compare-guides.json`
- `tools/pattern-dictionary/data/affiliate-config.json`
- `tools/pattern-dictionary/assets/reference/`

Publication/quality evidence:

- `tools/pattern-dictionary/tests/publication-test.mjs`
- `tools/pattern-dictionary/tests/reference-image-test.mjs`
- `tools/pattern-dictionary/tests/reference-image-accuracy-audit-test.mjs`
- `tools/pattern-dictionary/tests/search-test.mjs`
- `tools/pattern-dictionary/tests/compare-test.mjs`
- `tools/pattern-dictionary/tests/affiliate-test.mjs`
- `tools/pattern-dictionary/tests/seo-detail-test.mjs`
- `tools/pattern-dictionary/tests/browse-mobile-test.mjs`
- `tools/pattern-dictionary/tests/validate.mjs`
- `docs/tools/pattern-dictionary.md`
- `sitemap.xml`
