# Testing (INCI FastScan)

This document describes manual regression checks for the current photo/OCR-first and direct-text ingredient-matching workflow.

The current user-facing contract is neutral dictionary/reference state. Do not treat the legacy dictionary `safety` field as a UI safety rank.

## Quick smoke test

Run the four manual text-input checks below, then confirm:

- Results render in the result area.
- Exact known names remain identifiable through the maintained dictionary.
- Unmatched items remain visible instead of disappearing.
- Result states use the current neutral wording (`Dictionary match` / `Additional review` / `Unmatched`, or the Japanese equivalents).
- No SAFE / CAUTION / RISK safety ranking is shown as the current result contract.

### INCI / English source-label mode

1. `Sodium Hyaluronate, Fragrance, Salicylic Acid`
2.
   ```txt
   Hyaluronic Acid
   Perfume
   BHA
   ```

### Japanese source-label mode

3.
   ```txt
   ヒアルロン酸Na
   香料
   サリチル酸
   ```
4. `ヒアルロン酸Na・香料／サリチル酸`

The Japanese source-label mode performs maintained Japanese-name/alias matching. It is not a machine-translation test.

## Photo/OCR smoke test

Confirm the current first-view photo workflow:

1. Open FastScan and confirm photo/image mode is available as the primary entry path.
2. Select a local ingredient-label image.
3. Confirm a local image preview appears.
4. Run the appropriate OCR action for the source label.
5. Confirm OCR progress/status is visible while recognition runs.
6. Confirm recognized text is placed in the editable ingredient textarea.
7. Review/correct the OCR text before ingredient matching.
8. Run ingredient matching and confirm results are non-empty for a valid readable label.
9. Remove/reselect the image and confirm the previous preview does not remain as stale UI state.

OCR depends on the externally loaded Tesseract.js library, so this test also verifies that the OCR dependency can load in the test environment.

## OCR regression fixtures

These fixtures contain raw OCR-style output including noise. Copy/paste them into the text workflow when a real image is not convenient:

1. INCI/English: `tools/inci-fastscan/data/fixtures_ocr_samples/en_sample_01.txt`
2. Japanese: `tools/inci-fastscan/data/fixtures_ocr_samples/jp_sample_01.txt`

**PASS criteria**

- Ingredient-like tokens are extracted and remain reviewable, including examples such as **Sodium Hyaluronate**, **ヒアルロン酸Na**, **香料**, and **サリチル酸** where present in the fixture.
- OCR cleanup does not silently merge arbitrary adjacent lines.
- Exact dictionary-aware line repair may join adjacent OCR fragments only when the current regression contract allows it.
- Obvious non-ingredient blocks do not dominate the result list.

## Real-photo OCR accuracy benchmark (local-only runner)

The suite includes a measurement page at `/tools/inci-fastscan/qa/photo-ocr-benchmark.html` (file: `tools/inci-fastscan/qa/photo-ocr-benchmark.html`). This page is a **QA tool, not an already measured accuracy result**. It reuses the production `runOCR`, image preprocessing, OCR text cleanup and shared ingredient parser.

1. Select an **actual** cosmetic ingredient-label photo, not a text-file fixture, and independently transcribe the ingredient lines from the package as the ground-truth reference. Do not copy the initial OCR output as ground truth.
2. Select English or Japanese+English OCR according to the photographed label.
3. Run the **original** image first. This supplies a baseline with no image modifications.
4. Set 90° rotation, fine deskew ±12°, edge crop or 100–180% contrast. Run the **adjusted** image using the same photo/reference.
5. Compare normalized character error rate (CER, edit distance/reference characters), exact-ingredient recall and precision (duplicates counted) and time to complete. The CER normalizer first tokenizes label ingredients via the shared parser so the OCR cleanup's comma-to-line-break formatting does not create false OCR character errors; numeric locant commas inside ingredient names remain significant. For CER lower is better; for exact-name recall higher is better.
6. Copy the **metrics-only JSON** for later aggregation. It contains no source image, filename, transcribed label or OCR output. Raw photo and label transcription stay local to the browser. Tesseract's library/language data are downloaded externally.
7. Repeat on independent English and Japanese packaging photos, including low contrast, imperfect lighting, slight tilt, shadows, different phone cameras, high ingredient density, and text wrapping.

**Minimum objective QA sample before declaring success:** 10 independent real photos spanning both language modes, with a ground-truth transcription, measured baseline and adjusted runs for each. Record browser/device OS and test context separately without transmitting private photo contents. Report per-photo and pooled CER and exact ingredient recall; do not present a single-photo improvement as a general OCR accuracy gain. Validate mobile 360px controls and OCR execution on an actual handset before closing the device QA gate. This repository does **not** yet contain or claim results from ten independently labeled real photos.

The deterministic metric/HTML privacy regression is:
```bash
node tools/_shared/check-fastscan-photo-ocr-metrics.mjs
```
This checks metric mathematics and wiring, **not** Tesseract recognition quality on real photographs. Changes in the image options must invalidate stale measurements. For real-annotation sets, a bad recognition result is diagnostic information, not permission to silently alter the transcription or auto-correct exact dictionary matches.

## Opt-in browser-local OCR enhancement (experimental, 2026-11-02)

Both English and Japanese OCR photo interfaces now have an **off-by-default** "Enhance text" checkbox inside photo adjustments. Enabling it uses the existing shared browser canvas preview-and-recognize pipeline: grayscale conversion, fixed 1%/99% luminance histogram stretch, and up to 2× high-quality canvas enlargement capped at 3072px. The mode remains opt-in because some labels can become harder to read; the user can compare with the original photo, reset it, and correct recognized text before dictionary analysis. The photo and text stay local, with no new network/image upload feature. The checkbox change marks any earlier OCR result stale.

