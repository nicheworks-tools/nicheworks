# ManualFinder Affiliate Coverage

Updated: 2026-09-16

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

This document records the **current affiliate coverage contract and audit state**. Per-model compatibility evidence lives with the implementation ledgers and their tests so that this document does not become a second, stale copy of the runtime data.

## Current audit snapshot

The printer-detail Amazon handoff audit is complete for the current canonical ManualFinder printer catalog.

| Metric | Final audited value |
| --- | ---: |
| Printer records with a basic Amazon path | **291** |
| Printer records with a verified detail handoff | **284** |
| Reviewed printer-detail exclusions | **7** |
| Actionable printer records still missing detail | **0** |

The required reconciliation is therefore:

`printer basic 291 = detail 284 + reviewed exclusion 7 + missing 0`

The camera accessory audit is independently tracked and currently reconciles as:

`camera basic 185 = detail 14 + reviewed exclusion 0 + missing 171`

All 14 actionable Nikon camera records now have reviewed battery/charger detail mappings. The remaining camera backlog is DJI 96, OM SYSTEM 37, GoPro 31, and Insta360 7.

The printer coverage audit must also report:

- `printerMissingDetail: 0`
- `printerMissingDetailByMaker: {}`
- `printerMissingDetailModelsByMaker: {}`

A future canonical printer record that has a basic Amazon path but has neither a verified detail handoff nor an explicit reviewed exclusion is a regression and must fail the coverage audit.

## Reviewed printer-detail exclusions

The seven reviewed exclusions are intentional, evidence-backed cases rather than unresolved work:

- OKI `MC883dnwvバリューSタイプ`
- OKI `MC883dnwvバリューMタイプ`
- OKI `MC883dnwvバリューLタイプ`
- OKI `MC883dnwvバリューXLタイプ`
- KYOCERA Document Solutions `KM-2531`
- KYOCERA Document Solutions `KM-3531`
- KYOCERA Document Solutions `KM-4031`

They are recorded in `affiliate-printer-detail-exclusions.js` with official source/support URLs and `service_managed_consumables` as the reviewed reason. They must not be converted into guessed retail toner mappings merely to increase detail coverage.

## Decided rollout strategy

ManualFinder stays rule-driven. The target is a small number of reusable commerce rules plus manufacturer-verified compatibility mappings, not a URL ledger with hundreds or thousands of Amazon links.

Current state:

1. **Generic exact-model search** — active. One validated Amazon search template generates a tagged search URL from canonical ManualFinder `maker + model` metadata.
2. **Consumer-printer ink** — active for the verified Brother, Epson, and Canon mappings.
3. **Office-printer toner** — the current printer-detail audit is complete. Verified mappings exist across the maintained OKI, KYOCERA, RICOH, and FUJIFILM Business Innovation ledgers; reviewed non-retail/service-managed cases are explicit exclusions.
4. **Office-printer drum / maintenance parts** — optional future expansion, not part of the completed toner-detail audit.
5. **Camera batteries / chargers** — active for all 14 actionable Nikon camera records across Waves 1–2. The remaining camera backlog is measured separately and must continue in bounded reviewed waves.
6. **Appliance replacement parts / filters** — future work only where exact compatibility can be proven.
7. Additional accessory families require a clear user need and a verified mapping source.

There is no remaining printer-detail backlog in the current catalog. New printer records added later must satisfy the same fail-closed audit contract. Camera accessory expansion is independently bounded and does not change the completed printer reconciliation.

## Amazon tagged-search format

- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- status: `verified`
- verified: `2026-09-13`
- verification method: Amazon Link Checker
- representative proof URL: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- user-entered ManualFinder search text is never used in the Amazon destination

The same validated `s?k=...&tag=nicheworks09-22` format is used for exact-model and verified compatibility-sensitive accessory searches. No per-model SiteStripe operation is required.

## Generic model-search rule

The exact-model rule is active for:

- `PC・スマホ`
- `家電`
- `プリンター・複合機`
- `カメラ・映像`
- `オーディオ`
- `ゲーム`
- `ネットワーク機器`

A result must contain a non-empty canonical model. Generic manufacturer entrances do not receive an Amazon CTA. `その他` remains excluded because it mixes identities such as Seiko watch calibers and Roland legacy records that are not safe for blanket retail matching.

