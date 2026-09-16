# ManualFinder Camera Accessory Coverage

Updated: 2026-09-16

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **23** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **162** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 23 + reviewed exclusion 0 + missing 162`

The current detail ledger contains all 14 actionable Nikon records plus nine reviewed DJI records across Osmo Action Wave 1, Air Wave 2, and Mini Wave 3.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 9 | 0 | 87 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 14 | 0 | 0 |
| Insta360 | 7 | 0 | 0 | 7 |

The exact missing model arrays are emitted by `tests/camera-accessory-coverage.test.mjs` as `MANUALFINDER_CAMERA_ACCESSORY_COVERAGE`. They are intentionally not duplicated here as a 162-model prose ledger.

## Nikon completion — Waves 1–2

All fourteen actionable Nikon camera records have reviewed battery/charger detail mappings:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

The reviewed power-accessory groups are:

- Wave 1: `Z8`, `Z6III`, `Z5II`, `Zf` → `EN-EL15c` battery / `MH-25a` charger.
- Wave 2: `Z9` → `EN-EL18d` / `MH-33`.
- Wave 2: `Z7II`, `Z6II`, `Z5` → `EN-EL15c` / `MH-25a`.
- Wave 2: `Z7`, `Z6` → `EN-EL15b` / `MH-25a`.
- Wave 2: `Z50II`, `Z50`, `Z30`, `Zfc` → `EN-EL25a` / `MH-32`.

Every mapping is tied to an exact Nikon official model/manual source. Shared accessory families are not inferred from name similarity; the exact model rows are reviewed explicitly.

## DJI Osmo Action — Wave 1

Four current Osmo Action records have reviewed DJI power-accessory detail mappings:

- `Osmo Action 3`
- `Osmo Action 4`
- `Osmo Action 5 Pro`
- `Osmo Action 6`

For each of those four models, DJI official compatibility information supports:

- `Osmo Action Extreme Battery Plus` — battery search handoff.
- `Osmo Action Multifunctional Battery Case 2` — charger/battery-case search handoff.

The older `Osmo Action` and `DJI Action 2` records are deliberately not inferred into this wave.

## DJI Air — Wave 2

Two current DJI Air records have reviewed DJI power-accessory detail mappings:

- `DJI Air 3`
- `DJI Air 3S`

DJI official compatibility information explicitly supports both reviewed handoffs for both models:

- `DJI Air 3 Intelligent Flight Battery` — battery search handoff.
- `DJI Air 3 Series Battery Charging Hub` — charging-hub search handoff.

The Wave 2 contract is exact-model only. `DJI Air 2S`, `Mavic Air 2`, and `Mavic Air` are not inferred into the same compatibility set.

## DJI Mini — Wave 3

Three current DJI Mini records have reviewed DJI power-accessory detail mappings:

- `DJI Mini 3`
- `DJI Mini 3 Pro`
- `DJI Mini 4 Pro`

The battery mapping preserves DJI's exact compatibility boundary rather than forcing one battery across all three models:

- `DJI Mini 3`, `DJI Mini 3 Pro` → `DJI Mini 3 Series Intelligent Flight Battery`.
- `DJI Mini 4 Pro` → `DJI Mini 4 Pro Intelligent Flight Battery`.
- all three → `DJI Mini 4 Pro/Mini 3 Series Two-Way Charging Hub`.

`DJI Mini 2`, `DJI Mini SE`, `Mavic Mini`, and other Mini-family models are not inferred into Wave 3.

After DJI Waves 1–3 the maker-level reconciliation is:

`DJI camera 96 = detail 9 + reviewed exclusion 0 + missing 87`

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

1. Continue DJI from the remaining 87 actionable records in bounded product-family waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon is closed at zero missing. A later wave may alter the remaining order only when evidence quality or product-family structure makes another bounded batch materially safer to close first.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `162` actionable records remain missing accessory detail. Counts may change when the canonical catalog changes, but the reconciliation invariant and zero-unreviewed-missing completion target do not change.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 reviewed active accessory mappings.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 mappings that close the remaining ten actionable Nikon records.
- `affiliate-dji-camera-accessories-wave1.js` — DJI Osmo Action Wave 1 mappings for four reviewed models.
- `affiliate-dji-camera-accessories-wave2.js` — DJI Air Wave 2 mappings for `DJI Air 3` and `DJI Air 3S`.
- `affiliate-dji-camera-accessories-wave3.js` — DJI Mini Wave 3 mappings for `DJI Mini 3`, `DJI Mini 3 Pro`, and `DJI Mini 4 Pro`.
- `affiliate-camera-detail-exclusions.js` — reviewed explicit exclusions; currently empty.
- `tests/nikon-camera-accessory-wave1.test.mjs` — Nikon Wave 1 compatibility boundary.
- `tests/nikon-camera-accessory-wave2.test.mjs` — Nikon Wave 2 compatibility boundary and fourteen-record Nikon completion.
- `tests/dji-osmo-action-accessory-wave1.test.mjs` — exact DJI Osmo Action Wave 1 compatibility boundary.
- `tests/dji-air-accessory-wave2.test.mjs` — exact DJI Air Wave 2 compatibility boundary.
- `tests/dji-mini-accessory-wave3.test.mjs` — exact DJI Mini Wave 3 compatibility boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera coverage computation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard for this audited baseline.
