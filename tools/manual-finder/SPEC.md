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
- Consumer-printer ink mappings are active for verified Brother, Epson, and Canon model batches. Exact ink-family mappings retain an official manufacturer source URL and verification date; unmapped compatibility must fail closed.
- Office-printer toner mappings extend the same consumable runtime only for existing exact ManualFinder model records with explicit official manufacturer evidence. Maintained OKI, KYOCERA, RICOH, and FUJIFILM Business Innovation ledgers are covered by this rule.
- A manufacturer-published retail toner code is retained when verified. If the official source establishes the exact model/toner relationship but no public retail SKU can be verified, an empty code list is valid; the runtime must not invent a SKU.
- Printer-detail coverage is governed by a catalog-wide reconciliation contract: every canonical printer with a basic Amazon path must have either a verified detail handoff or an explicit reviewed exclusion.
- The current audited printer state is **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- The reviewed exclusions are evidence-backed service-managed-consumables cases and are stored in `affiliate-printer-detail-exclusions.js`; they are not unresolved mappings to be filled speculatively.
- KYOCERA Waves 1–19 close the current KYOCERA catalog at **123 = 120 detail + 3 reviewed exclusions + 0 missing**. Wave 19 adds the final `KM-C3225E` and `KM-C870` handoffs with `tonerCodes: []` because no public retail toner SKU was verified from the official evidence.
- The Wave 19 Amazon queries remain model-specific: `KYOCERA KM-C3225E トナー` and `KYOCERA KM-C870 トナー`.
- Camera accessory coverage is governed by a separate catalog-wide reconciliation contract: every actionable `カメラ・映像` record with a basic Amazon path must reconcile to verified accessory detail, a reviewed exclusion, or an explicit missing-accessory diagnostic.
- The current camera state is **185 basic = 36 detail + 0 reviewed exclusions + 149 missing accessory detail** across 192 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator.
- Nikon camera-accessory Waves 1–2 close all 14 actionable Nikon camera records at **14 detail + 0 reviewed exclusions + 0 missing**.
- Nikon Wave 1 remains exactly `Z8`, `Z6III`, `Z5II`, and `Zf`, each mapped to `EN-EL15c` rechargeable battery and `MH-25a` battery charger from model-specific Nikon official evidence.
- Nikon Wave 2 explicitly closes the remaining ten models: `Z9` → `EN-EL18d` / `MH-33`; `Z7II`, `Z6II`, `Z5` → `EN-EL15c` / `MH-25a`; `Z7`, `Z6` → `EN-EL15b` / `MH-25a`; `Z50II`, `Z50`, `Z30`, `Zfc` → `EN-EL25a` / `MH-32`.
- Shared Nikon power-accessory families must not be generalized by family or model-name similarity. Every active Nikon row must exist explicitly in a reviewed mapping ledger with an official Nikon model/manual source.
- The existing Nikon Z8 fixed body-search override may coexist with verified accessory handoffs; a fixed body override must not suppress separately reviewed accessory offers.
- DJI Osmo Action Wave 1 activates exactly `Osmo Action 3`, `Osmo Action 4`, `Osmo Action 5 Pro`, and `Osmo Action 6`. Each receives a battery handoff for `DJI Osmo Action Extreme Battery Plus` and a charger/battery-case handoff for `DJI Osmo Action Multifunctional Battery Case 2`, each backed by explicit DJI official compatibility information.
- DJI Osmo Action Wave 1 must not infer compatibility for the older `Osmo Action`, `DJI Action 2`, or any future similarly named model.
- DJI Air Wave 2 activates exactly `DJI Air 3` and `DJI Air 3S`, with `DJI Air 3 Intelligent Flight Battery` and `DJI Air 3 Series Battery Charging Hub` handoffs backed by explicit DJI official compatibility information.
- DJI Mini Wave 3 activates exactly `DJI Mini 3`, `DJI Mini 3 Pro`, and `DJI Mini 4 Pro`; it preserves the reviewed battery distinction and the shared `DJI Mini 4 Pro/Mini 3 Series Two-Way Charging Hub` boundary.
- DJI Mavic 3 Wave 4 activates exactly `DJI Mavic 3`, `DJI Mavic 3 Classic`, and `DJI Mavic 3 Pro`, mapped to `DJI Mavic 3 Series Intelligent Flight Battery` and `DJI Mavic 3 Series Battery Charging Hub` from explicit DJI Store compatibility evidence.
- DJI Mavic 3 Wave 4 must not infer compatibility for `DJI Mavic 3 Enterprise`, `DJI Mavic 3M`, `DJI Mavic 3 Cine`, `Mavic 2`, or other Mavic-family records.
- DJI Air 2S/Mavic Air 2 Wave 5 activates exactly `DJI Air 2S` and `Mavic Air 2`, mapped to `Mavic Air 2 Intelligent Flight Battery` and `Mavic Air 2 Battery Charging Hub` from explicit DJI Store compatibility evidence.
- DJI Air 2S/Mavic Air 2 Wave 5 must not infer compatibility for `Mavic Air`, `Mavic Air 2S`, `DJI Mini 2`, or other Air/Mavic-family records.
- DJI compact power Wave 6 activates exactly `DJI Avata 2`, `DJI Flip`, and `DJI Neo`. Each row is mapped only to its own DJI official battery and charging-hub pair: Avata 2 → `DJI Avata 2 Intelligent Flight Battery` / `DJI Avata 2 Two-Way Charging Hub`; Flip → `DJI Flip Intelligent Flight Battery` / `DJI Flip Parallel Charging Hub`; Neo → `DJI Neo Intelligent Flight Battery` / `DJI Neo Two-Way Charging Hub`.
- DJI compact power Wave 6 must not infer cross-model compatibility among Avata 2, Flip, and Neo and must not extend to `DJI Avata`, future similarly named products, or other unreviewed DJI records.
- DJI Mini 2 family Wave 7 activates exactly `DJI Mini 2`, `DJI Mini 4K | DJI Mini 2 SE`, and `DJI Mini SE`, mapped to `DJI Mini 2 Intelligent Flight Battery` and `DJI Mini 2 Two-Way Charging Hub` from DJI's explicit four-model compatibility list.
- The compound Wave 7 canonical row is permitted only because DJI explicitly names both `DJI Mini 4K` and `DJI Mini 2 SE`; Wave 7 does not infer compatibility for `Mavic Mini` or other Mini-family records.
- DJI FPV Wave 8 activates exactly `DJI FPV`, mapped to `DJI FPV Intelligent Flight Battery` and `DJI FPV AC Power Adapter` from explicit DJI official Store compatibility information. The adapter evidence also explicitly states that it charges the DJI FPV Intelligent Flight Battery.
- DJI FPV Wave 8 must not infer compatibility for `DJI Digital FPV System`, `DJI Avata`, `DJI Avata 2`, goggles, or other FPV-related records.
- DJI Avata Wave 9 activates exactly `DJI Avata`, mapped to `DJI Avata Intelligent Flight Battery` and `DJI Avata Battery Charging Hub` from the official DJI Avata Fly More Kit page, which explicitly identifies DJI Avata compatibility and lists both products in the kit.
- DJI Avata Wave 9 must not infer compatibility for `DJI Avata 2`, future similarly named products, or unrelated DJI records.
- The measured DJI state after Waves 1–9 is **96 basic = 22 detail + 0 reviewed exclusions + 74 missing accessory detail**.
- Camera detail exclusions are stored separately in `affiliate-camera-detail-exclusions.js`; the ledger is currently empty and must not be used to hide unreviewed missing rows.
- The measured remaining camera backlog is DJI 74, OM SYSTEM 37, GoPro 31, and Insta360 7. Exact missing models are emitted by `tests/camera-accessory-coverage.test.mjs` and summarized by `CAMERA_ACCESSORY_COVERAGE.md`.
- Wrong maker, wrong category, nonexistent model, malformed URL, unsupported category, and unreviewed compatibility cases must fail closed.
- Printer consumable CTAs use one coarse analytics target (`printer_consumable_search_template`). Camera accessory CTAs use a separate coarse target (`camera_accessory_search_template`). Amazon search terms are constructed only from verified compatibility mappings or exact canonical model identities, never arbitrary user text.
- Compatibility-sensitive CTA wording does not claim that every Amazon result is genuine, recommended, or compatible. The UI states that compatibility evidence was checked against a manufacturer source and asks the user to confirm the exact Amazon item before purchase.
- Amazon search CTAs are handoffs (`Amazonで <maker> <model> を探す` / `Find <maker> <model> on Amazon`), not claims that any listing is official, recommended, cheapest, available, or compatible.
- Amazon commerce UI appears after official links, is visually distinct, explicitly identifies Amazon/affiliate status, and uses the shared `/assets/amazon-affiliate.js` helper.
- The required Amazon Associates disclosure is rendered whenever an Amazon target is active.
- Do not display copied/scraped Amazon price, availability, rating, review count, seller claim, or product imagery.
- Affiliate analytics may emit only the shared coarse `affiliate_click` metadata (`tool`, `affiliate`, `target`, `placement`). Model names, generated Amazon query terms, consumable/accessory codes, search text, selected filters, and other user input must not be sent through the affiliate analytics path.
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
- [x] Verified Brother/Epson/Canon ink mappings expose only their manufacturer-backed searches; unknown or unmapped compatibility fails closed.
- [x] Maintained office-printer toner mappings activate only for reviewed exact model/maker/category contracts and retain manufacturer evidence without inventing unverified SKUs.
- [x] The catalog-wide printer audit reconciles to **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- [x] `printerMissingDetail`, `printerMissingDetailByMaker`, and `printerMissingDetailModelsByMaker` are empty at the completed audit baseline.
- [x] KYOCERA closes at **123 = 120 detail + 3 reviewed exclusions + 0 missing**, including the final Wave 19 `KM-C3225E` and `KM-C870` rows with no inferred toner SKU.
- [x] Nikon camera-accessory Wave 1 activates exactly `Z8`, `Z6III`, `Z5II`, and `Zf`, with exactly two manufacturer-backed handoffs per model.
- [x] Nikon camera-accessory Wave 2 adds exactly the remaining ten actionable Nikon records and closes Nikon at **14 detail + 0 reviewed exclusions + 0 missing** without modifying the Wave 1 boundary.
- [x] Each active Nikon camera row uses the reviewed battery/charger pair from its exact official Nikon evidence rather than family-name inference.
- [x] DJI Osmo Action Wave 1 activates exactly `Osmo Action 3`, `Osmo Action 4`, `Osmo Action 5 Pro`, and `Osmo Action 6`, with exactly two DJI-backed handoffs per model.
- [x] DJI Air Wave 2 activates exactly `DJI Air 3` and `DJI Air 3S` with reviewed DJI power-accessory mappings.
- [x] DJI Mini Wave 3 activates exactly `DJI Mini 3`, `DJI Mini 3 Pro`, and `DJI Mini 4 Pro` while preserving the distinct reviewed battery boundary.
- [x] DJI Mavic 3 Wave 4 activates exactly `DJI Mavic 3`, `DJI Mavic 3 Classic`, and `DJI Mavic 3 Pro`, with no inference to Enterprise/3M/Cine or older Mavic records.
- [x] DJI Air 2S/Mavic Air 2 Wave 5 activates exactly `DJI Air 2S` and `Mavic Air 2`, with exactly two DJI-backed power-accessory handoffs per model and no inference to unreviewed Air/Mavic records.
- [x] DJI compact power Wave 6 activates exactly `DJI Avata 2`, `DJI Flip`, and `DJI Neo`, with two individually evidenced DJI-backed power-accessory handoffs per model and no cross-model inference.
- [x] DJI Mini 2 family Wave 7 activates exactly `DJI Mini 2`, `DJI Mini 4K | DJI Mini 2 SE`, and `DJI Mini SE`, with two DJI-backed shared power-accessory handoffs per canonical row and no inference to `Mavic Mini`.
- [x] DJI FPV Wave 8 activates exactly `DJI FPV` with a reviewed DJI FPV battery and AC Power Adapter handoff, and does not infer compatibility to other FPV-related canonical records.
- [x] DJI Avata Wave 9 activates exactly `DJI Avata` with reviewed DJI Avata Intelligent Flight Battery and DJI Avata Battery Charging Hub handoffs from the official Fly More Kit compatibility page.
- [x] DJI Waves 1–9 reconcile to **96 basic = 22 detail + 0 reviewed exclusions + 74 missing accessory detail**.
- [x] The catalog-wide camera audit reconciles to **185 basic = 36 detail + 0 reviewed exclusions + 149 missing accessory detail**, while seven maker/index rows remain explicitly non-actionable.
- [x] `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` expose the remaining backlog and the documentation sync test prevents the camera baseline from drifting silently.
- [x] The Nikon Z8 fixed body-search override coexists with its reviewed battery/charger handoffs instead of short-circuiting them.
- [x] Nonexistent models, wrong maker/category combinations, and other unreviewed cases remain fail-closed.
- [x] Compatibility-sensitive searches use the fixed NicheWorks tracking ID while analytics receive only coarse fixed targets/placements, not the accessory/consumable/model query.
- [x] The Amazon disclosure and sponsored link semantics are supplied by the shared affiliate helper, with only coarse fixed click metadata.

## Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-office-consumables.js`
- `tools/manual-finder/affiliate-oki-toner-wave2.js`
- `tools/manual-finder/affiliate-oki-toner-wave6.js`
- `tools/manual-finder/affiliate-ricoh-consumables-wave3.js`
- `tools/manual-finder/affiliate-kyocera-toner-wave3.js`
- `tools/manual-finder/affiliate-kyocera-toner-wave4.js`
- `tools/manual-finder/affiliate-kyocera-toner-wave6.js`
- `tools/manual-finder/affiliate-fujifilm-toner-wave2.js`
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
- `tools/manual-finder/affiliate-camera-detail-exclusions.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/affiliate.css`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/CAMERA_ACCESSORY_COVERAGE.md`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
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
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`
- maker/wave-specific affiliate tests, including `tools/manual-finder/tests/kyocera-toner-wave19.test.mjs`
- `tools/manual-finder/data/manuals.json`
- `tools/manual-finder/data/manuals.full.js`
- `tools/manual-finder/data/manuals.wave1.01.js` through `manuals.wave1.06.js`
- `tools/manual-finder/data/manuals.wave2.js` and Wave 2 data batches
- `tools/manual-finder/data/manuals.wave3.js` and Wave 3 data batches
- `tools/manual-finder/COVERAGE.md`
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`