# ExecPlan — Phone QuickCheck data wave 3 (60 models)

## Goal

Expand Phone QuickCheck from 30 to 60 maintained smartphones while preserving the quick-check product scope, source discipline, charging semantics, and Amazon accessory-class architecture.

## Scope

In scope:

- add 30 normal slab smartphones relevant to the Japan market;
- expand manufacturer coverage to Apple, Google, Samsung, Sony, SHARP, OPPO, Xiaomi, and Motorola;
- add Lightning-era iPhone coverage without guessing Apple battery mAh;
- add a reusable USB-C-to-Lightning cable accessory class and Amazon handoff;
- preserve separate charger-guidance and source-backed device maximum fields;
- add a permanent Phone QuickCheck data validator and CI workflow;
- update canonical specs from 30 to 60 maintained models.

Out of scope:

- foldables whose open/closed dimensions cannot be represented faithfully by the current one-dimension-set schema;
- guessed charging wattage or guessed battery capacity;
- CPU, camera, benchmark, storage, radio-band, or review-database expansion;
- live Amazon price, inventory, rating, delivery, or product image ingestion;
- per-model SEO pages.

## Added model set

Apple: iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max / 13 / SE (3rd generation).

Google: Pixel 9 / 9 Pro / 9 Pro XL / 9a / 8 / 8a.

Samsung: Galaxy S24 / S24 Ultra / A55 5G / A36 5G / S23.

Sony: Xperia 1 VI / 10 VI / 5 V / 10 V.

SHARP: AQUOS sense9 / R9 / wish4.

OPPO: Reno13 A / Reno11 A / A3 5G.

Xiaomi: Xiaomi 15 Ultra / Xiaomi 14T Pro.

Motorola: motorola edge 60 pro.

## Data policy

- manufacturer or manufacturer-support sources are required for maintained physical and charging facts;
- Apple battery capacity remains unknown because the maintained Apple sources do not publish mAh;
- `wiredRecommendedW` remains charger guidance only;
- `wiredMaxW` is populated only where the maintained source supports a device-side fast-charge or input value;
- unknown facts remain null/unknown rather than inferred;
- all new records carry `verifiedAt: 2026-09-14` and HTTPS official-source destinations.

## Accessory compatibility

Lightning-era iPhones add `cable-usbc-lightning`. Their charger class remains USB-PD 20W guidance from the maintained Apple charging condition. The shared 10,000mAh USB-C power-bank class may be offered because the maintained cable class supplies the USB-C-to-Lightning connection; the displayed recharge count remains unavailable when Apple mAh is unknown.

## Verification

- canonical phone count is at least 60 and IDs are unique;
- manufacturer/model identities are unique;
- dimensions, weight, year, connector, source URLs, and verification date satisfy the permanent data contract;
- Apple records contain no maintained mAh value;
- all non-null battery capacities carry an accepted provenance class and HTTPS source;
- every accessory key is unique and the Lightning cable class exists;
- every affiliate offer covers a maintained accessory key;
- Phone QuickCheck data CI, affiliate CI, runtime audit, Tool spec audit, and SEO audit remain green;
- no temporary wave file or temporary workflow remains in the final PR.

## Release gate

Canonical merge completed on the branch: 30 base records + 30 wave records = 60 records. `phones.wave3.json` and temporary finalizer/sync workflows were removed after validation. The branch was synchronized with current `main` before final CI. Squash merge only after the branch is mergeable and all triggered PR checks succeed.
