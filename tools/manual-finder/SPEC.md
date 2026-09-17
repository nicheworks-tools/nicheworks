# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Exact real product records and manufacturer-defined shared destinations are preferred over guessed or synthetic per-model URLs. Optional Amazon purchase-search handoffs remain secondary to official documentation.

## Current functional contract

- Load and merge the maintained ManualFinder baseline and verified model-level coverage waves.
- Filter by maker, model fragment, family/product term, Japanese alias, and category.
- Provide quick-search shortcuts and pagination.
- Prefer the deepest verified official manual/model-support destination available.
- Preserve manufacturer-defined shared destinations where the maker intentionally groups models.
- Preserve provenance fields including source level, verification date, evidence URL, resolution class, and shared-target state.
- Keep official manufacturer destinations above optional commerce actions.
- Provide distinct canonical Japanese and English page families with equivalent core directory behavior.

## Inputs

- Search text for maker/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered official manual/support destination cards and result count.
- Verified model-level official destinations where available.
- Manufacturer-defined shared targets where applicable.
- Optional Amazon purchase-search handoffs generated only from canonical metadata or exact reviewed compatibility mappings.

## Data quality and provenance

- Verified model-level coverage uses official manufacturer sources only.
- Unofficial mirrors, retailer copies, guessed URLs, synthetic product identities, and family-name inference are out of scope.
- A model/product row must represent a real maker-product relationship supported by official evidence.
- `manualUrl` and `supportUrl` remain distinct when a deeper manual target and broader support target both exist.
- `sourceLevel: A` is reserved for accepted direct official model/manual/support evidence.
- Shared targets are accepted only when the manufacturer itself defines the shared destination.
- Coverage count is not a quality target; unresolved rows remain unresolved until acceptable evidence exists.

## Affiliate / commerce contract

ManualFinder is an `AFFILIATE` tool, but commerce is an optional next-action layer.

- Official manufacturer links render before Amazon CTAs.
- Affiliate configuration remains separate from official-source fields.
- Dynamic Amazon model searches use only canonical maker/model/category metadata, never arbitrary user-entered search text.
- The tracking ID is fixed in configuration and never accepted from user input.
- Compatibility-sensitive consumable/accessory searches require separate reviewed mapping data.
- Wrong maker/category, malformed URLs, nonexistent models, spelling variants, unsupported categories, and unreviewed compatibility cases fail closed.
- `その他` remains excluded from blanket generic model search.
- Amazon UI is visually separated from official links and uses `/assets/amazon-affiliate.js`.
- Required Amazon Associates disclosure is rendered whenever an Amazon target is active.
- Copied/scraped Amazon price, availability, rating, review count, seller claims, and product imagery are not displayed.
- Affiliate analytics may emit only coarse fixed target/placement metadata; model/accessory/consumable queries and user search text are excluded.

### Printer consumable contract

- Consumer and office-printer consumable mappings remain official-evidence backed and exact-model scoped.
- Public retail codes are retained only when verified; `tonerCodes: []` remains valid when exact applicability is proven but a public retail SKU is not.
- Every canonical printer with a basic Amazon path must have verified detail or an explicit reviewed exclusion.
- The current audited printer state is **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- Reviewed exclusions remain in `affiliate-printer-detail-exclusions.js`.
- KYOCERA remains closed at **123 = 120 detail + 3 reviewed exclusions + 0 missing**.

### Camera accessory contract

Every actionable `カメラ・映像` row with a basic Amazon path must reconcile to verified accessory detail, a reviewed exclusion, or explicit missing-accessory diagnostic state.

The current camera state is **185 basic = 56 detail + 0 reviewed exclusions + 129 missing accessory detail** across 192 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator.

Nikon Waves 1–2 remain closed at **14 detail + 0 reviewed exclusions + 0 missing**.

DJI advances only through bounded exact-canonical-model waves. Reviewed scope through Wave 22 includes Waves 1–21 frozen in their individual ledgers plus Wave 22 for exactly:

- `Phantom 3 Advanced`
- `Phantom 3 Professional`
- `Phantom 3 Standard`

