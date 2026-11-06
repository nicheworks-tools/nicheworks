# ManualFinder Coverage Inventory

Status date: 2026-11-04

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

With the completed Sony JP α E-mount, Panasonic JP LUMIX, Apple iPhone, Fujifilm GFX/X, VAIO JP start-guide PCs, Samsung JP Galaxy smartphones, dynabook JP 2024–2026 PCs, Fujitsu FMWORLD LIFEBOOK U business PCs, Google Pixel JP model-specific safety/support documentation, Motorola JP current smartphone lineup, ASUS JP Vivobook series, and Xiaomi JP smartphone/tablet user-guide index, the accepted dataset contains **2,679 verified model/caliber rows**. **2,236 are outside Seiko**. Coverage-Pass publication contributes **1,111 reviewed rows across twenty-two bounded manufacturer scopes**. The Xiaomi JP 60-device source reconciles to 59 positively verified manufacturer PDF guides and one held co-branded Leica model; 59 guide rows are published. This is not Xiaomi company-wide coverage.

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
| Xiaomi | 59 | expanded, scope-reviewed | Official Japan mobile user-guide index: 306 manufacturer guide links total, 74 raw mobile-section entries, 60 unique phone/tablet models after generic/accessory exclusions and exact duplicate collapse; 59 direct manufacturer PDF quick-start/product guides verified, one Leica held. Not all Xiaomi products. |
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
| Brother | 21 | expanded | Waves 3B+3F: 13 legacy MFC-J manual pages and 8 newly manufacturer-verified models (6 direct + 2 official shared manual identities), with 16 manufacturer-verified ink Amazon search offers. The separate legacy held model is unchanged. |
| Insta360 | 7 | expanded | Product-specific official online manuals. |
| Epson | 38 | expanded | Colorio Waves 3D+3G+3H+3I+3J: 6+8+8+9+7 exact official Epson model manuals, with individually verified printer ink queries. |
| OnePlus | 12 | expanded, bounded | Twelve manufacturer original English device PDFs byte-verified in GitHub Actions: 8 detailed manuals and 4 EU quick guides, all distinct model-specific sources. Not Japanese guides nor OnePlus-wide completeness. |
| OPPO | 7 | expanded, bounded | Seven actual OPPO Japan device-specific PDF guides (6 はじめてガイド plus Reno13 A Quick Guide); 2 invalid PDF candidates held. No OPPO company-wide completeness. |
| Huawei | 5 | expanded, bounded | Five HUAWEI Japan wearable manual-download indexes (Band 9/8, WATCH GT 4, WATCH FIT 3, WATCH 4) explicitly listed in official guide FAQ with both quick-start and user manual available. No PDF or vendor-wide completion claim. |
| MSI | 6 | expanded, bounded | Six exact GP66 Leopard and GE66 Raider 10U model variants mapped by MSI-operated source to chassis MS-1542 and separately verified two manufacturer Japanese GP/GE PDFs, all shared. Not MSI-wide. |
| NEC LAVIE | 18 | expanded, bounded | Twelve LAVIE Note Standard NS350/NS700 and six LaVie S LS550 archived exact PC- SKUs. Variant-specific reading notices plus linked standard-model manuals; not modern NEC catalog. |
| Acer | 16 | expanded, bounded | Five independent Japanese Acer user-manual PDF groups (Aspire 3 models, Swift 7, Nitro 6): 1 direct + 15 explicitly manufacturer-shared. Older Swift 7 PDF unavailable, held. No Acer-wide completeness. |
| HP | 17 | expanded, bounded | Seventeen Japanese HP Pavilion, ProBook and EliteBook model/series official Setup and User Guides index pages with published Japanese User Guide listings; direct HP page recheck blocked HTTP 403 in this environment. No company-wide completeness. |
| Lenovo | 13 | expanded, bounded | Thirteen verified Lenovo Japan ThinkPad Guides & Manuals pages across T/L/P/E/X1 families, exact machine types preserved; not whole family or company. |
| Dell | 20 | expanded, bounded | Twenty individually verified Dell Japan model-specific Manuals and Documents index pages with owner/service user manuals; Inspiron, XPS, Latitude, Precision and OptiPlex. Not Dell company-wide or any entire family. |
| Canon | 155 | expanded | Eighteen verified Waves 3E+3K+3L PIXUS printers plus 137 distinct official RF/EF-series lens instruction manual rows (123 direct + 14 shared) from Canon Japan nine-section lens-manual index. Lens scope does not claim Canon company-wide completeness; manufacturer direct PDFs verified. |
| Hisense | 2 | expanded | Exact TV function-manual targets; coverage is still very thin. |
| **Total** | **2,679** |  |  |

