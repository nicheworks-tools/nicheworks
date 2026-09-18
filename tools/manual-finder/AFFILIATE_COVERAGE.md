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

`camera basic 185 = detail 81 + reviewed exclusion 15 + missing 89`

Maker-level camera state:

- `Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`
- `DJI camera 96 = detail 67 + reviewed exclusion 15 + missing 14`
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

## DJI camera review Waves 1–38

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
| 26 | `Osmo Pocket 3` | Osmo Pocket 3 Battery Handle |
| 27 | `DJI Action 2` | DJI Action 2 Power Module |
| 28 | `DJI Pocket 2` | DJI Pocket 2 Charging Case |
| 29 | `Osmo Pocket` | DJI Osmo Pocket Charging Case |
| 30 | `Osmo 360` | Osmo Action Extreme Battery Plus / Osmo Action Multifunctional Battery Case 2 |
| 31 | `DJI Goggles 2` | DJI Goggles 2 Battery |
| 32 | `DJI Goggles 3`, `DJI Goggles Integra`, `DJI Goggles N3` | reviewed exclusion: built-in battery; no model-specific replaceable power accessory |
| 33 | `DJI RS 2`, `DJI RS 3`, `DJI RS 3 Pro`, `DJI RS 4`, `DJI RS 4 Pro`, `DJI RS 5` | DJI RS BG30 Battery Grip |
| 34 | `DJI RS 3 Mini`, `DJI RS 4 Mini`, `DJI RSC 2` | reviewed exclusion: nonremovable battery/grip; no separately purchasable model-specific power accessory |
| 35 | `DJI Ronin-SC`, `Ronin-S` | Ronin-SC BG18 Grip / Ronin-S BG37 Grip |
| 36 | `DJI OM 4`, `DJI OM 4 SE`, `DJI OM 5`, `Osmo Mobile 2`, `Osmo Mobile 3`, `Osmo Mobile 6`, `Osmo Mobile 7 Series`, `Osmo Mobile 8`, `Osmo Mobile SE` | reviewed exclusion: built-in/nonreplaceable battery |
| 37 | `Osmo`, `Osmo Mobile`, `Osmo+`, `Osmo Pro and Raw` | Osmo Intelligent Battery 980mAh / High Capacity Intelligent Battery 1225mAh |
| 38 | `Ronin 2`, `Ronin-M`, `Ronin-MX`, `Ronin` | TB50 Intelligent Battery / Ronin-M Battery 1580mAh / Ronin Battery 3400mAh |

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

### DJI Osmo Pocket 3 — Wave 26

Wave 26 activates exactly the canonical `Osmo Pocket 3` row. DJI's official Osmo Pocket 3 Battery Handle product page explicitly lists `Osmo Pocket 3` as compatible, and DJI's Osmo Pocket 3 support material documents the Battery Handle as a supported accessory.

The deterministic Amazon handoff is `DJI Osmo Pocket 3 Battery Handle`. Wave 26 remains exact-canonical-row only: `DJI Osmo Pocket 3`, `Osmo Pocket 3 Creator Combo`, `DJI Pocket 2`, and other neighboring or synthetic names remain fail-closed.

### DJI Action 2 — Wave 27

Wave 27 activates exactly the canonical `DJI Action 2` row. DJI's official Action 2 support page lists the Power Module as a compatible accessory and documents its built-in 1300 mAh battery, up to 180 minutes of Camera Unit + Power Module operating time, and charging behavior. DJI Store's official Power Module page independently lists `DJI Action 2` as compatible.

The deterministic Amazon handoff is `DJI Action 2 Power Module`. `Action 2`, `DJI Action 2 Power Combo`, `Osmo Action`, and other neighboring or synthetic names remain fail-closed.

### DJI Pocket 2 — Wave 28

Wave 28 activates exactly the canonical `DJI Pocket 2` row. DJI's official Pocket 2 support page states that the product can use the DJI Pocket 2 Charging Case for extended operating time. DJI Store's official Charging Case page explicitly lists `DJI Pocket 2` as compatible and specifies a 1500 mAh charging case.

The deterministic Amazon handoff is `DJI Pocket 2 Charging Case`. `Pocket 2`, `DJI Pocket 2 Creator Combo`, and other neighboring or synthetic names remain fail-closed. `Osmo Pocket` required separate review and is handled by Wave 29.

