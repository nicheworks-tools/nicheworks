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

## Current publication state

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

- `data/patterns.json`
- `data/search-dictionary.json`
- `data/production-content.json`
- `data/source-verification.json`
- `data/reference-images.json`
- `data/compare-guides.json`
- `data/affiliate-config.json`

## Search and discovery behavior

Search, filtering, ranking, autocomplete, and comparison run client-side against the maintained static dataset. Pattern IDs are language-independent. Japanese and English labels, aliases, search vocabulary, descriptions, relationships, and routes resolve to the same identity.

Search performs maintained weighted matching across names, aliases, descriptive terms, motif/geometry/family cues, culture/use terms, and other canonical vocabulary. Visual Autocomplete provides image-backed candidates. Search interpretation chips expose recognized cues and allow cue removal before reranking.

Low-confidence searches must not fabricate certainty. They return nearby maintained candidates and confidence wording. Zero-result and weak-result handling must preserve that uncertainty rather than invent a pattern outside the catalog.

Visual browsing is a primary path, not a secondary fallback. Family filters and the equal-square reference grid must remain usable without prior taxonomy knowledge.

## Reference Image contract

Every canonical ID has one deterministic 1536×1536 PNG Reference Image under `assets/reference/`. These images are recognition references, not claims that every real-world example has one exact appearance.

`data/reference-image-accuracy-audit.json` defines the accuracy boundary:

- `accepted`: the render materially represents the maintained recognition structure;
- `representative-accepted`: for a broad technique/style/tradition/material term, the render is one defensible representative cue rather than a universal canonical motif;
- `corrected`: a previously published render was judged capable of misleading recognition and was replaced.

The current audit is complete for all 100 records with **0 unresolved**. Accuracy-review state must remain distinct from mere image existence, dimensions, or decode success.

## Source and terminology contract

Source verification is complete for all 100 published terms. A `qualified` state is not an unfinished research flag: it marks terms where the name denotes a broader weave, technique, textile tradition, style, material effect, or overlapping naming convention that cannot honestly be reduced to one universal fixed repeat.

User-facing copy for qualified terms must preserve that boundary. The runtime must not convert a qualified term into a false statement that one Reference Image is the only correct form.

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

## Affiliate contract

Amazon affiliate navigation is active and downstream of identification.

- Provider: Amazon.co.jp.
- Shared tracking ID: `nicheworks09-22`.
- Shared helper: `/assets/amazon-affiliate.js`.
- Destinations come only from maintained canonical mappings in `data/affiliate-config.json`.
- User free text, autocomplete text, search chips, or other user state must never be forwarded into Amazon queries.
- Affiliate actions must remain visibly distinct from dictionary facts, search results, or comparison conclusions.
- No price, inventory, rating, review, or product-quality claim is made by Pattern Dictionary.

## Language contract

Pattern Dictionary uses separate Japanese and English public pages backed by one canonical identity set.

- Japanese root: `/tools/pattern-dictionary/`
- English root: `/tools/pattern-dictionary/en/`
- Japanese detail: `/tools/pattern-dictionary/patterns/{id}/`
- English detail: `/tools/pattern-dictionary/en/patterns/{id}/`

Language switching on a detail page must preserve the canonical pattern ID. Mixed-language search vocabulary is allowed.

## SEO contract

The Japanese and English landing pages and all 200 static detail pages are publication surfaces.

- Published detail pages are `index,follow`.
- Every published detail URL is present in the root sitemap.
- Japanese/English detail pairs use canonical and hreflang relationships.
- Detail pages carry Open Graph/Twitter metadata and absolute production Reference Image previews.
- Search and compare pages are query/selection-dependent utilities and remain `noindex,follow`.
- No thin color/scale/variant URL families are introduced.

## Privacy and network behavior

Pattern search text, filtering, ranking, and comparison are processed in the browser against same-origin static data. Pattern Dictionary does not intentionally transmit the user's search text to an external AI/search service or to Amazon.

The tool does not maintain user accounts or server-side search history and does not persist pattern queries in `localStorage` or `sessionStorage`. Query state may appear in the page URL where applicable.

The page still follows NicheWorks common analytics, advertising, and support behavior; those common resources must not be described as absent.

## Responsive and accessibility contract

The product is a visual-discovery interface.

- Desktop target: approximately 960–1200px useful content width.
- Tablet target: 768px.
- Mobile verification targets: 390px and 320px.
- Search, autocomplete, filters, chips, detail navigation, affiliate actions, and compare must work without a precision pointer.
- Page-level horizontal overflow is not allowed at supported widths.
- Filter rows may horizontally scroll where appropriate.
- Reference images require meaningful alt text tied to the maintained pattern identity.
- Keyboard focus and interactive control semantics must remain visible and usable.

## Error behavior

Unknown or weak queries must degrade to nearby maintained candidates or an explicit low-confidence/zero-result state. Runtime code must not invent names, relationships, source states, affiliate queries, or imagery to fill missing canonical data.

Malformed canonical data, missing detail routes, missing Reference Images, unresolved relationships, or publication-state drift must fail validation before publication.

## Limits and non-goals

- Canonical v1 is frozen at 100 patterns.
- No image-upload identification is implemented.
- No runtime AI/API dependency is required for search.
- No downloadable asset or pattern-generator behavior belongs to this tool.
- No live retailer data is fetched.
- Pattern Atlas remains independent.
- Qualified technique/tradition/style terms are representative categories, not claims of one universal motif.

## Acceptance criteria

- [x] Exactly 100 unique canonical IDs are published.
- [x] Visual browsing and ambiguous JA/EN text search are both primary discovery paths.
- [x] Visual Autocomplete and cue-removal reranking are implemented.
- [x] All 100 IDs have Japanese and English static detail routes.
- [x] All 200 detail pages are indexable and present in the sitemap.
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

- `index.html`, `en/index.html`
- `search.html`, `en/search.html`
- `compare.html`, `en/compare.html`
- `app.js`, `style.css`
- `data/patterns.json`
- `data/production-content.json`
- `data/source-verification.json`
- `data/reference-images.json`
- `data/reference-image-accuracy-audit.json`
- `data/search-dictionary.json`
- `data/compare-guides.json`
- `data/affiliate-config.json`
- `assets/reference/*.png`

Publication/quality evidence:

- `tests/publication-test.mjs`
- `tests/reference-image-test.mjs`
- `tests/reference-image-accuracy-audit-test.mjs`
- `tests/search-test.mjs`
- `tests/compare-test.mjs`
- `tests/affiliate-test.mjs`
- `tests/seo-detail-test.mjs`
- `tests/browse-mobile-test.mjs`
- `tests/validate.mjs`
- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- `docs/tools/pattern-dictionary.md`
- `sitemap.xml`