## Printer consumable evidence rule

Compatibility-sensitive consumable handoffs are allowed only when an existing canonical ManualFinder model is tied to an explicit official manufacturer source.

- Exact manufacturer-published ink/toner product codes are retained when available.
- Family-level official evidence may be used only when the manufacturer itself establishes the relevant compatibility relationship.
- A manufacturer document identifier, prose reference, or family name must not be converted into an invented retail SKU.
- When an official source proves that toner/consumables apply to the exact model but no public retail SKU can be verified, `tonerCodes: []` is valid and intentional.
- Unverified compatibility is never inferred from similar model numbers, product names, marketplace listings, or third-party supply pages.
- The user receives one concise model-specific consumable search handoff rather than a large list of cartridge/color links.

The UI states that manufacturer evidence was checked and that the user must still confirm the exact Amazon item and supported model before purchase.

## KYOCERA completion — Waves 1–19

The KYOCERA printer-detail work is complete for the current 123 canonical KYOCERA Document Solutions printer records:

`123 = 120 detail handoffs + 3 reviewed exclusions + 0 missing`

The three exclusions are `KM-2531`, `KM-3531`, and `KM-4031`, where official evidence supports the reviewed service-managed-consumables classification.

Wave 19 closed the final two actionable KYOCERA records:

| Model | Evidence disposition | Runtime behavior |
| --- | --- | --- |
| `KM-C3225E` | official model/product manual evidence; no public retail toner SKU verified | `tonerCodes: []`; search `KYOCERA KM-C3225E トナー` |
| `KM-C870` | official dedicated manual plus official catalog; no public retail toner SKU verified | `tonerCodes: []`; search `KYOCERA KM-C870 トナー` |

No toner SKU is inferred for either model. Their empty `tonerCodes` arrays are part of the fail-closed contract, not missing data to be filled speculatively.

The runtime matches the canonical maker string `KYOCERA Document Solutions` while using the shorter retail token `KYOCERA` in Amazon queries.

## Other printer makers

The completed detail audit includes the maintained Brother, Epson, Canon, OKI, RICOH, and FUJIFILM Business Innovation mappings in addition to KYOCERA. The implementation ledgers are the source of truth for exact per-model mappings and evidence URLs.

FUJIFILM Business Innovation family-level evidence remains intentionally distinguished from exact retail toner codes. SDS identifiers are not treated as product SKUs. The same principle applies to every maker: evidence proves the handoff boundary; it does not authorize SKU invention.

## Camera accessory rule — Nikon Waves 1–2

Nikon camera accessory coverage is complete for all 14 actionable Nikon camera records:

`Nikon camera 14 = detail 14 + reviewed exclusion 0 + missing 0`

Wave 1 remains the original four-row contract:

- `Z8`, `Z6III`, `Z5II`, `Zf` → `EN-EL15c` rechargeable battery / `MH-25a` battery charger.

Wave 2 explicitly reviews and closes the remaining ten canonical Nikon models:

- `Z9` → `EN-EL18d` / `MH-33`.
- `Z7II`, `Z6II`, `Z5` → `EN-EL15c` / `MH-25a`.
- `Z7`, `Z6` → `EN-EL15b` / `MH-25a`.
- `Z50II`, `Z50`, `Z30`, `Zfc` → `EN-EL25a` / `MH-32`.

Every mapping is tied to an exact Nikon official model/manual source. Shared battery or charger families are not generalized by model-name similarity. Wrong maker, wrong category, empty model, nonexistent model, and models outside an explicit reviewed ledger fail closed for camera accessory offers.

The catalog-wide camera audit now reports 185 actionable basic records, 14 detail mappings, 0 reviewed exclusions, and 171 missing accessory-detail rows. The remaining missing counts are DJI 96, OM SYSTEM 37, GoPro 31, and Insta360 7. Exact missing model arrays remain machine-readable in `tests/camera-accessory-coverage.test.mjs` output and are summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

## Current fixed override

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains an end-to-end proof of SiteStripe/account behavior. It is not the normal rollout mechanism. The fixed Z8 body-search override may coexist with its separately verified battery/charger handoffs; it does not suppress them.

