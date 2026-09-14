# ManualFinder Affiliate Coverage

Updated: 2026-09-14

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

## Decided rollout strategy

ManualFinder stays rule-driven. The target is a small number of reusable commerce rules plus manufacturer-verified compatibility mappings, not a URL ledger with hundreds or thousands of Amazon links.

Current order:

1. **Generic exact-model search** — active. One validated Amazon search template generates a tagged search URL from canonical ManualFinder `maker + model` metadata.
2. **Consumer-printer ink** — active for Brother Wave 1, Epson Wave 1, and Canon Wave 1 below. Consumable codes come only from official manufacturer compatibility sources.
3. **Office-printer toner** — active for ten OKI, thirty-five of 123 KYOCERA Wave-1 canonical records, eleven RICOH, and all twenty-seven current FUJIFILM Business Innovation exact-model records. Exact toner product codes are retained where the manufacturer publishes them; otherwise an explicit official manufacturer family-level toner source is retained as compatibility evidence. The Amazon handoff stays concise at one toner-search CTA per model.
4. **Office-printer toner cross-maker expansion** — continue bounded KYOCERA / RICOH / other-maker waves only where exact official compatibility evidence is available. Current FUJIFILM BI ManualFinder records are complete.
5. **Office-printer drum / maintenance parts** — later, after toner behavior is established.
6. **Camera batteries / chargers** — later, only for independently verified compatibility mappings.
7. **Appliance replacement parts / filters** — later, only where exact compatibility can be proven.
8. Additional accessory families require a clear user need and a verified mapping source.

## Amazon tagged-search format

- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- status: `verified`
- verified: `2026-09-13`
- verification method: Amazon Link Checker
- representative proof URL: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- user-entered ManualFinder search text is never used in the Amazon destination

The same validated `s?k=...&tag=nicheworks09-22` format is used for exact-model and verified-consumable searches. No per-model SiteStripe operation is required.

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

## Printer consumable rule — Brother Wave 1

For these 13 models, compatibility was checked on official Brother product/accessory pages or the official Brother Direct Club model-supply pages. Amazon destinations are generated from the verified consumable family codes; no Amazon URL is stored per model.

| Brother model | Verified consumable search families |
| --- | --- |
| MFC-J1500N | LC3133 / LC3135 |
| MFC-J1605DN | LC3133 / LC3135 |
| MFC-J4440N | LC416 / LC416XL |
| MFC-J4443N | LC416 / LC416XL |
| MFC-J4450N | LC516 / LC516XL |
| MFC-J4510N | LC113 / LC117 + LC115 |
| MFC-J4540N | LC416 / LC416XL |
| MFC-J4543N | LC416 / LC416XL |
| MFC-J4720N | LC213 / LC217 + LC215 |
| MFC-J4725N | LC213 / LC217 + LC215 |
| MFC-J6995CDW | LC3129 |
| MFC-J6997CDW | LC3139 |
| MFC-J6999CDW | LC3139 |

## Printer consumable rule — Epson Wave 1

The Brother production pilot passed rendering and tagged-link checks. Epson is the second manufacturer. This bounded first Epson wave adds six current Colorio model records with exact official manual/support destinations and official Epson consumable evidence.

| Epson model | Verified consumable search families |
| --- | --- |
| EW-056A | MED-4CL |
| EW-456A | MED-4CL |
| EP-817A | KAK-6CL |
| EP-887AW | KNI-6CL / KNI-6CL-L |
| EP-887AB | KNI-6CL / KNI-6CL-L |
| EP-887AP | KNI-6CL / KNI-6CL-L |

## Printer consumable rule — Canon Wave 1

Canon is the third manufacturer. This bounded PIXUS wave adds six exact model identities whose Canon online-manual membership and ink families were independently verified on Canon's official Japanese sites. Shared manual pages remain explicitly marked as vendor-defined shared targets rather than being presented as unique model pages.

