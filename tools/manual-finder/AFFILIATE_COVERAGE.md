# ManualFinder Affiliate Coverage

Updated: 2026-09-18

ManualFinder keeps official manufacturer manual/support destinations primary. Amazon is an optional commercial next action generated from canonical metadata and reviewed compatibility mappings; arbitrary user-entered search text is never used in Amazon destinations.

## Current audit snapshot

The printer-detail audit remains complete for the current canonical printer catalog.

| Metric | Final audited value |
| --- | ---: |
| Printer records with a basic Amazon path | **291** |
| Printer records with a verified detail handoff | **284** |
| Reviewed printer-detail exclusions | **7** |
| Actionable printer records still missing detail | **0** |

Required printer reconciliation:

`printer basic 291 = detail 284 + reviewed exclusion 7 + missing 0`

The camera accessory audit independently reconciles as:

`camera basic 185 = detail 59 + reviewed exclusion 0 + missing 126`

Maker-level camera state:

- `Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`
- `DJI camera 96 = detail 45 + reviewed exclusion 0 + missing 51`
- OM SYSTEM: 37 missing
- GoPro: 31 missing
- Insta360: 7 missing

The printer audit must continue to report `printerMissingDetail: 0`, an empty `printerMissingDetailByMaker`, and an empty `printerMissingDetailModelsByMaker`.

## Amazon tagged-search format

- Base: `https://www.amazon.co.jp/s`
- Tracking ID: `nicheworks09-22`
- Status: verified
- Verified: 2026-09-13
- Representative Link Checker proof: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- User-entered ManualFinder search text is never copied into Amazon destinations.

The same deterministic tagged-search format is used for reviewed exact-model and compatibility-sensitive accessory searches. No per-model SiteStripe short-link generation is required.

## Generic model-search rule

The exact-model rule is active for `PC・スマホ`, `家電`, `プリンター・複合機`, `カメラ・映像`, `オーディオ`, `ゲーム`, and `ネットワーク機器` when the canonical row has a non-empty model. Generic maker entrances do not receive an Amazon CTA. `その他` remains excluded from blanket model search.

## Printer consumable evidence rule

Compatibility-sensitive consumable handoffs are allowed only when an existing canonical ManualFinder model is tied to official manufacturer evidence.

- Manufacturer-published retail ink/toner codes are retained when verified.
- Family-level evidence is used only when the manufacturer explicitly establishes compatibility.
- Document identifiers, prose references, and family names are not converted into invented SKUs.
- If exact model/toner applicability is proven but no public retail SKU is verified, an empty code list remains valid.
- Similar model numbers, marketplace listings, and third-party supply pages do not establish compatibility.

## Reviewed printer-detail exclusions

The seven reviewed exclusions remain evidence-backed service-managed-consumables cases:

- OKI `MC883dnwvバリューSタイプ`
- OKI `MC883dnwvバリューMタイプ`
- OKI `MC883dnwvバリューLタイプ`
- OKI `MC883dnwvバリューXLタイプ`
- KYOCERA Document Solutions `KM-2531`
- KYOCERA Document Solutions `KM-3531`
- KYOCERA Document Solutions `KM-4031`

They remain in `affiliate-printer-detail-exclusions.js` and must not be replaced by guessed retail toner mappings.

## KYOCERA completion — Waves 1–19

The 123 canonical KYOCERA Document Solutions printer records remain closed at:

`123 = 120 detail handoffs + 3 reviewed exclusions + 0 missing`

Wave 19 closed `KM-C3225E` and `KM-C870` with model-specific Amazon toner searches and `tonerCodes: []`; no public retail toner SKU was inferred.

## Nikon camera completion — Waves 1–2

Nikon camera accessory coverage remains complete:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

Shared accessory families are not generalized by model-name similarity; each active row is explicit in the reviewed ledger.

## DJI camera accessory Waves 1–25

DJI camera accessory coverage advances only through bounded exact-canonical-model waves. Every active row requires DJI official evidence; neighboring names and variants remain fail-closed until separately reviewed.

