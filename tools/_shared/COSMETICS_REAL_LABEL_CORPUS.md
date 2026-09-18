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

PR34 established the independent cohort-2 baseline at `94 / 129` exact-known ingredient tokens, or `72.87%`. PR35 uses that measured unknown inventory for the first cohort-2 dictionary wave rather than adding speculative ingredients.

## Cohort 3

PR36 adds a third independent source-backed baseline instead of tuning further against cohorts 1 and 2.

Cohort 3 adds six United States official-product labels retrieved on `2026-09-14` from three brands not present in either earlier cohort:

- COSRX — Advanced Snail 96 Mucin Power Essence; Low pH Good Morning Gel Cleanser.
- Vanicream — Facial Moisturizer Broad Spectrum SPF 30; Gentle Body Wash.
- The INKEY List — Oat Cleansing Balm; Caffeine Eye Cream.

This cohort deliberately broadens form and category coverage with essence, body-wash, cleansing-balm, and eye-cream examples while also re-testing cleanser and sunscreen formulas on new brands. Records live separately in:

```txt
tools/_shared/cosmetics-real-label-corpus-cohort3.json
```

PR36 establishes the cohort-3 baseline at `91 / 132` exact-known ingredient tokens, or `68.94%`, with 41 unknown tokens representing 39 distinct names. PR37 uses that measured inventory for the first cohort-3 dictionary wave. It resolves 38 source-observed exact names while retaining `Phospholipids` as an intentionally unresolved broad group label, raising cohort 3 to `131 / 132 = 99.24%`.

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

All cohorts accept only official product pages on explicitly allow-listed brand domains. Marketplace pages, retailer mirrors, review sites, ingredient databases, search snippets without an official destination, and user-submitted lists are not valid corpus sources.

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

Cohort 2 has its own measured history:

```txt
PR34 baseline:                    94 / 129 exact identities = 72.87%
PR35 dictionary Wave 1:          126 / 129 exact identities = 97.67%
```

PR35 freezes the cohort-2 Wave 1 floor at:

```txt
exact identity coverage >= 97.6%
```

Cohort 3 has its own measured history:

```txt
PR36 baseline:                    91 / 132 exact identities = 68.94%
PR37 dictionary Wave 1:          131 / 132 exact identities = 99.24%
```

PR37 freezes the cohort-3 Wave 1 floor at:

```txt
exact identity coverage >= 99.2%
```

Across cohorts 1 and 2, PR35 measures `409 / 422` exact-known ingredient tokens, or `96.92%` overall. PR36 expands the fixed corpus to 24 products, 9 brands, 16 categories, and 554 ingredient tokens. PR37 raises the combined measurement to `540 / 554` exact-known ingredient tokens, or `97.47%` overall. Each cohort keeps its own floor so a high score in one cohort cannot hide a regression in another.

PR35 adds only exact names observed in the cohort-2 official-product labels and recognizes the finite display form `Aqua (Water)` as the existing `Water` identity. PR37 follows the same rule for cohort 3: source-observed exact names are added directly, `Aqua/Water` and `Water (Aqua / Eau)` are finite aliases of `Water`, and `Cera Microcristallina` is attached to the existing `Microcrystalline Wax` identity rather than creating a conflicting second owner. The checker freezes all 28 cohort-2 Wave 1 exact names and all 38 cohort-3 Wave 1 exact names so later dictionary changes cannot silently trade recognized identities while preserving only aggregate percentages.

Three cohort-2 labels remain deliberately unresolved after Wave 1: `Carbomer Homopolymer Type B`, `Chondrus Crispus`, and `Phospholipids`. Cohort 3 repeats `Phospholipids`; it remains unresolved there as well. Repetition does not make a broad group label safe to collapse into one exact identity merely to force 100% coverage.

The score may improve only through reviewed parser/dictionary identity coverage. It must not improve by deleting hard products, rewriting source labels into already-known names, or weakening ambiguity protections.

Broad, incomplete, or under-specified cohort-1 labels also remain non-exact where one chemical identity cannot be justified. In particular, `パラベン` remains a group label rather than one paraben identity, `エデト酸塩` remains a broad salt label rather than one EDTA salt identity, the truncated `Ammonium Polyacryloyldimethyl` remains non-exact, and `POE・ジメチコン共重合体`, `POEメチルグルコシド`, and `POE水添ヒマシ油` remain unresolved until one exact maintained identity is justified.

All dictionary additions and shared naming equivalents are available to Lite and FastScan because both tools use the maintained dictionary set and shared parser.

## Privacy and monetization

The corpus contains public product-label text only. It contains no user-entered ingredient lists, OCR images, filenames, scan results, or personal data.

Amazon affiliate links are live as a separate neutral commerce layer. Corpus records and user analysis results must not select or construct affiliate destinations dynamically, and corpus contents must not be sent to affiliate analytics. Affiliate analytics remain limited to coarse fixed metadata under the shared cosmetics affiliate contract.


## Public-role zero-gap invariant

The source-backed 30-product corpus now enforces a semantic invariant in addition to exact identity coverage:

> Every label token that resolves exactly to one maintained canonical ingredient must have at least one supported bilingual public role after the shared runtime merge.

This invariant is enforced by `check-cosmetics-real-label-corpus.mjs`. It does not require under-specified, ambiguous, or deliberately deferred label tokens to become exact matches; those remain tracked by the existing unknown inventory. The invariant must not be weakened to accommodate new gaps—new exact-known gaps must be resolved through reviewed provenance and the shared role taxonomy.
