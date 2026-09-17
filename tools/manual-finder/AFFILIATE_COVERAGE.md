# ManualFinder Affiliate Coverage

Updated: 2026-09-17

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

This document records the current affiliate coverage contract and audited state. Per-model compatibility evidence lives in the implementation ledgers and tests.

## Current audit snapshot

The printer-detail Amazon handoff audit remains complete for the current canonical ManualFinder printer catalog.

| Metric | Final audited value |
| --- | ---: |
| Printer records with a basic Amazon path | **291** |
| Printer records with a verified detail handoff | **284** |
| Reviewed printer-detail exclusions | **7** |
| Actionable printer records still missing detail | **0** |

Required reconciliation:

`printer basic 291 = detail 284 + reviewed exclusion 7 + missing 0`

The camera accessory audit independently reconciles as:

`camera basic 185 = detail 46 + reviewed exclusion 0 + missing 139`

All 14 actionable Nikon camera records are closed. DJI Waves 1–18 add thirty-two reviewed detail rows, leaving DJI 64, OM SYSTEM 37, GoPro 31, and Insta360 7 missing accessory-detail rows.

The printer coverage audit must continue to report:

- `printerMissingDetail: 0`
- `printerMissingDetailByMaker: {}`
- `printerMissingDetailModelsByMaker: {}`

A future canonical printer record with a basic Amazon path must have either verified detail or an explicit reviewed exclusion.

## Reviewed printer-detail exclusions

The seven reviewed exclusions remain evidence-backed service-managed-consumables cases:

- OKI `MC883dnwvバリューSタイプ`
- OKI `MC883dnwvバリューMタイプ`
- OKI `MC883dnwvバリューLタイプ`
- OKI `MC883dnwvバリューXLタイプ`
- KYOCERA Document Solutions `KM-2531`
- KYOCERA Document Solutions `KM-3531`
- KYOCERA Document Solutions `KM-4031`

They are recorded in `affiliate-printer-detail-exclusions.js` with official evidence and must not be replaced by guessed retail toner mappings.

## Amazon tagged-search format

- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- status: `verified`
- verified: `2026-09-13`
- verification method: Amazon Link Checker
- representative proof URL: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- user-entered ManualFinder search text is never used in the Amazon destination

The same validated tagged-search format is used for exact-model and reviewed compatibility-sensitive accessory searches. No per-model SiteStripe operation is required.

## Generic model-search rule

The exact-model rule is active for `PC・スマホ`, `家電`, `プリンター・複合機`, `カメラ・映像`, `オーディオ`, `ゲーム`, and `ネットワーク機器` when the canonical record has a non-empty model. Generic manufacturer entrances do not receive an Amazon CTA. `その他` remains excluded from blanket model search.

## Printer consumable evidence rule

Compatibility-sensitive consumable handoffs are allowed only when an existing canonical ManualFinder model is tied to explicit official manufacturer evidence.

- Manufacturer-published ink/toner product codes are retained when verified.
- Family-level evidence is used only when the manufacturer explicitly establishes the compatibility relationship.
- Document identifiers, prose references, and family names are not converted into invented retail SKUs.
- When exact model/toner applicability is proven but no public retail SKU is verified, `tonerCodes: []` is valid and intentional.
- Similar model numbers, marketplace listings, and third-party supply pages do not establish compatibility.

## KYOCERA completion — Waves 1–19

The current 123 canonical KYOCERA Document Solutions printer records remain closed at:

`123 = 120 detail handoffs + 3 reviewed exclusions + 0 missing`

The three exclusions are `KM-2531`, `KM-3531`, and `KM-4031`. Wave 19 closed `KM-C3225E` and `KM-C870` with model-specific Amazon toner searches and `tonerCodes: []`; no retail toner SKU was inferred.

## Nikon camera completion — Waves 1–2

Nikon camera accessory coverage remains complete:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

Wave 1 maps `Z8`, `Z6III`, `Z5II`, and `Zf` to `EN-EL15c` / `MH-25a`. Wave 2 closes the remaining ten Nikon records with exact reviewed Nikon evidence. Shared accessory families are not generalized by model-name similarity.

## DJI camera accessory Waves 1–18

DJI camera accessory coverage advances only through bounded exact-canonical-model waves. Every active row requires DJI official evidence; neighboring names and variants remain fail-closed until separately reviewed.

| Wave | Canonical rows | Reviewed power handoff |
| --- | --- | --- |
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

