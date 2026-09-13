# Pattern Dictionary — Canonical Tool Specification

## 1. Purpose

Pattern Dictionary is a bilingual visual pattern-identification dictionary. It is designed for users who do not know a pattern's formal name and therefore need to discover it either by looking through images or by describing its appearance in ordinary Japanese or English. It is not an asset-download product. The current repository slice validates the discovery model with 20 prototype-curated patterns before expansion to the planned 100-pattern catalog.

## 2. User-visible inputs

- Free-form Japanese or English search text describing appearance, color, use, culture, or an approximate name.
- Visual family filter selection on the top page.
- Pattern-card or Visual Autocomplete candidate selection.
- Search-interpretation cue removal on the search results page.
- Two pattern IDs for the comparison view.
- Normal page/language navigation between Japanese and English pages.

No image upload, account input, or payment input is accepted by the current slice.

## 3. User-visible outputs

- Image-backed pattern grid for visual browsing.
- Visual Autocomplete candidates while typing.
- Ranked search candidates with confidence wording and matched cues.
- Bilingual static pattern detail pages containing names, aliases, representative colors, uses, relationships, and prototype description text.
- Similar and commonly-confused pattern cards derived from canonical data.
- Two-pattern comparison output.
- A non-functional commerce placeholder indicating that product discovery will be connected later; no live affiliate URL is emitted in this slice.

## 4. Functional behavior

- Canonical pattern records live in `data/patterns.json` and use language-independent stable IDs.
- Search is client-side and combines normalized names, aliases, descriptive terms, canonical pattern attributes, and the bilingual search dictionary.
- Visual browsing and ambiguous text search are equal-priority discovery paths.
- Visual Autocomplete returns image-backed candidates rather than text-only suggestions.
- Search interpretation chips expose recognized cues and let the user remove a cue and rerank.
- Low-confidence searches explicitly present nearby candidates instead of asserting a certain identification.
- Family filters use micro-pattern visual cues in addition to labels.
- Pattern-card, autocomplete, related-pattern, and search-result links resolve to static `/patterns/{id}/` or `/en/patterns/{id}/` pages.
- Detail-page language switching preserves the same canonical pattern ID.
- Primary pattern colors are deterministic and are not randomized by searches.
- `color_role` is one of `non-essential`, `traditional`, `identity-relevant`, or `variable`.
- DEV placeholder imagery must remain visibly marked until replaced by verified production Reference Images.

## 5. Current Pro behavior

There is no Pattern Dictionary Pro feature in the current implementation. No capability is gated by NicheWorks Pro, and no paid entitlement is read or stored. The intended monetization path for this tool is affiliate referral after a user has identified a pattern, not a Pro feature boundary. Live Amazon affiliate URLs are intentionally absent from this slice.

## 6. Network / external dependencies

Core pattern search, filtering, comparison, and data lookup run from static same-origin files and do not require an external search API. Page presentation currently loads the repository's standard Google analytics/advertising and Cloudflare analytics resources. Footer support links can navigate to OFUSE and Ko-fi when the user chooses them. User search text is not sent to an external pattern-search service.

## 7. Browser storage

The current Pattern Dictionary implementation does not use `localStorage` or `sessionStorage` for pattern queries, selections, or history. Query state is represented by the page URL where applicable.

## 8. Download / copy behavior

The current slice does not provide pattern-asset download or copy operations. DEV placeholder imagery is for interface validation only and is not offered as a downloadable asset. Future commerce links must remain separate from any asset-download concept.

## 9. Privacy expectations

- Search text and ranking are processed in the browser against same-origin static data.
- Search text must not be sent to an external search or AI service.
- The tool must not claim that standard page analytics/advertising resources are absent; those resources follow the NicheWorks common site behavior.
- No personal profile, account, payment, or uploaded image data is collected by the tool itself in this slice.

## 10. Responsive expectations

- The pattern catalog must remain visually scannable on desktop, tablet, and phone layouts.
- Target verification widths are 1200px, 768px, 390px, and 320px.
- The primary mobile catalog is a two-column visual grid.
- Visual filter controls may scroll horizontally on narrow screens rather than collapsing into unreadable jargon-only controls.
- Two-pattern comparison remains two-up where practical on mobile and must avoid horizontal page overflow.
- Search, autocomplete, interpretation chips, and detail content must remain usable without precision pointer input.

## 11. Known limits

- The current catalog contains only 20 representative patterns rather than the planned 100-pattern first release.
- All 20 records remain `prototype-curated`; their historical/name/taxonomy facts have not yet completed source verification.
- Current large pattern visuals are deterministic DEV SVG placeholders, not verified production Reference Images.
- Static detail pages therefore remain `noindex,follow` until data and Reference Image verification are complete.
- Final primary image target is 1536×1536 PNG.
- Search smoke coverage is intentionally small at this stage and must expand before release-scale confidence claims.
- No live Amazon affiliate URLs are present yet.
- Browser QA for all target widths remains a pre-ready-for-review gate.

## 12. Automated checks

- `tools/pattern-dictionary/tests/validate.mjs` validates the 20-record structure, stable required fields, and required static files/pages.
- `tools/pattern-dictionary/tests/search-test.mjs` runs deterministic ambiguous-search smoke cases against the same canonical data and search dictionary.
- JavaScript syntax for `app.js` is checked during implementation work.
- Repository-wide tool, SEO, publication, and quality audits remain applicable once the tool is registered.

## 13. Current classification

- Product state: repository vertical slice / pre-release validation.
- Runtime type: static browser tool.
- Language policy: separate Japanese and English public pages sharing one canonical dataset.
- Monetization classification: `AFFILIATE` by intended downstream Amazon Associates product discovery; live affiliate links remain disabled until separate activation work.
- Pattern data state: `prototype-curated`.
- Detail-page indexability: `noindex,follow` until source and image verification.

## 14. Canonical source of truth

- Canonical product specification: `docs/tools/pattern-dictionary.md`.
- Tool-local implementation contract: `tools/pattern-dictionary/SPEC.md`.
- Pattern records: `tools/pattern-dictionary/data/patterns.json`.
- Ambiguous-search mapping: `tools/pattern-dictionary/data/search-dictionary.json`.
- Runtime search/rendering logic: `tools/pattern-dictionary/app.js`.
- Shared responsive presentation: `tools/pattern-dictionary/style.css`.
- Canonical public detail URL shape: `/tools/pattern-dictionary/patterns/{id}/` and `/tools/pattern-dictionary/en/patterns/{id}/`.
- Existing `tools/pattern-atlas/` is a separate tool and is not a source of truth for Pattern Dictionary.

## 15. Coverage checklist

- [x] Purpose documented
- [x] Inputs documented
- [x] Outputs documented
- [x] Pro/free boundary documented
- [x] Network/privacy behavior documented
- [x] Responsive expectations documented
- [x] Known limits documented
