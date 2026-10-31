# ManualFinder Coverage Inventory

Status date: 2026-10-31

This file is the cross-maker coverage authority for ManualFinder expansion work. It exists to prevent a single easy-to-crawl manufacturer from consuming the roadmap while major brands remain generic support links only.

All future model-level expansion must follow `COVERAGE_PASS_WORKFLOW.md`. Script discovery is candidate collection only; completion requires an explicitly locked official population, positive official evidence for published rows, negative escalation for unresolved rows, and exact reconciliation of every population member.

## Coverage rules

- `generic-only` means ManualFinder has a curated official manufacturer manual/support entrance but no accepted verified model-level rows for that baseline brand.
- `expanded` means at least one accepted verified model-level batch exists. It does **not** mean the manufacturer is complete.
- Model-level rows must continue to satisfy `SPEC.md`: official manufacturer sources only, real model/product identifiers, deepest confirmed official destination available, no guessed URLs, and explicit shared-target state when the vendor groups products.
- A large row count is not a completion claim. Archive boundaries and unresolved shared/multi-manual cases must remain explicit.
- No manufacturer may receive more than two consecutive expansion waves while another P0 manufacturer remains `generic-only`, except for closing a residual of 25 rows or fewer.
- Seiko is paused after Wave 2AR. New Seiko work is not P0 while the major generic-only brands below have no model-level wave.

## Current verified model-level inventory

With the completed Sony JP α E-mount, Panasonic JP LUMIX, Apple iPhone, Fujifilm GFX/X, VAIO JP start-guide PCs, Samsung JP Galaxy smartphones, dynabook JP 2024–2026 PCs, Fujitsu FMWORLD LIFEBOOK U business PCs, Google Pixel JP model-specific safety/support documentation, Motorola JP current smartphone lineup, and ASUS JP Vivobook series, the accepted dataset contains **2,317 verified model/caliber rows**. **1,874 are outside Seiko**. Coverage-Pass publication contributes **801 reviewed rows across eleven bounded manufacturer scopes**. ASUS JP contributes 35 exact manufacturer-model guide indexes with visibly selected configuration SKUs; no ASUS company-wide coverage is implied.

| Maker / dataset identity | Verified rows | Current state | Notes |
| --- | ---: | --- | --- |
| Seiko | 443 | deep, paused | Direct-primary pass plus first safe shared groups through Wave 2AR. Not globally complete. |
| Roland | 340 | deep | N-S direct-manual archive residual was closed conservatively; shared/non-primary cases remain separate. |
| T-fal | 159 | expanded | Exact product-number rows from official instruction sources; many vendor-defined shared manuals. |
| KYOCERA Document Solutions | 123 | expanded | Printer/MFP model rows from official manual pages. |
| DJI | 107 | expanded | Product-level official download/support destinations. |
| Sony | 107 | expanded, scope-complete | JP α E-mount body coverage pass is complete and published: 104 direct manual/help destinations + 3 exact JP support-only destinations. Sony company-wide coverage remains incomplete. |
| Apple | 31 | expanded, scope-complete | Bounded iPhone User Guide model scope is complete and published: 31 exact models share Apple's manufacturer-defined Japanese iPhone User Guide, with exact model Manuals and Downloads pages retained separately. Apple company-wide coverage remains incomplete. |
| Fujifilm | 56 | expanded, scope-complete | JP GFX + X-series camera-manual-index scope is complete and published: 52 direct manual destinations + 4 explicit shared official manual-index targets. FinePix and broader Fujifilm coverage remain incomplete. |
| Panasonic | 27 | expanded, scope-complete | JP LUMIX S/G/compact camera-body sitemap scope is complete and published: 27 direct official manual/support destinations. Panasonic company-wide coverage remains incomplete. |
| Samsung Mobile | 89 | expanded, scope-complete | Samsung Japan Galaxy smartphone manuals index: five smartphone tables A/S/Note/Fold-Flip/other = 89 models; 85 direct manufacturer model-specific manual-download sections + 4 exact manufacturer support-only + 0 held. One labelled official carrier SKU per model; carrier variants are not assumed interchangeable. Broader Samsung remains incomplete. |
| Google Pixel | 38 | expanded, support-scope-complete | Google Japan Pixel phone release table 2016–2026: 33 source rows expanded to 38 exact marketed models. Manufacturer official safety/regulatory index explicitly maps these to 24 verified model-named support documents. 0 direct, 0 shared, 38 support_only, 0 held. These documents are **not operational user manuals**; company-wide and operating-manual completeness are not claimed. |
| ASUS | 35 | expanded, scope-complete | Japanese manufacturer Vivobook product category: 35 complete product records in official API 20+15, with 35 direct exact selected-variant ASUS HTML manual indexes containing verified user manual metadata. 34 have Japanese manuals; X1605EA verified English-only. Not entire ASUS line. |
| Motorola | 11 | expanded, scope-reviewed | Japan current 12-phone lineup reconciled: 11 direct exact operating HTML guides published; one Japanese `moto g37j` held (vendor JP exact guide HTTP 403 in CI; global `moto g37` was rejected). Not full Motorola catalog. |
| Fujitsu FMV | 148 | expanded, scope-complete | Manufacturer FMWORLD JP business LIFEBOOK U-series only: exact 148 model-specific manual pages, each with positively verified official manual PDF evidence. 78 distinct official PDF endpoints validated. Business LIFEBOOK A/E/other families and consumer FMV are not complete. |
| dynabook | 177 | expanded, scope-complete | 2024–2026 annual Japanese PC manual index: 178 manufacturer source rows reconcile to 177 canonical PC identities (B86/PA repeated announcement). 16 direct and 161 explicitly manufacturer-shared official PDF manuals, 0 support-only, 0 held. All 53 distinct PDF endpoints returned verified PDF signatures. Earlier announced PC products remain out of scope. |
| VAIO | 82 | expanded, scope-complete | JP official start-guide index: 47 personal + 35 business PCs = 21 exact HTML manuals + 61 exact model support-only + 0 held. PDFs are listed by VAIO but returned HTTP 403 in CI and were not promoted; broader VAIO catalog remains incomplete. |
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
| **Total** | **2,317** |  |  |