| Canon model | Official manual scope | Verified consumable search families |
| --- | --- | --- |
| TS8830 | TS8800 series shared official manual | BCI-331 + BCI-330 / BCI-331XL + BCI-330XL |
| TS8730 | TS8700 series shared official manual | BCI-331 + BCI-330 / BCI-331XL + BCI-330XL |
| TS7630 | direct TS7630 series official manual | BCI-331 + BCI-330 / BCI-331XL + BCI-330XL |
| TS6730 | Canon shared TS6730/TR7800/TS7700 family manual | BC-385 + BC-386 / BC-385XL + BC-386XL |
| TS3730 | TS3700 series shared official manual | BC-365 + BC-366 / BC-365XL + BC-366XL |
| XK130 | direct XK130 series official manual | XKI-N21 + XKI-N20 |

Official Canon consumable evidence comes from Canon Marketing Japan product/supply pages. The runtime searches by ink family codes; it does not copy Canon prices, availability, seller data, or ratings.

## Office-printer toner rule — OKI Waves 1–2

OKI already has deep exact model-level ManualFinder coverage, so these affiliate waves do not add or inflate manual-directory records. They add verified toner compatibility to ten existing color LED printer models. Exact OKI toner codes are retained as evidence; the user sees one concise model-specific toner search rather than separate color links.

| OKI model | Officially verified toner codes |
| --- | --- |
| C650dnw | TC-C4EK1 / TC-C4EY1 / TC-C4EM1 / TC-C4EC1 |
| C651dnw | TC-C4FK1 / TC-C4FY1 / TC-C4FM1 / TC-C4FC1 |
| C712dnw | TC-C4CK1 / TC-C4CY1 / TC-C4CM1 / TC-C4CC1 / TC-C4CK2 / TC-C4CY2 / TC-C4CM2 / TC-C4CC2 |
| C835dnw | TC-C3BK1 / TC-C3BY1 / TC-C3BM1 / TC-C3BC1 / TC-C3BK2 / TC-C3BY2 / TC-C3BM2 / TC-C3BC2 |
| C844dnw | TC-C3BK1 / TC-C3BY1 / TC-C3BM1 / TC-C3BC1 / TC-C3BK2 / TC-C3BY2 / TC-C3BM2 / TC-C3BC2 |
| C824dn | TC-C3BK1 / TC-C3BY1 / TC-C3BM1 / TC-C3BC1 |
| C835dnwt | TC-C3BK1 / TC-C3BY1 / TC-C3BM1 / TC-C3BC1 / TC-C3BK2 / TC-C3BY2 / TC-C3BM2 / TC-C3BC2 |
| C911dn | TNR-C3RK2 / TNR-C3RY2 / TNR-C3RM2 / TNR-C3RC2 |
| C931dn | TNR-C3RK2 / TNR-C3RY2 / TNR-C3RM2 / TNR-C3RC2 / TNR-C3RK1 / TNR-C3RY1 / TNR-C3RM1 / TNR-C3RC1 |
| C941dn | TNR-C3RK2 / TNR-C3RY2 / TNR-C3RM2 / TNR-C3RC2 / TNR-C3RSW2 / TNR-C3RSC2 / TNR-C3RK1 / TNR-C3RY1 / TNR-C3RM1 / TNR-C3RC1 |

The Amazon query is `OKI <model> トナー` with the fixed Associate tag. The exact toner-code list remains attached to the mapping as manufacturer evidence. C941dn's specialty white/clear toner codes are retained as evidence but do not create additional links.

## Office-printer toner rule — KYOCERA Waves 1–5

ManualFinder Wave 1 contains 123 exact KYOCERA Document Solutions canonical records, IDs 62 through 184 across `manuals.wave1.01.js`, `manuals.wave1.02.js`, and `manuals.wave1.03.js`. The first five toner waves cover 35 of those 123 records with exact manufacturer-backed toner mappings. The affiliate layer does not create any additional KYOCERA model identity.

