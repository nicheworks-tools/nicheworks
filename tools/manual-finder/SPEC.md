# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Prefer real model/product records and direct official manual/model-support targets; where a manufacturer intentionally groups multiple models on one canonical page, preserve that official grouping rather than inventing per-model URLs.

## Current functional contract

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

## Inputs

- Search text for brand/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered official manual/support destination cards and result count.
- Model-level cards where exact official destinations have been verified.
- External navigation to official manufacturer manual/support destinations.

## Data quality and provenance

- Official manufacturer sources only for verified model-level coverage; unofficial PDF mirrors, retailer copies, and synthetic URLs are out of scope.
- A model/product record must represent a real maker-product relationship supported by the official source.
- `manualUrl` and `supportUrl` remain distinct when a deeper model/manual destination and a broader official support/index destination both exist.
- `sourceLevel: A` is used for model-level records accepted from a direct official manual/model index or exact official product-support destination.
- `verifiedAt` is retained per accepted record/wave rather than relying on one undifferentiated global review claim.
- Shared target URLs are valid only when the manufacturer itself groups those models/products on the same official page/manual.
- Coverage count is not a quality target by itself; unresolved model targets remain out until an acceptable official destination is established.

## State and persistence

Search/filter/page state is current-browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that external official site, where that site's own network/privacy behavior applies. Advertising and analytics resources may load on NicheWorks pages.

## Language mode

`separate JA/EN pages`

The Japanese canonical root and `/en/` page are distinct indexable language pages with corresponding guides/usage links.

## Layout class

`hybrid`

The directory/search cards are usable on mobile while desktop width improves browsing of larger result sets and pagination.

## Limits and non-goals

- ManualFinder is a directory/link aid; it does not host, mirror, modify, or guarantee the current content of manufacturers' manuals.
- A listed official link can change or become stale; users must confirm the latest information on the manufacturer site.
- Not every manufacturer/model has a sufficiently deep official target available to ManualFinder yet. Such gaps must not be filled with guessed or synthetic model URLs.
- A verified record may intentionally resolve to a manufacturer-defined shared page when that is the vendor's canonical manual structure.

## Acceptance criteria

- [x] Brand/category/model-fragment/Japanese-alias filtering changes the visible official-destination candidates and result count.
- [x] Large result sets remain navigable through implemented pagination rather than rendering an unbounded single list.
- [x] Result actions navigate only to maintained official manufacturer support/manual destinations; NicheWorks does not pretend to host the manuals.
- [x] Verified model-level records contain real model/product identifiers and accepted official targets, with no category Cartesian-product synthetic records.
- [x] Vendor-defined shared manual pages remain explicit shared targets instead of being expanded into invented per-model URLs.
- [x] Japanese and English canonical pages provide equivalent core search/directory behavior and preserve the accuracy disclaimer.
- [x] Search text remains local to the browser search/filter runtime and is not intentionally sent to an application search backend.

## Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/data/manuals.json`
- `tools/manual-finder/data/manuals.full.js`
- `tools/manual-finder/data/manuals.wave1.01.js` through `manuals.wave1.06.js`
- `tools/manual-finder/data/manuals.wave2.js` and Wave 2 data batches
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`