Counts above are accepted repository rows, not estimates of manufacturer catalog size.

## Curated baseline: all 66 brands

`manuals.json` currently supplies 66 generic manufacturer entrances. The model-level status below is intentionally conservative: a related company/division does not automatically count as coverage for another product division.

| # | Baseline brand | Model-level state | Next action |
| ---: | --- | --- | --- |
| 1 | Apple | **expanded — 31** | iPhone User Guide bounded scope is published and coverage-pass-complete at 31 shared manual rows + exact model support pages; broader Apple remains incomplete |
| 2 | Sony | **expanded — 107** | JP α E-mount scope is published and coverage-pass-complete at 104 direct + 3 support-only + 0 held; broader Sony categories remain incomplete |
| 3 | Panasonic | **expanded — 27** | JP LUMIX S/G/compact camera-body sitemap scope is published and coverage-pass-complete at 27 direct + 0 support-only + 0 held; broader Panasonic categories remain incomplete |
| 4 | Canon | **expanded — 6** | First PIXUS batch covered in Wave 3E; broader Canon remains incomplete |
| 5 | Nikon | **expanded — 14** | Mirrorless Web-manual section covered in Wave 3A; rotate away |
| 6 | Fujifilm | **expanded — 56** | JP GFX + X-series camera-manual-index scope is published and coverage-pass-complete at 52 direct + 4 shared + 0 held; FinePix and broader Fujifilm remain incomplete |
| 7 | Brother | **expanded — 13** | First bounded MFC-J batch covered in Wave 3B; MFC-J6990CDW held; rotate away |
| 8 | Epson | **expanded — 6** | First bounded Colorio batch covered in Wave 3D; broader Epson remains incomplete |
| 9 | HP | generic-only | PC/mobile queue |
| 10 | Dell | generic-only | PC/mobile queue |
| 11 | Lenovo | generic-only | PC/mobile queue |
| 12 | ASUS | **expanded — 35** | Manufacturer JP Vivobook category 35 products (API 20+15); 35 verified model-specific manual indexes, 0 held. Selected variant disclosed on each row. Other ASUS families not complete. |
| 13 | Acer | generic-only | PC/mobile queue |
| 14 | MSI | generic-only | PC/mobile queue |
| 15 | VAIO | **expanded — 82** | JP start-guide table scope complete: 21 direct HTML user guides + 61 exact support-only + 0 held; broader VAIO remains incomplete |
| 16 | dynabook | **expanded — 177** | JP 2024–2026 announced PC manual index scope-complete: 16 direct + 161 vendor-defined shared PDFs, zero held. Older years remain incomplete. |
| 17 | NEC LAVIE | generic-only | PC/mobile queue |
| 18 | Fujitsu FMV | **expanded — 148** | JP business LIFEBOOK U manual-index 148/148 direct, 0 held; other Fujitsu/FMV product scopes incomplete |
| 19 | Google Pixel | **expanded — 38** | Exact manufacturer model-specific safety/regulatory support-only records. 38/38 scope complete; operational user-guide coverage remains pending. |
| 20 | Samsung Mobile | **expanded — 89** | Samsung JP five smartphone tables scope-complete: 85 exact model-specific manual indexes + 4 manufacturer support-only; not Samsung-wide |
| 21 | Huawei | generic-only | Mobile queue |
| 22 | Xiaomi | generic-only | Mobile queue |
| 23 | OPPO | generic-only | Mobile queue |
| 24 | OnePlus | generic-only | Mobile queue |
| 25 | Motorola | **expanded — 11** | Motorola JP 12 currently listed phones: 11 exact operational HTML manuals published; moto g37j held following official Japanese guide HTTP 403 and non-exact global g37 guide. |
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