| ManualFinder model | Amazon search maker | Officially verified toner codes |
| --- | --- | --- |
| ECOSYS P6026cdn | KYOCERA | TK-591K / TK-591C / TK-591M / TK-591Y |
| LS-C8500DN | KYOCERA | TK-881K / TK-881C / TK-881M / TK-881Y |
| FS-C5300DN | KYOCERA | TK-561K / TK-561Y / TK-561M / TK-561C |
| FS-C5200DN | KYOCERA | TK-551K / TK-551C / TK-551M / TK-551Y |
| LS-C8026N | KYOCERA | TK-811K / TK-811Y / TK-811M / TK-811C |
| LS-C8100DN | KYOCERA | TK-821K / TK-821Y / TK-821M / TK-821C |
| LS-C8008N | KYOCERA | TK-801K / TK-801Y / TK-801M / TK-801C |
| LS-C8008DN | KYOCERA | TK-801K / TK-801Y / TK-801M / TK-801C |
| LS-C5030N | KYOCERA | TK-511K / TK-511Y / TK-511M / TK-511C |
| LS-C5016N | KYOCERA | TK-501K / TK-501Y / TK-501M / TK-501C |
| LS-9520DN | KYOCERA | TK-76 |
| LS-6970DN | KYOCERA | TK-451 |
| LS-6950DN | KYOCERA | TK-441 |
| LS-6820N | KYOCERA | TK-21 |
| LS-6800 | KYOCERA | TK-20H |
| LS-6020 | KYOCERA | TK-401 |
| LS-4020DN | KYOCERA | TK-361 |
| LS-3900DN | KYOCERA | TK-331 |
| LS-3830N | KYOCERA | TK-66 |
| LS-2020D | KYOCERA | TK-341 |
| LS-2000D | KYOCERA | TK-311 |
| LS-1820 | KYOCERA | TK-66 |
| FS-1370DN | KYOCERA | TK-131 |
| FS-1300D | KYOCERA | TK-131 |
| FS-1010 | KYOCERA | TK-17 |
| FS-920 | KYOCERA | TK-111 |
| TASKalfa 2550ci | KYOCERA | TK-8316C / TK-8316M / TK-8316Y / TK-8316K |
| TASKalfa 3050ci | KYOCERA | TK-8306C / TK-8306M / TK-8306Y / TK-8306K |
| TASKalfa 3550ci | KYOCERA | TK-8306C / TK-8306M / TK-8306Y / TK-8306K |
| TASKalfa 4550ci | KYOCERA | TK-8506C / TK-8506M / TK-8506Y / TK-8506K |
| TASKalfa 5550ci | KYOCERA | TK-8506C / TK-8506M / TK-8506Y / TK-8506K |
| TASKalfa 6550ci | KYOCERA | TK-8706C / TK-8706M / TK-8706Y / TK-8706K |
| TASKalfa 7550ci | KYOCERA | TK-8706C / TK-8706M / TK-8706Y / TK-8706K |
| ECOSYS M6526cidn | KYOCERA | TK-591K / TK-591Y / TK-591M / TK-591C |
| ECOSYS M6526cdn | KYOCERA | TK-591K / TK-591Y / TK-591M / TK-591C |

Wave 3 adds eleven existing canonical mono-printer records from `manuals.wave1.02.js`: `LS-6970DN`, `LS-6950DN`, `LS-6820N`, `LS-6800`, `LS-4020DN`, `LS-3900DN`, `LS-2020D`, `LS-2000D`, `FS-1370DN`, `FS-1300D`, and `FS-1010`. Wave 4 adds the remaining four exact old mono-printer records from that contiguous canonical block: `LS-6020`, `LS-3830N`, `LS-1820`, and `FS-920`. Wave 5 adds nine existing canonical records with direct manufacturer evidence: `TASKalfa 2550ci`, `TASKalfa 3050ci`, `TASKalfa 3550ci`, `TASKalfa 4550ci`, `TASKalfa 5550ci`, `TASKalfa 6550ci`, `TASKalfa 7550ci`, `ECOSYS M6526cidn`, and `ECOSYS M6526cdn`. Current verified toner coverage is therefore **35/123 KYOCERA canonical records**. The remaining 88 records stay fail-closed for toner until an explicit official compatibility source is verified for each bounded wave.

