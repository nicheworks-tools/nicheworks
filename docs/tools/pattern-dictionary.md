# Pattern Dictionary — Canonical Tool Specification

## 1. Identity

- **Slug:** `pattern-dictionary`
- **Japanese name:** 模様辞典
- **English name:** Pattern Dictionary
- **Public URL:** `https://nicheworks.app/tools/pattern-dictionary/`
- **Implementation:** `tools/pattern-dictionary/`
- **Tool-local contract:** `tools/pattern-dictionary/SPEC.md`
- **Current publication state:** first repository vertical slice with 20 `prototype-curated` patterns
- **Monetization classification:** `AFFILIATE`; live Amazon affiliate URLs are not enabled in this slice
- **Relationship to Pattern Atlas:** separate product; `tools/pattern-atlas/` is not modified or replaced by Pattern Dictionary

## 2. Purpose

Pattern Dictionary is a bilingual visual pattern-identification dictionary for users who do not know a pattern's formal name. It is built around two equal discovery paths: vague natural-language description and visual browsing.

The product goal is to help a user move from “I recognize the look but do not know what it is called” to a stable pattern identity, nearby/confusable patterns, and practical related information. It is not an asset-download marketplace and it is not a pattern generator.

The current slice validates this discovery model with 20 representative records before expansion toward the planned 100-pattern first release.

## 3. Inputs

User-visible inputs:

- free-form Japanese or English search text;
- visual family filters on the top page;
- Visual Autocomplete or pattern-card selection;
- removal of recognized search cues on the result page;
- two canonical pattern IDs for comparison;
- Japanese/English navigation.

Canonical runtime data:

- `tools/pattern-dictionary/data/patterns.json`
- `tools/pattern-dictionary/data/search-dictionary.json`

No account input, payment input, or image upload is accepted in the current slice.

## 4. Processing behavior

Search and filtering run client-side against the canonical static dataset. Pattern IDs are language-independent. Japanese and English names, aliases, search vocabulary, descriptions, relationships, and routes all resolve to the same underlying pattern identity.

The search path performs normalization and weighted matching across maintained names, aliases, descriptive terms, motif/geometry/family cues, culture/use terms, and other canonical attributes. Visual Autocomplete provides image-backed candidates while the user types. Search interpretation chips expose recognized cues and allow a cue to be removed before reranking.

Visual browsing is not secondary to text search. The landing page presents a substantial equal-square pattern grid and visual family filters. Micro-pattern cues supplement text labels so users are not required to understand taxonomy jargon before filtering.

Low-confidence search results must not claim certainty. They present the nearest maintained candidates and identify matched cues. Similar-pattern and commonly-confused relationships come from canonical record relationships, not ad-hoc runtime guessing.

Primary pattern colors are deterministic. Search queries do not dynamically recolor the reference image. Current large visuals are visibly marked DEV placeholders and must never be presented as verified production Reference Images.

## 5. Outputs

The current tool outputs:

- visual pattern grid;
- Visual Autocomplete candidates;
- ranked result cards with confidence wording and matched cues;
- static Japanese and English detail pages for each maintained ID;
- names, aliases, representative colors, use/culture information, description text, and relationships from canonical data;
- similar/confusable pattern navigation;
- two-pattern comparison output.

The current slice does not output downloadable pattern assets or live retailer data.

## 6. Error behavior

Unknown or weak queries must degrade to nearby candidate results rather than fabricate an identification. A low-confidence result should explicitly tell the user that an exact identification was not established.

Missing or malformed canonical data must fail validation before publication. Runtime code must not silently invent names, relationships, colors, or source-verification state to fill missing fields.

Broken detail IDs must not be treated as valid pattern entries. Static-route generation and structural validation are used to prevent published links from targeting nonexistent IDs.

## 7. Privacy/data handling

Search text, filtering, ranking, and comparison are processed in the browser against same-origin static files. User search text is not intentionally sent to an external pattern-search or AI service.

The current implementation does not persist pattern queries, selections, or history in `localStorage` or `sessionStorage`. Query state may be present in the page URL where applicable.

The page still follows NicheWorks common analytics, advertising, and support behavior. Standard site analytics/advertising resources and user-initiated OFUSE/Ko-fi navigation are therefore not described as absent.

