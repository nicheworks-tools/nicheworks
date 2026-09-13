# Tool Specification — Phone QuickCheck

- Japanese name: `スマホ QuickCheck`
- English name: `Phone QuickCheck`
- Slug: `phone-quickcheck`
- Planned public URL: `https://nicheworks.app/tools/phone-quickcheck/`
- Specification status: `planned`
- Common specification: `common-spec/spec-ja.md`
- Product class: `static browser utility / quick-check directory`

## Purpose

Let a user find a smartphone model and answer a small set of practical questions quickly:

- How large and heavy is this phone?
- What charging connector does it use?
- What charger/cable requirements matter for normal or fast charging?
- Does it support wireless charging, and under what named standard where verified?
- Roughly how many full-phone-equivalent charges could common 5,000 / 10,000 / 20,000 mAh power banks provide?
- Where are the manufacturer's official specification and manual/support pages?
- Which broad accessory class should the user look for if they want to buy a compatible cable, charger, power bank, or wireless charger?

The product is intentionally a **Quick Check**, not a comprehensive smartphone encyclopedia and not a benchmarking/review database.

## Core product principle

The UI must optimize for the path:

`find phone -> understand size/charging -> understand what accessory class is compatible -> optionally continue to Amazon`

Do not expand the main product into exhaustive CPU, GPU, camera, benchmark, storage-performance, radio-band, or full-spec comparison coverage merely because those fields are available elsewhere.

## Language mode

`same-page JA/EN switch`

- Japanese and English are required from the first runtime implementation.
- One canonical data model is shared across languages.
- Manufacturer names, model names, connector names, and standards such as `USB-C`, `USB PD`, `PPS`, `Qi`, and `Qi2` are canonical technical values and are not duplicated as translated data.
- UI labels, explanations, disclaimers, and accessory guidance are localized.
- Canonical dimensions and mass are stored in millimetres and grams.
- English UI may derive and show inches/ounces as secondary display values; derived imperial values are never canonical source facts.

## Layout class

`desktop-wide / mobile-adaptive`

### Desktop contract

Use a two-pane layout at desktop widths:

- Left/main pane: search, compact filters, sort, and phone list/table.
- Right detail pane: selected phone Quick Check.
- The list must remain scannable and must not expose every stored field.
- Target desktop content width follows the NicheWorks PC-oriented common-spec range rather than a 600px single-column layout.

Desktop list columns are limited to the practical scan set:

1. Manufacturer
2. Model
3. Release year
4. Dimensions (compact)
5. Weight
6. Charging connector

### Mobile contract

- Use a single-column compact model list/card view.
- Selecting a phone opens the detail content in a bottom sheet.
- The bottom sheet must be dismissible and vertically scrollable.
- Do not force the desktop table into a narrow horizontal-scroll-only experience when a readable card/list transformation is possible.
- The same factual/detail content must remain accessible as on desktop.

## Search and filtering contract

Initial runtime requirements:

- Free-text model search.
- Match canonical model name plus maintained aliases.
- Manufacturer filter.
- Charging connector filter.
- Release-year filter.
- Wireless-charging presence filter may be added if it remains compact.
- Sort modes should remain deliberately small: newest, lightest, and compact-size oriented sorting are sufficient for the initial version.

Aliases may include common spacing/romanization/script variants such as `iPhone16`, `iPhone 16`, or an explicitly maintained Japanese reading. Aliases must not create fake models.

## Display information contract

### List-level information

Keep list rows/cards concise:

- Manufacturer
- Model
- Release year
- Height × width (depth may be included in compact text where space permits)
- Weight
- Charging connector

### Detail-level information

The selected-phone detail pane/sheet may show:

#### Device

- Full dimensions: height × width × depth
- Weight
- Display size (optional supporting field)
- A simple derived size label such as compact / standard / wide, only if thresholds are documented and clearly treated as NicheWorks-derived guidance rather than manufacturer terminology

#### Charging

- Connector
- Verified charging protocol/standard labels
- Recommended charger wattage or minimum class, only where the source supports that guidance
- PPS requirement/support where relevant and verified
- Wireless charging standard/support
- Wireless charging wattage where verified
- Included cable state
- Included AC adapter/charger state

#### Power-bank estimate

Show fixed common capacities:

- 5,000 mAh
- 10,000 mAh
- 20,000 mAh

Display one-decimal approximate charge counts where calculation is allowed.

