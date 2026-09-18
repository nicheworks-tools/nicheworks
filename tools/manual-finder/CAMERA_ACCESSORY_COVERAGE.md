# ManualFinder Camera Accessory Coverage

Updated: 2026-09-18

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` rather than being duplicated as prose.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **83** |
| Reviewed camera-detail exclusions | **15** |
| Actionable camera records still missing accessory detail | **87** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 83 + reviewed exclusion 15 + missing 87`

The active detail ledger contains all fourteen actionable Nikon records and sixty-nine reviewed DJI records. Fifteen DJI rows are now evidence-backed reviewed exclusions because their official power input is a built-in or nonremovable battery/grip and no model-specific replaceable power accessory was established at the audit standard. Missing rows remain explicit rather than being converted to guessed mappings or unsupported exclusions.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 69 | 15 | 12 |
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

DJI coverage advances only through bounded exact-canonical-row waves backed by DJI official evidence. Waves 1–38 remain frozen in their reviewed mapping/exclusion boundaries.

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

The deterministic Amazon handoff is `DJI Pocket 2 Charging Case`. Wave 28 remains exact-canonical-row only. `Pocket 2`, `DJI Pocket 2 Creator Combo`, and other neighboring or synthetic names remain fail-closed; `Osmo Pocket` required separate review and is handled by Wave 29.

### Wave 29 — Osmo Pocket

Wave 29 activates exactly the canonical `Osmo Pocket` row. DJI's official Osmo Pocket product information publishes the Osmo Pocket Charging Case User Guide, and DJI's official Pocket 2 compatibility guidance explicitly states that the Osmo Pocket Charging Case is only compatible with `Osmo Pocket`.

The deterministic Amazon handoff is `DJI Osmo Pocket Charging Case`. Wave 29 remains exact-canonical-row only. `DJI Osmo Pocket`, `Osmo Pocket Charging Case`, `DJI Pocket 2`, and other neighboring or synthetic names remain fail-closed.

### Wave 30 — Osmo 360

Wave 30 activates exactly the canonical `Osmo 360` row. DJI's official Osmo 360 FAQ states that Osmo Action Extreme Battery Plus (1950 mAh) and Osmo Action Extreme Battery (1770 mAh) are supported. DJI Store independently lists `Osmo 360` as compatible with `Osmo Action Extreme Battery Plus (1950 mAh)` and with `Osmo Action Multifunctional Battery Case 2`.

The deterministic Amazon handoffs are `DJI Osmo Action Extreme Battery Plus` and `DJI Osmo Action Multifunctional Battery Case 2`. Wave 30 remains exact-canonical-row only. `DJI Osmo 360`, `Osmo 360 II`, `Osmo 360 Adventure Combo`, and other neighboring or synthetic names remain fail-closed.

### Wave 31 — DJI Goggles 2

Wave 31 activates exactly the canonical `DJI Goggles 2` row. DJI's official Goggles 2 support page specifies `DJI Goggles 2 Battery` as the goggles' power input and documents the battery as 1800 mAh / 18 Wh with approximately two hours of operating time. DJI Store independently lists `DJI Goggles 2` in the battery's compatibility section.

The deterministic Amazon handoff is `DJI Goggles 2 Battery`. Wave 31 remains exact-canonical-row only. `Goggles 2` and other non-canonical spellings remain fail-closed; power compatibility is not inherited across the Goggles family. `DJI Goggles 3`, `DJI Goggles Integra`, and `DJI Goggles N3` required separate review and are handled by Wave 32.

### Wave 32 — integrated-battery Goggles exclusions

Wave 32 reviews exactly three canonical rows: `DJI Goggles 3`, `DJI Goggles Integra`, and `DJI Goggles N3`. DJI's official support/specification pages identify the power input for all three as a built-in battery. The same official pages document USB-C charging or the built-in battery specification rather than a model-specific replaceable battery/charging accessory.

These three rows therefore receive the reviewed exclusion reason `built_in_battery_no_model_specific_replaceable_power_accessory`. No Amazon accessory-detail handoff is emitted, and the exclusion does not generalize to `DJI Goggles`, `DJI Goggles RE`, or any other Goggles-family row.

