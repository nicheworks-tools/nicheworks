# Pattern Dictionary — Canonical Tool Specification

## 1. Identity

- **Slug:** `pattern-dictionary`
- **Japanese name:** 模様辞典
- **English name:** Pattern Dictionary
- **Public URL:** `https://nicheworks.app/tools/pattern-dictionary/`
- **Implementation:** `tools/pattern-dictionary/`
- **Tool-local contract:** `tools/pattern-dictionary/SPEC.md`
- **Publication contract:** `canonical-100-v1`
- **Current publication state:** 100 verified-publication patterns
- **Monetization classification:** `AFFILIATE`; maintained Amazon.co.jp links are active downstream of identification
- **Relationship to Pattern Atlas:** separate product; Pattern Atlas is not modified or replaced by Pattern Dictionary

## 2. Product definition

Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who recognize a pattern but do not know its formal name. Visual browsing and vague Japanese/English description search are equal-priority entry paths.

The product moves a user from an uncertain description to one or more maintained pattern identities, then to definitions, recognition cues, aliases, nearby/confusable patterns, comparison guidance, and optional maintained Amazon links. It is not an image-classification service, asset marketplace, or pattern generator.

## 3. Canonical v1 publication state

Canonical v1 is complete and frozen at exactly 100 IDs.

- 100 canonical runtime records in `data/patterns.json`.
- 100 verified publication records in `data/production-content.json`.
- Source-review coverage for all 100 terms in `data/source-verification.json`.
- 100 deterministic 1536×1536 PNG Reference Images in verified-publication state.
- 100-entry image-accuracy audit: 13 corrected, 37 representative-accepted, 50 accepted, 0 unresolved.
- 100 Japanese + 100 English static detail pages, all published and indexable.
- 264 maintained search regressions.
- 72 maintained comparison guides.
- 305 maintained active Amazon.co.jp offers based only on fixed canonical mappings.

A future 101+ catalog is outside this specification and requires a new versioned expansion plan.

## 4. Inputs

User-visible inputs:

- free-form Japanese or English description text;
- visual family filters;
- pattern-card or Visual Autocomplete selection;
- recognized-cue removal and reranking;
- two canonical pattern IDs for comparison;
- Japanese/English navigation.

The current product does not accept image uploads, accounts, payments, or user-generated retailer queries.

## 5. Processing behavior

Search, filtering, ranking, autocomplete, and comparison execute client-side against same-origin canonical static data. Pattern IDs are language-independent. Japanese/English labels, aliases, search terms, relationships, detail routes, and Reference Images resolve to the same identity.

Search uses maintained weighted vocabulary across exact names, aliases, visual descriptions, geometry/motif/family cues, culture/use terms, and other curated signals. Low-confidence searches must preserve uncertainty and return nearby maintained candidates rather than fabricate certainty.

Visual browsing remains a primary discovery surface. Reference Images are deterministic recognition aids; user queries do not recolor or regenerate them.

## 6. Terminology and source boundary

All 100 terms have source-review state. Some terms remain explicitly `qualified` because they denote a broad technique, weave, textile tradition, style, material effect, or overlapping naming convention rather than one immutable visual repeat.

`qualified` does not mean unfinished. It means user-facing copy and imagery must preserve the non-universal boundary. One representative image must not be described as the only correct form of Sashiko, Adire, Kuba cloth, Shibori, Batik, Marbling, and other broad terms of this type.

## 7. Reference Image contract

Every canonical ID has one deterministic 1536×1536 PNG under `tools/pattern-dictionary/assets/reference/`.

Accuracy review is separately recorded in `data/reference-image-accuracy-audit.json`:

- `accepted`: materially matches the maintained recognition structure;
- `representative-accepted`: defensible representative cue for a broad/non-universal term;
- `corrected`: prior published render was capable of misleading recognition and was replaced.

The current audit covers 100/100 records with 0 unresolved. Mere file existence, dimensions, or successful browser decode is not sufficient evidence of visual accuracy.

## 8. Outputs

Pattern Dictionary outputs:

- bilingual 100-pattern visual browse surfaces;
- Visual Autocomplete candidates;
- ranked search candidates with confidence and recognized cues;
- 200 static bilingual detail pages;
- maintained names, aliases, definitions, recognition cues, uses, terminology scope, and relationships;
- similar/common-confusion navigation;
- two-pattern comparison guidance;
- explicit fixed-query Amazon.co.jp affiliate actions.