| Wave | Canonical rows | Reviewed power handoff |
| ---: | --- | --- |
| 1 | `Osmo Action 3`, `Osmo Action 4`, `Osmo Action 5 Pro`, `Osmo Action 6` | Extreme Battery Plus / Multifunctional Battery Case 2 |
| 2 | `DJI Air 3`, `DJI Air 3S` | Air 3 Intelligent Flight Battery / Air 3 Series Battery Charging Hub |
| 3 | `DJI Mini 3`, `DJI Mini 3 Pro`, `DJI Mini 4 Pro` | reviewed Mini battery boundary / shared Two-Way Charging Hub |
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
| 15 | `DJI Mavic 3 Enterprise`, `DJI Mavic 3M` | Mavic 3 Series Intelligent Flight Battery / 100W Charging Hub |
| 16 | `DJI Inspire 3` | TB51 Intelligent Battery / TB51 Charging Hub |
| 17 | `Inspire 2` | TB50 Intelligent Battery / Inspire 2 Battery Charging Hub |
| 18 | `Inspire 1` | TB47 Intelligent Flight Battery / Inspire 1 Battery Charging Hub |
| 19 | `Inspire 1 Pro/Raw` | TB47 Intelligent Flight Battery / Inspire 1 Battery Charging Hub |
| 20 | `Spark` | Spark Intelligent Flight Battery / Spark Battery Charging Hub |
| 21 | `Phantom 4`, `Phantom 4 Advanced`, `Phantom 4 Pro`, `Phantom 4 Pro V2.0`, `Phantom 4 RTK` | Phantom 4 Series Intelligent Flight Battery / Phantom 4 Battery Charging Hub |
| 22 | `Phantom 3 Advanced`, `Phantom 3 Professional`, `Phantom 3 Standard` | Phantom 3 Intelligent Flight Battery / Phantom 3 Battery Charging Hub |
| 23 | `Phantom 3 SE` | Phantom 3 Intelligent Flight Battery only; no hub inference |
| 24 | `Mavic 2 Enterprise Advanced` | Mavic 2 Enterprise Battery only; no hub inference |
| 25 | `Mavic 2 Enterprise Series` | Mavic 2 Enterprise Battery / Mavic 2 Battery Charging Hub |

### DJI Phantom 3 series — Wave 22

Wave 22 activates exactly three canonical Phantom 3 rows: `Phantom 3 Advanced`, `Phantom 3 Professional`, and `Phantom 3 Standard`.

DJI's official Advanced, Professional, and Standard Download Centers publish the Phantom 3 Series Charging Hub manual under those products. DJI's official battery guidance defines the Phantom 3 Series Intelligent Flight Battery, and the Standard support FAQ explicitly states that the Professional/Advanced and Standard batteries are the same.

The deterministic Amazon handoffs are:

- `DJI Phantom 3 Intelligent Flight Battery`
- `DJI Phantom 3 Battery Charging Hub`

Wave 22 does not infer compatibility to `Phantom 3 SE`, `Phantom 3 4K`, `DJI Phantom 3 Standard`, or other non-canonical spellings.

### DJI Phantom 3 SE — Wave 23

Wave 23 activates exactly `Phantom 3 SE`. DJI's official Phantom 3 SE Download Center carries SE-specific Intelligent Flight Battery safety documentation, and DJI's official Phantom 3 Series battery guidance identifies the series battery as 15.2 V / 4480 mAh. The only deterministic accessory handoff is `DJI Phantom 3 Intelligent Flight Battery`.

A charging-hub offer is intentionally omitted because explicit SE-specific hub compatibility was not established at the same evidence standard. Wave 22 hub evidence is not generalized to SE.

### DJI Mavic 2 Enterprise Advanced — Wave 24

Wave 24 activates exactly `Mavic 2 Enterprise Advanced`. DJI Store's official `Mavic 2 Enterprise Battery` page explicitly lists `Mavic 2 Enterprise Advanced` in its Compatibility section. The only deterministic accessory handoff is `DJI Mavic 2 Enterprise Battery`.

A charging-hub offer is intentionally omitted because the reviewed official hub evidence did not directly name Advanced at the same standard. Wave 10's Mavic 2 hub mapping is not generalized to this enterprise variant.

