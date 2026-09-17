# ManualFinder Camera Accessory Coverage

Updated: 2026-09-17

This document is the audited baseline for compatibility-sensitive camera battery/charger Amazon handoffs. It is separate from the completed printer-detail audit. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` rather than being duplicated as prose.

## Current baseline

| Metric | Audited value |
| --- | ---: |
| Canonical `カメラ・映像` records | **192** |
| Camera records with a basic Amazon path | **185** |
| Camera records with verified accessory detail | **47** |
| Reviewed camera-detail exclusions | **0** |
| Actionable camera records still missing accessory detail | **138** |
| Non-actionable camera maker-index records | **7** |

Required reconciliation:

`camera basic 185 = detail 47 + reviewed exclusion 0 + missing 138`

The current detail ledger contains all 14 actionable Nikon records plus thirty-three reviewed DJI records through Inspire 1 Pro/Raw Wave 19.

## Actionable coverage by maker

| Maker | Basic | Detail | Reviewed exclusion | Missing |
| --- | ---: | ---: | ---: | ---: |
| DJI | 96 | 33 | 0 | 63 |
| OM SYSTEM | 37 | 0 | 0 | 37 |
| GoPro | 31 | 0 | 0 | 31 |
| Nikon | 14 | 14 | 0 | 0 |
| Insta360 | 7 | 0 | 0 | 7 |

## Nikon completion

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

Nikon Waves 1–2 remain closed with explicit official-model evidence for every active row. Shared battery/charger families are not generalized by model-name similarity.

## DJI reviewed waves

DJI coverage is advanced only in bounded exact-canonical-model waves. Waves 1–18 retain their previously reviewed evidence and boundaries. Wave 19 adds exactly one canonical record:

### DJI Inspire 1 Pro/Raw — Wave 19

The canonical `Inspire 1 Pro/Raw` record has two reviewed power-accessory handoffs:

- `DJI TB47 Intelligent Flight Battery` — DJI's official SDK hardware documentation explicitly lists `Inspire 1 Pro/Raw` configurations using TB47 and TB48 batteries; TB47 is used as the deterministic reviewed battery search handoff.
- `DJI Inspire 1 Battery Charging Hub` — DJI's official charging-hub announcement states compatibility with TB47 and TB48 batteries.

The official DJI Download Center independently establishes `Inspire 1 Pro/Raw` as the exact canonical product identity. Wave 19 does not infer compatibility to `DJI Inspire 1 Pro/Raw`, `Inspire 1 Pro`, `Inspire 1 Raw`, or any other spelling. Existing `Inspire 1`, `Inspire 2`, and `DJI Inspire 3` mappings remain on their independently reviewed Waves 18, 17, and 16.

After DJI Waves 1–19:

`DJI camera 96 = detail 33 + reviewed exclusion 0 + missing 63`

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
- Generic exact-model body searches and fixed body-search overrides do not count as accessory detail.
- Reviewed exclusions must live in `affiliate-camera-detail-exclusions.js`; the ledger is currently empty.
- Missing records must not be converted to exclusions without an evidence-backed review reason.
- One camera record cannot simultaneously be detail-mapped and excluded.
- Every actionable camera record must reconcile to exactly one of verified accessory detail, reviewed exclusion, or missing accessory detail.
- `cameraMissingAccessoryByMaker` and `cameraMissingAccessoryModelsByMaker` remain required machine-readable diagnostics.

## Expansion order

1. Continue DJI from the remaining 63 actionable records in bounded product-family waves.
2. Review OM SYSTEM 37 actionable records.
3. Review GoPro 31 actionable records.
4. Review Insta360 7 actionable records.

Nikon is closed at zero missing.

## Completion target

The camera accessory phase is complete only when:

`camera basic = detail + reviewed exclusion + missing 0`

The current baseline is not complete: `138` actionable records remain missing accessory detail.

## Source of truth

- `affiliate-camera-accessories.js` — Nikon Wave 1.
- `affiliate-nikon-camera-accessories-wave2.js` — Nikon Wave 2 and Nikon completion.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave18.js` — previously reviewed DJI Waves 1–18.
- `affiliate-dji-camera-accessories-wave19.js` — exact reviewed `Inspire 1 Pro/Raw` TB47 battery and Inspire 1 charging-hub mapping.
- `affiliate-camera-detail-exclusions.js` — reviewed exclusions; currently empty.
- `tests/dji-inspire1-proraw-accessory-wave19.test.mjs` — exact Wave 19 compatibility boundary and prior-wave preservation checks.
- `tests/camera-accessory-coverage.test.mjs` — catalog-wide camera reconciliation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` — documentation drift guard.
