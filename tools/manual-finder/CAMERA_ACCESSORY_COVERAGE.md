# ManualFinder Camera Accessory Coverage

Updated: 2026-09-18

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` rather than being duplicated as prose.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **62** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **123** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 62 + reviewed exclusion 0 + missing 123`

The active detail ledger contains all fourteen actionable Nikon records and forty-eight reviewed DJI records. Missing rows remain explicit rather than being converted to guessed accessory mappings or unsupported exclusions.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 48 | 0 | 48 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 14 | 0 | 0 |
| Insta360 | 7 | 0 | 0 | 7 |

The exact missing model arrays are emitted by `tests/camera-accessory-coverage.test.mjs` as `MANUALFINDER_CAMERA_ACCESSORY_COVERAGE`.

## Nikon completion — Waves 1–2

All fourteen actionable Nikon camera records have reviewed battery/charger mappings:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

The reviewed groups are:

- `Z8`, `Z6III`, `Z5II`, `Zf` → `EN-EL15c` / `MH-25a`.
- `Z9` → `EN-EL18d` / `MH-33`.
- `Z7II`, `Z6II`, `Z5` → `EN-EL15c` / `MH-25a`.
- `Z7`, `Z6` → `EN-EL15b` / `MH-25a`.
- `Z50II`, `Z50`, `Z30`, `Zfc` → `EN-EL25a` / `MH-32`.

Every row is explicit in the reviewed ledger; shared accessory families are not inferred from model-name similarity.

## DJI reviewed waves

DJI coverage advances only through bounded exact-canonical-row waves backed by DJI official evidence. Waves 1–27 remain frozen in their reviewed ledgers.

### Wave 21 — Phantom 4 series

Wave 21 activates exactly five canonical Phantom 4 rows: `Phantom 4`, `Phantom 4 Advanced`, `Phantom 4 Pro`, `Phantom 4 Pro V2.0`, and `Phantom 4 RTK`, mapped to `DJI Phantom 4 Series Intelligent Flight Battery` and `DJI Phantom 4 Battery Charging Hub` from DJI official series/product evidence.

### Wave 22 — Phantom 3 series

Wave 22 activates exactly three canonical Phantom 3 rows:

- `Phantom 3 Advanced`
- `Phantom 3 Professional`
- `Phantom 3 Standard`

DJI's official Phantom 3 Advanced, Professional, and Standard Download Centers publish the `Phantom 3 Series Charging Hub User Manual` under those products. DJI's official Phantom 3 battery guidance identifies the Phantom 3 Series Intelligent Flight Battery as 15.2 V / 4480 mAh, and the Phantom 3 Standard official FAQ explicitly states that Professional/Advanced and Standard batteries are the same.

The deterministic Amazon handoffs are:

- `DJI Phantom 3 Intelligent Flight Battery`
- `DJI Phantom 3 Battery Charging Hub`

Wave 22 remains exact-canonical-row only. `Phantom 3 SE`, `Phantom 3 4K`, `DJI Phantom 3 Standard`, and other inferred names remain fail-closed unless separately reviewed.

### Wave 23 — Phantom 3 SE

Wave 23 activates exactly the canonical `Phantom 3 SE` row. DJI's official Phantom 3 SE Download Center publishes SE-specific Intelligent Flight Battery safety material, while DJI's official battery guidance defines the Phantom 3 Series Intelligent Flight Battery as 15.2 V / 4480 mAh. The deterministic Amazon handoff is `DJI Phantom 3 Intelligent Flight Battery`.

No charging-hub handoff is emitted in Wave 23 because equally explicit official SE-specific hub compatibility was not established. Wave 22 hub evidence is not inherited by name or series similarity. `Phantom 3 4K`, `DJI Phantom 3 SE`, and other non-canonical spellings remain fail-closed.

### Wave 24 — Mavic 2 Enterprise Advanced

Wave 24 activates exactly the canonical `Mavic 2 Enterprise Advanced` row. DJI Store's official `Mavic 2 Enterprise Battery` page explicitly lists `Mavic 2 Enterprise Advanced` in Compatibility, so the deterministic Amazon handoff is `DJI Mavic 2 Enterprise Battery`.

No charging-hub handoff is emitted in Wave 24 because the reviewed official evidence did not directly name Advanced at the same compatibility level. The existing Mavic 2 Wave 10 hub mapping is not inherited by family similarity. `Mavic 2 Enterprise Series`, `DJI Mavic 2 Enterprise Advanced`, and other inferred names remain fail-closed.

### Wave 25 — Mavic 2 Enterprise Series

Wave 25 activates exactly the canonical `Mavic 2 Enterprise Series` row. DJI's official Mavic 2 Enterprise Series Download Center publishes the series-specific Intelligent Flight Battery Safety Guide, and DJI's official charging-hub compatibility article explicitly lists `Mavic 2 Enterprise Series` for the `Mavic 2 Battery Charging Hub`.

The deterministic Amazon handoffs are `DJI Mavic 2 Enterprise Battery` and `Mavic 2 Battery Charging Hub`. Wave 25 remains exact-canonical-row only and does not create synthetic `Mavic 2 Enterprise`, `Mavic 2 Enterprise Dual`, or other names.

### Wave 26 — Osmo Pocket 3

Wave 26 activates exactly the canonical `Osmo Pocket 3` row. DJI's official Battery Handle product page explicitly lists `Osmo Pocket 3` as compatible, and DJI's official Osmo Pocket 3 support material documents the Battery Handle as a supported accessory. The deterministic Amazon handoff is `DJI Osmo Pocket 3 Battery Handle`.

