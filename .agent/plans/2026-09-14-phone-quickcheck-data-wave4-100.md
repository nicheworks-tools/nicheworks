# ExecPlan — Phone QuickCheck data wave 4 (100 models)

## Goal

Expand Phone QuickCheck from 60 to 100 maintained smartphone records without changing the product into a full specification encyclopedia.

## Scope

In scope:

- add 40 normal slab smartphones relevant to the Japan market;
- prioritize models with stable manufacturer or manufacturer-support specification pages;
- preserve the existing charging/source semantics and Amazon accessory-class architecture;
- keep Apple battery mAh unknown when not published by Apple;
- keep foldables excluded until the schema can represent open/closed dimensions separately;
- keep the dataset static and browser-only.

Out of scope:

- foldables;
- guessed battery or charging values;
- CPU/GPU/camera/benchmark expansion;
- live retailer price, inventory, rating, review-count, delivery, or product-image ingestion;
- per-model SEO pages.

## Target model set

Apple (6): iPhone 12 / 12 mini / 12 Pro / 12 Pro Max / 11 / SE (2nd generation).

Google (6): Pixel 7 / 7 Pro / 7a / 6 / 6 Pro / 6a.

Samsung (7): Galaxy S22 / S22 Ultra / S21 5G / S21 Ultra 5G / A54 5G / A53 5G / A35 5G.

Sony (5): Xperia 1 V / 1 IV / 5 IV / 10 IV / Ace III.

SHARP (7): AQUOS sense8 / sense7 / sense6 / wish3 / wish2 / R8 / R8 pro.

OPPO (4): Reno10 Pro 5G / Reno9 A / Reno7 A / A77.

Xiaomi (3): Redmi Note 13 Pro+ 5G / Redmi Note 13 Pro 5G / Redmi Note 11 Pro 5G.

Motorola (2): moto g64 5G / motorola edge 50 pro.

## Data policy

- manufacturer/manufacturer-support sources are the default provenance;
- physical dimensions, weight, display size, ingress rating, charging connector, battery capacity, charging and wireless facts are populated only when supported by maintained sources;
- `wiredRecommendedW` remains charger guidance, not device-side max input;
- `wiredMaxW` is used only when the source supports the device-side interpretation;
- unknown facts remain null/unknown;
- all new records use HTTPS sources and `verifiedAt: 2026-09-14`.

## Delivery sequence

1. Apple + Google first 12 records.
2. Samsung + Sony next 12 records.
3. SHARP next 7 records.
4. OPPO + Xiaomi + Motorola final 9 records.
5. Merge all 40 into canonical `phones.json` only after permanent data and affiliate checks pass.
6. Update canonical specs from 60 to 100 maintained models.
7. Remove temporary wave files before PR.

## Verification

- canonical count reaches exactly 100 maintained phones at release;
- IDs and manufacturer/model identities remain unique;
- Apple maintained mAh remains unknown;
- accepted non-null capacities have HTTPS provenance;
- no foldable enters the single-dimension schema;
- Phone QuickCheck data check, affiliate check, runtime contract, Tool spec audit, and SEO audit all pass;
- final PR contains no temporary workflow or temporary wave file.

## Release gate

Squash merge only after latest-main synchronization, mergeable=true, and all triggered PR checks succeed.