### Wave 33 — DJI RS BG30 Battery Grip

Wave 33 activates exactly six canonical rows: `DJI RS 2`, `DJI RS 3`, `DJI RS 3 Pro`, `DJI RS 4`, `DJI RS 4 Pro`, and `DJI RS 5`. DJI Store's official `DJI RS BG30 Battery Grip` page explicitly lists all six in Compatibility and documents the quick-release battery grip as independently chargeable.

The deterministic Amazon handoff is `DJI RS BG30 Battery Grip` for each of the six reviewed rows. `DJI RS 3 Mini`, `DJI RS 4 Mini`, and `DJI RSC 2` required separate review and are handled by Wave 34.

### Wave 34 — nonremovable RS/RSC power exclusions

Wave 34 reviews exactly `DJI RS 3 Mini`, `DJI RS 4 Mini`, and `DJI RSC 2`. DJI's official Ronin grip purchase guidance states that the grips of all three products are not removable and cannot be purchased separately. The RS 3 Mini, RS 4 Mini, and RSC 2 product specifications independently document their internal battery models, capacities, USB-C charging, and runtime.

These rows therefore receive the reviewed exclusion reason `built_in_battery_no_model_specific_replaceable_power_accessory`. No generic charger handoff is emitted. `DJI Ronin-SC` and `Ronin-S` required their own separately purchasable grip review and are handled by Wave 35.

### Wave 35 — Ronin-SC / Ronin-S battery grips

Wave 35 activates exactly `DJI Ronin-SC` and `Ronin-S`. DJI Store's official `Ronin-SC BG18 Grip` page explicitly lists Ronin-SC compatibility and identifies its built-in 2450 mAh battery. DJI Store's official `Ronin-S BG37 Grip` page explicitly lists Ronin-S compatibility and identifies its built-in 2400 mAh battery.

The deterministic Amazon handoffs are `DJI Ronin-SC BG18 Grip` and `DJI Ronin-S BG37 Grip`. `Ronin-SC`, `DJI Ronin-S`, `Ronin 2`, `Ronin-M`, and neighboring names remain fail-closed unless separately reviewed.

### Wave 36 — Osmo Mobile built-in battery exclusions

Wave 36 reviews exactly nine canonical rows: `DJI OM 4`, `DJI OM 4 SE`, `DJI OM 5`, `Osmo Mobile 2`, `Osmo Mobile 3`, `Osmo Mobile 6`, `Osmo Mobile 7 Series`, `Osmo Mobile 8`, and `Osmo Mobile SE`. DJI's official support/FAQ pages explicitly state that each reviewed battery is built in or cannot be replaced/swapped out and document direct USB charging.

These rows therefore receive the reviewed exclusion reason `built_in_battery_no_model_specific_replaceable_power_accessory`. No generic USB charger handoff is emitted. The original `Osmo Mobile` is intentionally not included because DJI documents a replaceable Intelligent Battery and compatibility with the Osmo High Capacity Battery / External Battery Extender; it is handled separately by Wave 37.

### Wave 37 — legacy Osmo replaceable batteries

Wave 37 activates exactly four canonical rows: `Osmo`, `Osmo Mobile`, `Osmo+`, and `Osmo Pro and Raw`. DJI's official Osmo support page identifies the HB01-522365 980 mAh Intelligent Battery, and the Osmo Mobile support page explicitly states that it uses the same 980 mAh battery as the original Osmo. DJI's official Osmo+ and Osmo Pro/RAW product information identifies the higher-capacity HB02-542465 1225 mAh Intelligent Battery.

The deterministic Amazon handoffs are `DJI Osmo Intelligent Battery 980mAh` for `Osmo` and `Osmo Mobile`, and `DJI Osmo High Capacity Intelligent Battery 1225mAh` for `Osmo+` and `Osmo Pro and Raw`. Synthetic splits such as `Osmo Pro`, `Osmo RAW`, `DJI Osmo`, and `Osmo Plus` remain fail-closed.