Counts above are accepted repository rows, not estimates of manufacturer catalog size.

## Curated baseline: all 66 brands

`manuals.json` currently supplies 66 generic manufacturer entrances. The model-level status below is intentionally conservative: a related company/division does not automatically count as coverage for another product division.

| # | Baseline brand | Model-level state | Next action |
| ---: | --- | --- | --- |
| 1 | Apple | **expanded — 31** | iPhone User Guide bounded scope is published and coverage-pass-complete at 31 shared manual rows + exact model support pages; broader Apple remains incomplete |
| 2 | Sony | **expanded — 107** | JP α E-mount scope is published and coverage-pass-complete at 104 direct + 3 support-only + 0 held; broader Sony categories remain incomplete |
| 3 | Panasonic | **expanded — 27** | JP LUMIX S/G/compact camera-body sitemap scope is published and coverage-pass-complete at 27 direct + 0 support-only + 0 held; broader Panasonic categories remain incomplete |
| 4 | Canon | **expanded — 155** | Eighteen PIXUS models and 137 official RF/EF interchangeable-lens user manuals; printers, cameras, and remaining lens groups are not complete |
| 5 | Nikon | **expanded — 14** | Mirrorless Web-manual section covered in Wave 3A; rotate away |
| 6 | Fujifilm | **expanded — 56** | JP GFX + X-series camera-manual-index scope is published and coverage-pass-complete at 52 direct + 4 shared + 0 held; FinePix and broader Fujifilm remain incomplete |
| 7 | Brother | **expanded — 21** | Eight additional 2026 MFC-J printers from official model user-guide/ink pages; MFC-J6990CDW remains held |
| 8 | Epson | **expanded — 38** | Five bounded manual-and-ink model waves: 6+8+8+9+7; Epson-wide scope incomplete |
| 9 | HP | **expanded — 17** | First bounded Japanese HP support model/series setup-and-user-guides index pages; indexed guide listings confirmed, web live recheck returned HTTP 403 |
| 10 | Dell | **expanded — 20** | First bounded Dell Japan manufacturer-owned exact-model manuals index pass: 20 direct owner/service document listing pages; no entire-catalog claim |
| 11 | Lenovo | **expanded — 13** | Thirteen explicit ThinkPad machine-type/SKU Japanese model-specific user/setup/maintenance manual indexes; Lenovo-wide coverage not claimed |
| 12 | ASUS | **expanded — 35** | Manufacturer JP Vivobook category 35 products (API 20+15); 35 verified model-specific manual indexes, 0 held. Selected variant disclosed on each row. Other ASUS families not complete. |
| 13 | Acer | **expanded — 16** | Acer Japan-first bounded 5 verified Japanese manufacturer PDF manuals; 16 exact model codes from covers, 15 explicitly shared + 1 direct, Swift 7 SF713-51 PDF held after /error_page redirect; not Acer-wide |
| 14 | MSI | **expanded — 6** | MSI-owned Japanese GP and GE manuals for six GP66/GE66 MS-1542 laptop variants; manufacturer shared PDF, not an MSI-wide catalog. |
| 15 | VAIO | **expanded — 82** | JP start-guide table scope complete: 21 direct HTML user guides + 61 exact support-only + 0 held; broader VAIO remains incomplete |
| 16 | dynabook | **expanded — 177** | JP 2024–2026 announced PC manual index scope-complete: 16 direct + 161 vendor-defined shared PDFs, zero held. Older years remain incomplete. |
| 17 | NEC LAVIE | **expanded — 18** | 18 exact PC- archived model manual pages with variant-specific amendment and base model manuals; not direct PDFs |
| 18 | Fujitsu FMV | **expanded — 148** | JP business LIFEBOOK U manual-index 148/148 direct, 0 held; other Fujitsu/FMV product scopes incomplete |
| 19 | Google Pixel | **expanded — 38** | Exact manufacturer model-specific safety/regulatory support-only records. 38/38 scope complete; operational user-guide coverage remains pending. |
| 20 | Samsung Mobile | **expanded — 89** | Samsung JP five smartphone tables scope-complete: 85 exact model-specific manual indexes + 4 manufacturer support-only; not Samsung-wide |
| 21 | Huawei | **expanded — 5** | Manufacturer JP FAQ explicitly maps 5 Band/WATCH wearable products to exact Japanese quick-start/user-guide download landing pages; 5 model-level indexes, no PDF byte claim |
| 22 | Xiaomi | **expanded — 59** | Xiaomi Japan full mobile/tablet user-guide index: 60 unique named devices from 74 mobile-section links; 59 exact manufacturer PDF guides direct, Leica Leitzphone held after Leica PDF HTTP 502 in CI. |
| 23 | OPPO | **expanded — 7** | Seven byte-verified Japanese OPPO manufacturer getting-started/quick guides; Reno A and Reno7 A held invalid PDFs. Not all OPPO models. |
| 24 | OnePlus | **expanded — 12** | 12 exact model English manufacturer PDFs (8 full user manuals + 4 EU quick guides); Japanese manuals not claimed, no OnePlus-wide catalogue claim |
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

