# ManualFinder Coverage Inventory

Status date: 2026-09-14

This file is the cross-maker coverage authority for ManualFinder expansion work. It exists to prevent a single easy-to-crawl manufacturer from consuming the roadmap while major brands remain generic support links only.

## Coverage rules

- `generic-only` means ManualFinder has a curated official manufacturer manual/support entrance but no accepted verified model-level rows for that baseline brand.
- `expanded` means at least one accepted verified model-level batch exists. It does **not** mean the manufacturer is complete.
- Model-level rows must continue to satisfy `SPEC.md`: official manufacturer sources only, real model/product identifiers, deepest confirmed official destination available, no guessed URLs, and explicit shared-target state when the vendor groups products.
- A large row count is not a completion claim. Archive boundaries and unresolved shared/multi-manual cases must remain explicit.
- No manufacturer may receive more than two consecutive expansion waves while another P0 manufacturer remains `generic-only`, except for closing a residual of 25 rows or fewer.
- Seiko is paused after Wave 2AR. New Seiko work is not P0 while the major generic-only brands below have no model-level wave.

## Current verified model-level inventory

With deployed Wave 3A / 3B / 3D / 3E, the accepted dataset contains **1,516 verified model/caliber rows**. **1,073 are outside Seiko**. Wave 3C Sony remains outside the deployed dataset and is not counted here.

| Maker / dataset identity | Verified rows | Current state | Notes |
| --- | ---: | --- | --- |
| Seiko | 443 | deep, paused | Direct-primary pass plus first safe shared groups through Wave 2AR. Not globally complete. |
| Roland | 340 | deep | N-S direct-manual archive residual was closed conservatively; shared/non-primary cases remain separate. |
| T-fal | 159 | expanded | Exact product-number rows from official instruction sources; many vendor-defined shared manuals. |
| KYOCERA Document Solutions | 123 | expanded | Printer/MFP model rows from official manual pages. |
| DJI | 107 | expanded | Product-level official download/support destinations. |
| OKI | 77 | expanded | Printer/MFP model-level official manual destinations. |
| RICOH | 39 | expanded | Office MFP/wide-MFP model-level official product/manual destinations. |
| OM SYSTEM | 37 | expanded | Camera/TG model-specific official manuals. |
| Haier | 34 | expanded | Refrigerator/washing/freezer model pages that expose official manuals. |
| Aterm | 31 | expanded | Router/mobile-router model-specific official manuals. |
| GoPro | 31 | expanded | Camera model/product-specific official destinations. |
| FUJIFILM Business Innovation | 27 | expanded | Vendor-defined grouped MFP manual pages. |
| CASIO | 20 | expanded | G-SHOCK / EX-word / NAME LAND / keyboard model support. |
| Nikon | 14 | expanded | Wave 3A covers all 14 mirrorless-camera models explicitly listed in Nikon's current Japanese Web-manual portal mirrorless section. Company-wide coverage is not complete. |
| Brother | 13 | expanded | Wave 3B covers 13 exact MFC-J model manual pages from the first bounded search-result block; one targeted model remains held. |
| Insta360 | 7 | expanded | Product-specific official online manuals. |
| Epson | 6 | expanded | Wave 3D first Colorio batch; exact official manual/support targets with verified consumable mappings. |
| Canon | 6 | expanded | Wave 3E first PIXUS batch; direct or vendor-shared official online manuals with verified consumable mappings. |
| Hisense | 2 | expanded | Exact TV function-manual targets; coverage is still very thin. |
| **Total** | **1,516** |  |  |

Counts above are accepted repository rows, not estimates of manufacturer catalog size.

## Curated baseline: all 66 brands

`manuals.json` currently supplies 66 generic manufacturer entrances. The model-level status below is intentionally conservative: a related company/division does not automatically count as coverage for another product division.