### Wave 38 — legacy Ronin replaceable batteries

Wave 38 activates exactly four canonical rows: `Ronin 2`, `Ronin-M`, `Ronin-MX`, and `Ronin`. DJI's official Ronin 2 support page states that Ronin 2 uses the same batteries as Inspire 2, while DJI Store explicitly lists `Ronin 2` as compatible with the TB50 Intelligent Battery. DJI's official Ronin-M and Ronin 1 Series materials document the model-specific Ronin-M battery and explicitly state that Ronin-MX uses the same 1580 mAh battery as Ronin-M. The original Ronin support material documents its removable 4S smart batteries.

The deterministic Amazon handoffs are `DJI TB50 Intelligent Battery` for `Ronin 2`, `DJI Ronin-M Battery 1580mAh` for `Ronin-M` and `Ronin-MX`, and `DJI Ronin Battery 3400mAh` for `Ronin`. Spelling variants such as `DJI Ronin 2`, `Ronin M`, and `Ronin MX` remain fail-closed.

### Wave 39 — DJI Ronin 4D and original Osmo Action

Wave 39 activates exactly two canonical rows: `DJI Ronin 4D` and `Osmo Action`. DJI's official Ronin 4D support page identifies the TB50 Intelligent Battery, and DJI Store explicitly lists `DJI Ronin 4D` as compatible with both the TB50 Intelligent Battery and the Inspire 2/Ronin 2 Battery Charging Hub. DJI's official original Osmo Action specifications identify its 1300 mAh removable battery, while the official Download Center publishes the `Osmo Action Charging Hub User Guide`.

The deterministic Amazon handoffs are `DJI TB50 Intelligent Battery` plus `DJI Inspire 2 Ronin 2 Battery Charging Hub` for `DJI Ronin 4D`, and `DJI Osmo Action Battery 1300mAh` plus `DJI Osmo Action Charging Hub` for `Osmo Action`. `Ronin 4D`, `DJI Ronin 4D-8K`, `DJI Osmo Action`, and `Osmo Action 2` remain fail-closed.

After DJI Waves 1–39 the maker-level reconciliation is:

`DJI camera 96 = detail 69 + reviewed exclusion 15 + missing 12`

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
- The exclusion ledger contains three Wave 32 Goggles rows, three Wave 34 nonremovable RS/RSC rows, and nine Wave 36 Osmo Mobile built-in-battery rows. Missing records must not be converted to exclusions without an evidence-backed review reason.
- One camera row cannot simultaneously be detail-mapped and excluded.
- Every actionable camera row must reconcile to exactly one of: verified accessory detail, reviewed exclusion, or missing accessory detail.
- Wrong maker/category, nonexistent model, spelling variants, and unreviewed family inference must fail closed.
- `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` remain required machine-readable diagnostics.

## Expansion order