Future Amazon affiliate navigation, when separately activated, must occur only after an explicit user click and remain downstream of the identification experience.

## 8. Responsive contract

The product is a visual-discovery interface rather than a text-first form.

- Desktop target: approximately 960–1200px useful content width with a dense equal-square visual grid.
- Tablet target: 768px.
- Mobile verification targets: 390px and 320px.
- Mobile pattern browsing remains two columns.
- Search, autocomplete, filters, chips, detail navigation, and comparison must work without a precision pointer.
- Visual filter controls may horizontally scroll where necessary rather than collapsing into unreadable text-only controls.
- Compare must avoid page-level horizontal overflow.

## 9. Language contract

Pattern Dictionary uses separate Japanese and English public pages backed by one canonical dataset.

- Japanese root: `/tools/pattern-dictionary/`
- English root: `/tools/pattern-dictionary/en/`
- Japanese detail: `/tools/pattern-dictionary/patterns/{id}/`
- English detail: `/tools/pattern-dictionary/en/patterns/{id}/`

Language switching on a detail page must preserve the same canonical pattern ID. Mixed-language search vocabulary is allowed because a user may combine Japanese and English descriptors.

## 10. SEO contract

The Japanese and English landing pages are the only Pattern Dictionary pages intended to be indexable in the current slice.

Search and compare pages are query-/selection-dependent and remain `noindex,follow`. All 40 prototype detail pages also remain `noindex,follow` until source verification and verified production Reference Images are complete.

Indexable landing pages require unique canonical URL, title, meta description, Open Graph metadata, Twitter metadata, favicon/apple-touch-icon, GA4, AdSense, WebApplication JSON-LD, stable tools metadata, tools-index registration, and sitemap registration according to repository SEO contracts.

No thin variant/color/scale pages are introduced in the current release.

## 11. Advertising contract

The tool follows the NicheWorks common advertising contract. Existing top/bottom ad-slot placement may be used without obstructing search, the visual grid, or pattern identification.

Advertising must not be styled as a pattern result, dictionary fact, similar-pattern recommendation, or affiliate product action.

## 12. Donation/support contract

The standard NicheWorks support area may link to OFUSE and Ko-fi. Support is optional and must not gate identification, search, detail, or comparison features.

## 13. Help/usage/FAQ contract

The current vertical slice explains the core interaction directly in the landing-page UI: describe a pattern in ordinary words or browse visually. Separate long-form usage and FAQ pages are optional at this stage.

The interface must make prototype status explicit where relevant so users do not interpret DEV placeholder images or unverified pattern facts as final dictionary evidence.

## 14. Functional acceptance tests

Current automated evidence includes:

- `tools/pattern-dictionary/tests/validate.mjs` — canonical record/static-route structure validation;
- `tools/pattern-dictionary/tests/search-test.mjs` — deterministic ambiguous-search smoke cases;
- repository-wide tool specification, quality, runtime, publication, and SEO audits.

Acceptance for the current slice requires:

- all 20 IDs remain unique and structurally valid;
- all 20 IDs have Japanese and English static detail routes;
- ambiguous JA/EN smoke queries return the intended pattern in the expected candidate set;
- Visual Autocomplete, filters, relationships, and two-pattern compare continue to resolve canonical IDs;
- no live affiliate URL is introduced before the separate affiliate activation work;
- prototype detail pages remain noindex until verification gates are complete.

Browser QA at 1200px, 768px, 390px, and 320px remains a pre-ready-for-review gate.

## 15. Explicit tool-specific exceptions

- The current dataset is intentionally limited to 20 `prototype-curated` records instead of the planned 100-pattern first release.
- Current pattern visuals are deterministic DEV SVG placeholders, not verified final 1536×1536 PNG Reference Images.
- Detail pages remain `noindex,follow` while this verification gap exists.
- Pattern Dictionary currently has no image-upload identification and no runtime AI/API dependency.
- Pattern Dictionary currently has no downloadable pattern asset feature.
- Pattern Dictionary currently has no Pro feature boundary; intended downstream monetization is affiliate referral after identification.
- Existing Pattern Atlas remains independent and may later benefit from improved SVG-generation capability without changing this dictionary contract.