#### Official information

- Official specifications link
- Official manual or official support/manual destination
- Verification/review date

#### Purchase guidance

Show only accessory classes determined from compatibility facts, for example:

- USB-C to USB-C cable
- USB-C to Lightning cable
- USB PD 20W+ charger
- USB PD/PPS 30W+ charger
- USB PD/PPS 45W+ charger
- Qi2 charger
- 5,000 / 10,000 / 20,000 mAh power bank

This guidance must not imply that every Amazon result is guaranteed compatible; the user must still confirm the selected product's own specifications.

## Canonical data contract

Runtime data is expected to be hosted as static NicheWorks data, initially under a structure such as:

- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`

A phone record must use stable normalized fields conceptually equivalent to:

```json
{
  "id": "google-pixel-10",
  "manufacturer": "Google",
  "model": "Pixel 10",
  "aliases": ["Pixel10"],
  "releaseYear": 2025,
  "dimensions": {
    "heightMm": 0,
    "widthMm": 0,
    "depthMm": 0
  },
  "weightG": 0,
  "displayInch": null,
  "charging": {
    "connector": "USB-C",
    "battery": {
      "capacityMah": null,
      "valueClass": "official|third_party_reference|unknown",
      "sourceRef": null
    },
    "wiredRecommendedW": null,
    "protocols": [],
    "pps": "supported|required|not_supported|unknown",
    "wirelessStandard": null,
    "wirelessMaxW": null
  },
  "included": {
    "cable": "included|not_included|unknown",
    "adapter": "included|not_included|unknown"
  },
  "waterRating": null,
  "sources": {
    "specificationsUrl": null,
    "manualUrl": null,
    "verifiedAt": null
  },
  "affiliateKeys": []
}
```

The example numeric zeroes above are schema illustrations only and must never be used as real phone facts.

## Fact classes and provenance

Every displayed numeric/compatibility fact must be attributable to one of three classes:

1. `official`
   - Directly supported by a manufacturer specification/manual/support source.
2. `third_party_reference`
   - Used only when the manufacturer does not publish the needed value and a maintained external reference is deliberately accepted.
3. `derived`
   - Computed by NicheWorks from canonical inputs, such as inches, ounces, size bands, or power-bank charge estimates.

Rules:

- Never label a third-party battery-capacity value as manufacturer-published.
- Never silently substitute an inferred value for a missing official field.
- Unknown stays unknown.
- Source URLs must point to the evidence actually used for the maintained record where practical.
- Official manufacturer specification/manual/support destinations are preferred for device and charging facts.
- Retailer product copy is not the canonical authority for phone technical facts.
- A source review date is required for accepted production records.

## Battery-capacity rule

Battery capacity is special because some manufacturers do not publish mAh values in ordinary consumer specifications.

- If manufacturer-published capacity is available, store it as `official`.
- If capacity is not manufacturer-published but the project deliberately accepts a maintained third-party reference, store it as `third_party_reference` and label the UI as a reference/non-manufacturer value.
- If no acceptable maintained value exists, keep capacity unknown and do not generate a charge-count estimate.
- Do not reverse-engineer or guess mAh from runtime claims such as video playback time.

## Power-bank estimate contract

The charge-count feature is an estimate, not a guarantee.

Initial formula:

```text
estimated_full_charge_equivalents =
  power_bank_nominal_mah * 0.67 / phone_battery_mah