The product does not output downloadable pattern files or live retailer price, inventory, rating, review, or delivery data.

## 9. Affiliate contract

Amazon affiliate navigation is active but remains downstream of the identification experience.

- Provider: Amazon.co.jp.
- Tracking ID: `nicheworks09-22`.
- Shared helper: `/assets/amazon-affiliate.js`.
- Destinations are fixed in `data/affiliate-config.json`.
- User free text, autocomplete text, cue chips, and other query state must never be forwarded to Amazon.
- Affiliate links must be visibly distinct from dictionary facts and search/comparison results.
- Pattern Dictionary makes no product-quality, price, stock, rating, review, or delivery claim.

## 10. Language and routes

- Japanese root: `/tools/pattern-dictionary/`
- English root: `/tools/pattern-dictionary/en/`
- Japanese detail: `/tools/pattern-dictionary/patterns/{id}/`
- English detail: `/tools/pattern-dictionary/en/patterns/{id}/`

Language switching on detail routes preserves the canonical pattern ID. Mixed-language search vocabulary is supported.

## 11. SEO contract

The Japanese/English landing pages and all 200 static detail pages are publication surfaces.

- Detail pages are `index,follow`.
- Every detail URL is in the root sitemap.
- JA/EN detail pairs expose canonical/hreflang relationships.
- Detail pages expose production Reference Images through social metadata.
- Search and compare remain `noindex,follow` because their content is query/selection dependent.
- No thin color/scale/variant URL families are created.

## 12. Privacy and network behavior

Search text, filtering, ranking, and comparison are processed in the browser against same-origin static files. Pattern Dictionary does not intentionally send user search text to an external AI/search service or to Amazon.

The product has no user account or server-side search history and does not persist query history in browser storage. URL query state may be used where applicable.

Common NicheWorks analytics, advertising, and support behavior still applies.

## 13. Responsive/accessibility contract

The product is a visual-discovery interface with supported verification widths at desktop, 768px tablet, 390px mobile, and 320px mobile.

- No page-level horizontal overflow at supported widths.
- Search, autocomplete, filters, cue chips, detail navigation, comparison, and affiliate actions must work without a precision pointer.
- Horizontal scrolling is permitted for compact filter rows where intentional.
- Interactive controls require usable keyboard focus.
- Reference Images require meaningful alt text tied to the pattern identity.

## 14. Error behavior

Unknown or weak queries must degrade to explicit low-confidence or zero-result behavior. Runtime code must not invent pattern names, source state, relationships, affiliate queries, or visual assets.

Malformed canonical data, unresolved relationships, missing detail routes, missing Reference Images, or publication-state drift must fail validation before release.

## 15. Explicit non-goals

- No image-upload identification in canonical v1.
- No runtime AI/API dependency for search.
- No downloadable pattern asset feature.
- No pattern-generator behavior.
- No live retailer data retrieval.
- No silent expansion beyond canonical 100.
- Pattern Atlas remains a separate product.

## 16. Acceptance evidence

Current repository evidence includes:

- `tools/pattern-dictionary/tests/publication-test.mjs`
- `tools/pattern-dictionary/tests/reference-image-test.mjs`
- `tools/pattern-dictionary/tests/reference-image-accuracy-audit-test.mjs`
- `tools/pattern-dictionary/tests/search-test.mjs`
- `tools/pattern-dictionary/tests/compare-test.mjs`
- `tools/pattern-dictionary/tests/affiliate-test.mjs`
- `tools/pattern-dictionary/tests/seo-detail-test.mjs`
- `tools/pattern-dictionary/tests/browse-mobile-test.mjs`
- `tools/pattern-dictionary/tests/validate.mjs`
- `tools/pattern-dictionary/data/reference-image-accuracy-audit.json`
- `sitemap.xml`

Canonical v1 acceptance requires exactly 100 published IDs, 200 indexable bilingual detail pages, 100 verified Reference Images, complete terminology/source scope, complete image-accuracy audit with 0 unresolved, maintained search/compare behavior, fixed-query affiliate behavior with no free-text forwarding, and successful desktop/mobile browser QA.
