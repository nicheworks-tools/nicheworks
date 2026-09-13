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

Slash-bearing names and aliases are deliberately retained. If the current parser/dictionary does not recognize them, that remains visible as a real corpus gap rather than being hidden by corpus cleanup.

## Coverage contract

Run:

```bash
node tools/_shared/check-cosmetics-real-label-corpus.mjs
```

The same 12 source-backed products and 293 ingredient tokens are retained across the coverage waves:

```txt
PR25 baseline:                 190 / 293 exact identities = 64.85%
PR26 Wave 1:                   244 / 293 exact identities = 83.28%
PR29 Wave 2:                   269 / 293 exact identities = 91.81%
PR30 JP label variants Wave 1: 273 / 293 exact identities = 93.17%
```

PR30 raises the release floor to:

```txt
exact identity coverage >= 93%
```

The score may improve only through reviewed parser/dictionary identity coverage. It must not improve by deleting hard products, rewriting source labels into already-known names, or weakening ambiguity protections.

Broad or incomplete labels remain non-exact where one chemical identity cannot be justified. In particular, `パラベン` remains a group label rather than one paraben identity, `エデト酸塩` remains a broad salt label rather than one EDTA salt identity, and the truncated `Ammonium Polyacryloyldimethyl` remains non-exact.

Wave 1 added reviewed full INCI names and label variants observed in this corpus, including multilingual Water labels, Japanese display names, surfactants, chelators, polymers, emollients, and other exact identities.

Wave 2 added 25 additional exact English ingredient identities that occur in the same official-source corpus. It deliberately did not guess mappings for unresolved Japanese display names or quasi-drug-style labels.

PR30 adds four source-backed Japanese/abbreviated label equivalences whose canonical identities already exist uniquely in the maintained dictionary set: `PG`, `水酸化ナトリウム液`, `水酸化カリウム液(A)`, and `グリセリルエチルヘキシルエーテル`. The mapping contract and evidence are maintained in `COSMETICS_JP_LABEL_VARIANTS.md`.

Two additional source-backed candidates, `ジカプリン酸ネオペンチルグリコール` and `ラウリルヒドロキシスルホベタイン液`, remain deliberately unresolved in PR30 because their canonical targets are not yet present in the maintained nine-file dictionary set. No alias is allowed to point to a canonical identity that the maintained dictionary does not actually contain.

The checker emits the complete unresolved-name inventory so future dictionary work can be selected from measured source-backed gaps rather than from guessed high-frequency ingredients.

All dictionary additions and shared naming equivalents are available to Lite and FastScan because both tools use the maintained dictionary set and shared parser.

## Privacy and monetization

The corpus contains public product-label text only. It contains no user-entered ingredient lists, OCR images, filenames, scan results, or personal data.

Amazon affiliate links are live as a separate neutral commerce layer. Corpus records and user analysis results must not select or construct affiliate destinations dynamically, and corpus contents must not be sent to affiliate analytics. Affiliate analytics remain limited to coarse fixed metadata under the shared cosmetics affiliate contract.