### DJI Mavic 2 Enterprise Series — Wave 25

Wave 25 activates exactly `Mavic 2 Enterprise Series`. DJI's official Series Download Center publishes the Intelligent Flight Battery Safety Guide, and DJI's official charging-hub compatibility article explicitly lists `Mavic 2 Enterprise Series` for the `Mavic 2 Battery Charging Hub`.

The deterministic handoffs are `DJI Mavic 2 Enterprise Battery` and `Mavic 2 Battery Charging Hub`. No synthetic child model is created from the series row.

After Waves 1–25:

`DJI camera 96 = detail 45 + reviewed exclusion 0 + missing 51`

The catalog-wide camera audit is therefore 185 actionable basic rows, 59 detail mappings, 0 reviewed exclusions, and 126 missing accessory-detail rows.

## Runtime boundary and source of truth

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on result cards.
- `affiliate-config.js` owns the fixed tracking ID and generic model-search policy.
- Maker-specific printer ledgers own reviewed consumable mappings.
- `affiliate-printer-detail-exclusions.js` owns reviewed printer exclusions.
- `affiliate-camera-accessories.js` and `affiliate-nikon-camera-accessories-wave2.js` own Nikon camera mappings.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave25.js` own reviewed DJI camera mappings.
- `affiliate-dji-camera-accessories-wave22.js` adds the exact reviewed three-row Phantom 3 mapping.
- `affiliate-dji-camera-accessories-wave23.js` adds the exact Phantom 3 SE battery-only mapping.
- `affiliate-dji-camera-accessories-wave24.js` adds the exact Mavic 2 Enterprise Advanced battery-only mapping.
- `affiliate-dji-camera-accessories-wave25.js` adds the exact Mavic 2 Enterprise Series battery/hub mapping and exposes the merged 59-row camera detail ledger.
- `affiliate-camera-detail-exclusions.js` remains empty.
- `affiliate-runtime.js` sequentially loads Nikon and DJI ledgers before affiliate rendering.
- `tests/affiliate-coverage.test.mjs` and `tests/affiliate-doc-sync.test.mjs` protect printer reconciliation.
- `tests/dji-phantom3-accessory-wave22.test.mjs` protects the exact Phantom 3 Wave 22 boundary.
- `tests/dji-phantom3-se-accessory-wave23.test.mjs` protects the exact battery-only Phantom 3 SE Wave 23 boundary.
- `tests/dji-mavic2-enterprise-advanced-wave24.test.mjs` protects the exact battery-only Mavic 2 Enterprise Advanced Wave 24 boundary.
- `tests/dji-mavic2-enterprise-series-wave25.test.mjs` protects the exact Mavic 2 Enterprise Series Wave 25 battery/hub boundary.
- `tests/camera-accessory-coverage.test.mjs` computes camera reconciliation and exact missing-model diagnostics.
- `tests/camera-accessory-doc-sync.test.mjs` prevents documentation drift and auto-discovers DJI wave evidence.
- `CAMERA_ACCESSORY_COVERAGE.md` records the measured camera baseline.

Unsupported categories, empty models, malformed URLs, wrong makers, wrong categories, nonexistent model IDs, and unreviewed compatibility mappings fail closed. Official manual/support links remain above the commercial block.

## Completion gates

Printer-detail remains closed only while:

- printer basic = 291
- printer detail = 284
- reviewed printer-detail exclusions = 7
- printer missing detail = 0
- the three missing-detail diagnostic structures remain empty

Nikon remains closed only while:

- Nikon basic = 14
- Nikon detail = 14
- Nikon reviewed exclusions = 0
- Nikon missing = 0

DJI remains partial at:

- DJI basic = 96
- DJI detail = 45
- DJI reviewed exclusions = 0
- DJI missing = 51

## Next expansion gate

Printer-detail is closed. Nikon camera coverage is closed. The measured camera backlog continues with DJI 51 actionable rows, followed by OM SYSTEM 37, GoPro 31, and Insta360 7, using bounded exact-model official-evidence waves.
