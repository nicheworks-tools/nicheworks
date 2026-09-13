# Tool Specification — Phone QuickCheck

- Japanese name: `スマホ QuickCheck`
- English name: `Phone QuickCheck`
- Slug: `phone-quickcheck`
- Public URL: `https://nicheworks.app/tools/phone-quickcheck/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Initial public dataset: `30 verified models`
- Public launch date: `2026-09-13`
- Product class: `static browser utility / quick-check directory`

## Purpose

Phone QuickCheck is a practical smartphone quick-reference tool. It is designed to answer the small set of questions a user is likely to have when checking a handset or buying charging accessories: physical size and weight, charging connector, charger requirements, wireless charging, approximate power-bank charge counts, and the manufacturer's official specification/manual destination.

It is intentionally not a comprehensive smartphone encyclopedia, review database, benchmark database, or live retail catalog.

## Current functional contract

The public baseline contains 30 verified models across Apple, Google, Samsung, Sony, and SHARP. Users can search by model name and maintained aliases, filter by manufacturer, charging connector, and release year, and sort by newest, lightest, or compact-size oriented order.

The list view remains deliberately compact. Selecting a phone exposes detail information including dimensions, weight, display size where maintained, charging port, charger guidance, verified protocol labels, PPS state, wireless charging standard/wattage, battery capacity where an accepted value exists, included cable/adapter state, official specification/manual links, and last verification date.

Charging semantics must remain explicit:

- `wiredRecommendedW` is charger guidance or a maintained adapter class. It must not automatically be described as the handset's measured maximum input.
- A separate device-side maximum may be displayed only when the maintained source supports that interpretation.
- Manufacturer-nonpublic battery capacity must remain unknown unless a deliberately maintained third-party reference is introduced and labelled as such.
- Unknown facts remain unknown rather than being inferred.

Power-bank charge estimates use the maintained product approximation:

`estimated_full_charge_equivalents = power_bank_nominal_mah * 0.67 / phone_battery_mah`

The UI shows 5,000 / 10,000 / 20,000mAh estimates rounded to one decimal place and clearly labels them approximate. If battery capacity is unknown, no charge-count estimate is generated.

Accessory guidance is resolved from maintained charging facts and reusable accessory classes rather than a phone × product matrix. Current classes cover USB-C cables, USB-PD, PPS, Samsung Super Fast Charging, Qi/Qi2, and USB-C power banks. Amazon purchase handoffs use the shared NicheWorks Associates helper and a fixed tagged-search template. Search destinations are generated only from maintained accessory-class metadata; user free-text search is never inserted into an Amazon URL. Maintained `amazonUrl` fields remain null because Phone QuickCheck uses the reviewed dynamic accessory-search template rather than per-record retail URLs.

## Inputs

Primary user inputs are local browser controls:

- free-text phone/model search;
- manufacturer filter;
- charging connector filter;
- release-year filter;
- sort mode;
- JP/EN language selection;
- selection of one phone record from the result list.

Canonical runtime inputs are static NicheWorks-hosted JSON data:

- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`
- `tools/phone-quickcheck/affiliate-config.js`
- `tools/phone-quickcheck/affiliate-runtime.js`
- `scripts/check-phone-quickcheck-affiliate.mjs`

Phone records use stable model IDs, canonical manufacturer/model names, maintained aliases, dimensions in millimetres, mass in grams, charging facts, provenance/source URLs, verification date, and optional additive accessory keys.

## Outputs

The tool produces an on-screen Quick Check rather than a downloadable artifact. Outputs include:

- matching phone list/cards;
- selected phone dimensions and weight;
- charging connector and charger guidance;
- protocol/PPS/wireless-charging information where verified;
- battery capacity where accepted;
- approximate 5,000 / 10,000 / 20,000mAh power-bank charge equivalents when calculable;
- reusable compatible accessory-class guidance;
- official manufacturer specification and manual/support links;
- last verification date.

No live Amazon price, stock, rating, review count, delivery estimate, or availability output is part of the product contract.

## State and persistence

Search, filters, sorting, selection, and rendering run in the browser. The current language preference is stored locally using the shared `nw_lang` localStorage key where available. Phone search text, filter state, and selected handset are not persisted as a user profile and are not sent to an application search backend.

