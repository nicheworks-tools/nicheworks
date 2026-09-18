# Phone QuickCheck v1 Completion Audit

Status: **IN PROGRESS**
Baseline date: **2026-09-18**
Dataset target for this closure pass: **182 maintained phones**

## Completion rule

Phone QuickCheck v1 is complete when the product behavior is stable and every currently actionable evidence gap is either:

1. resolved from acceptable primary evidence, or
2. explicitly reviewed and retained as unknown because the maintained evidence does not support a stronger claim.

Completion does **not** require forcing every nullable charging field to a value. Unknown values remain valid where manufacturer evidence is absent or the product contract deliberately forbids inference.

## Baseline

- phones: **182**
- manufacturers: **9**
- foldables: **32**
- package adapter unknown: **4**
- package cable unknown: **13**
- unresolved water state: **5**
- battery capacity unknown: **33** — all maintained Apple records; intentional under current policy
- charger guidance missing: **62**
- handset-side wired maximum missing: **86**
- PPS unknown: **151**
- wireless standard missing: **74**

The final four charging counts are **not automatically defects**. They are evidence-sensitive fields and must not be filled by inference merely to reduce an unknown count.

## Actionable package review backlog

### AC adapter unknown — 4

- `sony-xperia-1-vi`
- `sony-xperia-10-vi`
- `sony-xperia-5-v`
- `sony-xperia-10-v`

### Cable unknown — 13

- `samsung-galaxy-a36-5g`
- `sony-xperia-1-vi`
- `sony-xperia-10-vi`
- `sony-xperia-5-v`
- `sony-xperia-10-v`
- `samsung-galaxy-a35-5g`
- `sony-xperia-1-v`
- `sony-xperia-10-iv`
- `sharp-aquos-sense5g`
- `sharp-aquos-r6`
- `sharp-aquos-zero6`
- `sharp-aquos-r5g`
- `sharp-aquos-zero5g-basic`

## Actionable water review backlog — 5

- `samsung-galaxy-z-flip-5g`
- `google-pixel-4a-5g`
- `google-pixel-4a`
- `samsung-galaxy-m23-5g`
- `oppo-a54-5g`

## Intentional / evidence-sensitive unknowns

### Apple battery capacity

All 33 current Apple records intentionally keep `charging.battery.capacityMah` unknown. The data contract rejects guessed Apple mAh values unless the policy is explicitly revised.

### Charger guidance / handset maximum / PPS / wireless

A null or unknown value is not itself a completion defect. These fields may be populated only when maintained evidence supports the exact semantic claim:

- `wiredRecommendedW`: charger guidance / adapter class
- `wiredMaxW`: handset-side maximum, never inferred from charger guidance
- `pps`: explicit supported/required/not-supported state only with evidence
- `wirelessStandard` / `wirelessMaxW`: source-backed wireless capability only

## Closure sequence

1. Finish package review backlog.
2. Finish water review backlog.
3. Re-audit charging evidence and classify remaining null/unknown values as either source-backed gaps or intentionally unresolved.
4. Run final browser QA at 320 / 390 / 414 px, tablet, and desktop for search, filters, sorting, JP/EN, foldables, bottom sheet, unknown rendering, Amazon CTA, official links, and data-load failure.
5. Change this document's status to **V1 COMPLETE** only when no unreviewed actionable gap remains.

## Regression guard

`scripts/check-phone-quickcheck-completion.mjs` locks this baseline. If package/water unknown IDs or the intentional Apple battery rule drift, the Phone QuickCheck data CI must fail until this audit is consciously updated.
