# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of verified official manufacturer manual/support destinations. Exact real product records and manufacturer-defined shared destinations are preferred over guessed or synthetic per-model URLs. Optional Amazon purchase-search handoffs remain secondary to official documentation.

## Current functional contract

- Load and merge the maintained ManualFinder baseline and verified model-level coverage waves.
- Filter by maker, model fragment, family/product term, Japanese alias, and category.
- Provide quick-search shortcuts and pagination.
- Prefer the deepest verified official manual/model-support destination available.
- Preserve manufacturer-defined shared destinations where the maker intentionally groups models.
- Preserve provenance fields including source level, verification date, evidence URL, resolution class, and shared-target state.
- Keep official manufacturer destinations above optional commerce actions.
- Provide distinct canonical Japanese and English page families with equivalent core directory behavior.

## Inputs

- Search text for maker/model/product family/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered official manual/support destination cards and result count.
- Verified model-level official destinations where available.
- Manufacturer-defined shared targets where applicable.
- Optional Amazon purchase-search handoffs generated only from canonical metadata or exact reviewed compatibility mappings.

## VAIO JP PC coverage-pass (2026-10-31)

The bounded VAIO Corporation Japanese start-guide index scope is complete and published: 82 official model identities (47 personal and 35 business) = 21 direct model-specific HTML manuals + 0 shared + 61 exact model support-only + 0 held. All 82 model identities and support destinations passed live official verification. Start-guide PDF endpoints returned HTTP 403 from CI, so no PDF candidates were promoted without artifact verification; this does not imply that manuals do not exist. Publication uses `coverage-passes/vaio/jp-pc-start-guide-manual-index.json` and `data/manuals.coverage-pass.vaio-jp-pc-start-guide.js`, with CI at `.github/workflows/manualfinder-vaio-coverage-pass-review.yml`. The scope is not VAIO company-wide.

## Samsung JP Galaxy smartphone coverage-pass (2026-10-31)

Samsung's Japanese Galaxy online-manual index enumerates five smartphone sections: **89 marketed models** (18 A, 39 S, 8 Note, 19 Fold/Flip, 5 other). The separate tablet table (34 models) is outside scope. Live official source review verified 89/89 models and reviewed 189 Samsung-linked carrier/SKU candidates. Seven first-pass title exceptions were escalated through independent Samsung official product, service and carrier-update sources.

Final reconciliation: **89 = 85 direct Samsung model-specific manual-download index pages + 0 shared + 4 exact Samsung model support-only pages + 0 held**. The four support-only names are Galaxy S20 5G, Galaxy Note3, Galaxy Note20 Ultra 5G and Galaxy Z Fold2 5G Thom Browne Edition. No deeper manual equivalence was inferred where destination titles differ. Galaxy A21 シンプル required source-conflict review: Samsung's manual index prints SCG49 but Samsung's au software list shows SCV49, while the manufacturer manual metadata explicitly names the シンプル variant.

**Critical variant safety:** each marketing-model row links one **visibly labelled manufacturer product SKU** and does not claim manuals are interchangeable across carriers. Other carrier-specific documents must be chosen from Samsung's official index. The evidence is recorded in coverage-passes/samsung/jp-galaxy-smartphone-online-manual-index.json, published in data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js, with CI at .github/workflows/manualfinder-samsung-coverage-pass.yml. Samsung company-wide coverage is not complete.

## dynabook JP announced PC 2024–2026 coverage-pass (2026-10-31)

Official annual Japanese PDF manual tables enumerate 47 (2024) + 32 (2025) + 99 (2026) manufacturer **source rows**, including a repeated announcement for `dynabook B86/PA`. The two B86/PA rows list identical manuals, so the canonical model count is 177 rather than 178. The two `XP7/AR` full part codes, and explicitly distinguished Windows 11 Home/Pro configurations, remain separate official model identities. Nested HTML tables require balanced parsing and each official year's complete source-row order is locked with SHA256. This prevents silent source population truncation.

After live official URL and PDF signature checks for 53 distinct manufacturer-controlled PDFs, final reconciliation is **177 models = 16 direct + 161 manufacturer-defined shared + 0 support_only + 0 held**. For `shared`, multiple independent manufacturer model rows visibly link to the identical PDF artifact. Model-family similarity alone cannot justify the relationship. Source records: `coverage-passes/dynabook/jp-announced-pc-2024-2026-official-manual-index.json`. Public data: `data/manuals.coverage-pass.dynabook-jp-2024-2026.js`. CI checks: `.github/workflows/manualfinder-dynabook-jp-coverage-pass.yml`, `tests/dynabook-jp-2024-26-review.test.mjs` and `tests/dynabook-jp-2024-26-publication.test.mjs`.

