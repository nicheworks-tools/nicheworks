# ExecPlan — Phone QuickCheck data wave 5 (150 models)

## Goal

Expand Phone QuickCheck from 100 to 150 maintained smartphones without weakening provenance, charging semantics, behavior coverage, or the existing Amazon accessory-class architecture.

## Selection policy

Prioritize normal slab smartphones relevant to Japan that are still likely to be searched for size, cable, charger, battery, or manual information. Do not add a device merely to reach the count.

In scope:

- fill high-demand gaps in older iPhone, Pixel, Galaxy, Xperia, AQUOS, OPPO, Xiaomi/Redmi, and Motorola generations;
- use manufacturer/manufacturer-support sources for maintained facts;
- preserve Apple battery mAh as unknown when Apple does not publish it;
- keep charger guidance separate from source-backed device-side maximum charging;
- keep proprietary fast charging distinct from generic USB-PD unless the manufacturer supports that interpretation;
- keep the existing behavior regression suite green as the dataset expands;
- update canonical specs and the permanent data-count contract only when the 150-model canonical dataset is complete.

Out of scope:

- foldables until open/closed dimensions are modeled explicitly;
- guessed charging wattage, battery capacity, wireless wattage, or water rating;
- CPU/camera/benchmark/database expansion;
- live Amazon prices, inventory, ratings, delivery claims, or product scraping;
- thin per-model SEO pages.

## Tranche 1 — 12 models

Apple:
- iPhone 13 mini
- iPhone 13 Pro
- iPhone 13 Pro Max
- iPhone 11 Pro
- iPhone 11 Pro Max
- iPhone XS
- iPhone XS Max
- iPhone XR

Google:
- Pixel 5
- Pixel 5a (5G)
- Pixel 4a (5G)
- Pixel 4a

## Data policy

- All records carry a stable ID, manufacturer/model identity, JP market marker, release year, one slab dimension set, weight, charging connector, maintained charging facts, official specification/support URL, official manual/support URL, and `verifiedAt`.
- Apple capacity remains null/unknown unless Apple itself publishes a maintained mAh value.
- `wiredRecommendedW` means charger guidance or the manufacturer's stated adapter class.
- `wiredMaxW` is populated only when the source directly supports a device-side/fast-charge wattage interpretation.
- Unknown wireless maximums remain null even when the wireless standard itself is known.

## Verification

For each tranche:

- reject duplicate IDs and manufacturer/model identities against canonical `phones.json`;
- validate dimensions, weight, year, connector, source URLs, battery provenance, and charging fields;
- run `scripts/check-phone-quickcheck-data.mjs`;
- run `scripts/check-phone-quickcheck-affiliate.mjs`;
- run `tools/phone-quickcheck/tests/behavior.test.mjs`;
- keep runtime, Tool spec, and SEO audits green.

## Release gate

Do not change the permanent validator threshold from 100 to 150 and do not update canonical specs to 150 until all 50 additional records are merged into canonical `phones.json`. Squash merge only after all PR checks succeed and no temporary staging files remain.
