# Tool Specification — Pattern Dictionary

- Japanese name: `模様辞典`
- English name: `Pattern Dictionary`
- Slug: `pattern-dictionary`
- Public URL: `https://nicheworks.app/tools/pattern-dictionary/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Current dataset: `20 prototype-curated patterns`
- Product class: `static browser visual dictionary / discovery tool`
- Monetization class: `AFFILIATE` (planned downstream Amazon Associates handoff; live affiliate URLs disabled in this slice)

## Purpose

Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who do not know a pattern's formal name. It supports two equal discovery paths: ambiguous natural-language description and visual browsing. The tool is not an asset-download marketplace and is separate from the existing Pattern Atlas creation/export tool.

The current repository slice validates the discovery model with 20 prototype-curated pattern records before expansion toward the planned 100-pattern first release.

## Current functional contract

The current slice provides Japanese and English landing pages, client-side ambiguous search, image-backed Visual Autocomplete, search-interpretation chips, micro-pattern family filters, static bilingual detail routes for every maintained pattern ID, related/confusable-pattern navigation, and two-pattern comparison.

Canonical pattern records use language-independent stable IDs. Japanese and English labels, aliases, search terms, descriptions, and navigation point to the same identity. Detail-page language switching preserves the pattern ID. Search normalization and ranking run in the browser against same-origin static data.

Visual browsing and vague-language search are equal-priority entry paths. Low-confidence search results must present nearby candidates rather than claim a certain identification. Primary pattern colors are deterministic; user queries do not recolor the primary reference image. Current large visuals are visibly marked DEV placeholders and must not be represented as verified Reference Images.

The current 20 records remain `prototype-curated`. Their static detail pages therefore remain `noindex,follow` until source verification and production Reference Image verification are complete. Japanese and English landing pages are the only Pattern Dictionary pages intended to be indexable in this slice. Search and compare pages are also `noindex,follow`.

## Inputs

User-visible inputs are:

- free-form Japanese or English search text describing appearance, color, use, culture, or an approximate name;
- pattern-family filter selection on the landing page;
- pattern-card or Visual Autocomplete candidate selection;
- removal of recognized search cues on the results page;
- two pattern IDs for comparison;
- Japanese/English page navigation.

Canonical runtime data inputs are:

- `tools/pattern-dictionary/data/patterns.json`
- `tools/pattern-dictionary/data/search-dictionary.json`

No image upload, account input, or payment input is accepted by the current slice.

## Outputs

The tool produces:

- an image-backed pattern grid for visual browsing;
- Visual Autocomplete candidates while typing;
- ranked candidates with confidence wording and matched cues;
- static Japanese and English pattern detail pages;
- names, aliases, representative colors, uses, relationships, and prototype description text from canonical data;
- similar and commonly-confused pattern cards;
- two-pattern comparison output.

No downloadable pattern asset, live Amazon product result, live price, stock, rating, review count, or delivery claim is part of the current contract.

## State and persistence

Pattern search, ranking, filtering, comparison, and rendering run in the browser. Search/query state may be represented in the page URL where applicable. The current implementation does not persist pattern queries, selections, or history in `localStorage` or `sessionStorage`.

Canonical records and search mappings live in static repository JSON files. The tool has no user account, server-side search history, or user-specific database state.

## Privacy and network behavior

Pattern search text and ranking are processed locally in the browser against same-origin static data. Search text is not intentionally sent to an external pattern-search or AI service.

The page still follows NicheWorks common analytics, advertising, and support behavior, including standard site analytics/advertising resources and user-initiated OFUSE/Ko-fi navigation. These common resources must not be described as absent.

Future Amazon affiliate navigation, when separately activated, must occur only after explicit user action on a clearly labelled commerce link and must remain downstream of the identification experience. No live affiliate URL is emitted in this slice.

## Language mode

`separate JA/EN pages`

Japanese root: `/tools/pattern-dictionary/`.

English root: `/tools/pattern-dictionary/en/`.

Pattern detail routes use the same canonical ID in both languages. Language switching on a detail page must preserve that ID rather than return the user to a generic language home.

## Layout class

`hybrid`

Desktop uses a wide visual-discovery layout with a substantial equal-square pattern grid, search/autocomplete, visual filters, and detail/comparison surfaces. Mobile keeps the pattern catalog in two columns while surrounding controls collapse responsively. Target verification widths are 1200px, 768px, 390px, and 320px. Search, filter, autocomplete, and compare interactions must remain usable without a precision pointer and without horizontal page overflow.

## Limits and non-goals

- Current catalog size is 20 patterns, not the planned 100-pattern first release.
- Pattern facts are still `prototype-curated` and are not yet source-verified for publication as authoritative dictionary entries.
- Current pattern visuals are deterministic DEV SVG placeholders, not verified 1536×1536 PNG Reference Images.
- Detail pages remain `noindex,follow` until data and image verification gates are satisfied.
- Search smoke coverage is deliberately small and cannot support broad recall/accuracy claims yet.
- No image-upload identification is implemented.
- No runtime AI/API search is required for the current product contract.
- No asset download or pattern generator behavior belongs to this tool.
- Existing `tools/pattern-atlas/` remains a separate tool and is not modified by this product.
- No live Amazon affiliate URLs are enabled yet.

## Acceptance criteria

- [x] One registered Pattern Dictionary tool exists at `/tools/pattern-dictionary/` with a separate English landing at `/tools/pattern-dictionary/en/`.
- [x] Twenty canonical prototype records use unique language-independent IDs.
- [x] Visual browsing and ambiguous natural-language search are both implemented as primary discovery paths.
- [x] Visual Autocomplete shows image-backed candidates.
- [x] Search interpretation chips expose recognized cues and support cue removal/reranking.
- [x] All 20 IDs have static Japanese and English detail routes.
- [x] Detail-page language switching preserves the canonical pattern ID.
- [x] Similar and commonly-confused relationships render from canonical data.
- [x] Compare supports two pattern IDs.
- [x] DEV imagery is visibly marked and is not represented as verified production Reference Imagery.
- [x] Search/compare and prototype detail pages remain `noindex,follow` while the two landing pages are the intended indexable entry points.
- [x] No live affiliate URL is introduced in this slice.
- [ ] Source verification and production Reference Images are complete for publication-scale detail indexing.
- [ ] Browser QA is complete at 1200px, 768px, 390px, and 320px.

## Implementation evidence

Production/runtime evidence:

- `tools/pattern-dictionary/index.html`
- `tools/pattern-dictionary/en/index.html`
- `tools/pattern-dictionary/search.html`
- `tools/pattern-dictionary/en/search.html`
- `tools/pattern-dictionary/compare.html`
- `tools/pattern-dictionary/en/compare.html`
- `tools/pattern-dictionary/app.js`
- `tools/pattern-dictionary/style.css`
- `tools/pattern-dictionary/data/patterns.json`
- `tools/pattern-dictionary/data/search-dictionary.json`
- `tools/pattern-dictionary/tests/validate.mjs`
- `tools/pattern-dictionary/tests/search-test.mjs`

Publication/discovery evidence:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- `docs/tools/pattern-dictionary.md`
- `sitemap.xml`

Publication state remains prototype-gated until source verification, production PNG Reference Images, and target-width browser QA are complete.