Wave 26 remains exact-canonical-row only. `DJI Osmo Pocket 3`, `Osmo Pocket 3 Creator Combo`, `DJI Pocket 2`, and other neighboring or synthetic names remain fail-closed; compatibility is not inherited by product-family similarity.

### Wave 27 — DJI Action 2

Wave 27 activates exactly the canonical `DJI Action 2` row. DJI's official Action 2 support page explicitly lists the Power Module as a compatible accessory and documents its built-in 1300 mAh battery, up to 180 minutes of Camera Unit + Power Module operating time, and charging behavior. DJI Store's official Power Module page independently lists `DJI Action 2` as compatible.

The deterministic Amazon handoff is `DJI Action 2 Power Module`. Wave 27 remains exact-canonical-row only. `Action 2`, `DJI Action 2 Power Combo`, `Osmo Action`, and other neighboring or synthetic names remain fail-closed; compatibility is not inherited across the Action family.

### Wave 28 — DJI Pocket 2

Wave 28 activates exactly the canonical `DJI Pocket 2` row. DJI's official Pocket 2 support page states that the product can be used with the DJI Pocket 2 Charging Case for extended operating time, while DJI Store's official Charging Case page explicitly lists `DJI Pocket 2` as compatible and identifies the case as a 1500 mAh charging accessory.

The deterministic Amazon handoff is `DJI Pocket 2 Charging Case`. Wave 28 remains exact-canonical-row only. `Pocket 2`, `DJI Pocket 2 Creator Combo`, `Osmo Pocket`, and other neighboring or synthetic names remain fail-closed; charging-case compatibility is not inherited across the Pocket family.

After DJI Waves 1–28 the maker-level reconciliation is:

`DJI camera 96 = detail 48 + reviewed exclusion 0 + missing 48`

## Non-actionable camera records

Seven camera-category records are maker/index entries without an actionable exact-model Amazon path and are not counted as missing accessory detail:

- Canon: 1
- DJI: 1
- Fujifilm: 1
- GoPro: 1
- Nikon: 1
- OM SYSTEM: 1
- RICOH / PENTAX: 1

## Audit contract

- Accessory detail means at least one compatibility-sensitive accessory offer emitted from an exact reviewed maker/model mapping.
- A generic exact-model Amazon body search does not count as accessory detail.
- Reviewed exclusions must live in `affiliate-camera-detail-exclusions.js` and resolve to a canonical `カメラ・映像` row.
- The exclusion ledger remains empty. Missing records must not be converted to exclusions without an evidence-backed review reason.
- One camera row cannot simultaneously be detail-mapped and excluded.
- Every actionable camera row must reconcile to exactly one of: verified accessory detail, reviewed exclusion, or missing accessory detail.
- Wrong maker/category, nonexistent model, spelling variants, and unreviewed family inference must fail closed.
- `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` remain required machine-readable diagnostics.

## Expansion order

1. Continue DJI from the remaining 48 actionable records in bounded official-evidence waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon remains closed at zero missing.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `123` actionable records remain missing accessory detail.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 and camera accessory target.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 completion mappings.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave28.js` — reviewed DJI camera accessory ledgers.
- `affiliate-dji-camera-accessories-wave22.js` — exact reviewed Phantom 3 Advanced/Professional/Standard battery and charging-hub mappings.
- `affiliate-dji-camera-accessories-wave23.js` — exact reviewed Phantom 3 SE battery-only mapping; charging hub remains intentionally unasserted.
- `affiliate-dji-camera-accessories-wave24.js` — exact reviewed Mavic 2 Enterprise Advanced enterprise-battery-only mapping; charging hub remains intentionally unasserted.
- `affiliate-dji-camera-accessories-wave25.js` — exact reviewed Mavic 2 Enterprise Series battery and charging-hub mappings.
- `affiliate-dji-camera-accessories-wave26.js` — exact reviewed Osmo Pocket 3 Battery Handle mapping.
- `affiliate-dji-camera-accessories-wave27.js` — exact reviewed DJI Action 2 Power Module mapping.
- `affiliate-dji-camera-accessories-wave28.js` — exact reviewed DJI Pocket 2 Charging Case mapping.
- `affiliate-camera-detail-exclusions.js` — reviewed camera exclusions; currently empty.
- `affiliate-runtime.js` — sequential browser loading of Nikon and DJI accessory ledgers before rendering.
- `tests/dji-phantom3-accessory-wave22.test.mjs` — exact Wave 22 Phantom 3 boundary.
- `tests/dji-phantom3-se-accessory-wave23.test.mjs` — exact Wave 23 Phantom 3 SE battery-only boundary.
- `tests/dji-mavic2-enterprise-advanced-wave24.test.mjs` — exact Wave 24 Mavic 2 Enterprise Advanced battery-only boundary.
- `tests/dji-mavic2-enterprise-series-wave25.test.mjs` — exact Wave 25 Mavic 2 Enterprise Series battery/hub boundary.
- `tests/dji-osmo-pocket3-accessory-wave26.test.mjs` — exact Wave 26 Osmo Pocket 3 Battery Handle boundary.
- `tests/dji-action2-accessory-wave27.test.mjs` — exact Wave 27 DJI Action 2 Power Module boundary.
- `tests/dji-pocket2-accessory-wave28.test.mjs` — exact Wave 28 DJI Pocket 2 Charging Case boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera reconciliation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard and implementation-evidence synchronization.