Result after the Sony JP α E-mount, Panasonic JP LUMIX, Apple iPhone, and Fujifilm GFX/X publications: **45 of the 66 baseline brands are still generic-only**. The previous deep Seiko/Roland work therefore must not be treated as evidence that ManualFinder's manufacturer coverage is broadly mature.

## P0 source audit and order

The first rotation is based on source structure, user usefulness, and the ability to preserve exact official targets without URL guessing.

| Order | Maker | Official source structure observed 2026-09-13/14 | Decision |
| ---: | --- | --- | --- |
| 1 | Nikon | Nikon's Web manual portal enumerates product families and individual camera manuals. The mirrorless section explicitly lists 14 camera models. | **Wave 3A implemented:** 14 searchable rows, 12 unique primary Web-manual targets, including vendor-shared Z7II/Z6II and Z7/Z6 pages. |
| 2 | Brother | Official product search reports 96 MFC-J products. Wave 3B bounded the first search-result block to the 14 single-model results before the first grouped result. | **Wave 3B implemented:** 13 exact model manual pages accepted; MFC-J6990CDW held because its direct manual target was not confirmed in this pass. |
| 3 | Sony | Official manuals are highly structured but enormous: camera/camcorder reports more than one thousand product names, while the current Japanese α manual index separates A-mount and E-mount bodies. | **JP α E-mount coverage pass complete and published:** 107 official models = 104 direct + 3 support-only + 0 held. The live runner initially found 103 direct + 4 support-only; secondary official discovery upgraded ILCE-5000 to a Japanese Sony Help Guide and confirmed why ILCE-3000, NEX-3N, and NEX-F3 remain JP support-only. Broader Sony remains future work. |
| 4 | Epson | Official support/manual system exposes model/category manuals and downloadable official pages. | **Wave 3D implemented:** six current Colorio models with direct official targets. |
| 5 | Canon | Official manual selector is structured by product group, series and model across camera, printer, scanner and business lines. | **Wave 3E implemented:** six PIXUS models, preserving Canon-defined shared manual groups where applicable. |
| 6 | Panasonic | Official manual search spans a very broad appliance/AV catalog. The LUMIX sitemap provides a bounded camera-body population under S-series, G-series, and compact-camera headings. | **Coverage pass complete and published for the sitemap camera-body scope:** 27 official identities = 27 direct + 0 support-only + 0 held. The live runner confirmed 26 direct product-support/manual pages; secondary official discovery resolved DC-G100D to Panasonic's exact PDF manual. Broader Panasonic remains future work. |

### Fujifilm GFX/X coverage-pass pilot

FUJIFILM Japan's official camera 使用説明書 page explicitly enumerates 56 exact camera models across the GFX and X-series sections: 9 GFX, 32 X-series mirrorless, and 15 X-series fixed-lens models. That population is coverage-pass-complete and published: **56 = 52 direct + 4 shared + 0 support-only + 0 held**. The live runner accepted 50 direct detail pages and escalated six structural exceptions. Secondary official discovery found the exact GFX 50S II manual-detail page and Japanese X-E2 PDF; GFX 50S, GFX 50R, X-S20, and X half remain explicit shared targets at FUJIFILM's manufacturer-defined Japanese camera manual index rather than guessed deep URLs. FinePix, lenses, accessories, and software remain outside this pass.

### Apple iPhone coverage-pass pilot

