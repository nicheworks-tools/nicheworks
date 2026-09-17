# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Prefer exact real product records and the deepest confirmed official destination; preserve manufacturer-defined shared pages rather than inventing synthetic per-model URLs.

## Current functional contract

- Load the maintained ManualFinder datasets and display official support/manual destinations.
- Merge curated baseline data with separately versioned verified model-level coverage waves.
- Filter by maker, model fragment, product/family term, Japanese alias, and category.
- Provide quick-search shortcuts and pagination.
- Keep official manufacturer destinations primary and visibly above commerce actions.
- Preserve per-record provenance including source level, verification date, evidence URL, resolution class, and shared-target state.
- Provide distinct canonical Japanese and English page families.

## Inputs

- Search text for brand/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered official manual/support cards and result count.
- Model-level cards where exact official destinations have been verified.
- External navigation to official manufacturer destinations.
- Optional Amazon handoffs generated only from canonical metadata and reviewed compatibility mappings.

## Data quality and provenance

- Official manufacturer evidence only for verified model-level and compatibility-sensitive coverage.
- Unofficial mirrors, retailer compatibility claims, and synthetic URLs are out of scope.
- A product row must represent a real maker/model relationship supported by official evidence.
- `manualUrl` and `supportUrl` remain distinct where applicable.
- `verifiedAt` is retained per accepted record/wave.
- Coverage count alone is never a reason to infer a mapping.

## Affiliate / commerce contract

ManualFinder is an `AFFILIATE` tool, but its manual directory is the primary product.

- Official manual/support links always render before commerce CTAs.
- Affiliate data is separate from source/evidence fields.
- Dynamic Amazon searches use canonical maker/model metadata, never arbitrary user input.
- The Amazon tracking ID is fixed in configuration.
- Compatibility-sensitive offers require explicit reviewed mapping data and fail closed otherwise.
- Wrong maker/category, malformed URL, nonexistent model, empty model, and unreviewed variants fail closed.
- Amazon UI is clearly identified as commercial/affiliate and does not copy price, rating, availability, seller claims, or product imagery.
- Affiliate analytics emit only coarse fixed metadata, not model/query/accessory terms or user search text.

### Printer consumable contract

- Consumer-printer ink and maintained office-printer toner mappings require manufacturer-backed evidence.
- A retail toner code is stored only when verified. `tonerCodes: []` is valid where model applicability is proven but no public retail SKU is verified.
- Every actionable printer record must reconcile to detail or reviewed exclusion.
- Current printer state: **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- KYOCERA remains closed at **123 = 120 detail + 3 reviewed exclusions + 0 missing**.
- Printer missing diagnostics must remain empty.

### Camera accessory contract

Every actionable `カメラ・映像` record must reconcile to reviewed accessory detail, reviewed exclusion, or explicit missing status.

The current camera state is **185 basic = 47 detail + 0 reviewed exclusions + 138 missing accessory detail** across 192 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator.

Nikon Waves 1–2 remain closed at **14 detail + 0 reviewed exclusions + 0 missing**.

DJI coverage advances only through bounded exact-canonical-model waves. Waves 1–18 retain their previously reviewed boundaries. Wave 19 adds exactly:

- `Inspire 1 Pro/Raw` → `DJI TB47 Intelligent Flight Battery` / `DJI Inspire 1 Battery Charging Hub`.
- DJI Download Center establishes the exact canonical product identity.
- DJI Mobile SDK hardware documentation explicitly lists `Inspire 1 Pro/Raw` with TB47 and TB48 battery configurations.
- DJI's Inspire 1 Battery Charging Hub announcement states compatibility with TB47 and TB48.
- Wave 19 uses TB47 as the deterministic reviewed battery search handoff and does not infer compatibility to `DJI Inspire 1 Pro/Raw`, `Inspire 1 Pro`, `Inspire 1 Raw`, or other spellings.
- `Inspire 1`, `Inspire 2`, and `DJI Inspire 3` retain their independently reviewed Waves 18, 17, and 16 mappings.

The measured DJI state after Waves 1–19 is **96 basic = 33 detail + 0 reviewed exclusions + 63 missing accessory detail**.

Camera detail exclusions remain in `affiliate-camera-detail-exclusions.js`; the ledger is empty. Remaining camera backlog is DJI 63, OM SYSTEM 37, GoPro 31, and Insta360 7.

## State and persistence

Search/filter/page state is browser UI state. The current contract does not include accounts, saved lists, or local manual archives.

## Privacy and network behavior

Filtering runs locally against NicheWorks-hosted data. Search terms are not intentionally sent to an application backend or exported as analytics free text. Clicking an official manufacturer or Amazon destination intentionally navigates to that external site.

## Language mode

`separate JA/EN pages`

## Layout class

`hybrid`

## Limits and non-goals

- ManualFinder is a directory/link aid and does not host or mirror manufacturer manuals.
- Official links may later move; users must confirm current manufacturer information.
- Unresolved targets remain unresolved rather than being filled with guesses.
- Amazon handoffs are commercial searches, not manufacturer evidence or endorsements.

## Acceptance criteria

- [x] Search/category filtering and pagination operate on maintained official-destination records.
- [x] Verified model-level records use real model identities and official targets.
- [x] Shared manufacturer pages remain explicit shared targets rather than synthetic model URLs.
- [x] Japanese and English canonical pages provide equivalent core directory behavior.
- [x] Search text remains local to browser filtering.
- [x] Generic Amazon search uses canonical metadata only and excludes unsupported categories/entrances.
- [x] Printer audit reconciles to **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- [x] KYOCERA reconciles to **123 = 120 detail + 3 reviewed exclusions + 0 missing**.
- [x] Nikon camera coverage closes at **14 detail + 0 reviewed exclusions + 0 missing**.
- [x] DJI Inspire 1 Pro/Raw Wave 19 activates exactly `Inspire 1 Pro/Raw` with reviewed TB47 battery and Inspire 1 charging-hub handoffs from DJI official evidence.
- [x] Wave 19 does not infer neighboring spellings or replace prior Inspire-family mappings.
- [x] DJI Waves 1–19 reconcile to **96 basic = 33 detail + 0 reviewed exclusions + 63 missing accessory detail**.
- [x] Catalog-wide camera audit reconciles to **185 basic = 47 detail + 0 reviewed exclusions + 138 missing accessory detail**.
- [x] Camera missing diagnostics remain machine-readable and documentation sync prevents silent drift.
- [x] Unsupported/unreviewed compatibility fails closed.

## Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-office-consumables.js`
- `tools/manual-finder/affiliate-printer-detail-exclusions.js`
- `tools/manual-finder/affiliate-camera-accessories.js`
- `tools/manual-finder/affiliate-nikon-camera-accessories-wave2.js`
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
- `tools/manual-finder/affiliate-camera-detail-exclusions.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/CAMERA_ACCESSORY_COVERAGE.md`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
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
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`
- `tools/manual-finder/data/manuals.json`
- `tools/manual-finder/data/manuals.full.js`
- `tools/manual-finder/COVERAGE.md`
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`