### Osmo Pocket — Wave 29

Wave 29 activates exactly the canonical `Osmo Pocket` row. DJI's official Osmo Pocket product information publishes the Osmo Pocket Charging Case User Guide. DJI's official Pocket 2 compatibility guidance separately states that the Osmo Pocket Charging Case is only compatible with `Osmo Pocket`.

The deterministic Amazon handoff is `DJI Osmo Pocket Charging Case`. `DJI Osmo Pocket`, `Osmo Pocket Charging Case`, `DJI Pocket 2`, and other neighboring or synthetic names remain fail-closed.

### Osmo 360 — Wave 30

Wave 30 activates exactly the canonical `Osmo 360` row. DJI's official Osmo 360 FAQ explicitly supports Osmo Action Extreme Battery Plus (1950 mAh), and DJI Store lists `Osmo 360` as compatible with both `Osmo Action Extreme Battery Plus (1950 mAh)` and `Osmo Action Multifunctional Battery Case 2`.

The deterministic Amazon handoffs are `DJI Osmo Action Extreme Battery Plus` and `DJI Osmo Action Multifunctional Battery Case 2`. `DJI Osmo 360`, `Osmo 360 II`, `Osmo 360 Adventure Combo`, and other neighboring or synthetic names remain fail-closed.

### DJI Goggles 2 — Wave 31

Wave 31 activates exactly the canonical `DJI Goggles 2` row. DJI's official Goggles 2 support page specifies `DJI Goggles 2 Battery` as the goggles' power input and documents the battery as 1800 mAh / 18 Wh with approximately two hours of operating time. DJI Store independently lists `DJI Goggles 2` as compatible with that battery.

The deterministic Amazon handoff is `DJI Goggles 2 Battery`. `Goggles 2` and other non-canonical spellings remain fail-closed. `DJI Goggles 3`, `DJI Goggles Integra`, and `DJI Goggles N3` required separate review and are handled by Wave 32.

### Integrated-battery Goggles — Wave 32

Wave 32 reviews exactly `DJI Goggles 3`, `DJI Goggles Integra`, and `DJI Goggles N3`. DJI's official support/specification pages identify the power input for all three as a built-in battery. Because no model-specific replaceable battery or charger accessory was established at the same evidence standard, these rows are recorded as reviewed exclusions rather than receiving generic USB-C charger or power-bank handoffs.

The exclusion reason is `built_in_battery_no_model_specific_replaceable_power_accessory`. `DJI Goggles`, `DJI Goggles RE`, and other Goggles-family products remain unreviewed and are not excluded by inference.

### DJI RS BG30 Battery Grip — Wave 33

Wave 33 activates exactly `DJI RS 2`, `DJI RS 3`, `DJI RS 3 Pro`, `DJI RS 4`, `DJI RS 4 Pro`, and `DJI RS 5`. DJI Store's official BG30 page explicitly lists all six models in Compatibility and documents the battery grip as independently chargeable.

The deterministic Amazon handoff for each reviewed row is `DJI RS BG30 Battery Grip`. `DJI RS 3 Mini`, `DJI RS 4 Mini`, and `DJI RSC 2` required separate review and are handled by Wave 34.

### Nonremovable RS/RSC power — Wave 34

Wave 34 reviews exactly `DJI RS 3 Mini`, `DJI RS 4 Mini`, and `DJI RSC 2`. DJI's official Ronin grip purchase guidance states that these three grips are not removable and cannot be purchased separately. Their official product specifications document the integrated battery and USB-C charging behavior.

The three rows receive `built_in_battery_no_model_specific_replaceable_power_accessory` and no generic charger handoff. `DJI Ronin-SC` and `Ronin-S` required separate review and are handled by Wave 35.

### Ronin-SC / Ronin-S battery grips — Wave 35

Wave 35 activates exactly `DJI Ronin-SC` and `Ronin-S`. DJI Store's official `Ronin-SC BG18 Grip` page lists Ronin-SC compatibility and a built-in 2450 mAh battery, while the official `Ronin-S BG37 Grip` page lists Ronin-S compatibility and a built-in 2400 mAh battery.

