# Cosmetics Source-Backed Real-Label Corpus

This corpus is shared quality evidence for:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

It is not a public product database, recommendation catalog, safety rating, or claim that a formula remains unchanged after the recorded retrieval date.

## Cohort 1

Wave 4 starts with 12 real product labels verified on official brand/product pages on `2026-09-13`.

Coverage intentionally spans:

- Japan and United States market pages;
- Japanese and English ingredient labels;
- Curél, CeraVe, and La Roche-Posay;
- toner, cleanser, emulsion, cream, sunscreen, acne-cleanser, and moisturizer examples.

The fixed cohort-1 records live in:

```txt
tools/_shared/cosmetics-real-label-corpus.json
```

## Cohort 2

PR34 expands the source-backed corpus instead of continuing to optimize only against the original 12 products.

Cohort 2 adds six United States official-product labels retrieved on `2026-09-14` from three brands not present in cohort 1:

- The Ordinary — Niacinamide 10% + Zinc 1%; Mini Hyaluronic Acid 2% + B5 (with Ceramides); Salicylic Acid 2% Solution.
- Neutrogena — Hydro Boost Water Gel, Refillable Jar + Refill Pod; Stubborn Acne AM Treatment.
- Eucerin — Advanced Repair Lotion.

The cohort expands category coverage with serum, acne-serum, gel-moisturizer, acne-treatment, and body-lotion examples. Records live separately in:

```txt
tools/_shared/cosmetics-real-label-corpus-cohort2.json
```

PR34 is deliberately a **baseline** for cohort 2. The existing cohort-1 quality floor is frozen and must continue to pass; cohort 2 is measured without inventing a release floor before its actual unknown inventory is observed in CI. The next dictionary wave must be driven by that measured cohort-2 inventory.

Every record must retain:

```txt
id
cohort
brand
product
market
category
label_language
source_type
source_url
retrieved_at
source_label
analysis_label
transform_note
```

For the original cohort-1 file, the checker assigns `cohort1` when the field is absent so its frozen records do not need to be rewritten merely to support cohort accounting.

## Source rule

Both cohorts accept only official product pages on explicitly allow-listed brand domains. Marketplace pages, retailer mirrors, review sites, ingredient databases, search snippets without an official destination, and user-submitted lists are not valid corpus sources.

The source URL and retrieval date are part of the record because manufacturers may revise formulas or page content. Where an official page itself warns that packaging may contain the latest formula, the corpus remains only a dated observation of that official web page.

## Source label vs analysis label

`source_label` preserves the ingredient list transcribed from the official page as closely as practical.

`analysis_label` is the deterministic input used by the local parser. Permitted transformations are deliberately narrow:

- remove an official active-ingredient marker such as `＊` from the ingredient token;
- remove active/inactive section headings, concentration percentages, and purpose text while retaining the active ingredient name and all ingredient names in source order;
- normalize page-layout separators to commas;
- remove a trailing formula/code annotation or terminal punctuation that is not an ingredient;
- collapse source line wrapping without rewriting ingredient names.

Slash-bearing names and aliases are deliberately retained. If the current parser/dictionary does not recognize them, that remains visible as a real corpus gap rather than being hidden by corpus cleanup.

## Coverage contract

Run:

```bash
node tools/_shared/check-cosmetics-real-label-corpus.mjs
```

The fixed cohort-1 history remains:

```txt
PR25 baseline:                    190 / 293 exact identities = 64.85%
PR26 Wave 1:                      244 / 293 exact identities = 83.28%
PR29 Wave 2:                      269 / 293 exact identities = 91.81%
PR30 JP label variants Wave 1:    273 / 293 exact identities = 93.17%
PR31 canonical records Wave 1:    275 / 293 exact identities = 93.86%
PR32 JP label variants Wave 2:    280 / 293 exact identities = 95.56%
PR33 PEG / trisiloxane Wave 1:    283 / 293 exact identities = 96.59%
```

The cohort-1 release floor remains frozen at:

```txt
exact identity coverage >= 96.5%
```

PR34 does **not** lower or replace that floor. It adds a second independently reported cohort so a new-brand/new-category baseline can be measured honestly before new dictionary work begins.

The score may improve only through reviewed parser/dictionary identity coverage. It must not improve by deleting hard products, rewriting source labels into already-known names, or weakening ambiguity protections.

Broad, incomplete, or under-specified labels remain non-exact where one chemical identity cannot be justified. In particular, `パラベン` remains a group label rather than one paraben identity, `エデト酸塩` remains a broad salt label rather than one EDTA salt identity, the truncated `Ammonium Polyacryloyldimethyl` remains non-exact, and `POE・ジメチコン共重合体`, `POEメチルグルコシド`, and `POE水添ヒマシ油` remain unresolved until one exact maintained identity is justified.

PR30–PR33 improved cohort 1 using evidence-backed Japanese/display-name mappings and reviewed canonical records. PR34 changes the optimization target by introducing genuinely new brands and categories; its checker emits overall results plus separate cohort summaries and unknown inventories so subsequent work can be selected from measured failures rather than guessed ingredients.

All dictionary additions and shared naming equivalents are available to Lite and FastScan because both tools use the maintained dictionary set and shared parser.

## Privacy and monetization

The corpus contains public product-label text only. It contains no user-entered ingredient lists, OCR images, filenames, scan results, or personal data.

Amazon affiliate links are live as a separate neutral commerce layer. Corpus records and user analysis results must not select or construct affiliate destinations dynamically, and corpus contents must not be sent to affiliate analytics. Affiliate analytics remain limited to coarse fixed metadata under the shared cosmetics affiliate contract.