### DJI Inspire 1 — Wave 18

Wave 18 activates exactly the canonical `Inspire 1` record. DJI's official Inspire 1 support page identifies the standard Intelligent Flight Battery as model `TB47`, and DJI's official Inspire 1 Battery Charging Hub announcement states that the hub is compatible with `TB47` and `TB48` batteries.

The reviewed Amazon handoffs are:

- `DJI TB47 Intelligent Flight Battery`
- `DJI Inspire 1 Battery Charging Hub`

Wave 18 does not infer compatibility to `Inspire 1 Pro/Raw`, `DJI Inspire 1`, `Inspire 2`, or any other Inspire-family canonical record. Inspire 2 and DJI Inspire 3 retain their independently reviewed Wave 17 and Wave 16 mappings.

After DJI Waves 1–18 the maker reconciliation is:

`DJI camera 96 = detail 32 + reviewed exclusion 0 + missing 64`

The catalog-wide camera audit now reports 185 actionable basic records, 46 detail mappings, 0 reviewed exclusions, and 139 missing accessory-detail rows. Remaining missing counts are DJI 64, OM SYSTEM 37, GoPro 31, and Insta360 7. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` and summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

## Current fixed override

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains an end-to-end proof of SiteStripe/account behavior. It does not suppress separately verified battery/charger handoffs.

## Runtime boundary and source of truth

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on result cards.
- `affiliate-config.js` owns the fixed tracking ID, generic model-search policy, and consumer-printer mappings.
- `affiliate-office-consumables.js` and maker-specific printer ledgers own verified printer consumable mappings.
- `affiliate-printer-detail-exclusions.js` owns reviewed printer exclusions.
- `affiliate-camera-accessories.js` owns Nikon Wave 1 and the coarse camera-accessory target.
- `affiliate-nikon-camera-accessories-wave2.js` closes the remaining ten Nikon records.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave18.js` are the reviewed DJI camera accessory ledgers.
- `affiliate-dji-camera-accessories-wave18.js` adds the exact reviewed `Inspire 1` TB47 battery and charging-hub mapping and exposes the merged 46-row camera detail ledger.
- `affiliate-camera-detail-exclusions.js` remains the explicit camera exclusion ledger and is currently empty.
- `affiliate-runtime.js` loads Nikon Waves 1–2 and DJI Waves 1–18 before initial affiliate rendering.
- `/assets/amazon-affiliate.js` validates Amazon destinations and records only coarse analytics targets.
- `tests/affiliate-coverage.test.mjs` and `tests/affiliate-doc-sync.test.mjs` protect the completed printer reconciliation.
- maker/wave-specific camera tests lock exact compatibility boundaries, including `tests/dji-inspire1-accessory-wave18.test.mjs`.
- `tests/camera-accessory-coverage.test.mjs` is the catalog-wide camera reconciliation and missing-model diagnostic gate.
- `tests/camera-accessory-doc-sync.test.mjs` prevents camera documentation drift.
- `CAMERA_ACCESSORY_COVERAGE.md` records the measured camera baseline and remaining backlog.

Unsupported categories, empty models, malformed URLs, wrong makers, wrong categories, nonexistent model IDs, and unreviewed compatibility mappings must fail closed. Official manual/support links always remain above the commercial block.

## Audit completion gate

The printer phase remains closed only while:

- printer basic = 291
- printer detail = 284
- reviewed printer-detail exclusions = 7
- printer missing detail = 0
- the three missing-detail diagnostic structures remain empty
- every exclusion resolves to a canonical printer record and official evidence
- no empty/unknown SKU is replaced by a guessed SKU

The Nikon camera subphase remains closed only while:

- Nikon camera basic = 14
- Nikon camera detail = 14
- Nikon reviewed camera exclusions = 0
- Nikon camera missing accessory detail = 0

The DJI camera phase is partial and currently reconciles at:

- DJI camera basic = 96
- DJI camera detail = 32
- DJI reviewed camera exclusions = 0
- DJI camera missing accessory detail = 64

If the canonical catalog changes, numeric values may legitimately change, but every reconciliation invariant remains mandatory.

## Next expansion gate

Printer-detail is no longer an open expansion target. Nikon camera coverage is closed. The measured camera backlog continues with DJI 64 actionable records, followed by OM SYSTEM 37, GoPro 31, and Insta360 7, using bounded reviewed product-family waves and exact manufacturer evidence. Appliance replacement-part rules remain a separate future phase.