The deterministic Amazon handoffs are `DJI Ronin-SC BG18 Grip` and `DJI Ronin-S BG37 Grip`. `Ronin-SC`, `DJI Ronin-S`, `Ronin 2`, `Ronin-M`, and other neighboring names remain fail-closed.

### Osmo Mobile built-in batteries — Wave 36

Wave 36 reviews exactly nine canonical Osmo Mobile/OM rows: `DJI OM 4`, `DJI OM 4 SE`, `DJI OM 5`, `Osmo Mobile 2`, `Osmo Mobile 3`, `Osmo Mobile 6`, `Osmo Mobile 7 Series`, `Osmo Mobile 8`, and `Osmo Mobile SE`. DJI's official support/FAQ pages state that the battery in each reviewed model is built in or cannot be replaced/swapped out.

The nine rows receive `built_in_battery_no_model_specific_replaceable_power_accessory` and no generic USB-charger handoff. The original `Osmo Mobile` is intentionally excluded from this wave because DJI documents a replaceable Intelligent Battery and high-capacity/external-battery compatibility; it is handled separately by Wave 37.

### Legacy Osmo replaceable batteries — Wave 37

Wave 37 activates exactly `Osmo`, `Osmo Mobile`, `Osmo+`, and `Osmo Pro and Raw`. DJI's official Osmo support page identifies the HB01-522365 980 mAh Intelligent Battery; the Osmo Mobile support page explicitly states that it uses the same original Osmo 980 mAh battery. DJI's official Osmo+ and Osmo Pro/RAW information identifies the HB02-542465 1225 mAh high-capacity battery.

The deterministic Amazon handoffs are `DJI Osmo Intelligent Battery 980mAh` for the first two rows and `DJI Osmo High Capacity Intelligent Battery 1225mAh` for the latter two. `DJI Osmo`, `Osmo Plus`, `Osmo Pro`, and `Osmo RAW` remain fail-closed.

### Legacy Ronin replaceable batteries — Wave 38

Wave 38 activates exactly `Ronin 2`, `Ronin-M`, `Ronin-MX`, and `Ronin`. DJI's official Ronin 2 support says Ronin 2 uses the same batteries as Inspire 2, and DJI Store explicitly lists Ronin 2 compatibility for TB50. Official Ronin-M/Ronin Series material documents Ronin-M's removable smart battery and states that Ronin-MX uses the same 1580 mAh battery. Original Ronin support documents its removable 4S smart batteries.

The deterministic Amazon handoffs are `DJI TB50 Intelligent Battery`, `DJI Ronin-M Battery 1580mAh`, and `DJI Ronin Battery 3400mAh` at their exact reviewed rows. `DJI Ronin 2`, `Ronin M`, `Ronin MX`, and other spelling variants remain fail-closed.

After Waves 1–38:

`DJI camera 96 = detail 67 + reviewed exclusion 15 + missing 14`

The catalog-wide camera audit is therefore 185 actionable basic rows, 81 detail mappings, 15 reviewed exclusions, and 89 missing accessory-detail rows.