Apple's current Japanese iPhone User Guide explicitly enumerates a bounded 31-model set from iPhone 11 through iPhone 17e, including iPhone Air and iPhone SE (2nd/3rd generation). That population is coverage-pass-complete and published: **31 = 0 direct + 31 shared + 0 support-only + 0 held**. The first live model-doc review found 31 exact Apple model pages but no accepted per-model manual artifact on those JP pages; secondary discovery confirmed that Apple itself enumerates all 31 inside the shared Japanese iPhone User Guide. Older iPhones, accessories, and iOS software entries remain outside this pass.

Primary official entry points used for this audit:

- Nikon Web manuals: `https://onlinemanual.nikonimglib.com/portal/ja/`
- Sony manuals: `https://support.sony.jp/electronics/support/manuals`
- Brother product manuals: `https://support.brother.co.jp/j/b/productsearch.aspx?c=jp&content=ml&lang=ja`
- Epson support: `https://www.epson.jp/support/`
- Canon manuals: `https://canon.jp/support/manual`
- Panasonic manuals: `https://panasonic.jp/support/manual.html`
- Apple iPhone manuals: `https://support.apple.com/ja-jp/docs/iphone`
- Apple iPhone User Guide: `https://support.apple.com/ja-jp/guide/iphone/welcome/ios`
- Fujifilm camera manuals: `https://www.fujifilm-x.com/ja-jp/support/manual/cameras/`

### VAIO JP PC start-guide coverage pass

VAIO Corporation's Japanese official start-guide download index at `https://solutions.vaio.com/2012` enumerates a bounded 82 exact PC model codes: 47 personal and 35 business. The live GitHub Actions run `41095058960` independently recaptured 82/82 from the official HTML tables with zero unexpected models, missing models, or duplicate rows. Exact HTML document-title review and secondary official model-support discovery reconciled all 82: **82 = 21 direct HTML user guides + 0 shared + 61 exact model support-only + 0 held**. The first-pass run reported 58 PDF-access exceptions: many VAIO-owned PDF endpoints returned HTTP 403 in the CI environment. These are not evidence of missing manuals; no PDF was promoted without positive verification. Three linked HTML guides showed a title for a different model (VJPKR2/VJS4R2, VJPKR1/VJS4R1 and VJBM11/VJBM12) and were conservatively left support-only rather than falsely inferred as direct or shared. Published batch: `data/manuals.coverage-pass.vaio-jp-pc-start-guide.js`. Other VAIO hardware, peripherals and product scopes remain out of scope.

### Samsung JP Galaxy smartphone coverage pass