| # | Baseline brand | Model-level state | Next action |
| ---: | --- | --- | --- |
| 1 | Apple | generic-only | PC/mobile queue |
| 2 | Sony | generic-only | **P0 — Wave 3C branch remains outside deployed dataset; phase by product category** |
| 3 | Panasonic | generic-only | **P0 — phase by product category** |
| 4 | Canon | **expanded — 6** | First PIXUS batch covered in Wave 3E; broader Canon remains incomplete |
| 5 | Nikon | **expanded — 14** | Mirrorless Web-manual section covered in Wave 3A; rotate away |
| 6 | Fujifilm | generic-only | Camera division must be handled separately from FUJIFILM Business Innovation |
| 7 | Brother | **expanded — 13** | First bounded MFC-J batch covered in Wave 3B; MFC-J6990CDW held; rotate away |
| 8 | Epson | **expanded — 6** | First bounded Colorio batch covered in Wave 3D; broader Epson remains incomplete |
| 9 | HP | generic-only | PC/mobile queue |
| 10 | Dell | generic-only | PC/mobile queue |
| 11 | Lenovo | generic-only | PC/mobile queue |
| 12 | ASUS | generic-only | PC/mobile queue |
| 13 | Acer | generic-only | PC/mobile queue |
| 14 | MSI | generic-only | PC/mobile queue |
| 15 | VAIO | generic-only | PC/mobile queue |
| 16 | dynabook | generic-only | PC/mobile queue |
| 17 | NEC LAVIE | generic-only | PC/mobile queue |
| 18 | Fujitsu FMV | generic-only | PC/mobile queue |
| 19 | Google Pixel | generic-only | Mobile queue; verify whether stable per-device manual targets exist |
| 20 | Samsung Mobile | generic-only | Mobile queue; verify regional/per-device target stability |
| 21 | Huawei | generic-only | Mobile queue |
| 22 | Xiaomi | generic-only | Mobile queue |
| 23 | OPPO | generic-only | Mobile queue |
| 24 | OnePlus | generic-only | Mobile queue |
| 25 | Motorola | generic-only | Mobile queue |
| 26 | Dyson | generic-only | P1 household appliance queue |
| 27 | iRobot | generic-only | P1 household appliance queue |
| 28 | Sharp | generic-only | P1 Japan appliance queue |
| 29 | Hitachi | generic-only | P1 Japan appliance queue |
| 30 | Mitsubishi Electric | generic-only | P1 Japan appliance queue |
| 31 | Toshiba Lifestyle | generic-only | P1 Japan appliance queue |
| 32 | LG Electronics | generic-only | P1 appliance/AV queue |
| 33 | Philips | generic-only | P1 appliance queue |
| 34 | Bosch | generic-only | P1 appliance queue |
| 35 | Miele | generic-only | P1 appliance queue |
| 36 | Electrolux | generic-only | P1 appliance queue |
| 37 | T-fal | **expanded — 159** | Rotate away; revisit after P0 generic-only brands |
| 38 | DeLonghi | generic-only | P1 kitchen appliance queue |
| 39 | Nespresso | generic-only | P1 kitchen appliance queue |
| 40 | Yamaha Audio | generic-only | P1 audio queue |
| 41 | Pioneer | generic-only | P1 audio queue |
| 42 | Denon | generic-only | P1 audio queue |
| 43 | Marantz | generic-only | P1 audio queue |
| 44 | Bose | generic-only | P1 audio queue |
| 45 | JBL | generic-only | P1 audio queue |
| 46 | Sennheiser | generic-only | P1 audio queue |
| 47 | Audio-Technica | generic-only | P1 audio queue |
| 48 | Shure | generic-only | P1 audio queue |
| 49 | Nintendo | generic-only | P1 game queue; manuals may be product-family rather than hardware-model scoped |
| 50 | PlayStation | generic-only | P1 game queue |
| 51 | GoPro | **expanded — 31** | Revisit after P0 generic-only brands |
| 52 | DJI | **expanded — 107** | Revisit after P0 generic-only brands |
| 53 | OM SYSTEM | **expanded — 37** | Revisit after P0 generic-only brands |
| 54 | RICOH / PENTAX | generic-only | Camera division is not satisfied by RICOH office-MFP coverage |
| 55 | Ricoh Office | **expanded — 39** | Revisit after P0 generic-only brands |
| 56 | Kyocera Document | **expanded — 123** | Revisit after P0 generic-only brands |
| 57 | Zebra | generic-only | P1 printer/label queue |
| 58 | TP-Link | generic-only | P1 network queue |
| 59 | NETGEAR | generic-only | P1 network queue |
| 60 | Ubiquiti | generic-only | P1 network queue |
| 61 | Western Digital | generic-only | P1 storage queue |
| 62 | Seagate | generic-only | P1 storage queue |
| 63 | Anker | generic-only | P1 accessory/power queue |
| 64 | Belkin | generic-only | P1 accessory/network queue |
| 65 | Bambu Lab | generic-only | P1 3D-printer queue |
| 66 | Creality | generic-only | P1 3D-printer queue |

