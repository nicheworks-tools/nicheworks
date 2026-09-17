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

## 2. Purpose

Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who recognize a pattern but do not know its formal name. Visual browsing and vague Japanese/English description search are equal-priority entry paths.

Canonical v1 is complete and frozen at exactly 100 IDs. The product moves a user from an uncertain description to one or more maintained pattern identities, then to definitions, recognition cues, aliases, nearby/confusable patterns, comparison guidance, and optional maintained Amazon links. It is not an image-classification service, asset marketplace, or pattern generator.

The current production contract includes 100 canonical runtime records, 100 verified publication records, 100 deterministic 1536×1536 PNG Reference Images, 200 indexable bilingual detail pages, 264 maintained search regression cases, 72 comparison guides, and 305 maintained active Amazon.co.jp offers.

The complete Reference Image accuracy audit covers 100/100 records: 13 corrected, 37 representative-accepted, 50 accepted, 0 unresolved.

## 3. Inputs

User-visible inputs:

- free-form Japanese or English description text;
- visual family filters;
- pattern-card or Visual Autocomplete selection;
- recognized-cue removal and reranking;
- two canonical pattern IDs for comparison;
- Japanese/English navigation.

Canonical runtime data is maintained in static repository files including `patterns.json`, `search-dictionary.json`, `production-content.json`, `source-verification.json`, `reference-images.json`, `compare-guides.json`, and `affiliate-config.json`.

The current product does not accept image uploads, accounts, payment input, or user-generated retailer queries.

## 4. Processing behavior

Search, filtering, ranking, autocomplete, and comparison execute client-side against same-origin canonical static data. Pattern IDs are language-independent. Japanese/English labels, aliases, search terms, relationships, detail routes, and Reference Images resolve to the same identity.

Search uses maintained weighted vocabulary across exact names, aliases, visual descriptions, geometry/motif/family cues, culture/use terms, and other curated signals. Low-confidence searches preserve uncertainty and return nearby maintained candidates rather than fabricating certainty. Search interpretation chips expose recognized cues and can be removed before reranking.

Visual browsing remains a primary discovery surface. Reference Images are deterministic recognition aids; user queries do not recolor or regenerate them.

Source review is complete for all 100 terms. Some records are deliberately `qualified` because the term denotes a broader weave, technique, textile tradition, style, material effect, or overlapping naming convention rather than one immutable visual repeat. `qualified` does not mean unfinished; copy and imagery must preserve that non-universal boundary.

Every canonical ID has one deterministic 1536×1536 PNG under `tools/pattern-dictionary/assets/reference/`. Accuracy review is separately recorded in `data/reference-image-accuracy-audit.json` as `accepted`, `representative-accepted`, or `corrected`. Mere file existence, dimensions, or successful browser decode is not sufficient evidence of visual accuracy.

Amazon affiliate destinations come only from maintained fixed mappings in `data/affiliate-config.json`. User free text, autocomplete text, cue chips, and other query state must never be forwarded to Amazon.

## 5. Outputs

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

## 6. Error behavior

Unknown or weak queries must degrade to explicit low-confidence or zero-result behavior. Runtime code must not invent pattern names, source state, relationships, affiliate queries, or visual assets.

Malformed canonical data, unresolved relationships, missing detail routes, missing Reference Images, or publication-state drift must fail validation before release.

A broad/qualified term must not be converted into a false claim that one representative image is its only correct form.

## 7. Privacy/data handling

Search text, filtering, ranking, and comparison are processed in the browser against same-origin static files. Pattern Dictionary does not intentionally send user search text to an external AI/search service or to Amazon.

The product has no user account or server-side search history and does not persist query history in `localStorage` or `sessionStorage`. URL query state may be used where applicable.

Common NicheWorks analytics, advertising, and support behavior still applies.

## 8. Responsive contract

The product is a visual-discovery interface with supported verification widths at desktop, 768px tablet, 390px mobile, and 320px mobile.

- No page-level horizontal overflow at supported widths.
- Search, autocomplete, filters, cue chips, detail navigation, comparison, and affiliate actions must work without a precision pointer.
- Horizontal scrolling is permitted for compact filter rows where intentional.
- Interactive controls require usable keyboard focus.
- Reference Images require meaningful alt text tied to the maintained pattern identity.

## 9. Language contract

Pattern Dictionary uses separate Japanese and English public pages backed by one canonical identity set.

- Japanese root: `/tools/pattern-dictionary/`
- English root: `/tools/pattern-dictionary/en/`
- Japanese detail: `/tools/pattern-dictionary/patterns/{id}/`
- English detail: `/tools/pattern-dictionary/en/patterns/{id}/`

Language switching on detail routes preserves the canonical pattern ID. Mixed-language search vocabulary is supported.

## 10. SEO contract

The Japanese/English landing pages and all 200 static detail pages are publication surfaces.

- Detail pages are `index,follow`.
- Every detail URL is in the root sitemap.
- JA/EN detail pairs expose canonical/hreflang relationships.
- Detail pages expose production Reference Images through social metadata.
- Search and compare remain `noindex,follow` because their content is query/selection dependent.
- No thin color/scale/variant URL families are created.

## 11. Advertising contract

Pattern Dictionary follows the NicheWorks common advertising contract. Advertising must not obstruct search, visual browsing, detail interpretation, comparison, or affiliate actions.

Ads must not be styled as dictionary facts, search results, similar-pattern recommendations, comparison conclusions, or Amazon affiliate actions.

## 12. Donation/support contract

The standard NicheWorks support area may link to supported donation services according to the common site contract. Support remains optional and must not gate browsing, search, detail pages, comparison, or affiliate navigation.

## 13. Help/usage/FAQ contract

The landing-page UI must make both primary discovery paths understandable: describe a pattern in ordinary words or browse visually.

Qualified broad terms require wording that explains when the shown Reference Image is representative rather than universal. Comparison guidance should explain decisive cues where they exist and preserve ambiguity where appearance alone cannot honestly decide the name.

Canonical v1 does not require a separate long-form FAQ page if the core interaction and boundaries remain understandable in the product UI and detail copy.

## 14. Functional acceptance tests

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

Acceptance for canonical v1 requires exactly 100 published IDs, 200 indexable bilingual detail pages, 100 verified Reference Images, complete terminology/source scope, complete image-accuracy audit with 0 unresolved, maintained search/compare behavior, fixed-query affiliate behavior with no free-text forwarding, and successful desktop/mobile browser QA.

## 15. Explicit tool-specific exceptions

- Canonical v1 is intentionally frozen at 100 patterns; any 101+ catalog requires a new versioned expansion plan.
- No image-upload identification is implemented in canonical v1.
- No runtime AI/API dependency is required for search.
- No downloadable pattern asset feature belongs to this tool.
- No pattern-generator behavior belongs to this tool.
- No live retailer data is fetched.
- Qualified technique/tradition/style/material terms use representative recognition imagery rather than claiming one universal motif.
- Pattern Atlas remains a separate product.