This is a **bounded 2024–2026 announced PC index scope**, not all Dynabook products or earlier years.

## Fujitsu FMWORLD Japan business LIFEBOOK U-series Coverage-Pass (2026-10-31)

Official FMWORLD Japanese business computer manual-index [LIFEBOOK page](https://www.fmworld.net/biz/fmv/support/fmvmanual/lifebook2.html) lists many independent families. This Coverage-Pass locks only the explicitly enumerated **LIFEBOOK U-series**: 148 manufacturer-linked model identities. The full model name sequence and model-to-manual-landing URL relationships are independently fingerprinted with SHA256, preventing stale snapshots and silent pagination/HTML truncation. The official index is not company-wide.

For every one of the 148 models, live GitHub Actions confirmed the exact model name in the manufacturer manual-index page H1, a manufacturer-controlled HTTPS destination, and a linked manufacturer PDF with valid `%PDF-` signature after HTTP redirect checks. 78 distinct PDFs were checked. The final reconciliation is **148 = 148 direct + 0 shared + 0 support_only + 0 held**. Each manual destination is the **exact model-specific HTML manual index**, not a single PDF selected from multiple guides. Some subordinate PDF artifacts are explicitly repeated across different models; this does not mean the model-specific HTML indexes have shared identities. No inferred URLs or manufacturer-independent PDF mirrors are published.

Source records: `coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json`. Public batch: `data/manuals.coverage-pass.fujitsu-lifebook-u.js`. Live exact-document confirmation: `scripts/fujitsu-lifebook-u-review.mjs`; publication recheck: `scripts/fujitsu-lifebook-u-reconcile-publication.mjs`; CI: `.github/workflows/manualfinder-fujitsu-lifebook-u-coverage-pass.yml`. Consumer FMV, other LIFEBOOK families, and Fujitsu company-wide manual coverage remain incomplete.

## Google Pixel official model support Coverage-Pass (2026-10-31)

Google's [Pixel release-date index](https://support.google.com/pixelphone/answer/15738422?hl=ja) contains **33 official rows** (five manufacturer-grouped dual-model rows), enumerating **38 exact Google Pixel phone models** from 2016 through the 2026 Pixel 11 generation. An independent manufacturer [safety, regulatory and other information index](https://support.google.com/pixelphone/answer/9204905?hl=ja) lists all 38 exact device identities and explicitly links them to **24 manufacturer-controlled, model-named support articles**. The live runner verifies each official HTTPS destination, content type, and exact model alias in the manufacturer document's title. Earlier official titles such as `Pixel 4` omit `Google`; these aliases are accepted only with the authoritative model-to-document index and exact token boundaries, never by family prefix inference.

Final reconciliation: **38 = 0 direct + 0 shared + 38 support_only + 0 held**. Safety/regulatory information is **not** an operating user manual. Do not turn the general Google Pixel Help homepage into a false exact manual, or claim that several models sharing one regulatory support article implies they share a manufacturer-defined user manual. The published record links the exact official safety/support article and explicitly discloses its limited scope. Detailed operational user-manual coverage is still unresolved as a separate scope.

Manifest: `coverage-passes/google/pixel-phone-jp-2016-2026.json`. Official source / destination verification: `scripts/google-pixel-coverage-review.mjs`. Public batch: `data/manuals.coverage-pass.google-pixel-jp.js`. CI: `.github/workflows/manualfinder-google-pixel-coverage-pass.yml`.

This is a **bounded manufacturer-documented Pixel phone support-information scope**, not complete Google-wide documentation; Pixel Tablet, Watch and all unlisted devices are excluded.

## Motorola Japan current lineup Coverage-Pass (2026-10-31)

The Motorola-owned [Japanese model lineup](https://moto-bu.motorola.co.jp/products/) names 12 smartphones (razr/edge/moto g) in a 13-product H4 list, with `moto pen ultra` explicitly excluded as an accessory. The full source list and ordered exact model-name digest are locked in `coverage-passes/motorola/jp-motobu-2026-smartphone-lineup.json`. No prior or discontinued Motorola models are implied by this 2026 current Japan lineup.

Manufacturer-controlled model-specific operating guides are verified after live HTTP/HTTPS redirects, exact final document titles, and substantial manual operating content. Generated `help.php?m=` URLs are discovery candidates only; the accepted destination is the verified final manufacturer document. The complete population reconciles **12 = 11 direct + 0 shared + 0 support_only + 1 held**. Ten accepted English HTML manuals and one official Japanese `moto g66j 5G` manual are published as 11 precise model records in `data/manuals.coverage-pass.motorola-jp-lineup.js`. Guide language is disclosed in the user-facing record.

The exact Japanese `moto g37j` manufacturer article returned HTTP 403 in GitHub Actions; a global HTML manual titled `moto g37` was explicitly **rejected**, not inferred compatible. The exact Japanese variant remains **held** in the machine-readable complete population and is never silently dropped or represented as a direct manual. Use independent manufacturer-controlled secondary sources for future resolution. CI workflow: `.github/workflows/manualfinder-motorola-jp-coverage-pass.yml`.

## ASUS Japan Vivobook 35-model official product Coverage-Pass (2026-10-31)

The manufacturer-controlled [Japanese Vivobook catalog](https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook) initially renders 20 products. The official odinapi.asus.com ProductList separately states 35 products, verified as 20+15 through two pages and 35 in one 100-row API query. The lock saves 35 exact product marketing names, ASUS product IDs, and official product URLs with an ordered SHA256 digest; all 35 items remain in scope, including the single manufacturer-listed Vivobook Pro creator category product. This is the bounded catalog, not the full ASUS company.

Live manufacturer guide review validates each accepted manual's *final* ASUS-operated HTTPS destination, exact product family/model code in official page title or explicitly documented manufacturer abbreviation, manufacturer's selected model/SKU in the URL, and actual user manual language, edition/version and download metadata. A successful HTTP 200 or generated model2Name candidate is insufficient: an ASUS marketing-page fallback is explicitly rejected. Where the Japanese marketing site does not expose the manual selector, independent ASUS global model selector links and the exact alternative M1605YA official product family manual were reviewed. X1607QA/X1407QA manufacturer product names shorten their manual page titles to X1607Q/X1407Q, but the full QA variant is positively selected in each ASUS-operated manual and originates from the exact official model listing, rather than an inferred family equivalence.

The full reconciliation is **35 = 35 direct + 0 shared + 0 support_only + 0 held**. Each public model displays the **specific verified selected ASUS variant**. Models within the same Vivobook family are **not** presumed to use equivalent manuals. 34 have Japanese language user manual metadata; the verified X1605EA destination currently has only an English user manual listing. Manufacturer-issued guides are linked, not redistributed by ManualFinder.

Official manifest: coverage-passes/asus/jp-vivobook-official-2026-product-index.json; full-source reviewer: scripts/asus-jp-vivobook-review.mjs; public batch: data/manuals.coverage-pass.asus-jp-vivobook.js; live CI: .github/workflows/manualfinder-asus-jp-vivobook-coverage-pass.yml. This scoped release leaves the rest of ASUS/ROG/Zenbook and discontinued catalogs unreviewed.

## Xiaomi Japan 60-phone/tablet official guide-index Coverage-Pass (2026-11-01)

The [Xiaomi JP manufacturer user-guide index](https://www.mi.com/jp/support/user-guide/) has 306 manufacturer-indexed guide entries in six categories. The contiguous phone/tablet scope is the first 74 entries; six generic operating-system/safety manuals and seven accessory products were explicitly excluded, and two case-only variants of the identical manufacturer Redmi Pad 2 4G guide link were collapsed into one model. The **60 unique manufacturer-named devices** include distinct Redmi/POCO tablets, carrier variants, and the co-branded Leica Leitzphone. The index source label and href order is locked with SHA256.

The Xiaomi official SPA's model-guide routes return generic HTML shells and cannot be accepted just because they return HTTP 200. Its manufacturer-controlled client-side SupportPdfViewer component retrieves the independently maintained go.buy.mi.com CMS user-guide dataset, where each exact model label maps to a manufacturer-owned PDF link. The live reviewer checks all 306 CMS entries against the HTML index, the complete 60-model bounded source, manufacturer HTTPS file hosts, actual PDF header bytes and MIME rather than adopting unverified patterned URLs.

**Final reconciliation: 60 = 59 direct + 0 shared + 0 support_only + 1 held.** The 59 verified PDF quick-start/product guides are published as model-specific records from data/manuals.coverage-pass.xiaomi-jp-mobile.js. These PDFs are linked to their official manufacturer hosts and are not self-hosted; they may be simplified initial-setup guides rather than full manuals, which the public descriptions explicitly disclose.

The held **Leica Leitzphone powered by Xiaomi** has an exact device listing in Xiaomi Japan's official guide index, but Xiaomi's CMS entry links back to an unresolved product guide route instead of a PDF. Independent [Leica Japan manufacturer downloads](https://leica-camera.com/ja-JP/mobile/leitzphone-powered-by-xiaomi/downloads) explicitly list a multilingual quick-start PDF including Japanese; the official file returned **HTTP 502** during repeated GitHub Actions verification. Without positive live document verification it remains held and unpublished, with all evidence preserved in the locked source. This does not imply no document exists.

Full manifest: coverage-passes/xiaomi/jp-mobile-user-guide-2026.json. Live reviewer: scripts/xiaomi-jp-mobile-review.mjs. Publication gate: scripts/xiaomi-jp-mobile-reconcile.mjs. CI: .github/workflows/manualfinder-xiaomi-jp-coverage-pass.yml. This is a bounded manufacturer Japanese mobile guide-index scope only, not Xiaomi company-wide completion.

## Coverage expansion workflow

Future model-level expansion is governed by `COVERAGE_PASS_WORKFLOW.md`. Automation may discover candidates at scale, but it cannot promote rows solely because a URL was found or omit rows solely because a scraper missed them. Each manufacturer/category pass must lock an official population, retain every population model through direct/shared/support-only/held review states, escalate negative cases through alternate official discovery channels, and reconcile the entire population before `coverage-pass-complete` is allowed. Machine-readable manifests live under `coverage-passes/` and fail-closed validation lives under `scripts/coverage-pass-lib.mjs` plus `tests/coverage-pass-pipeline.test.mjs`.

## Data quality and provenance

- Verified model-level coverage uses official manufacturer sources only.
- Unofficial mirrors, retailer copies, guessed URLs, synthetic product identities, and family-name inference are out of scope.
- A model/product row must represent a real maker-product relationship supported by official evidence.
- `manualUrl` and `supportUrl` remain distinct when a deeper manual target and broader support target both exist.
- `sourceLevel: A` is reserved for accepted direct official model/manual/support evidence.
- Shared targets are accepted only when the manufacturer itself defines the shared destination.
- Coverage count is not a quality target; unresolved rows remain unresolved until acceptable evidence exists.

## Affiliate / commerce contract

ManualFinder is an `AFFILIATE` tool, but commerce is an optional next-action layer.

- Official manufacturer links render before Amazon CTAs.
- Affiliate configuration remains separate from official-source fields.
- Dynamic Amazon model searches use only canonical maker/model/category metadata, never arbitrary user-entered search text.
- The tracking ID is fixed in configuration and never accepted from user input.
- Compatibility-sensitive consumable/accessory searches require separate reviewed mapping data.
- Wrong maker/category, malformed URLs, nonexistent models, spelling variants, unsupported categories, and unreviewed compatibility cases fail closed.
- `その他` remains excluded from blanket generic model search.
- Amazon UI is visually separated from official links and uses `/assets/amazon-affiliate.js`.
- Required Amazon Associates disclosure is rendered whenever an Amazon target is active.
- Copied/scraped Amazon price, availability, rating, review count, seller claims, and product imagery are not displayed.
- Affiliate analytics may emit only coarse fixed target/placement metadata; model/accessory/consumable queries and user search text are excluded.

### Printer consumable contract

- Consumer and office-printer consumable mappings remain official-evidence backed and exact-model scoped.
- Public retail codes are retained only when verified; `tonerCodes: []` remains valid when exact applicability is proven but a public retail SKU is not.
- Every canonical printer with a basic Amazon path must have verified detail or an explicit reviewed exclusion.
- The current audited printer state is **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- Reviewed exclusions remain in `affiliate-printer-detail-exclusions.js`.
- KYOCERA remains closed at **123 = 120 detail + 3 reviewed exclusions + 0 missing**.

### Camera accessory contract

Every actionable `カメラ・映像` row with a basic Amazon path must reconcile to verified accessory detail, a reviewed exclusion, or explicit missing-accessory diagnostic state.

The current camera state is **375 basic = 171 detail + 33 reviewed exclusions + 171 missing accessory detail** across 382 canonical camera-category records; 7 maker/index rows are non-actionable and excluded from the actionable denominator. The camera audit now loads published coverage-pass batches exactly as the runtime does, so Sony, Panasonic, and Fujifilm camera expansions cannot bypass compatibility-sensitive accessory accounting.

Nikon Waves 1–2 remain closed at **14 detail + 0 reviewed exclusions + 0 missing**.

DJI advances only through bounded exact-canonical-model review waves. Reviewed scope through Wave 41 closes the final six unresolved DJI rows:

- `Osmo Nano`
- `DJI Digital FPV System`
- `DJI Goggles`
- `DJI Goggles RE`
- `DJI O3 Air Unit`
- `DJI O4 Air Unit Series`

Wave 41 maps exactly `Osmo Nano` to `DJI Osmo Nano Multifunctional Vision Dock`, the model-specific companion dock documented by DJI for extended operating time and charging/connection functions. The other five rows are exact reviewed exclusions: the original Goggles rows have integrated batteries without a separately established model-specific replacement power accessory; the O3/O4 Air Units are externally powered components; and the Digital FPV System is a multi-component system without one defensible system-level battery/charger handoff.

The measured DJI state after Waves 1–41 is **96 basic = 70 detail + 26 reviewed exclusions + 0 missing accessory detail**.

DJI camera review is closed at zero missing. Camera-detail exclusions contain twenty-six DJI rows across Waves 32, 34, 36, 40, and 41.

OM SYSTEM review is closed through Waves 1–6. Waves 1–4 cover BLX-1, BLH-1, LI-92B, and current/late BLS-50 families. Wave 5 maps exactly `E-M1`, `E-M5`, `E-M5 Mark II`, `E-P5`, and `PEN-F` to BLN-1. Wave 6 maps the final fifteen legacy PEN/E-M10 rows to BLS-50. Waves 5–6 use OM SYSTEM's official power-supply compatibility table, which explicitly marks those battery/model combinations; no family-name inference is used. The measured OM SYSTEM state is **37 basic = 37 detail + 0 reviewed exclusions + 0 missing accessory detail**.

GoPro review now covers Waves 1–5. Waves 1–4 map twelve exact HERO/MAX rows to GoPro-documented replaceable Enduro/rechargeable batteries. Wave 5 reviews exactly `HERO11 Black Mini`, `HERO7 Silver`, `HERO7 White`, `HERO5 Session`, `HERO Session`, `HERO+`, and `HERO+ LCD` as built-in/integrated-battery cameras based on official GoPro product/manual evidence; no generic USB charger handoff is emitted. The measured GoPro state is **31 basic = 12 detail + 7 reviewed exclusions + 12 missing accessory detail**.

Remaining missing camera rows are Sony 107, Fujifilm 56, Panasonic 27, GoPro 12, and Insta360 7. Exact missing models are emitted by `tests/camera-accessory-coverage.test.mjs` and summarized in `CAMERA_ACCESSORY_COVERAGE.md`.

## State and persistence

Search/filter/page state is browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs locally in the browser against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend or exported as analytics free text. Clicking a manufacturer destination intentionally navigates to that official external site. Clicking an active Amazon CTA intentionally navigates to Amazon through the configured Associates mechanism.

## Language mode

`separate JA/EN pages`

The Japanese canonical root and `/en/` page are distinct indexable language pages with equivalent core search/directory behavior.

## Layout class

`hybrid`

The directory/search cards are usable on mobile while desktop width improves browsing of large result sets and pagination.

## Limits and non-goals

- ManualFinder does not host, mirror, modify, or guarantee manufacturer manual content.
- Official destinations may move or become stale; users must confirm current information at the manufacturer site.
- Missing official evidence must not be filled with guessed URLs, inferred accessories, synthetic model IDs, or retailer-only compatibility claims.
- Amazon links are commercial search handoffs, not manufacturer-source evidence or endorsements.

## Acceptance criteria

- [x] Brand/category/model-fragment/Japanese-alias filtering changes visible official-destination candidates and result count.
- [x] Large result sets remain navigable through pagination.
- [x] Result actions use maintained official manufacturer destinations; NicheWorks does not pretend to host manuals.
- [x] Verified model rows contain real identifiers and accepted official targets with no synthetic category Cartesian product.
- [x] Manufacturer-defined shared destinations remain explicit shared targets.
- [x] Japanese and English canonical pages provide equivalent core behavior and disclaimers.
- [x] Dynamic Amazon searches are deterministic and generated only from canonical metadata.
- [x] The printer audit remains **291 basic = 284 detail + 7 reviewed exclusions + 0 missing detail**.
- [x] KYOCERA remains **123 = 120 detail + 3 reviewed exclusions + 0 missing**.
- [x] Nikon camera accessory coverage remains **14 detail + 0 reviewed exclusions + 0 missing**.
- [x] DJI Waves 1–41 preserve exact reviewed boundaries and do not infer neighboring product names.
- [x] DJI Mavic 2 Enterprise Series Wave 25 activates exactly one reviewed canonical series row with official battery and charging-hub evidence.
- [x] DJI Osmo Pocket 3 Wave 26 activates exactly one reviewed canonical row with official Battery Handle compatibility evidence.
- [x] DJI Action 2 Wave 27 activates exactly one reviewed canonical row with official Power Module compatibility evidence.
- [x] DJI Pocket 2 Wave 28 activates exactly one reviewed canonical row with official Charging Case compatibility evidence.
- [x] Osmo Pocket Wave 29 activates exactly one reviewed canonical row with official Charging Case compatibility evidence.
- [x] Osmo 360 Wave 30 activates exactly one reviewed canonical row with official battery and multifunctional battery-case compatibility evidence.
- [x] DJI Goggles 2 Wave 31 activates exactly one reviewed canonical row with official battery compatibility evidence.
- [x] DJI Goggles 3, DJI Goggles Integra, and DJI Goggles N3 Wave 32 are exact reviewed exclusions backed by official built-in-battery evidence and receive no generic power handoff.
- [x] DJI RS BG30 Wave 33 activates exactly six reviewed canonical rows with DJI Store compatibility evidence.
- [x] DJI RS 3 Mini, DJI RS 4 Mini, and DJI RSC 2 Wave 34 are exact reviewed exclusions backed by DJI's official nonremovable-grip guidance.
- [x] DJI Ronin-SC and Ronin-S Wave 35 activate exact reviewed BG18/BG37 battery-grip handoffs backed by DJI Store compatibility evidence.
- [x] Nine Osmo Mobile/OM Wave 36 rows are exact reviewed exclusions backed by official nonreplaceable-battery statements.
- [x] Four legacy Osmo Wave 37 rows activate exact reviewed 980mAh or 1225mAh Intelligent Battery handoffs backed by DJI official model evidence.
- [x] Four legacy Ronin Wave 38 rows activate exact reviewed replaceable-battery handoffs backed by DJI official support/store evidence.
- [x] DJI Ronin 4D and original Osmo Action Wave 39 activate exact reviewed battery and charging-hub handoffs backed by DJI official evidence.
- [x] Six DJI controller Wave 40 rows are exact reviewed exclusions backed by official rechargeable-controller battery/charging evidence and receive no generic USB power handoff.
- [x] DJI final Wave 41 maps Osmo Nano to its reviewed Multifunctional Vision Dock and resolves the remaining five DJI rows as exact evidence-backed exclusions.
- [x] DJI Waves 1–41 reconcile to **96 basic = 70 detail + 26 reviewed exclusions + 0 missing accessory detail**.
- [x] OM SYSTEM Wave 1 activates exactly OM-1, OM-1 Mark II, and OM-3 with official BLX-1 compatibility evidence.
- [x] OM SYSTEM Wave 2 activates exactly E-M1 Mark II, E-M1 Mark III, and E-M1X with official BLH-1 compatibility evidence.
- [x] OM SYSTEM Wave 3 activates exactly TG-4, TG-5, TG-6, and TG-7 with official LI-92B compatibility evidence.
- [x] OM SYSTEM Wave 4 activates exactly seven reviewed BLS-50 rows backed by OM SYSTEM official model/accessory evidence.
- [x] OM SYSTEM Wave 5 activates exactly five BLN-1 rows backed by the official OM SYSTEM power-supply compatibility table.
- [x] OM SYSTEM Wave 6 activates exactly fifteen legacy BLS-50 rows backed by the same explicit compatibility table.
- [x] OM SYSTEM Waves 1–6 reconcile to **37 basic = 37 detail + 0 reviewed exclusions + 0 missing accessory detail**.
- [x] GoPro Wave 1 activates exactly HERO13 Black with HERO13-specific Enduro evidence.
- [x] GoPro Wave 2 activates exactly HERO9 Black through HERO12 Black with explicit Enduro compatibility evidence.
- [x] GoPro Wave 3 activates exactly HERO5 Black, HERO6 Black, HERO7 Black, HERO8 Black, and canonical HERO 2018 with explicit GoPro battery compatibility evidence.
- [x] GoPro Wave 4 activates exactly MAX and MAX2 with separate official Enduro battery evidence.
- [x] GoPro Wave 5 reviews exactly seven built-in/integrated-battery cameras as evidence-backed exclusions with no generic USB charger handoff.
- [x] GoPro currently reconciles to **31 basic = 12 detail + 7 reviewed exclusions + 12 missing accessory detail**.
- [x] The catalog-wide camera audit reconciles to **375 basic = 171 detail + 33 reviewed exclusions + 171 missing accessory detail** while seven maker/index rows remain non-actionable, and published coverage-pass camera batches are included in the denominator.
- [x] Missing-model maker diagnostics and documentation sync remain machine-readable drift guards.
- [x] Sony Japan α E-mount coverage-pass population reconciles at **107 = 104 direct + 0 shared + 3 support-only + 0 held** and the reviewed rows are loaded into the public directory through the coverage-pass batch loader.
- [x] Panasonic Japan LUMIX S/G/compact camera-body sitemap scope reconciles at **27 = 27 direct + 0 shared + 0 support-only + 0 held** and the reviewed rows are loaded through the same reusable coverage-pass batch loader.
- [x] Apple iPhone bounded User Guide scope reconciles at **31 = 0 direct + 31 shared + 0 support-only + 0 held**; every model retains its exact Apple Manuals and Downloads support page while the manufacturer-defined Japanese iPhone User Guide remains explicit as a shared target.
- [x] Fujifilm JP GFX + X-series camera manual-index scope reconciles at **56 = 52 direct + 4 shared + 0 support-only + 0 held**; structural exceptions are resolved through secondary official discovery or left explicitly at FUJIFILM's manufacturer-defined manual index rather than guessed deep URLs.
- [x] Wrong maker/category, nonexistent models, spelling variants, and other unreviewed compatibility cases fail closed.
- [x] Amazon disclosure and sponsored-link semantics remain supplied by the shared affiliate helper.

## Implementation evidence

Core ManualFinder implementation:

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- `tools/manual-finder/affiliate-config.js`
- `tools/manual-finder/affiliate-runtime.js`
- `tools/manual-finder/AFFILIATE_COVERAGE.md`
- `tools/manual-finder/CAMERA_ACCESSORY_COVERAGE.md`
- `tools/manual-finder/affiliate-fujifilm-camera-accessories-bulk.js` — 38 officially mapped Fujifilm battery/charger affiliate rows.
- `tools/manual-finder/affiliate-camera-accessories.js`
- `tools/manual-finder/affiliate-nikon-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-camera-detail-exclusions.js`
- `tools/manual-finder/COVERAGE_PASS_WORKFLOW.md`
- `tools/manual-finder/coverage-passes/sony/jp-alpha-e-mount-bodies.json`
- `tools/manual-finder/data/manuals.coverage-passes.js`
- `tools/manual-finder/data/manuals.coverage-pass.sony-jp-alpha-e-mount.js`
- `tools/manual-finder/tests/sony-emount-coverage-pass-publication.test.mjs`
- `tools/manual-finder/coverage-passes/panasonic/jp-lumix-camera-bodies-sitemap.json`
- `tools/manual-finder/data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js`
- `tools/manual-finder/tests/panasonic-lumix-coverage-pass-publication.test.mjs`
- `tools/manual-finder/coverage-passes/apple/jp-iphone-ios26-guide-models.json`
- `tools/manual-finder/data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js`
- `tools/manual-finder/tests/apple-iphone-coverage-pass.test.mjs`
- `tools/manual-finder/tests/apple-iphone-coverage-pass-publication.test.mjs`
- `tools/manual-finder/coverage-passes/fujifilm/jp-gfx-x-camera-manual-index.json`
- `tools/manual-finder/data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js`
- `tools/manual-finder/tests/fujifilm-gfx-x-coverage-pass.test.mjs`
- `tools/manual-finder/tests/fujifilm-gfx-x-coverage-pass-publication.test.mjs`
- `tools/manual-finder/affiliate-printer-detail-exclusions.js`

Reviewed DJI camera accessory ledgers:

- `tools/manual-finder/affiliate-dji-camera-accessories-wave1.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave3.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave4.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave5.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave6.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave7.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave8.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave9.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave10.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave11.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave12.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave13.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave14.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave15.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave16.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave17.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave18.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave19.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave20.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave21.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave22.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave23.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave24.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave25.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave26.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave27.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave28.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave29.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave30.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave31.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave33.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave35.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave37.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave38.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave39.js`
- `tools/manual-finder/affiliate-dji-camera-accessories-wave41.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave1.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave3.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave4.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave5.js`
- `tools/manual-finder/affiliate-om-system-camera-accessories-wave6.js`
- `tools/manual-finder/affiliate-gopro-camera-accessories-wave1.js`
- `tools/manual-finder/affiliate-gopro-camera-accessories-wave2.js`
- `tools/manual-finder/affiliate-gopro-camera-accessories-wave3.js`
- `tools/manual-finder/affiliate-gopro-camera-accessories-wave4.js`

Camera accessory tests and audit gates:

- `tools/manual-finder/tests/nikon-camera-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/nikon-camera-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/dji-osmo-action-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/dji-air-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/dji-mini-accessory-wave3.test.mjs`
- `tools/manual-finder/tests/dji-mavic3-accessory-wave4.test.mjs`
- `tools/manual-finder/tests/dji-air2-accessory-wave5.test.mjs`
- `tools/manual-finder/tests/dji-compact-power-wave6.test.mjs`
- `tools/manual-finder/tests/dji-mini2-accessory-wave7.test.mjs`
- `tools/manual-finder/tests/dji-fpv-accessory-wave8.test.mjs`
- `tools/manual-finder/tests/dji-avata-accessory-wave9.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-accessory-wave10.test.mjs`
- `tools/manual-finder/tests/dji-mavic-mini-accessory-wave11.test.mjs`
- `tools/manual-finder/tests/dji-mavic-air-accessory-wave12.test.mjs`
- `tools/manual-finder/tests/dji-mavic-pro-accessory-wave13.test.mjs`
- `tools/manual-finder/tests/dji-mavic-pro-platinum-accessory-wave14.test.mjs`
- `tools/manual-finder/tests/dji-mavic3-enterprise-accessory-wave15.test.mjs`
- `tools/manual-finder/tests/dji-inspire3-accessory-wave16.test.mjs`
- `tools/manual-finder/tests/dji-inspire2-accessory-wave17.test.mjs`
- `tools/manual-finder/tests/dji-inspire1-accessory-wave18.test.mjs`
- `tools/manual-finder/tests/dji-inspire1-proraw-accessory-wave19.test.mjs`
- `tools/manual-finder/tests/dji-spark-accessory-wave20.test.mjs`
- `tools/manual-finder/tests/dji-phantom4-accessory-wave21.test.mjs`
- `tools/manual-finder/tests/dji-phantom3-accessory-wave22.test.mjs`
- `tools/manual-finder/tests/dji-phantom3-se-accessory-wave23.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-enterprise-advanced-wave24.test.mjs`
- `tools/manual-finder/tests/dji-mavic2-enterprise-series-wave25.test.mjs`
- `tools/manual-finder/tests/dji-osmo-pocket3-accessory-wave26.test.mjs`
- `tools/manual-finder/tests/dji-action2-accessory-wave27.test.mjs`
- `tools/manual-finder/tests/dji-pocket2-accessory-wave28.test.mjs`
- `tools/manual-finder/tests/dji-osmo-pocket-accessory-wave29.test.mjs`
- `tools/manual-finder/tests/dji-osmo360-accessory-wave30.test.mjs`
- `tools/manual-finder/tests/dji-goggles2-accessory-wave31.test.mjs`
- `tools/manual-finder/tests/dji-goggles-integrated-battery-exclusions-wave32.test.mjs`
- `tools/manual-finder/tests/dji-rs-bg30-accessory-wave33.test.mjs`
- `tools/manual-finder/tests/dji-rs-integrated-battery-exclusions-wave34.test.mjs`
- `tools/manual-finder/tests/dji-ronin-grip-accessory-wave35.test.mjs`
- `tools/manual-finder/tests/dji-osmo-mobile-battery-exclusions-wave36.test.mjs`
- `tools/manual-finder/tests/dji-osmo-legacy-battery-wave37.test.mjs`
- `tools/manual-finder/tests/dji-ronin-legacy-battery-wave38.test.mjs`
- `tools/manual-finder/tests/dji-ronin4d-osmo-action-wave39.test.mjs`
- `tools/manual-finder/tests/dji-rechargeable-controller-exclusions-wave40.test.mjs`
- `tools/manual-finder/tests/dji-final-power-wave41.test.mjs`
- `tools/manual-finder/tests/om-system-blx1-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/om-system-blh1-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/om-system-li92b-accessory-wave3.test.mjs`
- `tools/manual-finder/tests/om-system-bls50-accessory-wave4.test.mjs`
- `tools/manual-finder/tests/om-system-bln1-accessory-wave5.test.mjs`
- `tools/manual-finder/tests/om-system-bls50-legacy-wave6.test.mjs`
- `tools/manual-finder/tests/gopro-hero13-accessory-wave1.test.mjs`
- `tools/manual-finder/tests/gopro-enduro-accessory-wave2.test.mjs`
- `tools/manual-finder/tests/gopro-hero8-battery-accessory-wave3.test.mjs`
- `tools/manual-finder/tests/gopro-max-enduro-accessory-wave4.test.mjs`
- `tools/manual-finder/tests/gopro-integrated-battery-exclusions-wave5.test.mjs`
- `tools/manual-finder/tests/camera-accessory-coverage.test.mjs`
- `tools/manual-finder/tests/camera-accessory-doc-sync.test.mjs`
- `tools/manual-finder/tests/affiliate-coverage.test.mjs`
- `tools/manual-finder/tests/affiliate-doc-sync.test.mjs`
- `tools/manual-finder/tests/behavior.test.mjs`

Manual data and supporting pages remain under `tools/manual-finder/data/`, `tools/manual-finder/howto/`, `tools/manual-finder/COVERAGE.md`, `tools/manual-finder/usage.html`, and `tools/manual-finder/usage-en.html`.