1. Continue DJI from the remaining 12 actionable records in bounded official-evidence waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon remains closed at zero missing.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `87` actionable records remain missing accessory detail.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 and camera accessory target.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 completion mappings.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave39.js` — reviewed DJI camera accessory ledgers.
- `affiliate-dji-camera-accessories-wave22.js` — exact reviewed Phantom 3 Advanced/Professional/Standard battery and charging-hub mappings.
- `affiliate-dji-camera-accessories-wave23.js` — exact reviewed Phantom 3 SE battery-only mapping; charging hub remains intentionally unasserted.
- `affiliate-dji-camera-accessories-wave24.js` — exact reviewed Mavic 2 Enterprise Advanced enterprise-battery-only mapping; charging hub remains intentionally unasserted.
- `affiliate-dji-camera-accessories-wave25.js` — exact reviewed Mavic 2 Enterprise Series battery and charging-hub mappings.
- `affiliate-dji-camera-accessories-wave26.js` — exact reviewed Osmo Pocket 3 Battery Handle mapping.
- `affiliate-dji-camera-accessories-wave27.js` — exact reviewed DJI Action 2 Power Module mapping.
- `affiliate-dji-camera-accessories-wave28.js` — exact reviewed DJI Pocket 2 Charging Case mapping.
- `affiliate-dji-camera-accessories-wave29.js` — exact reviewed Osmo Pocket Charging Case mapping.
- `affiliate-dji-camera-accessories-wave30.js` — exact reviewed Osmo 360 battery and multifunctional battery-case mappings.
- `affiliate-dji-camera-accessories-wave31.js` — exact reviewed DJI Goggles 2 Battery mapping.
- `affiliate-dji-camera-accessories-wave33.js` — exact six-row DJI RS BG30 Battery Grip mapping.
- `affiliate-dji-camera-accessories-wave35.js` — exact DJI Ronin-SC BG18 and Ronin-S BG37 grip mappings.
- `affiliate-dji-camera-accessories-wave37.js` — exact four-row legacy Osmo replaceable-battery mappings.
- `affiliate-dji-camera-accessories-wave38.js` — exact four-row legacy Ronin replaceable-battery mappings.
- `affiliate-dji-camera-accessories-wave39.js` — exact DJI Ronin 4D TB50/hub and original Osmo Action battery/hub mappings.
- `affiliate-camera-detail-exclusions.js` — fifteen reviewed DJI exclusions across Waves 32, 34, and 36.
- `affiliate-runtime.js` — sequential browser loading of Nikon and DJI accessory ledgers before rendering.
- `tests/dji-phantom3-accessory-wave22.test.mjs` — exact Wave 22 Phantom 3 boundary.
- `tests/dji-phantom3-se-accessory-wave23.test.mjs` — exact Wave 23 Phantom 3 SE battery-only boundary.
- `tests/dji-mavic2-enterprise-advanced-wave24.test.mjs` — exact Wave 24 Mavic 2 Enterprise Advanced battery-only boundary.
- `tests/dji-mavic2-enterprise-series-wave25.test.mjs` — exact Wave 25 Mavic 2 Enterprise Series battery/hub boundary.
- `tests/dji-osmo-pocket3-accessory-wave26.test.mjs` — exact Wave 26 Osmo Pocket 3 Battery Handle boundary.
- `tests/dji-action2-accessory-wave27.test.mjs` — exact Wave 27 DJI Action 2 Power Module boundary.
- `tests/dji-pocket2-accessory-wave28.test.mjs` — exact Wave 28 DJI Pocket 2 Charging Case boundary.
- `tests/dji-osmo-pocket-accessory-wave29.test.mjs` — exact Wave 29 Osmo Pocket Charging Case boundary.
- `tests/dji-osmo360-accessory-wave30.test.mjs` — exact Wave 30 Osmo 360 battery and battery-case boundary.
- `tests/dji-goggles2-accessory-wave31.test.mjs` — exact Wave 31 DJI Goggles 2 Battery boundary.
- `tests/dji-goggles-integrated-battery-exclusions-wave32.test.mjs` — exact Wave 32 built-in-battery Goggles exclusion boundary.
- `tests/dji-rs-bg30-accessory-wave33.test.mjs` — exact Wave 33 six-row DJI RS BG30 Battery Grip boundary.
- `tests/dji-rs-integrated-battery-exclusions-wave34.test.mjs` — exact Wave 34 three-row nonremovable RS/RSC exclusion boundary.
- `tests/dji-ronin-grip-accessory-wave35.test.mjs` — exact Wave 35 Ronin-SC/Ronin-S grip boundary.
- `tests/dji-osmo-mobile-battery-exclusions-wave36.test.mjs` — exact Wave 36 nine-row Osmo Mobile built-in-battery exclusion boundary.
- `tests/dji-osmo-legacy-battery-wave37.test.mjs` — exact Wave 37 four-row legacy Osmo replaceable-battery boundary.
- `tests/dji-ronin-legacy-battery-wave38.test.mjs` — exact Wave 38 four-row legacy Ronin replaceable-battery boundary.
- `tests/dji-ronin4d-osmo-action-wave39.test.mjs` — exact Wave 39 two-row Ronin 4D / Osmo Action boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera reconciliation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard and implementation-evidence synchronization.