The official Samsung Japan [Galaxy smartphone/tablet manuals index](https://www.samsung.com/jp/support/mobile-devices/how-to-check-galaxy-online-manual/) exposes five complete smartphone tables: **18 A + 39 S + 8 Note + 19 Fold/Flip + 5 other = 89 official marketed model identities**, alongside a separately excluded 34-model tablet table. GitHub Actions live review on 2026-10-31 checked the official 89/89 model population, 189 manufacturer-linked carrier product candidates, and exact official model/HTML manual evidence. Initial results were 82 direct and 7 identity exceptions. Independent Samsung official carrier/support and product metadata secondary discovery reconciled **89 = 85 direct + 0 shared + 4 support_only + 0 held**. The four support-only rows are Galaxy S20 5G, Galaxy Note3, Galaxy Note20 Ultra 5G, and Galaxy Z Fold2 5G Thom Browne Edition: the manufacturer index and secondary SKU mapping confirm model identity but the chosen support destination does not visibly present the same full marketed title; no unsupported manual equivalence was promoted. Samsung A21 シンプル required an explicit source conflict review (manual index SCG49 vs Samsung au software list SCV49), resolved through a manufacturer manual explicitly marked シンプル. The published single support/manual link is for the **displayed exact SKU**; other carrier versions may have different manuals. Tablets and all other Samsung lines remain outside this pass.

### dynabook JP 2024–2026 PC official manual-index coverage pass

The manufacturer maintains year-scoped manual download tables: [2024](https://dynabook.com/manual_download/cata2024.html) (47 product rows), [2025](https://dynabook.com/manual_download/cata2025.html) (32 rows), and [2026](https://dynabook.com/manual_download/index.html) (99 rows). Nested HTML tables were parsed completely, and per-year ordered source-row SHA256 fingerprints were locked to catch silent truncation/drift. The one duplicate 2026 `dynabook B86/PA` announcement (January and September) lists identical manuals and is one canonical product identity; two different `XP7/AR` product part codes and Home/Pro variants are separate because the manufacturer explicitly distinguishes them. **178 official source rows = 177 unique canonical models = 16 direct official PDF manuals + 161 manufacturer-explicit shared official PDF manuals + 0 support_only + 0 held**. All 53 distinct accepted dynabook-controlled HTTPS PDF destinations passed a live ranged GET and `%PDF-` magic-header verification. A `shared` relationship is established solely because each manufacturer's exact model row explicitly links to the identical PDF; no family resemblance or inferred URL pattern is used. Published data: `data/manuals.coverage-pass.dynabook-jp-2024-2026.js`, manifest: `coverage-passes/dynabook/jp-announced-pc-2024-2026-official-manual-index.json`, live CI: `.github/workflows/manualfinder-dynabook-jp-coverage-pass.yml`. All earlier year products are outside this scope and company-wide coverage remains incomplete.

### Fujitsu FMWORLD JP business LIFEBOOK U-series Coverage-Pass

The official [Fujitsu LIFEBOOK business PC manual index](https://www.fmworld.net/biz/fmv/support/fmvmanual/lifebook2.html) separately lists A, E, P, S, T, U and other product families. The explicit **LIFEBOOK U-series** section was captured as a bounded 148-model official population. Source name/order and each model-to-page link are locked with SHA256; stale web-search snapshots would miss current U9416NQ/U8316 entries. Live GitHub Actions `41172890943` rechecked the official full population, the exact model name in every manufacturer-controlled manual page H1, and at least one manufacturer PDF with verified HTTPS redirect and `%PDF-` signature for all models. Final **148 = 148 direct + 0 shared + 0 support_only + 0 held**. There are 148 unique model-specific HTML manual index pages; 78 distinct PDF URLs were checked and may appear in several model pages. A common subordinate PDF does not make separate model-specific manual index pages a shared destination. Public file: `data/manuals.coverage-pass.fujitsu-lifebook-u.js`; manifest: `coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json`. This pass is **not** company-wide, nor complete for other LIFEBOOK families or consumer FMV products.

### Google Pixel JP official manufacturer support scope (2016–2026)

Google's [Pixel launch-date list](https://support.google.com/pixelphone/answer/15738422?hl=ja) has **33 official release table rows**, including five grouped two-model rows, which reconcile to **38 unique Pixel phone identities**. Google's independently maintained [safety, regulatory and other information index](https://support.google.com/pixelphone/answer/9204905?hl=ja) explicitly links those 38 models to **24 Google-controlled model-named regulatory support documents**, all HTTP/HTTPS and exact-name/type reviewed. Final scope state: **38 = 0 direct + 0 shared + 38 support_only + 0 held**. The 2016–2019 manufacturer article titles sometimes omit the `Google` brand prefix; positive exact Pixel variant labels and the manufacturer index relationship were checked without prefix/family guessing. Multiple Pixel models may be named on one regulatory document, but this is **not** grounds for claiming a shared operating user manual. Published support pages are not general Pixel Help and do not represent the user's instruction guide; the operating-guide search remains separate. Public batch: `data/manuals.coverage-pass.google-pixel-jp.js`. Source manifest: `coverage-passes/google/pixel-phone-jp-2016-2026.json`. This pass does not cover Pixel Tablet/Watch, generic Google products, nor Google's company-wide manuals.

### Motorola Japan currently listed smartphones Coverage-Pass

The [Motorola Japan manufacturer-controlled product lineup](https://moto-bu.motorola.co.jp/products/) enumerates 13 named product thumbnails in order: **12 smartphones** (razr, edge, moto g) plus the **moto pen ultra accessory**, excluded from the smartphone population. The exact manufacturer 12-model name sequence and source SHA256 are locked. The live primary review checks every model's manufacturer-controlled HTTPS operating HTML guide, exact final document title, and substantive operational topics, never treating a patterned `help.php?m=` candidate as publication truth. The complete 12-model population reconciles to **11 direct + 0 shared + 0 support_only + 1 held**, with all 11 direct verified and published in a single batch, `data/manuals.coverage-pass.motorola-jp-lineup.js`. Ten direct links currently resolve to English guides and one (`moto g66j 5G`) to a Japanese manufacturer HTML guide. Manufacturer-listed `moto g 37 j` remains held: the exact Japanese guide article returned HTTP 403 in live CI and an accessible global `moto g37` guide did **not** prove equivalent variant identity. The held model is retained in `coverage-passes/motorola/jp-motobu-2026-smartphone-lineup.json`, explicitly **not** dropped or published. This is a current listed 2026 Japan lineup scope only; historical Motorola products and company-wide documentation are incomplete.

### ASUS Japan Vivobook official 2026 product catalog Coverage-Pass

The manufacturer's [Vivobook JP product list](https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook) loads 20 cards initially but has 35 products in the independent ASUS-operated `odinapi.asus.com` paginated ProductList API; page 1 has 20 and page 2 has 15, with `PageSize=100` independently re-capturing all 35 in the same order. The full ordered model/product-ID/official-URL mapping is locked by SHA256. All 35 manufacturer-listed models, including one Vivobook Pro creator model enumerated in the filter, were kept in the same bounded population. Live CI positively reviewed the exact manufacturer model code, separately selected manufacturer-supported SKU, final official HTTPS HTML `Manual & Document` destination, and language/version/download metadata of an actual operating user manual. **35 = 35 direct + 0 shared + 0 support_only + 0 held**. There are 35 accepted exact manual-index pages; 34 display Japanese user manuals and the X1605EA selected SKU has an English manual listing only. Where ASUS JP's support route fell back to the marketing page, the alternative global ASUS product's manufacturer-explicit model selector supplied the verified selected SKU. ASUS global **M1605YA** and two Snapdragon **QA** variants were escalated and positively tied to their exact manufacturer product families; no family-wide interchangeability is claimed. Every public title displays the actually verified selected variant and says other configurations may require different manuals. Manifest: `coverage-passes/asus/jp-vivobook-official-2026-product-index.json`; public batch: `data/manuals.coverage-pass.asus-jp-vivobook.js`; live review workflow: `.github/workflows/manualfinder-asus-jp-vivobook-coverage-pass.yml`. This is a bounded 2026 Vivobook category and is not ASUS company-wide completeness.

## Wave rotation contract

Current deployed state:

1. **Wave 3A — Nikon:** implemented for the complete current mirrorless-camera Web-manual section; Nikon remains only `expanded`, not company-complete.
2. **Wave 3B — Brother:** implemented for a bounded first MFC-J block; Brother remains only `expanded`, not company-complete.
3. **Sony coverage-pass pilot:** JP α E-mount body scope is complete and published from `coverage-passes/sony/jp-alpha-e-mount-bodies.json`: **107 = 104 direct + 0 shared + 3 support-only + 0 held**. The public compiled batch is `data/manuals.coverage-pass.sony-jp-alpha-e-mount.js`. Broader Sony categories remain separate future coverage passes.
4. **Wave 3D — Epson:** implemented for six exact current Colorio models selected for clean manual and consumable evidence.
5. **Wave 3E — Canon:** implemented for six PIXUS models; direct and vendor-shared manual targets are distinguished explicitly.
6. **Panasonic coverage-pass pilot:** JP LUMIX S/G/compact camera-body scope is complete and published from `coverage-passes/panasonic/jp-lumix-camera-bodies-sitemap.json`: **27 = 27 direct + 0 shared + 0 support-only + 0 held**. The public compiled batch is `data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js`. Broader Panasonic categories remain separate future coverage passes.
7. **Apple coverage-pass pilot:** iPhone 11→17e/Air/SE2/SE3 scope is complete and published from `coverage-passes/apple/jp-iphone-ios26-guide-models.json`: **31 = 0 direct + 31 shared + 0 support-only + 0 held**. The public compiled batch is `data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js`. Broader Apple categories remain separate future coverage passes.
8. **Fujifilm coverage-pass pilot:** GFX + X-series camera manual-index scope is complete and published from `coverage-passes/fujifilm/jp-gfx-x-camera-manual-index.json`: **56 = 52 direct + 4 shared + 0 support-only + 0 held**. The public compiled batch is `data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js`. FinePix and broader Fujifilm categories remain separate future coverage passes.
9. **VAIO JP start-guide pass:** 82 official PC models are complete and published from `coverage-passes/vaio/jp-pc-start-guide-manual-index.json`: 21 exact HTML manuals + 61 exact model support pages + 0 held. This is not all VAIO models.
10. **Samsung JP Galaxy smartphone index pass:** 89 official marketed models complete and published, 85 direct manufacturer-specific manual indexes + 4 exact support only + 0 held; one labelled manufacturer SKU per marketed model, no inferred cross-carrier manual mapping.
10. Re-evaluate counts and gaps before any second model-coverage wave for Nikon/Brother/Epson/Canon.

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
