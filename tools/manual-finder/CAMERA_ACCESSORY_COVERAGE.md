# ManualFinder Camera Accessory Coverage

Updated: 2026-09-18

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` rather than being duplicated as prose.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **48** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **137** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 48 + reviewed exclusion 0 + missing 137`

The active detail ledger contains all fourteen actionable Nikon records and thirty-four reviewed DJI records. Missing rows remain explicit rather than being converted to guessed accessory mappings or unsupported exclusions.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 34 | 0 | 62 |
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

DJI coverage advances only through bounded exact-canonical-row waves backed by DJI official evidence. Current active waves are:

| Wave | Canonical row(s) | Reviewed power handoff |
| ---: | --- | --- |
| 1 | `Osmo Action 3`, `Osmo Action 4`, `Osmo Action 5 Pro`, `Osmo Action 6` | Extreme Battery Plus / Multifunctional Battery Case 2 |
| 2 | `DJI Air 3`, `DJI Air 3S` | Air 3 Intelligent Flight Battery / Air 3 Series Battery Charging Hub |
| 3 | `DJI Mini 3`, `DJI Mini 3 Pro`, `DJI Mini 4 Pro` | reviewed Mini 3/Mini 4 battery boundary / shared Two-Way Charging Hub |
| 4 | `DJI Mavic 3`, `DJI Mavic 3 Classic`, `DJI Mavic 3 Pro` | Mavic 3 Series Intelligent Flight Battery / Battery Charging Hub |
| 5 | `DJI Air 2S`, `Mavic Air 2` | Mavic Air 2 Intelligent Flight Battery / Battery Charging Hub |
| 6 | `DJI Avata 2`, `DJI Flip`, `DJI Neo` | individually reviewed model-specific battery/hub pairs |
| 7 | `DJI Mini 2`, `DJI Mini 4K | DJI Mini 2 SE`, `DJI Mini SE` | Mini 2 Intelligent Flight Battery / Two-Way Charging Hub |
| 8 | `DJI FPV` | FPV Intelligent Flight Battery / AC Power Adapter |
| 9 | `DJI Avata` | Avata Intelligent Flight Battery / Battery Charging Hub |
| 10 | `Mavic 2` | Mavic 2 Intelligent Flight Battery / Battery Charging Hub |
| 11 | `Mavic Mini` | Mavic Mini Intelligent Flight Battery / Two-Way Charging Hub |
| 12 | `Mavic Air` | Mavic Air Intelligent Flight Battery / Battery Charging Hub |
| 13 | `Mavic Pro` | Mavic Pro Intelligent Flight Battery / Battery Charging Hub |
| 14 | `Mavic Pro Platinum` | Mavic Pro Platinum Intelligent Flight Battery / Mavic Pro Battery Charging Hub |
| 15 | `DJI Mavic 3 Enterprise`, `DJI Mavic 3M` | Mavic 3 Series Intelligent Flight Battery / Mavic 3 Battery Charging Hub 100W |
| 16 | `DJI Inspire 3` | TB51 Intelligent Battery / TB51 Intelligent Battery Charging Hub |
| 17 | `Inspire 2` | TB50 Intelligent Battery / Inspire 2 Battery Charging Hub |
| 18 | `Inspire 1` | TB47 Intelligent Flight Battery / Inspire 1 Battery Charging Hub |
| 19 | `Inspire 1 Pro/Raw` | TB47 Intelligent Flight Battery / Inspire 1 Battery Charging Hub |
| 20 | `Spark` | Spark Intelligent Flight Battery / Spark Battery Charging Hub |

### Wave 20 — Spark

Wave 20 activates exactly the canonical `Spark` row.

- `DJI Spark Intelligent Flight Battery` — DJI's official older-product accessory purchase guide explicitly maps `Spark` to `Spark Intelligent Flight Battery`.
- `DJI Spark Battery Charging Hub` — DJI's official Spark Download Center publishes the `Spark Battery Charging Hub User Guide` under the Spark product.

The reviewed sources are:

- `https://www.dji.com/downloads/products/spark`
- `https://repair.dji.com/help/content?customId=01700009975&lang=en&paperDocType=ARTICLE&re=US&spaceId=17`

Wave 20 remains exact-canonical-row only. It does not activate `DJI Spark`, `Spark 2`, or any other similarly named record.

After DJI Waves 1–20 the maker-level reconciliation is:

`DJI camera 96 = detail 34 + reviewed exclusion 0 + missing 62`

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

The measured remaining backlog determines work order:

1. Continue DJI from the remaining 62 actionable records in bounded official-evidence waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon remains closed at zero missing.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `137` actionable records remain missing accessory detail.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 and camera accessory target.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 completion mappings.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave20.js` — reviewed DJI camera accessory ledgers.
- `affiliate-dji-camera-accessories-wave20.js` — exact reviewed Spark battery and charging-hub mapping.
- `affiliate-camera-detail-exclusions.js` — reviewed camera exclusions; currently empty.
- `affiliate-runtime.js` — sequential browser loading of Nikon and DJI accessory ledgers before rendering.
- `tests/dji-spark-accessory-wave20.test.mjs` — exact Wave 20 Spark compatibility boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera reconciliation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard and implementation-evidence synchronization.
