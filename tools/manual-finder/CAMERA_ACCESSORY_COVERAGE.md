# ManualFinder Camera Accessory Coverage

Updated: 2026-09-16

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **4** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **181** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 4 + reviewed exclusion 0 + missing 181`

The four current detail rows are Nikon Wave 1: `Z8`, `Z6III`, `Z5II`, and `Zf`.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 0 | 0 | 96 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 4 | 0 | 10 |
| Insta360 | 7 | 0 | 0 | 7 |

The exact missing model arrays are emitted by `tests/camera-accessory-coverage.test.mjs` as `MANUALFINDER_CAMERA_ACCESSORY_COVERAGE`. They are intentionally not duplicated here as a 181-model prose ledger.

## Non-actionable camera records

Seven camera-category records are maker/index entries without an actionable exact-model Amazon path. They are not counted as missing accessory detail:

- Canon: 1
- DJI: 1
- Fujifilm: 1
- GoPro: 1
- Nikon: 1
- OM SYSTEM: 1
- RICOH / PENTAX: 1

## Audit contract

- Accessory detail means at least one compatibility-sensitive camera accessory offer emitted from an exact reviewed maker/model mapping.
- A generic exact-model Amazon body search does not count as accessory detail.
- A fixed body-search override such as Nikon Z8 does not count as accessory detail by itself.
- Reviewed exclusions must live in `affiliate-camera-detail-exclusions.js` and must resolve to an existing canonical `カメラ・映像` record.
- The exclusion ledger starts empty. Missing records must not be converted to exclusions without an evidence-backed review reason.
- One camera record cannot simultaneously be detail-mapped and excluded.
- Every actionable camera record must reconcile to exactly one of: verified accessory detail, reviewed exclusion, or missing accessory detail.
- `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` are required diagnostics for planning subsequent waves.

## Expansion order

The measured backlog determines the work order rather than assumptions about brand prominence:

1. Close the remaining Nikon 10 exact-model gaps using official Nikon compatibility evidence.
2. Review DJI 96 actionable records in bounded product-family waves.
3. Review OM SYSTEM 37 actionable records.
4. Review GoPro 31 actionable records.
5. Review Insta360 7 actionable records.

A later wave may alter this order only when evidence quality or product-family structure makes another bounded batch materially safer to close first.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `181` actionable records remain missing accessory detail. Counts may change when the canonical catalog changes, but the reconciliation invariant and zero-unreviewed-missing completion target do not change.

## Source of truth

- `affiliate-camera-accessories.js` — reviewed active accessory mappings.
- `affiliate-camera-detail-exclusions.js` — reviewed explicit exclusions; currently empty.
- `tests/nikon-camera-accessory-wave1.test.mjs` — Nikon Wave 1 compatibility boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera coverage computation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard for this audited baseline.
