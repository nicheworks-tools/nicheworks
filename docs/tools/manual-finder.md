# ManualFinder — canonical tool specification

- **Slug:** `manual-finder`
- **Display name (JA):** 公式マニュアル検索補助
- **Display name (EN):** ManualFinder
- **Implementation:** `tools/manual-finder/`
- **Registry state:** active (registered implementation present)
- **Category:** manual, support, search, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `manual-finder` implementation at `/tools/manual-finder/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Prefer real model/product records and direct official manual/model-support targets; where a manufacturer intentionally groups multiple models on one canonical page, preserve that official grouping rather than inventing per-model URLs.

## 3. Inputs

- Search text for brand/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## 4. Processing behavior

- Load the maintained ManualFinder datasets and display official support/manual destinations.
- Merge the curated baseline dataset with separately versioned verified model-level coverage waves.
- Filter by manufacturer/brand name, real model-number fragment, product/family term, Japanese alias, and explicit category selection.
- Provide quick-search shortcuts for common brands/categories.
- Paginate large result sets rather than rendering an unbounded list.
- For verified model records, prefer the deepest confirmed official manual/model-support destination available.
- When a vendor defines one official manual/support page for multiple models, represent each real model as searchable while linking to the shared vendor-defined canonical page and marking it as shared.
- Keep a generic official support/manual entrance only where it is part of the curated baseline; do not generate synthetic maker × category/model combinations to inflate coverage.
- Preserve record provenance fields used by the current data waves, including source level, verification date, evidence URL, resolution class, and shared-target state.
- Provide method, disclaimer, credits, usage, and search-guide pages.
- Provide distinct canonical Japanese and English page families using the shared underlying directory logic.

## 5. Outputs

- Filtered official manual/support destination cards and result count.
- Model-level cards where exact official destinations have been verified.
- External navigation to official manufacturer manual/support destinations.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that external official site, where that site's own network/privacy behavior applies. Advertising and analytics resources may load on NicheWorks pages.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `support.apple.com`, `www.sony.jp`, `panasonic.jp`, `jp.sharp`, `kadenfan.hitachi.co.jp`, `www.toshiba-lifestyle.com`, `www.mitsubishielectric.co.jp`, `www.daikin.co.jp`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The directory/search cards are usable on mobile while desktop width improves browsing of larger result sets and pagination.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The Japanese canonical root and `/en/` page are distinct indexable language pages with corresponding guides/usage links.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/manual-finder/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **present**; FAQ **missing**.

## 14. Functional acceptance tests

- [x] Brand/category/model-fragment/Japanese-alias filtering changes the visible official-destination candidates and result count.
- [x] Large result sets remain navigable through implemented pagination rather than rendering an unbounded single list.
- [x] Result actions navigate only to maintained official manufacturer support/manual destinations; NicheWorks does not pretend to host the manuals.
- [x] Verified model-level records contain real model/product identifiers and accepted official targets, with no category Cartesian-product synthetic records.
- [x] Vendor-defined shared manual pages remain explicit shared targets instead of being expanded into invented per-model URLs.
- [x] Japanese and English canonical pages provide equivalent core search/directory behavior and preserve the accuracy disclaimer.
- [x] Search text remains local to the browser search/filter runtime and is not intentionally sent to an application search backend.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/app.curated.js`
- `tools/manual-finder/app.js`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/style.css`
- `tools/manual-finder/usage-en.html`
- `tools/manual-finder/usage.html`