Wave 22 maps those three canonical rows to `DJI Phantom 3 Intelligent Flight Battery` and `DJI Phantom 3 Battery Charging Hub`. DJI official Advanced, Professional, and Standard Download Centers publish the Phantom 3 Series Charging Hub manual for those products. DJI official battery guidance identifies the Phantom 3 Series Intelligent Flight Battery, and the Standard support FAQ explicitly states that Professional/Advanced and Standard batteries are the same. `Phantom 3 SE`, `Phantom 3 4K`, `DJI Phantom 3 Standard`, and other inferred names remain fail-closed.

The measured DJI state after Waves 1–22 is **96 basic = 42 detail + 0 reviewed exclusions + 54 missing accessory detail**.

Camera-detail exclusions remain in `affiliate-camera-detail-exclusions.js`; the ledger is currently empty. Remaining missing camera rows are DJI 54, OM SYSTEM 37, GoPro 31, and Insta360 7. Exact missing models are emitted by `tests/camera-accessory-coverage.test.mjs` and summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

## State and persistence

Search/filter/page state is browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that official external site. Clicking an active Amazon CTA intentionally navigates to Amazon through the configured Associates mechanism.

## Language mode

`separate JA/EN pages`

The Japanese canonical root and `/en/` page are distinct indexable language pages with equivalent core search/directory behavior.

## Layout class

`hybrid`

The directory/search cards are usable on mobile while desktop width improves browsing of large result sets and pagination.

## Limits and non-goals

- ManualFinder does not host, mirror, modify, or guarantee manufacturer manual content.
- Official destinations may move or become stale; users must confirm current information at the manufacturer site.
- Missing official evidence must not be filled with guessed URLs, inferred accessories, synthetic model IDs, or retailer-only compatibility claims.
- Amazon links are commercial search handoffs, not manufacturer-source evidence or endorsements.

## Acceptance criteria

- [x] Brand/category/model-fragment/Japanese-alias filtering changes visible official-destination candidates and result count.
- [x] Large result sets remain navigable through pagination.
- [x] Result actions use maintained official manufacturer destinations; NicheWorks does not pretend to host manuals.
- [x] Verified model rows contain real identifiers and accepted official targets with no synthetic category Cartesian product.
- [x] Manufacturer-defined shared destinations remain explicit shared targets.
- [x] Japanese and English canonical pages provide equivalent core behavior and disclaimers.
- [x] Dynamic Amazon searches are deterministic and generated only from canonical metadata.
- [x] The printer audit remains **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- [x] KYOCERA remains **123 = 120 detail + 3 reviewed exclusions + 0 missing**.
- [x] Nikon camera accessory coverage remains **14 detail + 0 reviewed exclusions + 0 missing**.
- [x] DJI Waves 1–22 preserve exact reviewed boundaries and do not infer neighboring product names.
- [x] DJI Phantom 3 Wave 22 activates exactly three reviewed Phantom 3 canonical rows with official battery/hub evidence.
- [x] DJI Waves 1–22 reconcile to **96 basic = 42 detail + 0 reviewed exclusions + 54 missing accessory detail**.
- [x] The catalog-wide camera audit reconciles to **185 basic = 56 detail + 0 reviewed exclusions + 129 missing accessory detail** while seven maker/index rows remain non-actionable.
- [x] Missing-model maker diagnostics and documentation sync remain machine-readable drift guards.
- [x] Wrong maker/category, nonexistent models, spelling variants, and other unreviewed compatibility cases fail closed.
- [x] Amazon disclosure and sponsored-link semantics remain supplied by the shared affiliate helper.

## Implementation evidence

Core ManualFinder implementation:

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/CAMERA_ACCESSORY_COVERAGE.md`
- `tools/manual-finder/affiliate-camera-accessories.js`
- `tools/manual-finder/affiliate-nikon-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-camera-detail-exclusions.js`
- `tools/manual-finder/affiliate-printer-detail-exclusions.js`

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
- `tools/manual-finder/affiliate-dji-camera-accessories-wave21.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave22.js`

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
- `tools/manual-finder/tests/dji-phantom4-accessory-wave21.test.mjs`
- `tools/manual-finder/tests/dji-phantom3-accessory-wave22.test.mjs`
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`

Manual data and supporting pages remain under `tools/manual-finder/data/`, `tools/manual-finder/howto/`, `tools/manual-finder/COVERAGE.md`, `tools/manual-finder/usage.html`, and `tools/manual-finder/usage-en.html`.
