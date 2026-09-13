# ExecPlan — Phone QuickCheck verified phone data wave 2

## Goal

Expand the staged Phone QuickCheck dataset from 10 to 30 officially sourced smartphone records, prioritizing models that are relevant to users in Japan and that exercise the runtime's charging, size, manual, and power-bank estimate paths.

## Scope

In scope:

- `tools/phone-quickcheck/data/phones.json`
- this ExecPlan

Out of scope:

- no public `index.html` promotion yet
- no tools-index or sitemap registration yet
- no live Amazon affiliate destinations, prices, or availability
- no unrelated tool changes
- no speculative battery-capacity values

## Device additions

Add 20 records:

- Apple: iPhone 16, 16 Plus, 16 Pro, 16 Pro Max, 16e, 15, 15 Plus, 15 Pro, 15 Pro Max
- Google: Pixel 10, Pixel 10 Pro, Pixel 10 Pro XL, Pixel 10a
- Samsung: Galaxy S25, Galaxy S25 Ultra
- Sony: Xperia 1 VII, Xperia 10 VII
- SHARP: AQUOS R10, AQUOS sense10, AQUOS wish5

## Data contract

- Manufacturer or manufacturer-support sources are required for core device facts.
- Apple battery `capacityMah` remains `null` unless Apple publishes an official mAh value; no third-party battery figure is introduced in this wave.
- Google, Samsung, Sony, and SHARP battery capacities may be stored only when published by the manufacturer.
- Store dimensions, weight, display size, connector, recommended/required charger wattage when officially stated, charging protocol when officially stated, wireless standard/max wattage when officially stated, water/dust rating, included cable/adapter state only when supported, official specifications/support/manual URLs, release year, and verification date.
- Unknown fields remain `null` or `unknown`; do not infer unsupported capabilities.
- `affiliateKeys` remain empty until the separate accessory/affiliate contract PR.

## Verification

- JSON parses successfully.
- Device IDs are unique.
- Dataset contains exactly 30 records after this wave.
- All records have manufacturer, model, releaseYear, dimensions, weight, connector, sources.specificationsUrl, sources.manualUrl, and sources.verifiedAt.
- Battery-backed recharge estimates are possible only for records with an official numeric `capacityMah`.
- Apple records added in this wave have `capacityMah: null`.
- No Amazon URL, price, or availability field is introduced.
- Existing runtime/SEO CI remains green while the page stays `index.staged.html`.