```

Initial efficiency factor: `0.67`.

Runtime rules:

- Round display to one decimal place.
- Label results as approximate: `約` / `Approx.`.
- The explanatory note must state that conversion loss, device use during charging, temperature, cable/charger behavior, battery condition, and other factors can change real results.
- The factor is a product-level approximation constant and must be kept in one clearly named implementation location rather than duplicated across UI code.
- If a later evidence-backed methodology changes the factor or moves to an energy/Wh model, update the specification and regression expectations together.
- Do not calculate when phone battery capacity is `unknown`.
- When capacity is a third-party reference, the estimate must inherit that caveat in the displayed methodology/footnote.

## Accessory compatibility model

Do not maintain a large phone × individual-product matrix.

Use reusable compatibility/accessory keys, conceptually such as:

- `cable-usbc-usbc`
- `cable-usbc-lightning`
- `charger-pd-20w`
- `charger-pd-30w`
- `charger-pps-30w`
- `charger-pps-45w`
- `charger-pd-65w`
- `charger-qi2`
- `powerbank-5000`
- `powerbank-10000`
- `powerbank-20000`

A phone record references the appropriate keys. Accessory definitions provide localized labels, compatibility notes, and affiliate/search destinations.

The compatibility rule must be based on verified charging facts, not on affiliate economics.

## Amazon affiliate contract

Primary monetization is Amazon accessory referral.

Rules:

- Affiliate calls to action must follow from the selected phone's verified compatibility facts.
- Do not make the page look like an Amazon storefront.
- Do not require one manually maintained Amazon product URL per phone.
- Prefer reusable accessory-category/search destinations where permitted by the Amazon Associates setup.
- Do not display scraped or hard-coded live Amazon price/availability claims.
- If price/availability is ever introduced, it requires a separate implementation decision using a compliant current Amazon mechanism.
- Required affiliate disclosure must be present before production affiliate links are enabled.
- Affiliate buttons/links must remain visually distinct from official manufacturer specification/manual links.
- The initial Japanese and English UI may both route to the project's configured Amazon Japan destination; adding US/UK/other regional affiliate programs is a later explicit expansion, not an automatic geolocation feature.
- No affiliate destination may alter the underlying compatibility classification.

## Privacy and network behavior

- Search/filter/detail behavior runs locally in the browser against NicheWorks-hosted static data.
- Model search text is not intentionally sent to an application search backend.
- No account or saved-phone profile is required for the initial version.
- External navigation occurs only when the user intentionally opens an official-source or affiliate destination.
- NicheWorks common analytics/advertising behavior remains governed by `common-spec/spec-ja.md`.

## SEO and indexing direction

Initial launch uses one canonical tool page rather than generating hundreds of thin per-model pages.

The root tool should communicate search intent around:

- smartphone/phone size
- charging connector/cable type
- charger wattage/charging requirements
- power-bank charge estimates
- official manual/specification lookup

Per-model indexable landing pages are out of scope until real search demand and sufficient unique content justify them.

## Initial dataset scope

Do not block initial runtime quality on an enormous catalog.

Implementation sequence:

- First functional dataset: approximately 30 verified representative/current models across major brands relevant to Japanese users.
- Validate the full UI/data/source workflow with that set.
- Expand to approximately 100–150 maintained models after the product behavior is stable.
- Coverage count is not a quality target by itself.

Candidate brand coverage may include Apple, Google, Samsung, Sony, SHARP, Xiaomi, OPPO, and Motorola, but inclusion still requires maintainable source evidence.

## Limits and non-goals

- Not a complete smartphone specification encyclopedia.
- Not a phone review or ranking service.
- Not a benchmark database.
- Not a guaranteed charging-performance calculator.
- Not a guarantee that a specific third-party accessory will work merely because it belongs to a broad compatible class.
- Not a source for live Amazon price or inventory in the initial version.
- Not an exhaustive archive of every historic handset.
- No server-side phone search, user accounts, or personal device history in the initial version.

## Acceptance criteria — specification foundation

- [x] Product purpose is limited to practical Quick Check information and accessory compatibility.
- [x] Japanese and English behavior is explicitly required.
- [x] Desktop right-pane and mobile bottom-sheet behavior are explicitly defined.
- [x] List-level fields are intentionally smaller than detail-level fields.
- [x] Canonical data structure and reusable accessory-key structure are defined.
- [x] Official, third-party-reference, and derived values are distinguishable.
- [x] Manufacturer-nonpublic battery capacity cannot silently appear as an official value.
- [x] 5,000 / 10,000 / 20,000 mAh estimate behavior and initial 0.67 efficiency methodology are defined.
- [x] Unknown battery capacity produces no fabricated charge estimate.
- [x] Official specification/manual links and review dates are part of the production record contract.
- [x] Amazon monetization is compatibility/category based rather than a per-phone product-link matrix.
- [x] Live Amazon price/availability scraping/hard-coding is outside the initial contract.
- [x] The initial product uses a single canonical tool page rather than mass-generated thin model pages.

## Planned implementation evidence

Later PRs should add and then keep this section current with concrete implementation paths, expected to include at minimum:

- `tools/phone-quickcheck/index.html`
- `tools/phone-quickcheck/style.css`
- `tools/phone-quickcheck/app.js`
- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`

Until those files exist, this `SPEC.md` is the product contract and must not claim implementation completion.
