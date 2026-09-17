# ManualFinder Camera Accessory Coverage

Updated: 2026-09-17

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **45** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **140** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 45 + reviewed exclusion 0 + missing 140`

The current detail ledger contains all 14 actionable Nikon records plus thirty-one reviewed DJI records across Osmo Action Wave 1, Air Wave 2, Mini Wave 3, Mavic 3 Wave 4, Air 2S/Mavic Air 2 Wave 5, compact power Wave 6, Mini 2 Wave 7, FPV Wave 8, Avata Wave 9, Mavic 2 Wave 10, Mavic Mini Wave 11, Mavic Air Wave 12, Mavic Pro Wave 13, Mavic Pro Platinum Wave 14, Mavic 3 Enterprise/Mavic 3M Wave 15, Inspire 3 Wave 16, and Inspire 2 Wave 17.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 31 | 0 | 65 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 14 | 0 | 0 |
| Insta360 | 7 | 0 | 0 | 7 |

The exact missing model arrays are emitted by `tests/camera-accessory-coverage.test.mjs` as `MANUALFINDER_CAMERA_ACCESSORY_COVERAGE`. They are intentionally not duplicated here as a 140-model prose ledger.

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

## DJI Mavic 3 — Wave 4

Three current consumer Mavic 3 records have reviewed DJI power-accessory detail mappings:

- `DJI Mavic 3`
- `DJI Mavic 3 Classic`
- `DJI Mavic 3 Pro`

DJI official Store compatibility information explicitly supports both reviewed handoffs for all three models:

- `DJI Mavic 3 Series Intelligent Flight Battery` — battery search handoff.
- `DJI Mavic 3 Series Battery Charging Hub` — charging-hub search handoff.

The Wave 4 contract is exact-model only. `DJI Mavic 3 Enterprise`, `DJI Mavic 3M`, `DJI Mavic 3 Cine`, `Mavic 2`, and other Mavic records are not inferred into this compatibility set.

## DJI Air 2S / Mavic Air 2 — Wave 5

Two current records have reviewed DJI power-accessory detail mappings:

- `DJI Air 2S`
- `Mavic Air 2`

DJI official Store compatibility information explicitly supports both reviewed handoffs for both models:

- `Mavic Air 2 Intelligent Flight Battery` — battery search handoff.
- `Mavic Air 2 Battery Charging Hub` — charging-hub search handoff.

The Wave 5 contract is exact-model only. `Mavic Air`, `DJI Air 3`, `DJI Air 3S`, `DJI Mini 2`, and other Air/Mavic records are not inferred into this compatibility set.

## DJI compact power — Wave 6

Three current DJI records have individually reviewed power-accessory mappings:

- `DJI Avata 2` → `DJI Avata 2 Intelligent Flight Battery` / `DJI Avata 2 Two-Way Charging Hub`.
- `DJI Flip` → `DJI Flip Intelligent Flight Battery` / `DJI Flip Parallel Charging Hub`.
- `DJI Neo` → `DJI Neo Intelligent Flight Battery` / `DJI Neo Two-Way Charging Hub`.

Each row is backed by its own DJI official Store battery and charging-hub compatibility pages. Wave 6 does not infer cross-model compatibility among Avata 2, Flip, and Neo and does not extend to `DJI Avata`, future similarly named models, or any other DJI record.

## DJI Mini 2 family — Wave 7

Three canonical rows have reviewed DJI power-accessory detail mappings:

- `DJI Mini 2`
- `DJI Mini 4K | DJI Mini 2 SE`
- `DJI Mini SE`

DJI official Store compatibility information explicitly lists DJI Mini 4K, DJI Mini 2 SE, DJI Mini 2, and DJI Mini SE for both reviewed accessories:

- `DJI Mini 2 Intelligent Flight Battery` — battery search handoff.
- `DJI Mini 2 Two-Way Charging Hub` — charging-hub search handoff.

The compound canonical row `DJI Mini 4K | DJI Mini 2 SE` is accepted because the official compatibility list names both constituent models. Wave 7 remains exact-canonical-row only and does not infer compatibility to `Mavic Mini` or other Mini-family records.

## DJI FPV — Wave 8

The canonical `DJI FPV` record has two reviewed DJI power-accessory handoffs:

- `DJI FPV Intelligent Flight Battery` — the official DJI battery page identifies it as compatible with DJI FPV.
- `DJI FPV AC Power Adapter` — the official DJI adapter page identifies it as compatible with DJI FPV and explicitly states that it charges the DJI FPV Intelligent Flight Battery.

Wave 8 uses the AC Power Adapter itself as the charger handoff rather than inferring a separate charging-hub retail mapping. `DJI Digital FPV System`, `DJI Avata`, and other FPV-related names remain fail-closed.

## DJI Avata — Wave 9

The canonical `DJI Avata` record has two reviewed DJI power-accessory handoffs:

- `DJI Avata Intelligent Flight Battery` — battery search handoff.
- `DJI Avata Battery Charging Hub` — charging-hub search handoff.

The DJI official `DJI Avata Fly More Kit` page explicitly identifies the kit as compatible with DJI Avata and lists two DJI Avata Intelligent Flight Batteries plus one DJI Avata Battery Charging Hub in the box. Wave 9 therefore uses one exact-model official source for both handoffs. `DJI Avata 2` remains separately reviewed in Wave 6; Wave 9 evidence is not reused for it.

## DJI Mavic 2 — Wave 10

The canonical `Mavic 2` record has two reviewed DJI power-accessory handoffs:

- `Mavic 2 Intelligent Flight Battery` — DJI Store explicitly marks the battery as compatible with Mavic 2.
- `Mavic 2 Battery Charging Hub` — the official DJI Mavic 2 support page describes the hub's charging logic and its use with Mavic 2 Intelligent Flight Batteries.

Wave 10 remains exact-canonical-row only. `Mavic 2 Enterprise Advanced`, `Mavic 2 Enterprise Series`, `Mavic 2 Pro`, `Mavic 2 Zoom`, and other Mavic records are not inferred into this mapping; enterprise variants require their own review.

## DJI Mavic Mini — Wave 11

The canonical `Mavic Mini` record has two reviewed DJI power-accessory handoffs:

- `Mavic Mini Intelligent Flight Battery` — DJI Store explicitly marks the battery as compatible with Mavic Mini.
- `Mavic Mini Two-Way Charging Hub` — DJI's official charging-hub compatibility table maps the Mavic Mini hub to the Mavic Mini Intelligent Flight Battery.

Wave 11 remains exact-canonical-row only. It does not reuse the DJI Mini 2 Wave 7 evidence and does not infer compatibility to `Mavic Pro`, `Mavic Pro Platinum`, `Mavic Air`, or other Mavic-family records.

## DJI Mavic Air — Wave 12

The canonical `Mavic Air` record has two reviewed DJI power-accessory handoffs:

- `Mavic Air Intelligent Flight Battery` — DJI's official battery policy identifies the Mavic Air Intelligent Flight Battery and its exact battery characteristics.
- `Mavic Air Battery Charging Hub` — DJI's official charging-hub compatibility table maps the Mavic Air hub to the Mavic Air Intelligent Flight Battery.

Wave 12 remains exact-canonical-row only. `Mavic Air 2` retains its separately reviewed Wave 5 mapping, and Wave 12 evidence is not extended to `Mavic Pro`, `Mavic Pro Platinum`, or other Mavic-family records.

## DJI Mavic Pro — Wave 13

The canonical `Mavic Pro` record has two reviewed DJI power-accessory handoffs:

- `Mavic Pro Intelligent Flight Battery` — DJI's official battery policy identifies the Mavic Pro Intelligent Flight Battery and its exact battery characteristics.
- `Mavic Pro Battery Charging Hub` — DJI's official charging-hub compatibility table maps the Mavic Pro hub to the Mavic Pro Intelligent Flight Battery.

DJI separately states that the Mavic Pro Battery Charging Hub also supports `Mavic Pro Platinum`, but Wave 13 does not extend the battery mapping to Platinum without an equally explicit reviewed battery boundary. `Mavic Pro Platinum` therefore remains missing rather than being inferred.

## DJI Mavic Pro Platinum — Wave 14

The canonical `Mavic Pro Platinum` record has two reviewed DJI power-accessory handoffs:

- `Mavic Pro Platinum Intelligent Flight Battery` — DJI's official Mavic Pro Platinum support page identifies the model's Intelligent Flight Battery and states that the Platinum battery can also be used with Mavic Pro.
- `Mavic Pro Battery Charging Hub` — DJI's official charging-hub compatibility guidance explicitly lists Mavic Pro Platinum together with Mavic Pro.

Wave 14 remains exact-canonical-row only. It does not replace or broaden the existing Wave 13 `Mavic Pro` battery mapping and does not infer compatibility to `Mavic 2`, `Mavic Air`, or other Mavic-family records.

## DJI Mavic 3 Enterprise / Mavic 3M — Wave 15

Two canonical enterprise Mavic 3 rows have reviewed DJI power-accessory handoffs:

- `DJI Mavic 3 Enterprise`
- `DJI Mavic 3M`

DJI's official Mavic 3 Enterprise specifications identify the `DJI Mavic 3 Series Intelligent Flight Battery`, while the Enterprise support page identifies the `DJI Mavic 3 Battery Charging Hub (100W)` as the charging hub for the Enterprise Series. DJI's official Mavic 3M support page states that Mavic 3M batteries are compatible with DJI Mavic 3 Series and Mavic 3 Enterprise Series aircraft and explicitly identifies the Mavic 3M charging hub / DJI Mavic 3 Charging Hub (100 W).

Wave 15 therefore exposes:

- `DJI Mavic 3 Series Intelligent Flight Battery` — battery search handoff.
- `DJI Mavic 3 Battery Charging Hub 100W` — charging-hub search handoff.

Wave 15 remains exact-canonical-row only. It does not infer support to `DJI Mavic 3T`, a generic `DJI Mavic 3 Enterprise Series` row, or other non-canonical names, and it does not replace the separately reviewed consumer Wave 4 mappings.

## DJI Inspire 3 — Wave 16

The canonical `DJI Inspire 3` record has two reviewed DJI power-accessory handoffs:

- `DJI TB51 Intelligent Battery` — DJI's official Inspire 3 specifications identify the aircraft battery as the TB51 Intelligent Battery.
- `DJI TB51 Intelligent Battery Charging Hub` — DJI Store explicitly marks the charging hub as compatible with DJI Inspire 3.

Wave 16 remains exact-canonical-row only. It does not infer the TB51 mapping to `Inspire 1`, `Inspire 1 Pro/Raw`, `Inspire 2`, or a non-canonical `Inspire 3` name, and it does not reuse earlier Inspire-family battery assumptions.

## DJI Inspire 2 — Wave 17

The canonical `Inspire 2` record has two reviewed DJI power-accessory handoffs:

- `DJI TB50 Intelligent Battery` — DJI Store explicitly lists the TB50 Intelligent Battery as compatible with Inspire 2.
- `DJI Inspire 2 Battery Charging Hub` — DJI Store provides the Inspire 2 charging-hub product for the reviewed battery workflow.

Wave 17 remains exact-canonical-row only. It does not infer this mapping to `DJI Inspire 2`, `Inspire 1`, `Inspire 1 Pro/Raw`, or any other Inspire-family canonical record. `DJI Inspire 3` retains its independent TB51 Wave 16 mapping.

After DJI Waves 1–17 the maker-level reconciliation is:

`DJI camera 96 = detail 31 + reviewed exclusion 0 + missing 65`

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

1. Continue DJI from the remaining 65 actionable records in bounded product-family waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon is closed at zero missing. A later wave may alter the remaining order only when evidence quality or product-family structure makes another bounded batch materially safer to close first.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `140` actionable records remain missing accessory detail. Counts may change when the canonical catalog changes, but the reconciliation invariant and zero-unreviewed-missing completion target do not change.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1 reviewed active accessory mappings.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 mappings that close the remaining ten actionable Nikon records.
- `affiliate-dji-camera-accessories-wave1.js` — DJI Osmo Action Wave 1 mappings for four reviewed models.
- `affiliate-dji-camera-accessories-wave2.js` — DJI Air Wave 2 mappings for `DJI Air 3` and `DJI Air 3S`.
- `affiliate-dji-camera-accessories-wave3.js` — DJI Mini Wave 3 mappings for `DJI Mini 3`, `DJI Mini 3 Pro`, and `DJI Mini 4 Pro`.
- `affiliate-dji-camera-accessories-wave4.js` — DJI Mavic 3 Wave 4 mappings for `DJI Mavic 3`, `DJI Mavic 3 Classic`, and `DJI Mavic 3 Pro`.
- `affiliate-dji-camera-accessories-wave5.js` — DJI Air 2S/Mavic Air 2 Wave 5 mappings for `DJI Air 2S` and `Mavic Air 2`.
- `affiliate-dji-camera-accessories-wave6.js` — exact reviewed power mappings for `DJI Avata 2`, `DJI Flip`, and `DJI Neo`.
- `affiliate-dji-camera-accessories-wave7.js` — reviewed shared Mini 2 power mappings for `DJI Mini 2`, `DJI Mini 4K | DJI Mini 2 SE`, and `DJI Mini SE`.
- `affiliate-dji-camera-accessories-wave8.js` — exact reviewed DJI FPV battery and AC power-adapter mapping.
- `affiliate-dji-camera-accessories-wave9.js` — exact reviewed DJI Avata battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave10.js` — exact reviewed Mavic 2 battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave11.js` — exact reviewed Mavic Mini battery and two-way charging-hub mapping.
- `affiliate-dji-camera-accessories-wave12.js` — exact reviewed Mavic Air battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave13.js` — exact reviewed Mavic Pro battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave14.js` — exact reviewed Mavic Pro Platinum battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave15.js` — exact reviewed DJI Mavic 3 Enterprise and DJI Mavic 3M battery and 100W charging-hub mappings.
- `affiliate-dji-camera-accessories-wave16.js` — exact reviewed DJI Inspire 3 TB51 battery and charging-hub mapping.
- `affiliate-dji-camera-accessories-wave17.js` — exact reviewed Inspire 2 TB50 battery and charging-hub mapping.
- `affiliate-camera-detail-exclusions.js` — reviewed explicit exclusions; currently empty.
- `tests/nikon-camera-accessory-wave1.test.mjs` — Nikon Wave 1 compatibility boundary.
- `tests/nikon-camera-accessory-wave2.test.mjs` — Nikon Wave 2 compatibility boundary and fourteen-record Nikon completion.
- `tests/dji-osmo-action-accessory-wave1.test.mjs` — exact DJI Osmo Action Wave 1 compatibility boundary.
- `tests/dji-air-accessory-wave2.test.mjs` — exact DJI Air Wave 2 compatibility boundary.
- `tests/dji-mini-accessory-wave3.test.mjs` — exact DJI Mini Wave 3 compatibility boundary.
- `tests/dji-mavic3-accessory-wave4.test.mjs` — exact DJI Mavic 3 Wave 4 compatibility boundary.
- `tests/dji-air2-accessory-wave5.test.mjs` — exact DJI Air 2S/Mavic Air 2 Wave 5 compatibility boundary.
- `tests/dji-compact-power-wave6.test.mjs` — exact DJI Avata 2 / Flip / Neo Wave 6 compatibility boundary.
- `tests/dji-mini2-accessory-wave7.test.mjs` — exact canonical DJI Mini 2-family Wave 7 boundary.
- `tests/dji-fpv-accessory-wave8.test.mjs` — exact DJI FPV Wave 8 compatibility boundary.
- `tests/dji-avata-accessory-wave9.test.mjs` — exact DJI Avata Wave 9 compatibility boundary.
- `tests/dji-mavic2-accessory-wave10.test.mjs` — exact canonical Mavic 2 Wave 10 compatibility boundary.
- `tests/dji-mavic-mini-accessory-wave11.test.mjs` — exact canonical Mavic Mini Wave 11 compatibility boundary.
- `tests/dji-mavic-air-accessory-wave12.test.mjs` — exact canonical Mavic Air Wave 12 compatibility boundary.
- `tests/dji-mavic-pro-accessory-wave13.test.mjs` — exact canonical Mavic Pro Wave 13 compatibility boundary.
- `tests/dji-mavic-pro-platinum-accessory-wave14.test.mjs` — exact canonical Mavic Pro Platinum Wave 14 compatibility boundary.
- `tests/dji-mavic3-enterprise-accessory-wave15.test.mjs` — exact DJI Mavic 3 Enterprise / DJI Mavic 3M Wave 15 compatibility boundary.
- `tests/dji-inspire3-accessory-wave16.test.mjs` — exact DJI Inspire 3 Wave 16 compatibility boundary.
- `tests/dji-inspire2-accessory-wave17.test.mjs` — exact Inspire 2 Wave 17 compatibility boundary.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera coverage computation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard for this audited baseline.