## Runtime boundary and source of truth

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on each result card.
- `affiliate-config.js` owns the fixed tracking ID, generic model-search policy, and consumer-printer compatibility mappings.
- `affiliate-office-consumables.js` owns the base cross-maker office-printer toner mappings.
- `affiliate-oki-toner-wave2.js` and `affiliate-oki-toner-wave6.js` extend reviewed OKI toner coverage.
- `affiliate-ricoh-consumables-wave3.js` extends reviewed RICOH consumable coverage.
- `affiliate-kyocera-toner-wave3.js`, `affiliate-kyocera-toner-wave4.js`, and `affiliate-kyocera-toner-wave6.js` contain the KYOCERA supplemental ledgers. The last bundle exposes the later ledgers through Wave 19, including the final `KM-C3225E` and `KM-C870` rows.
- `affiliate-fujifilm-toner-wave2.js` contains the supplemental FUJIFILM Business Innovation family-evidence mappings.
- `affiliate-printer-detail-exclusions.js` is the explicit reviewed printer exclusion ledger.
- `affiliate-camera-accessories.js` owns Nikon Wave 1 and the dedicated coarse camera-accessory Amazon target.
- `affiliate-nikon-camera-accessories-wave2.js` extends the camera resolver with the remaining ten Nikon records and exposes the merged 14-row camera ledger.
- `affiliate-camera-detail-exclusions.js` is the reviewed camera-detail exclusion ledger and is currently empty.
- `affiliate-runtime.js` renders the generic/body search plus zero or more verified consumable or camera-accessory searches. It loads Nikon Wave 1 and Wave 2 before initial affiliate rendering so the final config is complete before cards are mounted.
- `/assets/amazon-affiliate.js` validates Amazon destinations and records only coarse analytics targets. Model names and consumable/accessory terms are not analytics parameters.
- `tests/affiliate-coverage.test.mjs` is the catalog-wide reconciliation gate for basic/detail/exclusion/missing printer coverage.
- `tests/nikon-camera-accessory-wave1.test.mjs` locks the original four-model Wave 1 boundary.
- `tests/nikon-camera-accessory-wave2.test.mjs` locks the ten Wave 2 records and 14-record Nikon completion.
- `tests/camera-accessory-coverage.test.mjs` is the catalog-wide camera reconciliation and missing-model diagnostic gate.
- `tests/camera-accessory-doc-sync.test.mjs` prevents the measured camera baseline documentation from drifting from runtime data.
- `CAMERA_ACCESSORY_COVERAGE.md` records the current measured camera baseline and remaining maker backlog.
- Maker/wave-specific tests enforce exact evidence boundaries and fail-closed behavior.

Unsupported categories, empty models, malformed URLs, wrong makers, wrong categories, nonexistent model IDs, and unreviewed compatibility mappings must fail closed. Official manual/support links always remain above the commercial block.

## Audit completion gate

The current printer phase is closed only while all of the following remain true:

- printer basic = 291
- printer detail = 284
- reviewed printer-detail exclusions = 7
- printer missing detail = 0
- the three missing-detail diagnostic structures remain empty
- every exclusion resolves to a canonical printer record and official evidence
- no empty/unknown SKU is replaced by a guessed SKU
- model-specific Amazon queries are derived only from canonical model metadata and reviewed mappings

The Nikon camera subphase is closed only while all of the following remain true:

- Nikon camera basic = 14
- Nikon camera detail = 14
- Nikon reviewed camera exclusions = 0
- Nikon camera missing accessory detail = 0
- every Nikon accessory row resolves to a canonical Nikon camera record and an official Nikon source

If the canonical catalog changes, numeric values may legitimately change, but each reconciliation invariant remains mandatory.

## Next expansion gate

The printer-detail Amazon handoff audit is no longer an open expansion target. Further printer work should be triggered by newly added canonical models, newly discovered evidence that changes an explicit exclusion, or a separately approved accessory family such as drums/maintenance parts.

Nikon camera coverage is closed. The measured camera backlog now moves to DJI 96 actionable records, followed by OM SYSTEM 37, GoPro 31, and Insta360 7, using bounded reviewed product-family waves and exact manufacturer evidence. Appliance replacement-part rules remain a separate future phase.