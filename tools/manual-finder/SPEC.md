# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Prefer exact real product records and the deepest confirmed official destination; preserve manufacturer-defined shared pages rather than inventing synthetic per-model URLs.

ManualFinder may expose optional Amazon purchase-search handoffs, but official manual/support destinations remain the primary product and commercial mappings never replace manufacturer-source evidence.

## Current functional contract

- Load the maintained ManualFinder datasets and display official support/manual destinations.
- Merge curated baseline data with separately versioned verified model-level coverage waves.
- Filter by maker, model fragment, product/family term, Japanese alias, and category.
- Provide quick-search shortcuts and pagination.
- Prefer the deepest verified official manual/model-support destination available.
- Preserve manufacturer-defined shared destinations when the maker intentionally groups multiple models.
- Keep generic maker support entrances only where they are part of the curated baseline; do not generate synthetic maker × model combinations.
- Keep official manufacturer destinations primary and visibly above commerce actions.
- Preserve per-record provenance including source level, verification date, evidence URL, resolution class, and shared-target state.
- Provide distinct canonical Japanese and English page families using the same maintained data and search logic.

## Inputs

- Search text for brand/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered official manual/support destination cards and result count.
- Verified model-level official manual/support destinations where available.
- Manufacturer-defined shared targets where that is the official structure.
- Optional Amazon purchase-search handoffs generated only from canonical metadata or exact reviewed compatibility mappings.

## Data quality and provenance

- Model-level coverage uses official manufacturer sources only. Unofficial mirrors, retailer copies, guessed URLs, and synthetic product identities are out of scope.
- A model/product row must represent a real maker-product relationship supported by official evidence.
- `manualUrl` and `supportUrl` remain distinct when a deeper manual/model destination and a broader official support destination both exist.
- `sourceLevel: A` is reserved for model-level records accepted from direct official manual/model indexes or exact official support/product destinations.
- `verifiedAt` remains attached to accepted records/waves rather than relying on one global review date.
- Shared targets are accepted only when the manufacturer itself groups those models/products on the same official destination.
- Coverage count is not a quality target by itself. Unresolved rows remain unresolved until acceptable official evidence exists.

## Affiliate / commerce contract

ManualFinder is an `AFFILIATE` tool, but commerce is an optional next-action layer.

- Official manufacturer links render before Amazon CTAs.
- Affiliate configuration is separate from `manualUrl`, `supportUrl`, evidence, and verification metadata.
- One result may have zero, one, or multiple commerce offers.
- Deterministic Amazon tagged-search templates are preferred over maintaining one SiteStripe short link per model.
- Dynamic model-search destinations are generated only from canonical ManualFinder maker/model/category metadata, never arbitrary user-entered search text.
- The Amazon tracking ID is fixed in configuration and never accepted from user input.
- Rendered cards expose canonical maker/model/category metadata directly; the runtime must not reconstruct identity by parsing display titles.
- The current exact fixed override remains Nikon `Z8` → `https://amzn.to/3T7sxbB`.
- The validated generic model-search template remains active for eligible categories using the fixed `nicheworks09-22` tracking ID.
- `その他` remains excluded from blanket generic model search.
- Compatibility-sensitive consumable/accessory searches require separate reviewed mapping data and must not be inferred from model-name similarity.
- Wrong maker, wrong category, malformed URL, nonexistent model, unsupported category, and unreviewed compatibility cases fail closed.
- Amazon UI is visually separated from official-source links and uses the shared `/assets/amazon-affiliate.js` helper.
- Required Amazon Associates disclosure is rendered whenever an Amazon target is active.
- Copied/scraped Amazon price, availability, rating, review count, seller claim, and product imagery are not displayed.
- Affiliate analytics may emit only coarse fixed target/placement metadata; model names, accessory codes, consumable codes, generated Amazon queries, filters, and user search text are excluded from the analytics payload.

### Printer consumable contract

- Consumer-printer ink mappings remain active for reviewed Brother, Epson, and Canon records.
- Office-printer detail mappings remain exact-model and official-evidence backed across maintained OKI, KYOCERA, RICOH, and FUJIFILM Business Innovation ledgers.
- A manufacturer-published retail toner/ink code is retained when verified.
- If official evidence proves exact model applicability but no public retail SKU can be verified, an empty code list is valid; the runtime must not invent a SKU.
- Every canonical printer with a basic Amazon path must have verified detail or an explicit reviewed exclusion.
- The current audited printer state is **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- Reviewed exclusions live in `affiliate-printer-detail-exclusions.js` and remain evidence-backed service-managed-consumables cases.
- KYOCERA remains closed at **123 = 120 detail + 3 reviewed exclusions + 0 missing**.