Canonical device/accessory facts live in static repository data files. The initial product has no account, server-side saved-phone history, or user-specific database state.

## Privacy and network behavior

Phone filtering and detail rendering run locally against static NicheWorks-hosted data. Search text is not intentionally transmitted to an application search service.

External navigation occurs only when a user follows an official manufacturer link or, in a future reviewed release, an enabled affiliate destination. NicheWorks common analytics and advertising behavior remains governed by `common-spec/spec-ja.md`.

Amazon affiliate navigation occurs only after an explicit user click on an Amazon-labelled CTA. Phone QuickCheck does not fetch Amazon prices or inventory, does not scrape retailer pages, and does not send the user's phone-search text in affiliate analytics or destination queries.

## Language mode

`bilingual single-page`

Japanese and English share one canonical page and one canonical device dataset. UI labels, explanations, disclaimers, and accessory guidance are localized. Technical values such as manufacturer/model names, `USB-C`, `USB PD`, `PPS`, `Qi`, and `Qi2` remain canonical technical terms rather than duplicated translated facts.

## Layout class

`hybrid`

Desktop uses a wide two-pane layout: searchable/filterable list on the left and a sticky selected-phone detail pane on the right. Mobile transforms the list into a single-column readable view and opens the same detail content in a dismissible, vertically scrollable bottom sheet. The mobile implementation must not depend on forcing the desktop table through horizontal scrolling.

## Limits and non-goals

- Not a complete smartphone specification encyclopedia.
- Not a phone review, recommendation ranking, or benchmark service.
- Not an exhaustive archive of every historic handset.
- Not a guaranteed charging-performance calculator.
- Not a guarantee that every third-party product within a compatible accessory class works with every handset.
- Not a source for live Amazon price, inventory, or delivery claims in the initial version.
- No guessed Apple mAh values simply to make the recharge calculator display a result.
- No CPU, GPU, camera, benchmark, storage-performance, or exhaustive radio-band catalog merely because such data exists elsewhere.
- No server-side phone search, user accounts, or personal device history in the initial version.
- Per-model indexable landing pages are out of scope until actual search demand and sufficient unique content justify them.

## Acceptance criteria

- [x] One canonical public tool page exists at `/tools/phone-quickcheck/`.
- [x] Japanese and English UI are available on the same page.
- [x] Desktop uses list + right detail pane and mobile uses a bottom sheet for details.
- [x] The initial public dataset contains 30 maintained models.
- [x] Search matches canonical model names plus maintained aliases.
- [x] Manufacturer, connector, and release-year filters work from canonical data.
- [x] Device dimensions, weight, charging information, and official-source links can be displayed without converting the tool into a full specification encyclopedia.
- [x] Manufacturer-nonpublic battery capacity is not silently presented as official.
- [x] Unknown battery capacity produces no fabricated recharge estimate.
- [x] 5,000 / 10,000 / 20,000mAh recharge estimates use the single maintained 0.67 efficiency constant and one-decimal approximate display.
- [x] Charger guidance and device-side maximum charging are not intentionally conflated.
- [x] Accessory compatibility is resolved through reusable classes rather than a per-phone product matrix.
- [x] Official manufacturer specification/manual links are visually/functionally separate from purchase guidance.
- [x] Amazon accessory search CTAs use the shared helper, fixed tracking ID, visible disclosure, canonical accessory queries, and coarse analytics only; no live price or inventory is displayed.
- [x] Phone search/filter behavior requires no application backend or user account.

## Implementation evidence

Production/runtime evidence:

- `tools/phone-quickcheck/index.html`
- `tools/phone-quickcheck/style.css`
- `tools/phone-quickcheck/app.js`
- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`
- `tools/phone-quickcheck/affiliate-config.js`
- `tools/phone-quickcheck/affiliate-runtime.js`
- `scripts/check-phone-quickcheck-affiliate.mjs`

Publication/discovery evidence:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- `sitemap.xml`

Implementation history:

- specification foundation: PR #655
- staged runtime shell: PR #662
- verified data wave 1: PR #668
- verified dataset expansion to 30 models: PR #670
- charging semantics and reusable accessory guidance: PR #676
- public promotion: PR #689