Result after deployed Wave 3E: **56 of the 66 baseline brands are still generic-only**. The previous deep Seiko/Roland work therefore must not be treated as evidence that ManualFinder's manufacturer coverage is broadly mature.

## P0 source audit and order

The first rotation is based on source structure, user usefulness, and the ability to preserve exact official targets without URL guessing.

| Order | Maker | Official source structure observed 2026-09-13/14 | Decision |
| ---: | --- | --- | --- |
| 1 | Nikon | Nikon's Web manual portal enumerates product families and individual camera manuals. The mirrorless section explicitly lists 14 camera models. | **Wave 3A implemented:** 14 searchable rows, 12 unique primary Web-manual targets, including vendor-shared Z7II/Z6II and Z7/Z6 pages. |
| 2 | Brother | Official product search reports 96 MFC-J products. Wave 3B bounded the first search-result block to the 14 single-model results before the first grouped result. | **Wave 3B implemented:** 13 exact model manual pages accepted; MFC-J6990CDW held because its direct manual target was not confirmed in this pass. |
| 3 | Sony | Official manuals are highly structured but enormous: camera/camcorder alone reports 1,094 product names; interchangeable-lens camera body page reports 166. | **Wave 3C remains pending outside deployed dataset.** Never attempt all-Sony in one pass; phase by category. |
| 4 | Epson | Official support/manual system exposes model/category manuals and downloadable official pages. | **Wave 3D implemented:** six current Colorio models with direct official targets. |
| 5 | Canon | Official manual selector is structured by product group, series and model across camera, printer, scanner and business lines. | **Wave 3E implemented:** six PIXUS models, preserving Canon-defined shared manual groups where applicable. |
| 6 | Panasonic | Official manual search supports exact part-number lookup across a very broad appliance/AV catalog. | Next cross-maker P0 model-coverage phase; do not scrape the entire catalog as one wave. |

Primary official entry points used for this audit:

- Nikon Web manuals: `https://onlinemanual.nikonimglib.com/portal/ja/`
- Sony manuals: `https://support.sony.jp/electronics/support/manuals`
- Brother product manuals: `https://support.brother.co.jp/j/b/productsearch.aspx?c=jp&content=ml&lang=ja`
- Epson support: `https://www.epson.jp/support/`
- Canon manuals: `https://canon.jp/support/manual`
- Panasonic manuals: `https://panasonic.jp/support/manual.html`

## Wave rotation contract

Current deployed state:

1. **Wave 3A — Nikon:** implemented for the complete current mirrorless-camera Web-manual section; Nikon remains only `expanded`, not company-complete.
2. **Wave 3B — Brother:** implemented for a bounded first MFC-J block; Brother remains only `expanded`, not company-complete.
3. **Wave 3C — Sony:** pending outside the deployed dataset; retain its bounded-category requirement before merge.
4. **Wave 3D — Epson:** implemented for six exact current Colorio models selected for clean manual and consumable evidence.
5. **Wave 3E — Canon:** implemented for six PIXUS models; direct and vendor-shared manual targets are distinguished explicitly.
6. **Next cross-maker coverage wave — Panasonic:** one bounded product category, unless Wave 3C Sony is closed first.
7. Re-evaluate counts and gaps before any second model-coverage wave for Nikon/Brother/Epson/Canon.

Affiliate expansion has a separate priority queue and may evaluate already-deep office-printer datasets for verified toner/drum mappings without claiming new model coverage.

Seiko and Roland are excluded from this first rotation unless a correctness bug is found in already-published records.

## Completion criteria for a manufacturer

A manufacturer may be marked `coverage-pass-complete` only when all of the following are documented:

- the official manual/support index boundary used for the pass;
- accepted model/product count;
- held/unresolved count and reason classes;
- direct vs vendor-shared target treatment;
- duplicate check across existing waves;
- no generic-only fallback was promoted as if it were a model-specific manual;
- a future refresh path is identified.

Until then, `expanded` means only that useful verified model-level coverage exists.