### Camera accessory contract

Camera accessory coverage is governed by a catalog-wide reconciliation contract. Every actionable `カメラ・映像` row with a basic Amazon path must reconcile to verified accessory detail, a reviewed exclusion, or explicit missing-accessory diagnostic state.

The current camera state is **185 basic = 48 detail + 0 reviewed exclusions + 137 missing accessory detail** across 192 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator.

Nikon Waves 1–2 close all fourteen actionable Nikon camera rows at **14 detail + 0 reviewed exclusions + 0 missing**. Shared Nikon accessory families are not generalized by name similarity; each active row exists explicitly in reviewed mapping data.

DJI advances only in bounded exact-canonical-model waves. Current reviewed scope through Wave 20 is:

- Wave 1: `Osmo Action 3`, `Osmo Action 4`, `Osmo Action 5 Pro`, `Osmo Action 6`.
- Wave 2: `DJI Air 3`, `DJI Air 3S`.
- Wave 3: `DJI Mini 3`, `DJI Mini 3 Pro`, `DJI Mini 4 Pro`.
- Wave 4: `DJI Mavic 3`, `DJI Mavic 3 Classic`, `DJI Mavic 3 Pro`.
- Wave 5: `DJI Air 2S`, `Mavic Air 2`.
- Wave 6: `DJI Avata 2`, `DJI Flip`, `DJI Neo`.
- Wave 7: `DJI Mini 2`, `DJI Mini 4K | DJI Mini 2 SE`, `DJI Mini SE`.
- Wave 8: `DJI FPV`.
- Wave 9: `DJI Avata`.
- Wave 10: `Mavic 2`.
- Wave 11: `Mavic Mini`.
- Wave 12: `Mavic Air`.
- Wave 13: `Mavic Pro`.
- Wave 14: `Mavic Pro Platinum`.
- Wave 15: `DJI Mavic 3 Enterprise`, `DJI Mavic 3M`.
- Wave 16: `DJI Inspire 3`.
- Wave 17: `Inspire 2`.
- Wave 18: `Inspire 1`.
- Wave 19: `Inspire 1 Pro/Raw`.
- Wave 20: `Spark`.

Wave 20 activates exactly canonical `Spark` with `DJI Spark Intelligent Flight Battery` and `DJI Spark Battery Charging Hub` handoffs. DJI's official older-product accessory guide explicitly maps Spark to the Spark Intelligent Flight Battery, and DJI's official Spark Download Center publishes the Spark Battery Charging Hub User Guide under the Spark product. The mapping must not infer support to `DJI Spark`, `Spark 2`, or similarly named rows.

The measured DJI state after Waves 1–20 is **96 basic = 34 detail + 0 reviewed exclusions + 62 missing accessory detail**.

Camera-detail exclusions remain in `affiliate-camera-detail-exclusions.js`; the ledger is currently empty and must not hide unreviewed missing rows. The remaining camera backlog is DJI 62, OM SYSTEM 37, GoPro 31, and Insta360 7. Exact missing models are emitted by `tests/camera-accessory-coverage.test.mjs` and summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

## State and persistence

Search/filter/page state is browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that official external site. Clicking an active Amazon CTA intentionally navigates to Amazon through the configured Associates mechanism. Advertising and analytics resources may load on NicheWorks pages according to the common site contract.

## Language mode

`separate JA/EN pages`

The Japanese canonical root and `/en/` page are distinct indexable language pages with corresponding guide/usage links and equivalent core directory/search behavior.

## Layout class

`hybrid`

The directory/search cards are usable on mobile while desktop width improves browsing of large result sets and pagination.

## Limits and non-goals

- ManualFinder is a directory/link aid; it does not host, mirror, modify, or guarantee manufacturer manual content.
- Official manufacturer destinations may move or become stale; users must confirm the latest information at the manufacturer site.
- Not every manufacturer/model currently has a sufficiently deep official destination.
- Missing official evidence must not be filled with guessed URLs, inferred accessories, synthetic model IDs, or retailer-only compatibility claims.
- A verified record may intentionally resolve to a manufacturer-defined shared destination.
- Amazon links are commercial search handoffs, not manufacturer-source evidence or endorsements.

## Acceptance criteria

