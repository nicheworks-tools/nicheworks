# Cosmetics Japanese Label Variant Contract

This contract records reviewed Japanese label forms that may resolve to maintained canonical ingredient identities in both cosmetics tools.

The mappings in this wave are source-backed label/name equivalences. They are not safety, efficacy, concentration, suitability, or medical claims.

## Active mappings

| Observed / accepted label | Canonical identity | Evidence |
| --- | --- | --- |
| `PG` | `Propylene Glycol` | MHLW alias table lists `PG` for プロピレングリコール: https://www.mhlw.go.jp/web/t_doc?dataId=00tb3376&dataType=1&pageNo=1 |
| `水酸化ナトリウム液` | `Sodium Hydroxide` | PMDA additive list identifies 水酸化ナトリウム液 as Sodium Hydroxide Solution: https://www.pmda.go.jp/files/000223946.pdf |
| `水酸化カリウム液(A)` | `Potassium Hydroxide` | MHLW specification defines 水酸化カリウム液(A) as a KOH aqueous solution: https://www.mhlw.go.jp/web/t_doc?dataId=00tc3056&dataType=1&pageNo=1 |
| `グリセリルエチルヘキシルエーテル` | `Ethylhexylglycerin` | Iwaki cosmetic raw-material documentation lists エチルヘキシルグリセリン and the quasi-drug display variant グリセリルエチルヘキシルエーテル together: https://www.iwaki-kk.co.jp/dcms_media/other/B00025_2025.pdf |
| `ジカプリン酸ネオペンチルグリコール` | `Neopentyl Glycol Dicaprate` | KOKYU ALCOHOL KOGYO identifies ジカプリン酸ネオペンチルグリコール with INCI `NEOPENTYL GLYCOL DICAPRATE`: https://www.kak.co.jp/product/plant_petroleum_derived_ester/item_12 |
| `ラウリルヒドロキシスルホベタイン液` | `Lauryl Hydroxysultaine` | Kao Japan identifies the external-standard label ラウリルヒドロキシスルホベタイン液 for AMPHITOL 20HD, while Kao's English product page gives INCI `LAURYL HYDROXYSULTAINE`: https://chemical.kao.com/ja/products/B0001639_ja/ and https://chemical.kao.com/en/products/B0001639_en/ |

## PR31 canonical record activation

PR30 deliberately deferred the last two mappings because their canonical targets did not yet exist in the maintained nine-file dictionary set. PR31 closes that structural gap by adding reviewed canonical records for:

- `Neopentyl Glycol Dicaprate`, category `emollient`, with Japanese label `ジカプリン酸ネオペンチルグリコール`;
- `Lauryl Hydroxysultaine`, category `surfactant`, with Japanese label `ラウリルヒドロキシスルホベタイン液`.

The labels are attached to the canonical records themselves rather than introduced as dangling shared aliases. The dictionary's legacy `safety` field remains an internal compatibility field; this mapping contract does not turn that field into a safety claim.

## Guardrails

- Matching remains exact after the shared parser's existing NFKC/punctuation normalization. This wave adds no fuzzy auto-replacement.
- A label variant is activated only when the evidence supports one maintained canonical identity and that canonical target exists uniquely in the maintained dictionary set.
- Broad labels such as `パラベン` and `エデト酸塩` remain unresolved rather than being forced onto one member of a chemical group.
- The truncated corpus token `Ammonium Polyacryloyldimethyl` remains unresolved.
- Amazon destinations remain fixed and independent of these mappings, ingredient input, OCR output, or analysis results.

Run the regression with:

```bash
node tools/_shared/check-cosmetics-jp-label-variants.mjs
```