## Runtime boundary and source of truth

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on result cards.
- `affiliate-config.js` owns the fixed tracking ID and generic model-search policy.
- Maker-specific printer ledgers own reviewed consumable mappings.
- `affiliate-printer-detail-exclusions.js` owns reviewed printer exclusions.
- `affiliate-camera-accessories.js` and `affiliate-nikon-camera-accessories-wave2.js` own Nikon camera mappings.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave38.js` own reviewed DJI camera mappings.
- `affiliate-dji-camera-accessories-wave22.js` adds the exact reviewed three-row Phantom 3 mapping.
- `affiliate-dji-camera-accessories-wave23.js` adds the exact Phantom 3 SE battery-only mapping.
- `affiliate-dji-camera-accessories-wave24.js` adds the exact Mavic 2 Enterprise Advanced battery-only mapping.
- `affiliate-dji-camera-accessories-wave25.js` adds the exact Mavic 2 Enterprise Series battery/hub mapping.
- `affiliate-dji-camera-accessories-wave26.js` adds the exact Osmo Pocket 3 Battery Handle mapping.
- `affiliate-dji-camera-accessories-wave27.js` adds the exact DJI Action 2 Power Module mapping.
- `affiliate-dji-camera-accessories-wave28.js` adds the exact DJI Pocket 2 Charging Case mapping.
- `affiliate-dji-camera-accessories-wave29.js` adds the exact Osmo Pocket Charging Case mapping.
- `affiliate-dji-camera-accessories-wave30.js` adds the exact Osmo 360 battery/case mappings.
- `affiliate-dji-camera-accessories-wave31.js` adds the exact DJI Goggles 2 Battery mapping.
- `affiliate-dji-camera-accessories-wave33.js` adds the exact six-row DJI RS BG30 Battery Grip mapping.
- `affiliate-dji-camera-accessories-wave35.js` adds the exact Ronin-SC BG18 / Ronin-S BG37 mappings.
- `affiliate-dji-camera-accessories-wave37.js` adds the exact four-row legacy Osmo battery mappings.
- `affiliate-dji-camera-accessories-wave38.js` adds the exact four-row legacy Ronin battery mappings and exposes the merged 81-row camera detail ledger.
- `affiliate-camera-detail-exclusions.js` contains fifteen exact DJI exclusions across Waves 32, 34, and 36.
- `affiliate-runtime.js` sequentially loads Nikon and DJI ledgers before affiliate rendering.
- `tests/affiliate-coverage.test.mjs` and `tests/affiliate-doc-sync.test.mjs` protect printer reconciliation.
- `tests/dji-phantom3-accessory-wave22.test.mjs` protects the exact Phantom 3 Wave 22 boundary.
- `tests/dji-phantom3-se-accessory-wave23.test.mjs` protects the exact battery-only Phantom 3 SE Wave 23 boundary.
- `tests/dji-mavic2-enterprise-advanced-wave24.test.mjs` protects the exact battery-only Mavic 2 Enterprise Advanced Wave 24 boundary.
- `tests/dji-mavic2-enterprise-series-wave25.test.mjs` protects the exact Mavic 2 Enterprise Series Wave 25 battery/hub boundary.
- `tests/dji-osmo-pocket3-accessory-wave26.test.mjs` protects the exact Osmo Pocket 3 Wave 26 Battery Handle boundary.
- `tests/dji-action2-accessory-wave27.test.mjs` protects the exact DJI Action 2 Wave 27 Power Module boundary.
- `tests/dji-pocket2-accessory-wave28.test.mjs` protects the exact DJI Pocket 2 Wave 28 Charging Case boundary.
- `tests/dji-osmo-pocket-accessory-wave29.test.mjs` protects the exact Osmo Pocket Wave 29 Charging Case boundary.
- `tests/dji-osmo360-accessory-wave30.test.mjs` protects the exact Osmo 360 Wave 30 battery/case boundary.
- `tests/dji-goggles2-accessory-wave31.test.mjs` protects the exact DJI Goggles 2 Wave 31 battery boundary.
- `tests/dji-goggles-integrated-battery-exclusions-wave32.test.mjs` protects the exact three-row Wave 32 exclusion boundary.
- `tests/dji-rs-bg30-accessory-wave33.test.mjs` protects the exact six-row DJI RS BG30 Wave 33 boundary.
- `tests/dji-rs-integrated-battery-exclusions-wave34.test.mjs` protects the exact three-row Wave 34 nonremovable RS/RSC boundary.
- `tests/dji-ronin-grip-accessory-wave35.test.mjs` protects the exact two-row Wave 35 Ronin grip boundary.
- `tests/dji-osmo-mobile-battery-exclusions-wave36.test.mjs` protects the exact nine-row Wave 36 Osmo Mobile exclusion boundary.
- `tests/dji-osmo-legacy-battery-wave37.test.mjs` protects the exact four-row Wave 37 legacy Osmo battery boundary.
- `tests/dji-ronin-legacy-battery-wave38.test.mjs` protects the exact four-row Wave 38 legacy Ronin battery boundary.
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
- DJI detail = 67
- DJI reviewed exclusions = 15
- DJI missing = 14

## Next expansion gate

Printer-detail is closed. Nikon camera coverage is closed. The measured camera backlog continues with DJI 14 actionable rows, followed by OM SYSTEM 37, GoPro 31, and Insta360 7, using bounded exact-model official-evidence waves.