- [x] Brand/category/model-fragment/Japanese-alias filtering changes visible official-destination candidates and result count.
- [x] Large result sets remain navigable through pagination.
- [x] Result actions navigate only to maintained official manufacturer support/manual destinations; NicheWorks does not pretend to host manuals.
- [x] Verified model-level rows contain real product identifiers and accepted official targets, with no category Cartesian-product synthetic rows.
- [x] Manufacturer-defined shared manual/support targets remain explicit shared targets instead of invented per-model URLs.
- [x] Japanese and English canonical pages provide equivalent core search/directory behavior and accuracy disclaimers.
- [x] Search text remains local to browser filtering and is not intentionally sent to an application search backend.
- [x] Dynamic Amazon model-search URLs are deterministic and generated only from canonical metadata.
- [x] Generic manufacturer entrances and `その他` rows do not receive blanket model-search CTAs.
- [x] Verified printer consumable mappings expose only manufacturer-backed searches; unknown/unmapped compatibility fails closed.
- [x] The printer audit remains **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- [x] KYOCERA remains **123 = 120 detail + 3 reviewed exclusions + 0 missing**.
- [x] Nikon camera accessory coverage remains **14 detail + 0 reviewed exclusions + 0 missing**.
- [x] DJI Waves 1–20 preserve exact reviewed boundaries and do not infer compatibility across neighboring product names.
- [x] DJI Spark Wave 20 activates exactly `Spark` with reviewed battery and charging-hub handoffs from DJI official evidence.
- [x] DJI Waves 1–20 reconcile to **96 basic = 34 detail + 0 reviewed exclusions + 62 missing accessory detail**.
- [x] The catalog-wide camera audit reconciles to **185 basic = 48 detail + 0 reviewed exclusions + 137 missing accessory detail** while seven maker/index rows remain non-actionable.
- [x] `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` expose the remaining backlog and documentation sync prevents silent drift.
- [x] Wrong maker/category, nonexistent models, spelling variants, and other unreviewed compatibility cases fail closed.
- [x] Compatibility-sensitive searches use the fixed NicheWorks tracking ID while analytics receive only coarse fixed targets/placements.
- [x] Amazon disclosure and sponsored-link semantics are supplied by the shared affiliate helper.

## Implementation evidence

Core ManualFinder implementation:

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/CAMERA_ACCESSORY_COVERAGE.md`
- `tools/manual-finder/affiliate-printer-detail-exclusions.js`
- `tools/manual-finder/affiliate-camera-accessories.js`
- `tools/manual-finder/affiliate-nikon-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-camera-detail-exclusions.js`

Reviewed DJI camera accessory ledgers:

- `tools/manual-finder/affiliate-dji-camera-accessories-wave1.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave3.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave4.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave5.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave6.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave7.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave8.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave9.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave10.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave11.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave12.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave13.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave14.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave15.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave16.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave17.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave18.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave19.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave20.js`

Camera accessory tests and audit gates:

- `tools/manual-finder/tests/nikon-camera-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/nikon-camera-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/dji-osmo-action-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/dji-air-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/dji-mini-accessory-wave3.test.mjs`
- `tools/manual-finder/tests/dji-mavic3-accessory-wave4.test.mjs`
- `tools/manual-finder/tests/dji-air2-accessory-wave5.test.mjs`
- `tools/manual-finder/tests/dji-compact-power-wave6.test.mjs`
- `tools/manual-finder/tests/dji-mini2-accessory-wave7.test.mjs`
- `tools/manual-finder/tests/dji-fpv-accessory-wave8.test.mjs`
- `tools/manual-finder/tests/dji-avata-accessory-wave9.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-accessory-wave10.test.mjs`
- `tools/manual-finder/tests/dji-mavic-mini-accessory-wave11.test.mjs`
- `tools/manual-finder/tests/dji-mavic-air-accessory-wave12.test.mjs`
- `tools/manual-finder/tests/dji-mavic-pro-accessory-wave13.test.mjs`
- `tools/manual-finder/tests/dji-mavic-pro-platinum-accessory-wave14.test.mjs`
- `tools/manual-finder/tests/dji-mavic3-enterprise-accessory-wave15.test.mjs`
- `tools/manual-finder/tests/dji-inspire3-accessory-wave16.test.mjs`
- `tools/manual-finder/tests/dji-inspire2-accessory-wave17.test.mjs`
- `tools/manual-finder/tests/dji-inspire1-accessory-wave18.test.mjs`
- `tools/manual-finder/tests/dji-inspire1-proraw-accessory-wave19.test.mjs`
- `tools/manual-finder/tests/dji-spark-accessory-wave20.test.mjs`
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`

Manual dataset and supporting pages:

- `tools/manual-finder/data/manuals.json`
- `tools/manual-finder/data/manuals.full.js`
- `tools/manual-finder/data/manuals.wave1.01.js` through maintained Wave 1 batches
- `tools/manual-finder/data/manuals.wave2.js` and maintained Wave 2 batches
- `tools/manual-finder/data/manuals.wave3.js` and maintained Wave 3 batches
- `tools/manual-finder/COVERAGE.md`
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`