**Evidence boundary:** the [72-run external photo preprocessing experiment](https://github.com/nicheworks-tools/nicheworks/actions/runs/41386084537) used Node.js `sharp`, **not** this browser canvas implementation. On 12 pinned genuine English ingredient-label photos, the strongest fixed sharp recipe improved production dictionary-supported name recall **58/233 (24.89%) → 82/233 (35.19%)**, a gain of 24 source-backed matches / 10.30 percentage points. Grayscale + normalization without upscaling achieved 77/233 (33.05%) and grayscale + sharpening achieved 68/233 (29.18%). Although these support testing grayscale/contrast/enlargement, they **do not establish a 35.19% browser success rate**: canvas and sharp differ in intensity mapping and resizing. A phone/Japanese/browser-parity study is still required; the result is not general accuracy approval.

Automated regression: `node tools/_shared/check-fastscan-image-enhancement.mjs` checks untouched default-image handling, concrete grayscale pixel writes, upscale and memory cap, expected failure handling and blob-URL release, bilingual option wiring, optional QA comparison and photo privacy. The noindex QA page at `tools/inci-fastscan/qa/photo-ocr-benchmark.html` now exposes the same checkbox so manual testers can compare original and browser-enhanced scans of a **single independently transcribed real label**.

## Japanese photographed-label INCI expansion — wave 4 (2026-11-04)

This source-backed wave adds **five new non-colliding canonical INCI identities with exact Japanese package names** to the two-product Japanese photographed-label research corpus. All records have `safety: "unrated"`, neutral ingredient-role notes, and two HTTPS nomenclature/function references. Do not infer safety, product suitability, or regulatory eligibility from a dictionary match.

| Actual published Japanese display | Canonical INCI | Independent identity/role sources |
| --- | --- | --- |
| セラミドAG | Ceramide AG | [Nippon Seika manufacturer Japanese name/INCI table](https://nipponseika-cosme.com/products/phytopresome-cera-v), [COSMILE humectant/conditioning role](https://cosmileeurope.eu/inci/detail/23595/ceramide-ag/) |
| 金 | Gold | [Cosmetic-Info.jp exact Japanese / INCI entry](https://www.cosmetic-info.jp/jcln/detail.php?id=3169), [COSMILE colour and conditioning roles](https://cosmileeurope.eu/inci/detail/6171/gold/) |
| 銀 | Silver | [Beaker ingredient-name/INCI record](https://beaker.media/jsln_ingredients/555881), [COSMILE conditioning/deodorant roles](https://cosmileeurope.eu/inci/detail/20223/silver/) |
| ラウリン酸メチルヘプチル | Methylheptyl Laurate | [Japanese exact ingredient/INCI listing](https://www.ishampoo.jp/kaiseki/ingredients/59577), [COSMILE emollient role](https://cosmileeurope.eu/inci/detail/17786/methylheptyl-laurate/) |
| o-シメン-5-オール | o-Cymen-5-ol | [Cosmetic-Info.jp **revised** Japanese display/INCI entry](https://www.cosmetic-info.jp/jcln/detail.php?id=11529), [COSMILE preservative role](https://cosmileeurope.eu/inci/detail/9545/o-cymen-5-ol/) |

The old `シメン-5-オール` spelling is not silently substituted for the newer official `o-シメン-5-オール`; only the exact published corpus spelling is registered here. The o-Cymen-5-ol supplier and display-name references identify **concentration-dependent restrictions in Japan**. Gold and Silver may require form-/market-dependent review. **The UI remains non-safety-rating**, and this work does **not** certify a particular product's permitted concentration, compliance or safety.

Two particular candidate source-list names are deliberately **not matched**: `ハマメリス水` has been used for more than one Japanese-display-name/INCI identity ([separate distillate/water entries](https://www.cosmetic-info.jp/jcln/detail.php?id=79787)); `白金` is associated with both Platinum and Platinum Powder ([JP nomenclature entry](https://beaker.media/jsln_ingredients/557480)). A product source list alone is insufficient to choose between those. A similarly named `コロイド性白金` is also held until an exact Japanese-source/INCI mapping is reviewed; never merge these as synonyms.

Pre-wave 4: **90/127** publicly published Japanese product ingredient names matched the maintained dictionary. Post-wave 4 expected: **95/127**, with **32/127** still needing independent source-backed identity review. The dedicated `qa/check-japanese-source-backed-wave4.mjs` asserts exact JP/INCI identity, individual source URLs, preservation of existing canonical names, distinct entries rather than arbitrary aliases, `unrated` legacy safety and source-list positive-control coverage. Both core cosmetics QA and **actual Japanese photographed-product CI** run the tests. These 127 names are **public product-formula reference names**, not verified package-photo transcriptions; optional image preprocessing is still off by default and these data do not certify phone OCR accuracy.

## Japanese photographed-label INCI expansion — wave 3 (2026-11-03)

Following the source-backed first nine exact Japanese display-name aliases and four new canonical substances, the fixed Japanese photographed-package source inventory still contained **44 names absent from the maintained dictionary**. This wave adds **seven different, source-verified INCI substances**, each with the exact product label spelling and an individually source-backed, *neutral* function note. **All seven keep the explicit legacy `safety: "unrated"`; no new safety, pregnancy, allergy, efficacy, product or regulatory verdict is manufactured.**

| Product-source Japanese name | Distinct canonical INCI | Exact name and function evidence |
| --- | --- | --- |
| タウリン | Taurine | [Seiwa Kasei original Japanese/INCI premix](https://fuji-kasei-database.com/materials/1109/), [Mitsui Fine Chemicals raw material](https://www.mitsuifinechemicals.com/jp/department/advanced/additive/taurine/), [RAU skin-conditioning/buffering function](https://rau-cosmetics.de/wirkstofflexikon/taurine) |
| ロイシン | Leucine | [Seiwa Kasei original Japanese/INCI premix](https://fuji-kasei-database.com/materials/1109/), [COSMILE skin- and hair-conditioning](https://cosmileeurope.eu/inci/detail/8252/leucine/) |
| チロシン | Tyrosine | [Japanese ingredient-name reference](https://beauty-trendblog.com/nakami/ingredient/tyrosine/), [SpecialChem ingredient function and INCI identity](https://www.specialchem.com/cosmetics/inci-ingredients/tyrosine) |
| アスパラギン酸Na | Sodium Aspartate | [Japanese cosmetic display-name / INCI index](https://www.cosmetic-info.jp/jcln/result.php?-d=asc&-f=name&-p=all&-r=20&inci=sodium&inciOp=cn), [COSMILE humectant/buffer](https://cosmileeurope.eu/inci/detail/14552/sodium-aspartate/) |
| イノシン酸2Na | Disodium Inosinate | [Japanese cosmetic display-name / INCI index](https://www.cosmetic-info.jp/jcln/result.php?-d=asc&-f=name&-p=all&-r=20&inci=sodium&inciOp=cn), [Korean Cosmetics Association exact INCI identity and conditioning function](https://kcia.or.kr/cid/search/ingd_view.php?no=8447) |
| グアニル酸2Na | Disodium Guanylate | [Japanese cosmetic ingredient/INCI name reference](https://www.ishampoo.jp/kaiseki/ingredients/1032), [COSMILE humectant function](https://cosmileeurope.eu/inci/detail/4942/disodium-guanylate/) |
| ドデカン | Dodecane | [Japanese name/INCI source](https://www.ishampoo.jp/kaiseki/ingredients/10166), [COSMILE fragrance functional listing](https://cosmileeurope.eu/inci/detail/25844/dodecane/) |

Do **not** collapse `ロイシン` to `イソロイシン`; nor `ドデカン` to the pre-existing `イソドデカン`. These are separate canonical chemical identities despite similar names. Individual names, roles, HTTPS references, strict no-collision/identity checks and a real-photo published-source matching assertion are enforced in `qa/check-japanese-source-backed-wave3.mjs`.

A separate **regulatory-review hold** is maintained for `アミノカプロン酸 / Aminocaproic Acid`. The original Japanese public ingredient list contains that spelling, but the [European Chemicals Agency's EU Cosmetic Products Regulation Annex II page](https://echa.europa.eu/en/legislation-obligation/-/obligations/100.000.427) identifies CAS 60-32-2 / Aminocaproic Acid on the prohibition list for EU cosmetic products. **EU regulatory status is not automatically Japanese regulatory status, nor evidence about a particular product's compliance or health effects.** It must not be silently scored `safe` or registered as an ordinary cosmetic ingredient without legal jurisdiction/context review. The fact that product-source text contains it remains visible as an unmatched ingredient; no user ingredient is removed.

Expected dictionary-supported reference names on the two publicly photographed Japanese products after this wave: **83 → 90 / 127**. This figure is a source-list benchmark denominator and will be verified by CI separately from the Tesseract OCR count. The actual photo/version equivalence and physical mobile-browser OCR remain unverified, and original/optional browser-enhanced modes are still not combined into a claimed product accuracy score. All public photographs are temporary CI downloads and no raw label text or photographs are published.

## New Japanese photo-source canonical identities with no safety verdict (2026-11-03)

A second source-backed round adds **four new actual INCI identities** that were absent from the nine maintained FastScan dictionaries (and the generated names). Each name has an independent Japanese-manufacturer/distributor **exact Japanese display-name ↔ English INCI** reference, and a source-backed neutral functional category/note; each is stored with legacy `safety: "unrated"`, which does **not** mean safe or unsafe and is not used in either cosmetics tool's user-facing verdict.

| Full Japanese display name | Exact INCI identity | Function provenance |
| --- | --- | --- |
| ミリスチン酸オクチルドデシル | Octyldodecyl Myristate | [Kao Chemicals Japanese product specification](https://chemical.kao.com/ja/products/B0002083_ja/) and [COSMILE emollient role](https://cosmileeurope.eu/inci/detail/9644/octyldodecyl-myristate/) |
| ピーナッツ油 | Arachis Hypogaea (Peanut) Oil | [Ota Oil Japan manufacturer's ingredient name and INCI](https://ota-oil.co.jp/business/cosmetic-materials/arachis/) and [Summit Oil manufacturer](https://www.summit-oilmill.com/product/peanut-oil_s/) |
| 加水分解ヒアルロン酸Na | Hydrolyzed Sodium Hyaluronate | [Kewpie Japanese cosmetic raw material specification](https://www.kewpie.co.jp/finechemical/hyaluronic/habooster.html) and [COSMILE](https://cosmileeurope.eu/inci/detail/6988/hydrolyzed-sodium-hyaluronate/) |
| 炭酸水素Na | Sodium Bicarbonate | [COSMILE buffering-function reference](https://cosmileeurope.eu/inci/detail/14564/sodium-bicarbonate/) and [PMDA original sodium bicarbonate nomenclature](https://www.pmda.go.jp/files/000240229.pdf) |

The dictionary validator now accepts the **explicit legacy compatibility value `unrated` only for records with `note_verified: true`, a neutral note and HTTPS source evidence**. The semantic quality auditor accepts `unrated` as a *non-graded* legacy classification; all older safety statuses remain untouched, and user-facing FastScan matching continues to omit the legacy safety field entirely. This is deliberately more conservative than automatically grading unfamiliar ingredients `safe` or `caution`.

Baseline after the prior nine name-only aliases was **79/127** supported published Japanese ingredient names. This wave expects **83/127** (44 remain unsupported), which is a **dictionary source-list coverage denominator**, not new evidence of correct OCR on the photos. Real photographed Japanese `jpn+eng` results must be separately checked in GitHub CI on the pinned two sample photos. The photo and current marketing ingredient list may still come from different formulation versions; nothing here is a physical smartphone accuracy certification. The neutral note/role is not medical or product safety advice.


## Source-backed Japanese name alias repair — first wave (2026-11-03)

The first two photographed Japanese cosmetic packages ([baseline #41439004709](https://github.com/nicheworks-tools/nicheworks/actions/runs/41439004709)) had **127 independently published source-list ingredients**, of which only **70** were matched by the existing 1,169-record canonical ingredient dictionary. **Nine of the 57 unsupported Japanese label names** had an *already existing and distinct* canonical English INCI identity with an empty `jp` name list. This first wave attaches those **nine source-verified Japanese names** to existing entries. No new INCI substance, new cosmetic role, or inferred safety grade was added.

The exact name pairs and provenance:
- **リシンHCl / Lysine HCl, ヒスチジンHCl / Histidine HCl, フェニルアラニン / Phenylalanine, バリン / Valine, イソロイシン / Isoleucine** — Kaneda / Seiwa Kasei original [JP display names and INCI manufacturer data](https://cosmetic-material-database.custhelp.com/app/answers/detail/a_id/568/~/p.p.a.a.-c)
- **ジメチルイソソルバイド / Dimethyl Isosorbide** — [Cosmetic-Info.jp entry 555113](https://www.cosmetic-info.jp/jcln/detail.php?id=4073)
- **ベヘン酸グリセリル / Glyceryl Behenate** — [Ikeda Bussan / Gattefosse supplier ingredients](https://www.ikedabussan.com/itemindex/itemdetail/358)
- **フィトステロールズ / Phytosterols** — [Yamakawa ingredient/INCI specification](https://www.yamakawa-and.co.jp/products/)
- **ダイズステロール / Glycine Soja (Soybean) Sterols** — [Ikeda Bussan / Lucas Meyer AMISOLTRIO P JP/INCI listing](https://www.ikedabussan.com/itemindex/itemdetail/416); this is **deliberately NOT an alias for Phytosterols** (soy-specific sterols have a distinct canonical INCI identity)

All pairs are maintained in `qa/japanese-source-alias-evidence.mjs` with literal source URLs, and regressions assert exact identity mapping, absence of aliases colliding with other canonical names, that all nine appear in the two publicly sourced product lists, and no fabricated `note_short`, new canonical substance, legacy safety reclassification or automatic fuzzy matching. The runtime Japanese results remain role-first with unmatched ingredient names visible.

[Actual nine-alias Japanese photographed-package OCR CI run #41563063249](https://github.com/nicheworks-tools/nicheworks/actions/runs/41563063249) passed. After this change, **79/127** Japanese published names are covered (+9), leaving **48/127** not yet supported by the dictionary.

| Real Japanese photographed package | Published names | Dictionary-supported old → new | Original photo source matches old → new | Opt-in enhancement source matches old → new |
| --- | ---: | ---: | ---: | ---: |
| ZIGEN gel | 68 | 35 → **41** | 0 → 0 | 19 → **21** |
| KISOCARE cream | 59 | 35 → **38** | 18 → **19** | 15 → **16** |
| **Total** | **127** | **70 → 79** | **18 → 19** | **34 → 37** |

The latest fixed test's supported-name matches for enhanced photos are **37/79 = 46.84%**, compared with the older **34/70 = 48.57%**. As the denominator increases, an extra recognized name does not necessarily increase the fraction. These are **matches to publicly published formulas, NOT independently proven exact image-to-label/lot OCR recall**. Headless Chromium emulates 360px but the jpn+eng Tesseract worker runs in Node. Keep the enhancement **OFF by default** because it worsens one of the two actual Japanese product photos.

The other **48 published names** need independent Japanese display-name/INCI research, including new canonical identities where no safe schema-neutral registration currently exists. Do not guess botanical species/part, collapse distinct sterols, or assign unverified safety/efficacy claims. The public raw OCR remains editable before ingredient analysis.

## First photographed real Japanese cosmetics label OCR comparison (2026-11-02)

[GitHub Actions Japanese REAL photo QA run #41438582269](https://github.com/nicheworks-tools/nicheworks/actions/runs/41438582269) **passed**, making the first measured test of **actual photographed Japanese cosmetics ingredient back-panels**, rather than synthetic Japanese string-only fixtures. The controlled test fetched two public packaging images into a transient GitHub runner: the **ZIGEN All-in-one Face Gel** ingredients side-panel featured in the manufacturer's February 2025 article (source list from the manufacturer's own live landing page), and the **KISOCARE Super Wrinkle Cream VA No.036** ingredient label photograph featured on its @cosme product-variation page (full ingredients list provided/approved as brand product details on the same page).

| Real photographed package | Published ingredients listed | Names supported by current 1,169-record dictionary | Original JPEG JP OCR matched | Chromium enhanced JPEG JP OCR matched |
| --- | ---: | ---: | ---: | ---: |
| ZIGEN All-in-one Face Gel | 68 | 35 | 0/35 | **19/35** |
| KISOCARE Super Wrinkle Cream VA No.036 50g | 59 | 35 | **18/35** | 15/35 |
| **Aggregate** | **127** | **70** | **18/70 (25.71%)** | **34/70 (48.57%)** |

The original JPEG vs opt-in enhanced image were both recognized using real **Tesseract.js 5.0.3 `jpn+eng`** with **PSM6**. Enhanced pixels came from the actual production `image_preprocess.js` running in headless Chromium with simulated **360px mobile viewport**, but the OCR worker ran in **Node**, not a phone browser. The same Japanese-language `core_ocr_post.js`, maintained dictionary, parser, exact sequence/line-wrap repair and matcher were used. A no-OCR *published-source-only* positive control validates exact source-name scoring; it is not photo accuracy.

**Interpretation:** Browser grayscale/stretch/upscale increased source-reference dictionary matches by 16 on this two-photo sample, but worsened one of two products by 3. Consequently **retain enhancement disabled by default and let the user choose and review output**. This is not the same experimental corpus as the 12 English photos and the numerators/denominators cannot be pooled with English accuracy. The source lists represent published product formulas; a photographed package can be an earlier/later lot or label revision, and the precise photo-to-formula match has **not been independently verified**. Therefore use the term *matches against a published source list*, **not true image-derived ground-truth ingredient recall or certified Japanese OCR accuracy**. No label text, OCR output, image bytes or user inputs were uploaded; only numeric metrics and publicly listed source URLs are stored.

The source manifest at `qa/japanese-real-photo-corpus.mjs` retains source URLs, collection caveats and factual ingredient names; it does not contain photo bytes. The CI workflow `.github/workflows/fastscan-japanese-real-photo.yml` fetches images temporarily and fails rather than fabricating scores if URLs/models become unavailable. It also tests exact source self-match and checks that the ingredient lists are substantial and unique.

**Remaining gates:** this is only **2 Japanese label photos with version uncertainty**, not a 12–30 photo representative Japanese corpus or a verified actual handset. **57/127 names** on these two published product lists do not correspond to current dictionary-supported identities in the benchmark; they are excluded from the supported-only OCR denominator, not evidence that the camera OCR read them. Reviewed JP alias/dictionary growth and reliable photo-version-matched annotations are separate outstanding tasks. Never infer cosmetic product risk/safety from imperfect recognition.

## Same-pixel Chromium alternative OCR modes and annotation-extra audit (2026-11-02)

[Real photo QA run #41401053171](https://github.com/nicheworks-tools/nicheworks/actions/runs/41401053171) compared **PSM6, PSM4 and PSM11 on exactly the same 12 real English label photos** with the browser's actual `enhanceForOcr` canvas pixels, pinned Tesseract.js 5.0.3 English OCR, production spaced-dash cleanup and 1,169-entry FastScan dictionary. Unlike the older comparison on original photos, this A/B holds the postprocessor, enhanced pixels and current production parser fixed. The worker is reset to PSM6 before the first recognition on every photo to avoid experimental-parameter carryover.

| Segmentation on Chromium-enhanced photos | Reference-supported exact matches | Recall / 233 | Dictionary matches not in annotation |
| --- | ---: | ---: | ---: |
| **PSM6 current default** | **102** | **43.78%** | 7 |
| PSM4 single column | 86 | 36.91% | 10 |
| PSM11 sparse text | 93 | 39.91% | 9 |

**Decision:** retain PSM6 as the production default. The other two modes lower pooled exact-name recall by 16 and 9 names respectively, even though individual photos may differ. They also increase annotation-absent dictionary matches. No source-annotation-guided per-photo OCR mode selection or automatic multi-mode combination was implemented.

The same CI run independently assessed the **seven PSM6 matches missing from the canonical reference annotation** against the dataset's original `raw_ingredients_list` source-label transcription. **All seven had a dictionary name or alias appearing as a complete word/phrase in that transcription**. For PSM4 it was 10/10; for PSM11 it was 8/9. This is evidence that annotation-only counts can understate correct extraction, **not proof** that every match is valid: the transcription may itself be wrong, names may be ambiguous, and a phrase can occur in unexpected context. Thus these numbers are neither confirmed false positives nor fully independently verified matches. The audit reports strictly numeric counts, with no photo, OCR text or ingredient identity in CI logs or artifacts.

The photo corpus still lacks an independently labeled Japanese counterpart and a real mobile-device test. Exactly **131/233** dictionary-supported reference names remain unrecognized under the best current English Chromium-canvas and PSM6 settings. No device, Japanese-label or fully in-browser Tesseract certification is implied.

## English OCR source-delimiter and exact-dictionary rescue (2026-11-02)

[Combined Chromium real-photo QA run #41389981946](https://github.com/nicheworks-tools/nicheworks/actions/runs/41389981946) tested the **same 12 real English ingredient-label images** and same 1,169-record production dictionary, comparing old punctuation processing against explicitly enabled **spaced-dash delimiters** plus a unique full-line **dictionary-exact known-name sequence splitter**. The browser loaded the actual `image_preprocess.js` enhancement at an emulated 360px viewport; the pinned Tesseract.js 5.0.3 `eng` worker ran in Node. Source images/annotations and recognized OCR text remained ephemeral; only numeric metrics were uploaded. The new source example `3253581766538.yaml` contains genuinely hyphen-separated names such as `AQUA/WATER - GLYCERIN - CETEARYL ALCOHOL`. Previous postprocessing split commas/newlines but not these **spaced delimiters**.

| Processing on same photos | Supported reference name matches | Recall over 233 names | Matches outside annotations |
| --- | ---: | ---: | ---: |
| Historical original JPEG OCR, no dash cleanup | 58 | 24.89% | 1 |
| Original JPEG + spaced-dash cleanup + exact-sequence rescue | **84** | **36.05%** | 5 |
| Historical Chromium canvas enhancement, no dash cleanup | 76 | 32.62% | 2 |
| Chromium canvas enhancement + spaced-dash cleanup + exact-sequence rescue | **102** | **43.78%** | 7 |

The real-photo **combined enhancement recovers 26 additional reference identities / +11.16 percentage points** relative to its previous 76/233 condition. The conservative exact-sequence splitting step independently recovered 2 names on the enhanced photographs with no additional annotation-absent matches; the remaining improvement is attributable to spaced-dash cleanup, but exact contributions are **not additive** across preprocessing arms. Avoid interpreting an extra dictionary match outside the reference as a proven hallucination: source annotations may omit or group source words. The increase from 2 to 7 needs human error review, not silent approval.

**Deployed behavior:** English `app.js` explicitly enables `spacedDashDelimiter: true` when postprocessing OCR. Only delimiters surrounded by spaces are converted; `PEG-20`, `C12-15`, slash INCI names, numeric locants and Japanese postprocessing remain unchanged. `coreAnalyzeIngredients` can split a previously unmatched ASCII text fragment only when its **entire text** admits **exactly one** partition into two or more maintained names, with no unknown words dropped, no fuzzy correction and no split of an already known complete ingredient. It deduplicates the rescued identities. The results remain editable and user-reviewed; dictionary matching never establishes safety or concentration. No remote upload is added.

The numeric **OCR loss funnel** on the prior enhanced baseline found 76 matched and 157 missed, of which **65** had a literal known name/alias phrase somewhere in the raw OCR output and **92** did not. This phrase search is a *diagnostic proxy*: it is not evidence that each of the 65 could be safely recovered. The **42.92%** dash-only experimental result before the exact-sequence implementation (100/233) is not the combined code result. The **43.78%** result here is from controlled Chromium-processed public English photos, **not** actual handset, Japanese-label or end-to-end in-browser Tesseract certification. Even now 131/233 supported names are missed, so the photo OCR completion gate remains open.

## Actual Chromium-canvas 12-real-photo OCR result (2026-11-02)

[CI workflow run 41387468917](https://github.com/nicheworks-tools/nicheworks/actions/runs/41387468917) executed **24 genuine OCR recognitions** over the 12 independently annotated English product-label photos, using exactly the same pinned Tesseract.js 5.0.3 English Node OCR worker and the full 1,169-record FastScan dictionary, parser, conservative 2/3-line repair and matcher. Chromium at an emulated **360px** mobile viewport loaded `tools/inci-fastscan/js/image_preprocess.js` and prepared the enhanced image through the **real browser canvas code**. Only the numeric-only `fastscan-chromium-canvas-real-photo-metrics` artifact was uploaded; photos, human annotation text and recognized OCR text were not shared.

| Path | Supported canonical reference hits | Recall on supported 233 names | Dictionary matches outside annotation | Exact wrap repairs |
| --- | ---: | ---: | ---: | ---: |
| Original JPEG | **58/233** | **24.89%** | 1 | 3 |
| Chromium-canvas enhancement (opt-in) | **76/233** | **32.62%** | 2 | 10 |

The browser code recovers **18 additional reference names / +7.73 percentage points** overall on this small English corpus. This is lower than the offline `sharp` recipe's 82/233: the two image-processing implementations must **not** be presented as identical. Some individual photos lose matching names after enhancement (e.g., one source image went 19 to 18 hits), and the number of matches absent from annotations increased from 1 to 2. Those extra matches cannot automatically be classified as incorrect; annotations may be imperfect. **Keep enhancement OFF by default and optional.** This does not prove 32.62% performance in Japanese labels, actual handsets, other lighting/curved packaging, or fully in-browser Tesseract execution: Chromium rendered the enhanced pixels but the controlled OCR worker ran in Node. The overall OCR quality is still inadequate for automatic trust; users must review the editable text. No safety inference is based on an OCR match.

## External annotated real-photo OCR pilot (12 English-language labels)

An independent real-photo baseline can run in GitHub Actions via
`.github/workflows/fastscan-real-photo-ocr-pilot.yml`. It is an **actual photo OCR
measurement**, not a generated/simulated label regression and **not a completed
mobile-browser QA certification**.

- External data source: [ToxFox OCR development corpus](https://github.com/ki-iw/toxfox-ocr),
  fixed commit `5ba39a7b06c59ff1edb30a396fdd640f82506742`, GPL-3.0 repo.
  The pilot downloads 12 publicly available cropped ingredient-label photos and
  their associated `INCI_list` / `raw_ingredients_list` ground-truth YAML files.
  Source photo binaries and transcriptions are fetched into temporary CI storage
  and **never committed to or uploaded as NicheWorks artifacts**.
- OCR engine: Tesseract.js 5.0.3 with English language model. Output then passes
  the actual FastScan `coreProcessOCRText` and `postProcessOcrText` functions,
  and the existing `photo_ocr_metrics.js` character error / exact ingredient
  scoring with the shared ingredient parser.
- Metric outputs: per-image exact ingredient recall against the external annotated
  ingredient list, and CER against the external raw package transcription.
  The additionally reported **annotation-only control** scores the same source's
  `raw_ingredients_list` against its `INCI_list` without any photo OCR. This
  explicitly measures how much strict exact-name scoring disagrees with the
  dataset's own spellings, aliases, names with explanatory parentheses and
  separator formatting. It is **not** an OCR quality score or a correct-output
  upper bound; compare it with the raw photo OCR score before diagnosing the model.
  Pooled metrics correctly weight ingredient counts and reference characters.
  CI uploads **aggregate numeric results only**, including per-photo numeric
  scores without the image, filename of the local user, input transcription,
  OCR output or raw text. Public corpus sample IDs are included for reproducibility.
- Important limitation: source labels can contain spelling/normalization errors,
  aliases and imperfect human transcriptions. The pilot runs on **unmodified
  source photos** with no client-side canvas preprocessing. Therefore the result
  is a raw Tesseract.js real-photo baseline, **not** the accuracy of the
  end-to-end browser FastScan image-processing workflow. All 12 must have real
  OCR output to count as measured; there is no assumed acceptable performance
  threshold.
- Additional acceptance gates after this pilot: **production browser** original
  versus adjusted preprocessing, Japanese ingredient-label photos with independent
  transcription, actual 360px smartphone photo/OCR operation, curved/glare-rich
  packaging, and evaluation of errors before declaring product completion.

**First measured 12-photo pilot (2026-11-01, [GitHub Actions run 41307444468](https://github.com/nicheworks-tools/nicheworks/actions/runs/41307444468)):** all 12 external real English-language label photos were recognized, with **19.28% pooled strict annotated-ingredient exact recall**, **44.60% pooled CER against the raw transcription**, and **62.05% pooled annotation-only exact-recall control**. These are negative diagnostic results, **not a passed OCR accuracy gate**; strict matching also disagrees with the corpus's own spelling/alias conventions, so raw image OCR and exact-ingredient matching must be debugged separately. Results vary widely by photo. The first run printed valid per-photo numbers but its upload-artifact step skipped the hidden `.qa-external-fastscan-results.json` output; the next workflow revision changes to a visible numeric-only filename and makes a missing artifact a hard failure. No photographed label, OCR text, or ground truth is uploaded. Real smartphone/browser original-versus-preprocessed and Japanese measurements remain outstanding.

**Production dictionary-backed 12-photo scoring (2026-11-02 extension):** the external photo pilot also loads FastScan's **nine actual JSON dictionaries**, its generated dictionary, shared merge policy, and the exact production `core_parser.js`, `core_analyze.js` and `core_matcher.js` routines in an isolated Node VM. For each photo, it independently compares **before vs after exact dictionary-backed line-wrap repair** and reports (a) reference names covered by the deployed dictionary, (b) recall over those distinct supported reference names, (c) recognized dictionary names missing from the reference annotation, and (d) 2/3-fragment exact joins. It also runs a **no-photo raw-transcription control**. This avoids blaming OCR for names missing from the dictionary, and separates transcription errors from extraction and matching. The output artifact contains only numeric metrics; no images, source labels, recognized text or candidate suggestions. These are not whole-product safety scores and do not constitute smartphone/Japanese accuracy certification. The benchmark workflow now runs `node tools/inci-fastscan/qa/check-production-label-scoring.mjs` with exact-match/fuzzy-rejection/triple-wrap/denominator/privacy controls before downloading photos.

**Offline real-photo preprocessing A/B (2026-11-02):** the pinned 12-photo Tesseract.js corpus now also compares three **fixed**, label-agnostic recipes under constant PSM6: (1) grayscale + contrast normalization, (2) grayscale + mild gain/sharpen, and (3) grayscale + normalization + 2× maximum upscale capped at 3072px. Each candidate is measured on the **same 12 images** for strict annotated-INCI recall, label-transcription CER, and the **production dictionary's supported-name recall after exact wrap repair**, including matches not backed by annotations. These transforms are performed with pinned `sharp` **inside the offline GitHub runner**. **They are not byte-equivalent to FastScan's browser-canvas preprocessing**, so no candidate may be automatically promoted to production or claimed as a validated browser setting. Do not select per-photo variants using ground truth. A zero or negative recall gain is a valid outcome; accuracy has no artificial PASS threshold, and the original raw-image baseline remains untouched. Images and transcriptions are ephemeral; the uploaded artifact contains numeric metrics only. Results and any adoption decision must be added to this section **only after CI actually measures the 12-photo comparisons**.

**First production dictionary-backed real-photo result (2026-11-02, [GitHub Actions run 41376512656](https://github.com/nicheworks-tools/nicheworks/actions/runs/41376512656)):** real CI job **passed** and uploaded numeric-only artifact `fastscan-real-photo-ocr-metrics`. FastScan's current deployed dictionary pipeline contains **1,169 merged records** (nine JSON files + generated dictionary). The **12 photos** have 233 *distinct within each photo* reference names supported by the dictionary in total (92 additionally annotated items not matched by the dictionary, excluded from the denominator). Exact canonical-name recall on this supported subset:

| Photo route | Before dictionary wrap repair | After dictionary wrap repair | Exact repair actions | Three-part repairs |
| --- | ---: | ---: | ---: | ---: |
| Default/PSM6 original OCR | 23.61% (55/233) | **24.89% (58/233)** | 3 | 0 |
| PSM11 sparse-text OCR | 19.31% (45/233) | 21.89% (51/233) | 6 | 1 |
| **Source-raw-transcription control** (not OCR) | 73.39% (171/233) | 73.39% (171/233) | 0 | 0 |

The postprocessor and exact dictionary-based repair recovered **three** additional supported reference names from default OCR without creating additional dictionary matches absent from the annotations (before/after both report one such extra match). The triple-line implementation successfully repaired **one** name in the experimental PSM11 OCR output, but **none** in default OCR. The source-transcription-only control is much higher than photo OCR but below 100% due to ground-truth transcription vs canonical annotation/alias/layout differences. An extra match outside the annotated list is not necessarily a false positive. **Do not claim product-quality acceptance:** nearly three-quarters of dictionary-supported reference names remain unrecovered from these twelve raw photo reads; Japanese OCR, crop/contrast and smartphone browsers are still untested in this external corpus.

**Controlled real-photo segmentation A/B (2026-11-02, [GitHub Actions run 41335294961](https://github.com/nicheworks-tools/nicheworks/actions/runs/41335294961)):** all 36 OCR recognitions completed on the same 12 independently annotated English package photos and a metrics-only artifact was uploaded. Reported pooled results:

| Fixed OCR mode | Strict annotated INCI recall (higher better) | CER vs raw label transcription (lower better) | Raw OCR CER before FastScan cleanup |
| --- | ---: | ---: | ---: |
| Tesseract.js default | **19.28%** | 44.60% | 46.57% |
| PSM6 uniform text block | **19.28%** | 44.60% | 46.57% |
| PSM11 sparse text | 16.57% | **38.22%** | 40.12% |

**Decision:** retain production default. PSM11 reduces pooled character edits by 6.38 percentage points but **decreases exact-name recall by 2.71 points**; an unconditional switch would worsen a primary user-facing metric. PSM6 replicates default in this corpus. The FastScan OCR cleanup slightly reduces pooled CER in both modes (without demonstrating better exact-name recall). Individual photos vary widely and some show near-zero exact recall despite moderately low CER, so OCR text segmentation, missing ingredient boundaries, ground-truth spellings/aliases, and image quality must be investigated separately. This is not an overall mobile or Japanese accuracy certification, and is not an instruction to silently auto-correct user text. See CI numeric-only artifact `fastscan-real-photo-ocr-metrics` in that run.

The pilot also compares default Tesseract page segmentation with fixed **PSM 6** (uniform text block) and **PSM 11** (sparse text) on the same 12 photos. It reports baseline and experimental per-photo/pooled exact ingredient recall, CER against package transcription, and the raw OCR CER before ingredient cleanup, without logging image or OCR text. These modes are **offline experiments only**: no best-per-photo oracle selection and no production mode change without proven reproducible improvement. A successful job means the measurement ran, not that the recognition accuracy passed.

The pilot may be triggered manually in GitHub Actions and also runs when its own
workflow or runner is changed in a pull request. If external image/model downloads
are unavailable, the job must fail transparently rather than report a made-up
recognition score.

## Detailed result regression

For known matches, confirm cards expose the maintained reference information expected by the current UI, including canonical INCI and the route used to resolve the name where available.

For an unmatched spelling such as:

```txt
PhenoxyethanoI
```

confirm:

- The item remains visibly unmatched.
- Conservative close-match candidates may be shown when eligible.
- A candidate is never auto-applied.
- Applying a candidate requires an explicit user action.
- Applying a candidate edits the current input but does not automatically rerun analysis.

## Result controls regression

After generating a mixed result set:

- Filter by Dictionary match / Additional review / Unmatched and confirm filtering changes visibility only.
- Confirm filtering does not alter the underlying analysis.
- Use previous/next review navigation and confirm it moves only among currently visible Additional review / Unmatched cards.
- Confirm review navigation does not edit input or rerun analysis.

## Language regression

Test both JP and EN UI states:

- Static labels change language.
- Current scan/input state is preserved where the implementation contract requires it.
- Dynamic result/reference wording follows the selected UI language.
- The non-safety/non-diagnostic disclaimer remains present in both languages.
- The Japanese-label mode is not described as machine translation in either language.

## Layout regression

At minimum, verify:

- 360px width: no overlapping controls, clipped primary actions, or unusable result navigation.
- Photo/text mode controls remain usable on narrow screens.
- Result filters/review controls remain usable without breaking the page.
- Desktop keeps adequate width for detailed result review.

## PASS / FAIL criteria

**PASS** when:

- Photo/OCR and direct-text entry paths work without blank results for valid input.
- OCR output is editable before matching.
- Unknown/unmatched entries remain visible.
- Neutral result semantics are preserved.
- JP/EN switching does not revive legacy safety-ranking or translation copy.
- Result filtering and review navigation do not mutate analysis state.
- Layout remains usable at 360px and desktop widths.

**FAIL** if any of the following occur:

- Results disappear after valid input.
- OCR output cannot be reviewed/corrected before matching.
- Unmatched items vanish from results.
- SAFE / CAUTION / RISK returns as the current user-facing result ranking.
- Japanese-label matching is presented as machine translation.
- Result filters or review navigation edit/reclassify data unexpectedly.
- Layout breaks at narrow mobile width.

## Pre-merge checklist

- [ ] Photo/image path usable.
- [ ] OCR progress and editable OCR result verified.
- [ ] Direct text path usable.
- [ ] INCI/English and Japanese source-label tests pass.
- [ ] Result state/filter/review navigation checks pass.
- [ ] JP/EN wording and disclaimers pass.
- [ ] Mobile 360px layout OK.
- [ ] Automated cosmetics benchmark/release gates pass.

## Dictionary validation

Run the canonical dictionary validator from the repository root:

```bash
node tools/inci-fastscan/validate-dictionary.mjs
```

The validator currently checks the maintained static files plus the generated dictionary layer, schema fields, duplicate/overlapping identities, allowed categories, the legacy `safety` enum, and the minimum unique-English-ingredient threshold.

The legacy `safety` field remains part of the stored dictionary schema for compatibility. Passing validation for that field does **not** authorize exposing it as a current UI safety score. Runtime isolation is covered by the cosmetics legacy-safety regression.

## Automated regression commands

The pull-request workflow `.github/workflows/cosmetics-accuracy-benchmark.yml` runs the maintained cosmetics checks, including:

- shared parser regression
- dictionary/alias and semantic-quality checks
- legacy safety runtime/public-copy isolation
- canonical merge/equivalent checks
- Japanese label variants
- FastScan result, OCR, line-repair, robustness, result-control, and review-queue regressions
- Lite navigation regression
- 100-case, full-label, and source-backed real-label benchmarks
- cross-tool and release gates
- affiliate isolation contract

Keep these automated checks green before merging FastScan or shared cosmetics changes.
