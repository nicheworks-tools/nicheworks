# ManualFinder Camera Accessory Coverage

Updated: 2026-09-16

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **14** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **171** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 14 + reviewed exclusion 0 + missing 171`

The fourteen current detail rows are all actionable Nikon camera records. Wave 1 covers `Z8`, `Z6III`, `Z5II`, and `Zf`; Wave 2 closes `Z9`, `Z7II`, `Z6II`, `Z7`, `Z6`, `Z5`, `Z50II`, `Z50`, `Z30`, and `Zfc`.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 0 | 0 | 96 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 14 | 0 | 0 |
| Insta360 | 7 | 0 | 0 | 7 |

The exact missing model arrays are emitted by `tests/camera-accessory-coverage.test.mjs` as `MANUALFINDER_CAMERA_ACCESSORY_COVERAGE`. They are intentionally not duplicated here as a 171-model prose ledger.

## Nikon completion — Waves 1–2

All fourteen actionable Nikon camera records now have reviewed battery/charger detail mappings:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

The reviewed power-accessory groups are:

- Wave 1: `Z8`, `Z6III`, `Z5II`, `Zf` → `EN-EL15c` battery / `MH-25a` charger.
- Wave 2: `Z9` → `EN-EL18d` / `MH-33`.
- Wave 2: `Z7II`, `Z6II`, `Z5` → `EN-EL15c` / `MH-25a`.
- Wave 2: `Z7`, `Z6` → `EN-EL15b` / `MH-25a`.
- Wave 2: `Z50II`, `Z50`, `Z30`, `Zfc` → `EN-EL25a` / `MH-32`.

Every mapping is tied to an exact Nikon official model/manual source. Shared accessory families are not inferred from name similarity; the exact model rows are reviewed explicitly.

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

The measured remaining backlog determines the work order rather than assumptions about brand prominence:

1. Review DJI 96 actionable records in bounded product-family waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon is closed at zero missing. A later wave may alter the remaining order only when evidence quality or product-family structure makes another bounded batch materially safer to close first.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `171` actionable records remain missing accessory detail. Counts may change when the canonical catalog changes, but the reconciliation invariant and zero-unreviewed-missing completion target do not change.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 reviewed active accessory mappings.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 mappings that close the remaining ten actionable Nikon records.
- `affiliate-camera-detail-exclusions.js` — reviewed explicit exclusions; currently empty.
- `tests/nikon-camera-accessory-wave1.test.mjs` — Nikon Wave 1 compatibility boundary.
- `tests/nikon-camera-accessory-wave2.test.mjs` — Nikon Wave 2 compatibility boundary and fourteen-record Nikon completion.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera coverage computation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard for this audited baseline.
