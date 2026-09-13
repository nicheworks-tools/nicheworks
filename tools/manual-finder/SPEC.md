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

## Affiliate / commerce contract

ManualFinder is an `AFFILIATE` tool, but its official manual directory remains the primary product. Commerce is an optional next-action layer and must never be mixed into the official-source fields.

- Always render the official manual/support destination before any commercial CTA.
- Affiliate configuration remains separate from `manualUrl`, `supportUrl`, evidence, and verification metadata.
- A result may have zero, one, or multiple commerce offers. There is no one-model-one-link requirement.
- ManualFinder must not require one manually generated SiteStripe short link per model. Reusable Amazon link templates are the default when Amazon permits a deterministic tagged-link format and the template has passed the common release gate.
- A dynamic model-search destination may be generated only from canonical ManualFinder maker/model metadata, never from arbitrary user-entered search text.
- The Amazon tracking ID is fixed in configuration and is never accepted from user input.
- Rendered cards expose canonical maker/model/category metadata directly to the affiliate runtime; the runtime must not recover those values by parsing display titles.
- A fixed override may still be used for an exact model when there is a reason to pin one Amazon-provided Special Link. The current `Nikon` / `Z8` override remains `https://amzn.to/3T7sxbB`.
- The generic model-search template is represented by one coarse target (`manual_model_search_template`) rather than one target per model. Its representative Brother MFC-J4440N tagged search URL was validated by Amazon Link Checker on 2026-09-13 and the template is active.
- Generic exact-model search is enabled for `PC・スマホ`, `家電`, `プリンター・複合機`, `カメラ・映像`, `オーディオ`, `ゲーム`, and `ネットワーク機器`, provided the record has a non-empty canonical model.
- `その他` is deliberately excluded from the generic rule because it mixes materially different identity types such as Seiko watch calibers and Roland legacy products. Any future commerce rule for an `その他` family must be narrowly scoped and independently justified.
- Compatibility-sensitive accessory offers require separate verified mapping data and must not be inferred from model names.
- Consumer-printer ink mappings are active for verified Brother, Epson, and Canon model batches. Exact ink-family mappings retain an official manufacturer source URL and verification date; unmapped printer models receive no consumable CTA.
- Office-printer toner mappings may extend the same consumable runtime only for existing exact ManualFinder model records with explicit official manufacturer compatibility evidence. The first OKI toner wave stores exact toner codes for five models and renders one concise model-specific toner search per result rather than one link per color cartridge.
- Printer consumable CTAs use one coarse analytics target (`printer_consumable_search_template`). Amazon search terms are constructed only from verified compatibility mappings or exact canonical model identities, never arbitrary user text.
- Consumable CTA wording does not claim that every Amazon result is genuine, recommended, or compatible. The UI states that compatibility evidence was checked against a manufacturer source and asks the user to confirm the exact Amazon item before purchase.
- Amazon search CTAs are handoffs (`Amazonで <maker> <model> を探す` / `Find <maker> <model> on Amazon`), not claims that any listing is official, recommended, cheapest, available, or compatible.
- Amazon commerce UI appears after official links, is visually distinct, explicitly identifies Amazon/affiliate status, and uses the shared `/assets/amazon-affiliate.js` helper.
- The required Amazon Associates disclosure is rendered whenever an Amazon target is active.
- Do not display copied/scraped Amazon price, availability, rating, review count, seller claim, or product imagery.
- Affiliate analytics may emit only the shared coarse `affiliate_click` metadata (`tool`, `affiliate`, `target`, `placement`). Model names, generated Amazon query terms, consumable codes, search text, selected filters, and other user input must not be sent through the affiliate analytics path.
- Future expansion should add a small number of verified offer rules/templates, not thousands of individually maintained URLs.

## State and persistence

Search/filter/page state is current-browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that external official site, where that site's own network/privacy behavior applies. Clicking an active Amazon CTA intentionally navigates to Amazon through the configured Associates mechanism. Advertising and analytics resources may load on NicheWorks pages.

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
- Amazon links are commercial search handoffs, not manufacturer-source evidence and not product endorsements.

## Acceptance criteria

- [x] Brand/category/model-fragment/Japanese-alias filtering changes the visible official-destination candidates and result count.
- [x] Large result sets remain navigable through implemented pagination rather than rendering an unbounded single list.
- [x] Result actions navigate only to maintained official manufacturer support/manual destinations; NicheWorks does not pretend to host the manuals.
- [x] Verified model-level records contain real model/product identifiers and accepted official targets, with no category Cartesian-product synthetic records.
- [x] Vendor-defined shared manual pages remain explicit shared targets instead of being expanded into invented per-model URLs.
- [x] Japanese and English canonical pages provide equivalent core search/directory behavior and preserve the accuracy disclaimer.
- [x] Search text remains local to the browser search/filter runtime and is not intentionally sent to an application search backend.
- [x] The Nikon Z8 result may show the verified Amazon search override only after the official manual links.
- [x] The validated dynamic model-search builder generates deterministic tagged URLs from canonical maker/model metadata without requiring a per-model stored link for eligible product categories.
- [x] Generic manufacturer entrances and `その他` records do not receive the generic Amazon model-search CTA.
- [x] Verified Brother/Epson/Canon ink mappings expose only their manufacturer-backed searches; unknown or unmapped models fail closed for consumables.
- [x] The first OKI toner wave applies only to five existing exact model records, retains exact manufacturer toner-code evidence, and renders one concise tagged toner handoff per model.
- [x] Consumable searches use the fixed NicheWorks tracking ID while analytics receive only the coarse consumable target, not the ink/toner/model query.
- [x] The Amazon disclosure and sponsored link semantics are supplied by the shared affiliate helper, with only coarse fixed click metadata.

## Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-office-consumables.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/affiliate.css`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/data/manuals.json`
- `tools/manual-finder/data/manuals.full.js`
- `tools/manual-finder/data/manuals.wave1.01.js` through `manuals.wave1.06.js`
- `tools/manual-finder/data/manuals.wave2.js` and Wave 2 data batches
- `tools/manual-finder/data/manuals.wave3.js` and Wave 3 data batches
- `tools/manual-finder/COVERAGE.md`
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`