The runtime matches the canonical maker string `KYOCERA Document Solutions` but deliberately uses the shorter retail search term `KYOCERA` in Amazon queries. The generated handoff is `KYOCERA <model> トナー` with the fixed Associate tag. Exact toner codes remain attached as manufacturer evidence and do not create separate color links. Manufacturer price information is not copied into the affiliate layer.

## Office-printer toner rule — RICOH Waves 1–2

RICOH already has exact current color-MFP records in ManualFinder. The first two bounded RICOH waves use eleven existing model records and only mappings explicitly stated by Ricoh's official maintenance pages. Some current machine names intentionally use a toner identifier from an earlier compatible family; those relationships are stored exactly as Ricoh states them rather than inferred from model-number similarity.

| ManualFinder model | Official toner identifiers |
| --- | --- |
| RICOH IM C8010 | RICOH MP toner C8003 (K/Y/M/C) |
| RICOH IM C6510 | RICOH MP toner C8003 (K/Y/M/C) |
| RICOH IM C7010 | RICOH toner IM C7010 (K/Y/M/C) |
| RICOH IM C6011 | RICOH toner IM C6010 (K/Y/M/C) |
| RICOH IM C3511 | RICOH toner IM C3510 (K/Y/M/C) |
| RICOH IM C5511 | RICOH toner IM C6010 (K/Y/M/C) |
| RICOH IM C4511 | RICOH toner IM C6010 (K/Y/M/C) |
| RICOH IM C3011 | RICOH toner IM C3510 (K/Y/M/C) |
| RICOH IM C2511 | RICOH toner IM C2510 (K/Y/M/C) |
| RICOH IM C320F | RICOH P toner IM C320 (K/Y/M/C) |
| RICOH IM C2011 | RICOH toner kit IM C2010 (K/Y/M/C) |

Wave 2 activates only `RICOH IM C5511`, `RICOH IM C4511`, `RICOH IM C3011`, `RICOH IM C2511`, `RICOH IM C320F`, and `RICOH IM C2011`, all of which already exist as canonical ManualFinder records. `RICOH IM C431` and other current RICOH records remain fail-closed until an equally explicit official toner mapping is verified.

The canonical model strings already begin with `RICOH`, so each row carries a separate retail `searchModel` to avoid generating a duplicated query such as `RICOH RICOH IM C8010`. The Amazon handoff becomes `RICOH IM C8010 トナー` while exact manufacturer toner identifiers remain attached as evidence. No separate color links are emitted and no Ricoh price information is copied.

## Office-printer toner rule — FUJIFILM Business Innovation Wave 1

The first FUJIFILM Business Innovation toner wave reuses seven existing exact ApeosPort-VII color-MFP records. FUJIFILM's official shared user guide explicitly lists the toner cartridge product codes for the whole C7773/C6673/C5573/C4473/C3373/C3372/C2273 family, so the same verified four-code set is attached to each existing model record.

| ManualFinder model | Official toner product codes |
| --- | --- |
| ApeosPort-VII C7773 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C6673 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C5573 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C4473 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C3373 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C3372 | CT203138 / CT203139 / CT203140 / CT203141 |
| ApeosPort-VII C2273 | CT203138 / CT203139 / CT203140 / CT203141 |

The Amazon query uses the shorter retail maker token `FUJIFILM`, for example `FUJIFILM ApeosPort-VII C7773 トナー`, while matching still uses the canonical ManualFinder maker `FUJIFILM Business Innovation`. The exact CT product codes remain evidence only; the card shows one toner-search CTA rather than four color-specific links.

## Office-printer toner rule — FUJIFILM Business Innovation family-evidence completion

The remaining twenty current FUJIFILM Business Innovation ManualFinder records are backed by explicit official family-level toner evidence. Seventeen records use official SDS family pages that name the relevant toner category. Apeos 3061 / 2561 / 2061 uses the exact official product-family feature page, which explicitly describes newly developed toner for the Apeos 3061 series. The affiliate layer activates only models that already exist in ManualFinder. Models appearing on an official family page but absent from ManualFinder, such as Apeos C3071 and Apeos C3067, remain fail-closed.

