# ManualFinder Affiliate Coverage

Updated: 2026-09-14

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

## Decided rollout strategy

ManualFinder stays rule-driven. The target is a small number of reusable commerce rules plus manufacturer-verified compatibility mappings, not a URL ledger with hundreds or thousands of Amazon links.

Current order:

1. **Generic exact-model search** — active. One validated Amazon search template generates a tagged search URL from canonical ManualFinder `maker + model` metadata.
2. **Printer consumables** — active for Brother Wave 1 and Epson Wave 1 below. Consumable codes come only from official manufacturer compatibility sources.
3. **Camera batteries / chargers** — later, only for independently verified compatibility mappings.
4. **Appliance replacement parts / filters** — later, only where exact compatibility can be proven.
5. Additional accessory families require a clear user need and a verified mapping source.

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

The UI deliberately says `Amazonで <consumable code> インクを探す`. It does not say that every Amazon result is genuine or compatible. A note tells the user that the consumable code was checked against an official manufacturer source and that the exact Amazon item must still be confirmed before purchase.

Unmapped printer models receive only the generic exact-model Amazon search. Consumable compatibility is never guessed from model naming.

## Current fixed override

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains an end-to-end proof of SiteStripe/account behavior. It is not the normal rollout mechanism.

## Runtime boundary

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on each result card.
- `affiliate-config.js` owns the fixed tracking ID, generic model-search policy, official manufacturer compatibility mappings, and deterministic URL builders.
- `affiliate-runtime.js` renders the generic model search plus zero or more verified consumable searches.
- `/assets/amazon-affiliate.js` validates the Amazon destination host and records only coarse analytics targets. Model names and consumable terms are not analytics parameters.
- Unsupported categories, empty models, malformed URLs, and unmapped consumables fail closed.
- Official manual/support links always remain above the commercial block.

## Next expansion gate

After the Epson wave is checked in production, continue with Canon if exact model-level ManualFinder rows and official consumable mappings can be established cleanly. Existing office-printer datasets such as OKI, KYOCERA, RICOH and FUJIFILM Business Innovation may then be evaluated for toner/drum rules where official compatibility evidence is sufficiently explicit. Camera battery/charger and appliance replacement rules remain behind the printer-consumable rollout.
