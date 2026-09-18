# Phone QuickCheck v1 Completion Audit

Status: **IN PROGRESS**
Baseline date: **2026-09-18**
Dataset target for this closure pass: **181 maintained phones**

## Completion rule

Phone QuickCheck v1 is complete when the product behavior is stable and every actionable evidence gap is either:

1. resolved from acceptable primary evidence, or
2. explicitly reviewed and retained as unknown because the maintained evidence does not support a stronger canonical claim.

Completion does **not** require forcing every nullable field to a value. Unknown values remain valid where manufacturer/carrier evidence is absent, ambiguous across Japan sales variants, or the product contract deliberately forbids inference.

## Baseline

Correction note: Galaxy A35 5G was removed from the JP-maintained set on 2026-09-18. The previous record used global launch/specification sources while incorrectly declaring `market: ["JP"]`.

- phones: **181**
- manufacturers: **9**
- foldables: **32**
- raw package unknowns: **4 adapter / 11 cable = 15 fields**
- raw water unresolved: **3 records**
- reviewed-unresolved package/water fields: **18 / 18**
- **unreviewed package/water gaps: 0**
- battery capacity unknown: **33** — all maintained Apple records; intentional under current policy
- charger guidance missing: **62**
- handset-side wired maximum missing: **86**
- PPS unknown: **151**
- wireless standard missing: **74**

The final four charging counts are **not automatically defects**. They are evidence-sensitive fields and must not be filled by inference merely to reduce an unknown count.

## Package review closure

All remaining package unknown fields are now explicitly recorded in `data/reviewed-unknowns.json` with a reason and reviewed primary-source URLs.

The remaining raw unknowns are:

- Galaxy A36 5G: cable
- Xperia 1 VI: adapter + cable
- Xperia 10 VI: adapter + cable
- Xperia 5 V: adapter + cable
- Xperia 10 V: adapter + cable
- Xperia 1 V: cable
- Xperia 10 IV: cable
- AQUOS sense5G: cable
- AQUOS R6: cable
- AQUOS R5G: cable
- AQUOS zero5G basic: cable

These are not silently converted to `included` or `not_included`. Exact JP in-box evidence was not sufficient for the canonical record, or package state is not safe to generalize across Japan sales variants.

## Water review closure

The remaining raw water unknowns are:

- Pixel 4a (5G)
- Pixel 4a
- OPPO A54 5G

Primary safety/specification material was reviewed. It does not support converting these records to the combined UI claim `not_resistant` (“非防水・非防塵”), so the canonical value remains unknown and each record is registered as `reviewed_unresolved`.

Galaxy Z Flip 5G and Galaxy M23 5G were separately resolved to explicit `not_resistant` states from Japan-market primary evidence.

## Intentional / evidence-sensitive unknowns

### Apple battery capacity

All 33 current Apple records intentionally keep `charging.battery.capacityMah` unknown. The data contract rejects guessed Apple mAh values unless the policy is explicitly revised.

### Charger guidance / handset maximum / PPS / wireless

A null or unknown value is not itself a completion defect. These fields may be populated only when maintained evidence supports the exact semantic claim:

- `wiredRecommendedW`: charger guidance / adapter class
- `wiredMaxW`: handset-side maximum, never inferred from charger guidance
- `pps`: explicit supported/required/not-supported state only with evidence
- `wirelessStandard` / `wirelessMaxW`: source-backed wireless capability only

## Remaining closure sequence

1. Re-audit charging evidence and classify remaining null/unknown values as either actionable source gaps or intentionally unresolved.
2. Run final browser QA at 320 / 390 / 414 px, tablet, and desktop for search, filters, sorting, JP/EN, foldables, bottom sheet, unknown rendering, Amazon CTA, official links, and data-load failure.
3. Change this document's status to **V1 COMPLETE** only when the charging review and final browser QA are complete.

## Regression guard

`scripts/check-phone-quickcheck-completion.mjs` now compares the live package/water unknown field set to `data/reviewed-unknowns.json`.

The CI fails when:

- a new package/water unknown appears without review;
- a reviewed unknown is resolved but its ledger entry is left stale;
- a ledger entry references a missing phone/unsupported field;
- evidence/review metadata is malformed;
- the intentional Apple battery rule drifts.

This makes **unreviewed actionable package/water gaps = 0** a machine-checked invariant.