Result after the Sony JP α E-mount, Panasonic JP LUMIX, Apple iPhone, and Fujifilm GFX/X publications: **44 of the 66 baseline brands are still generic-only**. The previous deep Seiko/Roland work therefore must not be treated as evidence that ManualFinder's manufacturer coverage is broadly mature.

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

### Xiaomi Japan mobile phones and tablets official guide-index Coverage-Pass

Xiaomi's [Japanese user guide index](https://www.mi.com/jp/support/user-guide/) includes 306 manufacturer-labelled guide links across six categories. The contiguous initial mobile category has 74 source items. Removing six generic OS/safety documents, seven clearly identified accessories and one exact duplicate Redmi Pad 2 4G index row yields **60 unique marketed smartphones/tablets**; carrier-specific and radio variants remain separate manufacturer-identified models. The manufacturer-owned `go.buy.mi.com/jp/v2/cms/page/get` CMS response independently associates each exact model label with an actual guide PDF or other source. The live runner verifies all 306 source entries and six CMS groups, each candidate's manufacturer-hosted HTTPS origin, actual PDF bytes (not HTTP 200 alone), and `%PDF-` format magic. Final reconciliation: **60 = 59 direct + 0 shared + 0 support_only + 1 held**, with all 59 validated PDF quick-start/product guides published in `data/manuals.coverage-pass.xiaomi-jp-mobile.js`. The single held **Leica Leitzphone powered by Xiaomi** is in the Xiaomi-owned source index, but its Xiaomi CMS guide link is self-referential; the independently verified [Leica Japan manufacturer quick-start guide](https://leica-camera.com/ja-JP/mobile/leitzphone-powered-by-xiaomi/downloads) points to an exact PDF that returned HTTP 502 in CI, so it was deliberately not published as direct. The held source entry, alternate manufacturer download evidence and reason remain in `coverage-passes/xiaomi/jp-mobile-user-guide-2026.json`. PDF files are manufacturer-issued and linked, never redistributed by ManualFinder. Many are quick-start guides rather than full reference manuals; public copy says so. This is a bounded Japan mobile/phone/tablet guide-index scope, **not** Xiaomi/REDMI/POCO company-wide completion.

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

### Canon Japan official interchangeable-lens manual-index Coverage-Pass (2026-11-01)

Manufacturer entry: https://canon.jp/support/manual/ef . Nine direct Japanese lens-manual subsections enumerate the bounded single-model scope: RF zoom, RF prime, RF-S, EF zoom, EF prime, EF-S, EF-M, EF macro, TS-E. **137 unique model/manual anchors** reconcile to **123 direct + 14 shared + 0 support_only + 0 held**. Manufacturer-referred redirects yielded 134 verified official PDF file signatures; three VR lens manual entries are explicitly named on the shared Canon EOS VR SYSTEM page. Separately named mixed-model anchors and adapters are excluded from this **bounded scope**; this is not Canon-wide completion. Evidence manifest: `coverage-passes/canon/jp-lens-manual-index-2026.json`; publicly indexed records: `data/manuals.coverage-pass.canon-jp-lens.js`. Each record qualifies for the existing reviewed exact Canon model Amazon search; interchangeable lenses are excluded from camera-body battery/charger detail requirements rather than inventing compatibility.

### Brother JP MFC-J official manuals and ink compatibility — Wave 3F (2026-11-02)

Eight new manufacturer-confirmed MFC-J models, six direct official product-manual pages and two separate DN/DWN model identities sharing one vendor-defined official manual page: MFC-J4950DN, MFC-J7110CDW, MFC-J7210CDW, MFC-J7310CDW, MFC-J7510CDW, MFC-J7610CDW, MFC-J742DN and MFC-J742DWN. Every manufacturer model page explicitly lists the **online user's guide**; source evidence and eight exact-model official ink compatibility pages are recorded in `coverage-passes/brother/jp-mfcj-8-printer-manual-ink-20261102.json`. Publication `data/manuals.wave3.06.js` and existing Wave 3 runtime. The existing Amazon `nicheworks09-22` model search is active, and **16 verified ink SKU search offers** are added to `affiliate-config.js` (two per model); no retailer purchase or revenue is claimed. This is a bounded expansion, not Brother company-complete.

### Epson Japan Colorio 8 model manual + ink review — Wave 3G (2026-11-02)

Eight exact official manufacturer Japanese manual destinations are added: EP-885AW, EP-885AB, EP-885AR, EP-886AW, EP-886AB, EP-886AR, EP-716A, EP-717A. All eight exact model manual pages on `https://www.epson.jp/support/portal/used/` list official Web/PDF operating manuals. Eight corresponding exact model `support/portal/shoumouhin/` pages prove 16 consumable SKU offers: 885A/886A variants KAM-6CL and KAM-6CL-L; EP-716A SAT-6CL and SAT-BK; EP-717A KAK-6CL and KAK-BK. All eight new canonical model entries receive the existing Amazon Associates model query handoff plus two model-specific ink queries, `tag=nicheworks09-22`. Evidence: `coverage-passes/epson/jp-colorio-8-model-manual-ink-20261102.json`. This is a bounded exact-model pass, not Epson company-wide completion. Total catalog: 2,529.

### Epson Japan Colorio Wave 3H eight manufacturer manual and ink mappings (2026-11-02)

Eight manufacturer model-specific official user-guide lists were confirmed: EP-812A, EP-813A, EP-814A, EP-815A, EP-816A, EP-715A, EW-052A, EW-452A. All have an explicit named User Guide in the Epson `/support/portal/used/{model}.htm` page, including PDF guides; the correspondingly named `/support/portal/shoumouhin/{model}.htm` proves each exact ink model mapping. The six EP-series models link SAT-6CL six-color packs and SAT-BK black cartridges; both EW-series models link MUG-4CL four-color packs and MUG-BK black. The eight new printer records enable eight model searches and 16 ink searches using the existing `nicheworks09-22` Amazon tag. Evidence: `coverage-passes/epson/jp-colorio-wave3h-8-legacy-models-20261102.json`, published through `data/manuals.wave3.08.js`. Scoped legacy+mid-generation model batch only, no catalog-wide Epson claim. Accepted manual catalog 2,537; Epson 22.

### Epson Japan Colorio Wave 3I nine exact models (2026-11-02)

Nine previously unindexed models have independent manufacturer manual pages (`https://www.epson.jp/support/portal/used/{model}.htm`) with a named Web User's Guide and PDF User's Guide: EP-712A, EP-713A, EP-714A, EP-883AW/AB/AR, EP-884AW/AB/AR. Their exact manufacturer consumable pages (`/support/portal/shoumouhin/{model}.htm`) individually list both accepted ink SKUs: SAT-6CL + SAT-BK for the three EP-71xA units, and KAM-6CL + KAM-6CL-L for the six EP-883A/884A color variants. Published as `data/manuals.wave3.09.js`; reviewed source manifest `coverage-passes/epson/jp-colorio-wave3i-9-legacy-models-20261102.json`. Each of nine devices gains an existing tagged exact-model Amazon query and two SKU-tagged compatible-ink search offers; **9 new manual rows + 27 tagged search paths (9 model/18 ink)**. No claim of Epson-wide completeness or measured sales.

### Epson JP EP-881A/882A seven-model Wave 3J manual + ink pass (2026-11-02)

Seven exactly named manufacturer manual pages: EP-881AB, EP-881AN, EP-881AR, EP-881AW, EP-882AB, EP-882AR and EP-882AW. The seven `www.epson.jp/support/portal/used/{model}.htm` pages visibly list a PDF user guide, and all seven exact `shoumouhin/{model}.htm` manufacturer consumables pages individually list KAM-6CL and KAM-6CL-L ink packs. The ink product's Epson manufacturer compatibility table separately names all seven identities. Published `data/manuals.wave3.10.js`, evidence `coverage-passes/epson/jp-colorio-wave3j-7-kam-models-20261102.json`. Adds seven official guide rows + seven tagged exact Amazon model searches + fourteen compatible ink searches. No purchases or sales are inferred.

### Canon PIXUS six exact official manuals and verified ink (Wave 3K, 2026-11-03)

Six new printer models — TS8930, XK140, XK510, TS6630, TS5630 and TS5530 — have individually confirmed Canon-hosted official manual indexes and manufacturer model-specific specifications listing the selected ink cartridges. Source manifest `coverage-passes/canon/jp-pixus-wave3k-6-models-20261103.json`; runtime `data/manuals.wave3.11.js`; tests `tests/canon-pixus-wave3k-publication.test.mjs`. This adds six manual rows, six Canon exact-model tagged Amazon searches and twelve specifically compatible ink cartridge searches. Inventory grows from historical **2,553 verified model/caliber rows** to **2,559 verified model/caliber rows**. Canon becomes 149, consisting of 12 PIXUS printers and 137 verified lens manuals; Canon company-wide coverage remains incomplete.

### Canon PIXUS six earlier-model manuals with exact cartridges (Wave 3L, 2026-11-03)

Wave 3L adds TS8230, TS8430, TS8530, TS8630, XK110 and XK120 from six individually verified Canon product manual indexes that list PDF and online manuals. Each model's Canon consumables page independently names two chosen compatible ink SKUs. Published data `data/manuals.wave3.12.js`; reviewed evidence `coverage-passes/canon/jp-pixus-wave3l-six-manual-ink-20261103.json`. Adds six canonical guide records, six tagged model searches and twelve verified cartridge searches without inferred compatibility. Canon now has **155** records (18 printers + 137 lens models); ManualFinder now contains **2,565 verified model/caliber rows**. Catalog-wide completion is not claimed.

### Dell JP 20 official exact-model owner/service manual indexes (2026-11-03)

The first Dell manufacturer publication pass is a deliberately bounded 20-page official `www.dell.com/support/product-details/ja-jp/product/.../resources/manuals` set. Every page explicitly names the corresponding device and lists its Dell owner's, service, or setup documentation; the list includes ten Inspiron devices and Dell XPS, Latitude, Precision and OptiPlex. Exact 20-model population, actual Dell-owned URLs and review states are recorded in `coverage-passes/dell/jp-20-model-manual-index-20261103.json`. All 20 are `direct` model-specific official manual-index pages. For Inspiron 15 3530, Dell's index includes different manuals for USB-C and non-USB-C variants; the public row requires the user to choose the correct device variant. No inferred direct-PDF URLs, universal manual compatibility, battery SKU, power adaptor compatibility, or Dell-wide completion are claimed. Public data: `data/manuals.coverage-pass.dell-jp-20.js` registered by `data/manuals.coverage-passes.js`; test: `tests/dell-jp-20-publication.test.mjs`. Adds 20 verified PC records and 20 tagged canonical Dell model searches using the existing Amazon configuration. The previous Dell PR #1512 remained candidate-only and contributed no public models. Updated inventory **2,585 verified model/caliber rows**, Dell 20, outside-Seiko 2,142, reviewed Coverage-Pass contribution 1,017. No measured affiliate sales are asserted.

### Lenovo JP 13 ThinkPad model-specific user/setup/maintenance manual indexes (2026-11-03)

After the Dell first pass, the first Lenovo model-specific publication is an explicitly bounded **13 official ThinkPad machine-type or SKU page set**, across T14/T16, L14, P16s/P1, E14/E16 and X1 Carbon/X1 2-in-1 families, plus the T470. Each `pcsupport.lenovo.com/jp/ja/products/.../document-userguide` link was individually observed as an official machine-type/product-specific index with user, hardware maintenance or setup manual information. Distinct CPU/machine types are not treated as interchangeable; the single L14 Gen 5 and X1 Carbon Gen 9 SKU examples are identified explicitly. Official scope: `coverage-passes/lenovo/jp-thinkpad-13-official-manual-index-20261103.json` with 13 exact identities = 13 direct manual-index pages, 0 shared, 0 support-only, 0 held. This is **not Lenovo or ThinkPad company-wide scope completion**, and no direct PDFs or charger/battery compatibility is inferred. Published in `data/manuals.coverage-pass.lenovo-jp-thinkpad-13.js` and the bilingual coverage-pass loader; dedicated regression is `tests/lenovo-jp-13-publication.test.mjs`. The existing optional Amazon tagged model search yields 13 device searches. Updated inventory **2,598 verified model/caliber rows** with Lenovo 13, outside Seiko 2,155, Coverage-Pass reviewed rows 1,030. No sales claims.

### HP Japan 17 model/series user-guide listing indexes (2026-11-03)

This is a bounded HP Japan source set of **17 exact official HP support setup-user-guides pages** spanning Pavilion, ProBook and EliteBook; all show model/series identities and Japanese PDF user-guide entries in manufacturer-hosted indexed content. Direct access from the current web fetch environment returned HTTP 403; therefore **these are guide-index landing URLs, not independently downloaded PDFs or proof that automated fetches currently succeed**. HP's product series indexes are labelled explicitly instead of masquerading as unique individual SKUs. Each of the 17 links and document-list evidence is recorded in `coverage-passes/hp/jp-pc-17-user-guide-index-20261103.json`; reviewed state 17 direct indexes, zero held within this *narrowly selected* source set. Public data `data/manuals.coverage-pass.hp-jp-pc-17.js`; dedicated test `tests/hp-jp-17-publication.test.mjs`. It adds 17 official model/series guide-index records and optional exact-named Amazon device searches; no charger/battery compatibility, general HP catalog completion or sales are asserted. Updated inventory **2,615 verified model/caliber rows**, non-Seiko 2,172, Coverage-Pass contribution 1,047. Future network revalidation must fail closed on 403 and retain this caveat.

### Xiaomi JP live guide-index drift gate, 306 → 307 candidate (2026-11-03)

The original accepted manufacturer snapshot had 306 total guide links; current live Xiaomi CMS reports 307, while the product scope in this registry is **only the first 74 mobile links, yielding 60 unique mobile models**. The fail-closed live reviewer now accepts either 306 or 307 full-index rows **only if both the official HTML and CMS have equal counts and identical ordered model names across the full index**, the 75th entry remains the REDMI Buds 5 Pro non-mobile boundary, and the SHA-256 of all 60 exact manufacturer model-to-guide href pairs remains identical to the previously locked manifest. The extra entry cannot enter the published mobile catalog; any second extra link or mobile source mutation fails. The source manifest's original 306 count remains an immutable historical snapshot, and newly observed full-index totals are emitted separately by the live review. This changes no published model/manual records, counts or PDF URLs; actual CI must still verify all existing PDFs and the held Leica classification independently.

### Acer JP five manufacturer PDF user manuals, 16 exact model codes (2026-11-04)

First verified Acer model-level publication. Five **Acer-hosted Japanese user-manual PDF files** were actually downloaded in GitHub Actions run **41773975781**, and each passed official final-host, HTTP status, `%PDF-` magic and first-four-page extracted-text checks covering all named model codes. Manufacturer cover-lists establish 3 Aspire 5 models (A515-51/A515-51G/A515-41G), 6 Swift models in two Swift 3 manuals (SF314-54/54G/56/56G, SF314-511/43), six Nitro 5 codes (AN515-45/56/57 and AN517-41/53/54), and one Swift 16 AI model (SF16-71T). **16 published = 1 exact single-model PDF + 15 manufacturer-defined shared PDF records.** An additional manufacturer-indexed Swift 7 SF713-51 PDF returned a final Acer `/error_page` instead of a valid PDF in CI; it remains **held and not published**. Audited candidate universe: **17 = 1 direct + 15 shared + 0 support_only + 1 held**. All exact URL and group associations are in `coverage-passes/acer/jp-six-japanese-user-manual-pdf-groups-20261104.json`; published rows in `data/manuals.coverage-pass.acer-jp-pdf16.js`, registered by `data/manuals.coverage-passes.js`. The five PDFs are manufacturer-issued, linked but not redistributed. This is not an exhaustive Acer catalog or proof that other configurations are interchangeable. Optional canonical Amazon Associates exact model searches use the existing `nicheworks09-22` tag, with no unverified charger/battery fits or sales claim. Main inventory **2,631 verified model/caliber rows**, outside Seiko 2,188, Coverage-Pass publication 1,063 across seventeen bounded manufacturer scopes.

### NEC LAVIE JP 18 exact archived PC- SKU manual indexes (2026-11-04)

First 18 manufacturer-owned exact SKU manual landing pages, 12 LAVIE Note Standard (NS350/NS700) and 6 legacy LaVie S (LS550). The exact **PC-** SKU is explicitly printed at each NEC page, which links two complementary resources: **『本製品をお買い求めのお客様へ』** (variant-specific reading correction) and the referenced standard base-model **添付マニュアル**. Links are **not direct PDF files**; do not omit the SKU-specific notice or imply the standard model alone is fully interchangeable. The bounded review population is **18 = 18 direct exact-SKU manufacturer manual indexes + 0 shared + 0 support_only + 0 held**; these are older archived models, not NEC-wide or current lineup completion. Manufacturer model-to-standard-model evidence and exact URLs: `coverage-passes/nec-lavie/jp-archived-exact18-manual-index-20261104.json`. Searchable data: `data/manuals.coverage-pass.nec-lavie-jp-exact18.js`; live exact-SKU verifier: `scripts/nec-lavie-jp-exact18-live.mjs`; and publication tests: `tests/nec-lavie-jp-exact18-publication.test.mjs`. 18 optional existing tagged Amazon exact PC model searches; no inferred charger/battery compatibility or sales. New catalog **2,649 verified model/caliber rows**, non-Seiko **2,206**, bounded Coverage-Pass **1,081 across eighteen scopes**.

### MSI JP MS-1542 two actual Japanese PDF user manuals and six exact model variants (2026-11-04)

MSI-operated [model-to-internal-chassis crosswalk](https://us-spareparts.msi.com/products/msi-adaptor-s93-0409380-d04) explicitly identifies GP66 Leopard 10UE/10UG/10UH and GE66 Raider 10UE/10UG/10UH as **MS-1542**. This crosswalk is used **only for manual identity**, not as evidence that a particular charger or spare part is suitable to recommend. MSI Japan's energy efficiency model table additionally confirms GE66 Raider 10U → MS-1542. The manufacturer-owned GP and GE *different* Japanese notebook PDFs, respectively `MS-1542_v1.0_Japanese_GP.pdf` and `MS-1542_v1.0_Japanese_GE.pdf`, were positively fetched in [live GitHub workflow run 41801269196](https://github.com/nicheworks-tools/nicheworks/actions/runs/41801269196): 8,560,650 and 8,814,664 bytes, `%PDF-1.7`, proper Japanese user manual headings. Both redirect from `download.msi.com` to MSI's own `download-2.msi.com` mirror with **identical path and file name**; the live gate allows only these two exact MSI hosts and requires PDF magic and Japanese content. Publication records are **six manufacturer-shared manual associations across just two PDF files** (GP 3, GE 3), not six distinct PDFs, and are not a company-wide MSI catalog claim. The separate GE65 Raider 9SF candidate was deliberately held outside this scope because its old `16U1...` PDF URL redirected to an unrelated `C_17F3...` file. Evidence and bounded scope: `coverage-passes/msi/jp-ms1542-gp-ge-manual-20261104.json`; public data: `data/manuals.coverage-pass.msi-jp-ms1542-six.js`; dedicated live test and publication test. Canonical optional exact MSI model Amazon searches 6, no charger/battery SKU compatibility inferred, no sales claimed. Current accepted inventory **2,655 verified model/caliber rows**, non-Seiko **2,212**, Coverage-Pass 1,087 across nineteen bounded manufacturer scopes.

### HUAWEI Japan 5 manufacturer-explicit wearable guide download indexes (2026-11-04)

HUAWEI Japan's [own instructions for obtaining user manuals](https://consumer.huawei.com/jp/support/content/ja-jp00753143/) present an explicit five-product table under **方法①**. It associates each named device with its own manufacturer `/jp/support/wearables/<model>/` download landing page and explicitly marks **both クイックスタートガイド and 取扱説明書 as available**. All five exact product URLs were individually checked as named maker support/download pages. Devices: Band 9, WATCH GT 4 (FAQ spells GT4; linked product page GT 4), WATCH FIT 3, Band 8, WATCH 4. Official evidence ledger: `coverage-passes/huawei/jp-wearables-five-user-guides-20261104.json` and public model records `data/manuals.coverage-pass.huawei-jp-wearables-5.js`. Review reconciliation **5 exact official model-guide indexes = 5 direct manual landing pages + 0 shared + 0 support_only + 0 held**. **These are manufacturer pages hosting the document downloads, not independently fetched or verified PDF file endpoints**. WATCH GT 4 product page displays 41mm/46mm editions but this batch does not infer different edition manuals or accessories. This is *not* the full Huawei smartphone/tablet/wearable catalog. These watches/bands are classified under existing `その他` category, which is ineligible for the current canonical Amazon model search template; therefore **zero tagged product searches** are fabricated and no accessory fit or sales claimed. Totals **2,660 verified model/caliber rows**, outside-Seiko **2,217**, Coverage-Pass **1,092 across twenty manufacturer-bounded scopes**.

### OPPO Japan first 7 verified guide PDFs of 9 bounded smartphone candidates (2026-11-05)

Manufacturer-hosted full PDF downloads verified in [GitHub Actions run 41879485312](https://github.com/nicheworks-tools/nicheworks/actions/runs/41879485312): final OPPO source host, exact unmodified PDF pathname, `%PDF-` bytes, and **first-five-page extracted exact OPPO device name and Japanese operating-guide text**. **7 passed**: A5 2020, Reno3 A, Reno3 5G, Reno5 A, A54 5G, A73 (six **『はじめてガイド』/getting-started guides**) and Reno13 A (one **Quick Guide**). These are not claimed to be exhaustive full-length operating manuals. The Reno3 5G manufacturer's source reflects a SoftBank-edition context; no other sale edition is assumed compatible. **2 held**: Reno A and Reno7 A KDDI guide source did not pass PDF signature/size validation; despite manufacturer-indexed URLs neither is published. Exact evidence, including negatives: `coverage-passes/oppo/jp-first-nine-mobile-guidepdf-20261105.json`. Reconciliation **9 scoped = 7 direct official model-specific PDFs + 0 shared + 0 support_only + 2 held = 7 public**; not all OPPO Japan devices or company-wide. Public rows `data/manuals.coverage-pass.oppo-jp-seven-guides.js`; mandatory independent live source recheck `scripts/oppo-jp-nine-pdf-probe.mjs` and publication test. Seven opt-in existing tagged Amazon **device model** searches via `nicheworks09-22`, no assumed batteries, chargers, accessories, inventory or commissions. Catalog **2,667 verified model/caliber rows**, non-Seiko **2,224**, Coverage-Pass **1,099 across twenty-one bounded manufacturer scopes**.

### OnePlus official first 12 English PDF model-level guides (2026-11-06)

Twelve **different actual OnePlus manufacturer-hosted PDFs** were downloaded and checked in [GitHub Actions live verification run 42168500772](https://github.com/nicheworks-tools/nicheworks/actions/runs/42168500772): origin and final host + exact pathname from `service.oneplus.com` or `www.oneplus.com`, all `%PDF-` signatures and plausible byte sizes, printed model name or original internal manufacturer **CPH** code inside extracted first five pages, and document guidance headings. **All 12 passed; 0 held.** Eight are **full English operating user manuals**: OnePlus 8, OnePlus 9, Nord 3 5G, Nord N30 5G, Nord 2T 5G, Nord N300 5G, Nord N200 5G and Nord N20 5G. Four are **English EU quick guides only**, **not full operational manuals**: OnePlus 13 (CPH2653), OnePlus 13R (CPH2645), OnePlus 15 (CPH2747), OnePlus Nord 4 (CPH2663). This group makes no claims about Japanese availability, corresponding Japan variants, modern OnePlus full-user-manual coverage, or the entire product catalog. Reconciliation **12 = 12 direct model PDFs + 0 shared + 0 support_only + 0 held**. Source ledger `coverage-passes/oneplus/global-english-twelve-20261106.json`, public data `data/manuals.coverage-pass.oneplus-global-en-twelve.js`, live regression `scripts/oneplus-global-english-pdf-probe.mjs`, publication test `tests/oneplus-global-twelve-publication.test.mjs`. Optional twelve canonical Amazon tagged exact device **model searches**, no claimed battery/charger compatibility, stock, purchases or commissions. Accepted ManualFinder total **2,679 verified model/caliber rows**, non-Seiko **2,236**; Coverage-Pass reviewed **1,111 across twenty-two bounded manufacturer scopes**.
