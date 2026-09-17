# ManualFinder Affiliate Coverage

Updated: 2026-09-17

ManualFinder keeps official manufacturer manual/support destinations primary. Amazon is an optional commercial next action generated from canonical metadata and reviewed compatibility mappings; arbitrary user-entered search text is never used in Amazon destinations.

## Current audit snapshot

| Metric | Final audited value |
| --- | ---: |
| Printer records with a basic Amazon path | **291** |
| Printer records with a verified detail handoff | **284** |
| Reviewed printer-detail exclusions | **7** |
| Actionable printer records still missing detail | **0** |

`printer basic 291 = detail 284 + reviewed exclusion 7 + missing 0`

The camera accessory audit independently reconciles as:

`camera basic 185 = detail 47 + reviewed exclusion 0 + missing 138`

The printer coverage audit must continue to report:

- `printerMissingDetail: 0`
- `printerMissingDetailByMaker: {}`
- `printerMissingDetailModelsByMaker: {}`

## Printer detail completion

The seven reviewed printer exclusions remain evidence-backed service-managed-consumables cases: four OKI MC883dnwv value-service rows and three KYOCERA Document Solutions rows (`KM-2531`, `KM-3531`, `KM-4031`). They must not be converted to guessed retail mappings.

KYOCERA remains closed at:

`123 = 120 detail handoffs + 3 reviewed exclusions + 0 missing`

Wave 19 closed `KM-C3225E` and `KM-C870` with model-specific toner searches and `tonerCodes: []`; no public retail toner SKU was invented.

## Amazon tagged-search format

- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- verified: 2026-09-13 with Amazon Link Checker
- representative proof: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`

Generic exact-model search remains limited to eligible canonical categories with non-empty canonical model metadata. Compatibility-sensitive consumable/accessory offers require separate manufacturer-backed mappings and fail closed otherwise.

## Nikon camera completion

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

Nikon Waves 1–2 remain closed. Shared battery/charger families are not generalized by model-name similarity.

## DJI camera accessory Waves 1–19

DJI coverage advances only through bounded exact-canonical-model waves. Waves 1–18 retain their reviewed evidence and boundaries. Wave 19 activates exactly `Inspire 1 Pro/Raw`.

DJI official evidence establishes the boundary as follows:

- DJI Download Center independently identifies `Inspire 1 Pro/Raw` as the canonical product.
- DJI Mobile SDK hardware documentation lists `Inspire 1 Pro/Raw` configurations using TB47 and TB48 batteries; the deterministic battery handoff is `DJI TB47 Intelligent Flight Battery`.
- DJI's Inspire 1 Battery Charging Hub announcement states compatibility with TB47 and TB48; the charging handoff is `DJI Inspire 1 Battery Charging Hub`.

Wave 19 does not infer compatibility to `DJI Inspire 1 Pro/Raw`, `Inspire 1 Pro`, `Inspire 1 Raw`, or other spellings. Existing `Inspire 1`, `Inspire 2`, and `DJI Inspire 3` rows retain their independent Waves 18, 17, and 16 evidence.

After DJI Waves 1–19:

`DJI camera 96 = detail 33 + reviewed exclusion 0 + missing 63`

The catalog-wide camera state is 185 actionable basic records, 47 detail rows, 0 reviewed exclusions, and 138 missing accessory-detail rows. Remaining missing counts are DJI 63, OM SYSTEM 37, GoPro 31, and Insta360 7.

## Runtime boundary and source of truth

- `affiliate-config.js` owns generic search policy and the fixed tracking ID.
- printer mapping ledgers plus `affiliate-printer-detail-exclusions.js` own printer detail.
- `affiliate-camera-accessories.js` and `affiliate-nikon-camera-accessories-wave2.js` own Nikon camera detail.
- `affiliate-dji-camera-accessories-wave1.js` through `affiliate-dji-camera-accessories-wave19.js` own reviewed DJI detail.
- `affiliate-dji-camera-accessories-wave19.js` adds the exact reviewed `Inspire 1 Pro/Raw` row and exposes the merged 47-row camera detail ledger.
- `affiliate-camera-detail-exclusions.js` remains empty.
- `affiliate-runtime.js` loads Nikon Waves 1–2 and DJI Waves 1–19 before affiliate rendering.
- `tests/dji-inspire1-proraw-accessory-wave19.test.mjs` locks Wave 19 and prior-wave preservation.
- `tests/camera-accessory-coverage.test.mjs` computes the camera reconciliation and exact missing arrays.
- `tests/camera-accessory-doc-sync.test.mjs` prevents documentation drift.

Unsupported categories, empty models, malformed URLs, wrong makers, wrong categories, nonexistent model IDs, and unreviewed compatibility mappings fail closed.

## Audit completion gate

Printer detail remains complete only while `291 = 284 + 7 + 0` and all missing-detail diagnostics stay empty. Nikon remains complete at 14/14. DJI remains partial at 33/96 detail.

The next measured backlog is DJI 63, OM SYSTEM 37, GoPro 31, and Insta360 7. The camera phase is complete only when `camera basic = detail + reviewed exclusion + missing 0`.