| ManualFinder family records | Manufacturer toner evidence |
| --- | --- |
| Apeos C7071 / C6571 / C5571 / C4571 / C3571 / C2571 | official family SDS: black / yellow / magenta / cyan toner |
| Apeos 7580 / 6580 / 5580 | official family SDS: black toner |
| Apeos C3061 / C2561 / C2061 | official family SDS: black / yellow / magenta / cyan toner |
| Apeos 3060 / 2560 / 1860 | official family SDS: black toner |
| Apeos 4570 / 3570 | official family SDS: black toner |
| Apeos 3061 / 2561 / 2061 | official exact-family product page: newly developed toner for the Apeos 3061 series |

FUJIFILM's SDS document identifiers are not retail toner product codes, so SDS-backed mappings do **not** place those identifiers in `tonerCodes`. The Apeos 3061 / 2561 / 2061 rows likewise do not invent a retail toner code from product-page prose. SDS rows store `evidenceKind: official_family_toner_sds`; the 3061 family stores `evidenceKind: official_family_toner_product_page`. The Amazon handoff remains deterministic, for example `FUJIFILM Apeos 7580 トナー`, and does not claim that every Amazon result is compatible.

Together with Wave 1, all twenty-seven FUJIFILM Business Innovation exact model records currently present in ManualFinder now have a bounded toner handoff backed by manufacturer evidence. No extra model is created by the affiliate layer.

The UI tells the user that toner compatibility was checked against an official manufacturer source and that the exact Amazon item and supported model must still be confirmed before purchase.

Unmapped printer models receive only the generic exact-model Amazon search. Consumable compatibility is never guessed from model naming.

## Current fixed override

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains an end-to-end proof of SiteStripe/account behavior. It is not the normal rollout mechanism.

## Runtime boundary

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on each result card.
- `affiliate-config.js` owns the fixed tracking ID, generic model-search policy, and consumer-printer compatibility mappings.
- `affiliate-office-consumables.js` extends the same fail-closed contract with verified cross-maker office-printer toner mappings without duplicating the main config.
- `affiliate-kyocera-toner-wave3.js` appends the eleven Wave 3 KYOCERA mappings to the same office-consumables contract and is idempotent if loaded twice.
- `affiliate-kyocera-toner-wave4.js` is the KYOCERA supplemental bundle for Waves 4–5: it preserves the four Wave 4 legacy mono-printer mappings, exposes a separate nine-row Wave 5 ledger, composes all thirteen supplemental rows, and remains idempotent if loaded twice.
- `affiliate-fujifilm-toner-wave2.js` contains all twenty non-Wave-1 FUJIFILM BI records backed by explicit family-level toner evidence: seventeen SDS-backed records plus three product-page-backed Apeos 3061-family records. SDS document identifiers are never treated as toner product codes.
- `affiliate-runtime.js` renders the generic model search plus zero or more verified consumable searches.
- `/assets/amazon-affiliate.js` validates the Amazon destination host and records only coarse analytics targets. Model names and consumable terms are not analytics parameters.
- Unsupported categories, empty models, malformed URLs, and unmapped consumables fail closed.
- Official manual/support links always remain above the commercial block.

## Next expansion gate

FUJIFILM Business Innovation is complete for the twenty-seven exact records currently present in ManualFinder. KYOCERA currently has **35/123** Wave-1 canonical records with verified toner mappings, leaving 88 fail-closed for toner; KYOCERA remains a primary expansion target. RICOH has eleven exact toner mappings across Waves 1–2. Continue bounded KYOCERA, RICOH, or other office-printer waves only where an official maintenance/specification page binds the toner identifier to an existing canonical model. Drum and maintenance-part links remain a later rule so result cards do not become link-heavy. Camera battery/charger and appliance replacement rules remain behind the printer-consumable rollout.