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

Every record must retain:

```txt
id
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

## Source rule

Cohort 1 accepts only official product pages on explicitly allow-listed brand domains. Marketplace pages, retailer mirrors, review sites, ingredient databases, search snippets without an official destination, and user-submitted lists are not valid corpus sources.

The source URL and retrieval date are part of the record because manufacturers may revise formulas or page content. Where an official page itself warns that packaging may contain the latest formula, the corpus remains only a dated observation of that official web page.

## Source label vs analysis label

`source_label` preserves the ingredient list transcribed from the official page as closely as practical.

`analysis_label` is the deterministic input used by the local parser. Permitted transformations in cohort 1 are deliberately narrow:

- remove an official active-ingredient marker such as `＊` from the ingredient token;
- remove active/inactive section headings and concentration percentages while retaining the ingredient name and source order;
- normalize page-layout separators to commas;
- remove a trailing formula/code annotation that is not an ingredient;
- collapse source line wrapping without rewriting ingredient names.

Slash-bearing names and aliases are deliberately retained. If the current parser/dictionary does not recognize them, that remains visible as a real corpus gap for the next PR rather than being hidden by corpus cleanup.

## Baseline rule

Run:

```bash
node tools/_shared/check-cosmetics-real-label-corpus.mjs
```

The checker validates provenance/schema/diversity and reports current exact-identity coverage plus frequent unknown strings.

PR25 establishes a baseline and therefore does **not** impose a release coverage threshold. PR26 must use the measured gaps as the input for dictionary/parser improvements. It must not improve the score by deleting hard products, rewriting source ingredients into already-known names, or weakening ambiguous-key protections.

## Privacy and monetization

The corpus contains public product-label text only. It contains no user-entered ingredient lists, OCR images, filenames, scan results, or personal data.

Amazon remains disabled during this wave. The corpus must not be used to dynamically recommend a product based on a user's detected ingredient list, and corpus records must not be sent to affiliate analytics.
