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

The current camera state is **185 basic = 87 detail + 26 reviewed exclusions + 72 missing accessory detail** across 192 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator.

Nikon Waves 1–2 remain closed at **14 detail + 0 reviewed exclusions + 0 missing**.

DJI advances only through bounded exact-canonical-model review waves. Reviewed scope through Wave 41 closes the final six unresolved DJI rows:

- `Osmo Nano`
- `DJI Digital FPV System`
- `DJI Goggles`
- `DJI Goggles RE`
- `DJI O3 Air Unit`
- `DJI O4 Air Unit Series`

Wave 41 maps exactly `Osmo Nano` to `DJI Osmo Nano Multifunctional Vision Dock`, the model-specific companion dock documented by DJI for extended operating time and charging/connection functions. The other five rows are exact reviewed exclusions: the original Goggles rows have integrated batteries without a separately established model-specific replacement power accessory; the O3/O4 Air Units are externally powered components; and the Digital FPV System is a multi-component system without one defensible system-level battery/charger handoff.

The measured DJI state after Waves 1–41 is **96 basic = 70 detail + 26 reviewed exclusions + 0 missing accessory detail**.

DJI camera review is closed at zero missing. Camera-detail exclusions contain twenty-six DJI rows across Waves 32, 34, 36, 40, and 41.

OM SYSTEM review has started with Wave 1 for exactly `OM-1`, `OM-1 Mark II`, and `OM-3`. OM SYSTEM's official BLX-1 page explicitly lists all three as compatible with the BLX-1 Lithium Ion Rechargeable Battery, so each exact canonical row receives the deterministic `OM SYSTEM BLX-1 Lithium Ion Rechargeable Battery` handoff. The measured OM SYSTEM state is **37 basic = 3 detail + 0 reviewed exclusions + 34 missing accessory detail**.

Remaining missing camera rows are OM SYSTEM 34, GoPro 31, and Insta360 7. Exact missing models are emitted by `tests/camera-accessory-coverage.test.mjs` and summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

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
- [x] DJI Waves 1–41 preserve exact reviewed boundaries and do not infer neighboring product names.
- [x] DJI Mavic 2 Enterprise Series Wave 25 activates exactly one reviewed canonical series row with official battery and charging-hub evidence.
- [x] DJI Osmo Pocket 3 Wave 26 activates exactly one reviewed canonical row with official Battery Handle compatibility evidence.
- [x] DJI Action 2 Wave 27 activates exactly one reviewed canonical row with official Power Module compatibility evidence.
- [x] DJI Pocket 2 Wave 28 activates exactly one reviewed canonical row with official Charging Case compatibility evidence.
- [x] Osmo Pocket Wave 29 activates exactly one reviewed canonical row with official Charging Case compatibility evidence.
- [x] Osmo 360 Wave 30 activates exactly one reviewed canonical row with official battery and multifunctional battery-case compatibility evidence.
- [x] DJI Goggles 2 Wave 31 activates exactly one reviewed canonical row with official battery compatibility evidence.
- [x] DJI Goggles 3, DJI Goggles Integra, and DJI Goggles N3 Wave 32 are exact reviewed exclusions backed by official built-in-battery evidence and receive no generic power handoff.
- [x] DJI RS BG30 Wave 33 activates exactly six reviewed canonical rows with DJI Store compatibility evidence.
- [x] DJI RS 3 Mini, DJI RS 4 Mini, and DJI RSC 2 Wave 34 are exact reviewed exclusions backed by DJI's official nonremovable-grip guidance.
- [x] DJI Ronin-SC and Ronin-S Wave 35 activate exact reviewed BG18/BG37 battery-grip handoffs backed by DJI Store compatibility evidence.
- [x] Nine Osmo Mobile/OM Wave 36 rows are exact reviewed exclusions backed by official nonreplaceable-battery statements.
- [x] Four legacy Osmo Wave 37 rows activate exact reviewed 980mAh or 1225mAh Intelligent Battery handoffs backed by DJI official model evidence.
- [x] Four legacy Ronin Wave 38 rows activate exact reviewed replaceable-battery handoffs backed by DJI official support/store evidence.
- [x] DJI Ronin 4D and original Osmo Action Wave 39 activate exact reviewed battery and charging-hub handoffs backed by DJI official evidence.
- [x] Six DJI controller Wave 40 rows are exact reviewed exclusions backed by official rechargeable-controller battery/charging evidence and receive no generic USB power handoff.
- [x] DJI final Wave 41 maps Osmo Nano to its reviewed Multifunctional Vision Dock and resolves the remaining five DJI rows as exact evidence-backed exclusions.
- [x] DJI Waves 1–41 reconcile to **96 basic = 70 detail + 26 reviewed exclusions + 0 missing accessory detail**.
- [x] OM SYSTEM Wave 1 activates exactly OM-1, OM-1 Mark II, and OM-3 with official BLX-1 compatibility evidence.
- [x] OM SYSTEM currently reconciles to **37 basic = 3 detail + 0 reviewed exclusions + 34 missing accessory detail**.
- [x] The catalog-wide camera audit reconciles to **185 basic = 87 detail + 26 reviewed exclusions + 72 missing accessory detail** while seven maker/index rows remain non-actionable.
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
- `tools/manual-finder/affiliate-dji-camera-accessories-wave23.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave24.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave25.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave26.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave27.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave28.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave29.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave30.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave31.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave33.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave35.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave37.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave38.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave39.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave41.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave1.js`

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
- `tools/manual-finder/tests/dji-phantom3-se-accessory-wave23.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-enterprise-advanced-wave24.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-enterprise-series-wave25.test.mjs`
- `tools/manual-finder/tests/dji-osmo-pocket3-accessory-wave26.test.mjs`
- `tools/manual-finder/tests/dji-action2-accessory-wave27.test.mjs`
- `tools/manual-finder/tests/dji-pocket2-accessory-wave28.test.mjs`
- `tools/manual-finder/tests/dji-osmo-pocket-accessory-wave29.test.mjs`
- `tools/manual-finder/tests/dji-osmo360-accessory-wave30.test.mjs`
- `tools/manual-finder/tests/dji-goggles2-accessory-wave31.test.mjs`
- `tools/manual-finder/tests/dji-goggles-integrated-battery-exclusions-wave32.test.mjs`
- `tools/manual-finder/tests/dji-rs-bg30-accessory-wave33.test.mjs`
- `tools/manual-finder/tests/dji-rs-integrated-battery-exclusions-wave34.test.mjs`
- `tools/manual-finder/tests/dji-ronin-grip-accessory-wave35.test.mjs`
- `tools/manual-finder/tests/dji-osmo-mobile-battery-exclusions-wave36.test.mjs`
- `tools/manual-finder/tests/dji-osmo-legacy-battery-wave37.test.mjs`
- `tools/manual-finder/tests/dji-ronin-legacy-battery-wave38.test.mjs`
- `tools/manual-finder/tests/dji-ronin4d-osmo-action-wave39.test.mjs`
- `tools/manual-finder/tests/dji-rechargeable-controller-exclusions-wave40.test.mjs`
- `tools/manual-finder/tests/dji-final-power-wave41.test.mjs`
- `tools/manual-finder/tests/om-system-blx1-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`

Manual data and supporting pages remain under `tools/manual-finder/data/`, `tools/manual-finder/howto/`, `tools/manual-finder/COVERAGE.md`, `tools/manual-finder/usage.html`, and `tools/manual-finder/usage-en.html`.
