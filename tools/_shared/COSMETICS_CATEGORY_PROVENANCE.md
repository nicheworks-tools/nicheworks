# Cosmetics Verified Category Provenance

PR44 introduced a source-backed category overlay for canonical cosmetic ingredient identities. PR45 added wave 2, PR46 formalized the verified category taxonomy, PR47 promoted two taxonomy-reviewed mappings as wave 3, PR53 added Tocopheryl Acetate as wave 4, and PR54 adds three further identities using existing taxonomy terms only. None of these changes rewrites the raw recognition dictionaries merely to make the frozen 187 missing-category baseline smaller.

## Contract

A verified category entry is keyed by `canonicalIdentityKey()` and contains:

- `category`: the reviewed functional category used by the runtime;
- `sources`: one or more HTTPS source URLs supporting that function;
- `authority`: the organization responsible for the cited source.

The overlay is independent from legacy `safety` metadata and from `note_short` provenance. A verified category does not imply that an ingredient is safe, effective, appropriate for a particular concentration, or suitable for a particular user.

During canonical merge, verified category evidence is added to the canonical functional metadata. Runtime output exposes:

- `category_verified: true`
- `category_sources`
- `category_authority`

Raw recognition records remain unchanged. This keeps recognition identity/aliases separate from evidence-backed functional semantics and keeps the frozen raw gap count auditable.

## Wave 1 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `water` | `solvent` | Cosmetics Info states that water is primarily used as a solvent in cosmetics and personal care products. |
| `glycerin` | `humectant` | Cosmetics Info identifies glycerin as a well-known humectant. |
| `propylene glycol` | `humectant` | Cosmetics Info states that propylene glycol attracts water and functions as a humectant. |
| `phenoxyethanol` | `preservative` | European Commission SCCS Opinion SCCS/1575/16 evaluates phenoxyethanol specifically for use as a preservative. |
| `carbomer` | `thickener` | Cosmetics Info states that carbomers function as thickening, dispersing, suspending, and emulsifying agents; wave 1 records the normalized category `thickener`. |

## Wave 2 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `citric acid` | `pH adjuster` | Cosmetics Info explicitly lists pH adjuster among the functions of citric acid and citrate-derived ingredients. |
| `tocopherol` | `antioxidant` | Cosmetics Info states that Tocopherol functions as an antioxidant and that Tocopherol-derived ingredients function primarily as antioxidants. |

## Wave 3 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `sodium chloride` | `viscosity adjuster` | Cosmetics Info lists Sodium Chloride as a `viscosity increasing agent - aqueous`. PR46 explicitly mapped that authority wording to the internal category `viscosity adjuster`. |
| `disodium edta` | `chelating agent` | Cosmetics Info states that EDTA and related ingredients function as chelating agents. PR46 explicitly mapped that authority wording to the internal category `chelating agent`. |

## Wave 4 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `tocopheryl acetate` | `antioxidant` | Cosmetics Info explicitly states that Tocopheryl Acetate functions as an antioxidant. |

Sodium Citrate was evaluated during PR53 but intentionally deferred. Its raw canonical metadata is `buffer`, while the external source supports `pH adjuster`. The fail-closed provenance checker rejected silently treating those as equivalent, so Sodium Citrate remains outside runtime evidence until a dedicated taxonomy decision is made.

## Wave 5 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `butylene glycol` | `solvent` | Cosmetics Info states that Butylene Glycol and related glycols function as solvents in cosmetics and personal care products. |
| `dipropylene glycol` | `solvent` | Cosmetics Info states that Dipropylene Glycol and related glycols function as solvents in cosmetics and personal care products. |
| `sodium hydroxide` | `pH adjuster` | Cosmetics Info states that sodium hydroxide can be used in lesser quantities as a pH adjuster in cosmetic products. |

Wave 5 introduces no new internal category and no new authority-function translation. All three entries use terms already permitted by the explicit taxonomy.

Source URLs are stored in `VERIFIED_CATEGORY_EVIDENCE` in `cosmetic-ingredient-parser.js`, while authority-function translations are controlled by `cosmetics-category-taxonomy.json`. Both are enforced in CI.

## Non-regression rules

- The raw missing-category count remains 187; the verified overlay does not mutate recognition records to hide debt.
- Wave 1 remains exactly five reviewed canonical identities.
- Wave 2 remains exactly two reviewed canonical identities.
- Wave 3 contains exactly Sodium Chloride and Disodium EDTA.
- Wave 4 contains exactly Tocopheryl Acetate.
- Wave 5 contains exactly Butylene Glycol, Dipropylene Glycol and Sodium Hydroxide.
- Sodium Citrate remains deferred until the `buffer` vs `pH adjuster` semantic relationship is explicitly reviewed.
- Every overlay entry must exist in the maintained nine-file dictionary set.
- Every entry must have a non-empty category, source organization, and approved HTTPS source URL.
- The checker pins the reviewed source URL for every verified canonical identity.
- Authority function → internal category translations must be explicitly allowed by the taxonomy registry.
- Ambiguous exact tokens (`AHA`, `BHA`, `PHA`, `Iron Oxides`, `酸化鉄`) may not receive verified category evidence.
- If a canonical identity already has raw category metadata, the verified normalized category must match an existing raw category rather than silently contradict it.
- Legacy `safe` / `caution` / `risk` behavior is unchanged.
- OCR, recognition coverage, affiliate behavior, and privacy contracts are unchanged.

## Validation

Run:

```bash
node tools/_shared/check-cosmetics-category-taxonomy.mjs
node tools/_shared/check-cosmetics-category-provenance.mjs
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

The Cosmetics accuracy benchmark runs these checks together with parser, semantic, OCR, real-label, release-gate, and affiliate-isolation regressions. The provenance report prints raw category inventory for every reviewed canonical identity so duplicate metadata remains visible during later waves.

## Next waves

Subsequent waves may add canonical identities only after the functional category has been checked against an authoritative or primary source and, when terminology differs, an explicit taxonomy mapping exists. Legacy duplicate metadata may be used to locate candidates, but it is never sufficient evidence by itself.


## Wave 11 reviewed set

Wave 11 advances four common canonical identities that had no raw functional category at all. It adds source-backed runtime semantics without rewriting the recognition records.

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `ethylhexylglycerin` | `skin conditioning` | COSMILE Europe lists skin conditioning among Ethylhexylglycerin functions. |
| `squalane` | `emollient` | COSMILE Europe lists skin-conditioning emollient for Squalane. |
| `sodium cocoyl glutamate` | `cleanser` | COSMILE Europe lists cleansing and surfactant-cleansing functions. |
| `dimethicone` | `skin conditioning` | COSMILE Europe lists skin conditioning and skin-conditioning emollient functions. |

Wave 11 intentionally does not classify Sodium Citrate; its buffer vs pH-adjuster taxonomy remains deferred. It also does not force Niacinamide into a local role category until the external function vocabulary is mapped explicitly.


## Wave 12 reviewed set

Wave 12 advances four additional canonical identities with no raw functional category by reusing the explicit Wave 11 taxonomy mappings.

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `cetearyl alcohol` | `emollient` | COSMILE Europe lists skin-conditioning emollient. |
| `cetyl alcohol` | `emollient` | COSMILE Europe lists skin-conditioning emollient. |
| `disodium lauryl sulfosuccinate` | `cleanser` | COSMILE Europe lists cleansing. |
| `hydrogenated polyisobutene` | `emollient` | COSMILE Europe lists skin-conditioning emollient. |


## Wave 13 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `cetearyl olivate` | `emollient` | COSMILE Europe lists skin-conditioning emollient. |
| `stearyl alcohol` | `emollient` | COSMILE Europe lists skin-conditioning emollient. |
| `sodium lauroyl glutamate` | `cleanser` | COSMILE Europe lists surfactant-cleansing. |
| `sodium coco-sulfate` | `cleanser` | COSMILE Europe lists surfactant-cleansing. |


## Wave 14 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `polysorbate 80` | `emulsifier` | COSMILE Europe lists surfactant-emulsifying. |
| `sorbitan olivate` | `emulsifier` | COSMILE Europe lists surfactant-emulsifying. |
| `steareth-2` | `emulsifier` | COSMILE Europe lists surfactant-emulsifying. |
| `steareth-21` | `emulsifier` | COSMILE Europe lists surfactant-emulsifying. |


## Wave 15 reviewed set

Wave 15 begins the unsupported-legacy-category cleanup rather than selecting more category-empty identities. The reviewed source-backed role becomes the public primary role while the pre-existing raw category hint remains auditable in runtime metadata.

| Canonical identity | Verified public category | Preserved raw category hint | Source basis |
| --- | --- | --- | --- |
| `caprylyl glycol` | `emollient` | `preservative booster` | COSMILE Europe lists skin-conditioning emollient. |
| `ceramide np` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists skin-conditioning miscellaneous. |
| `cholesterol` | `emollient` | `barrier lipid` | COSMILE Europe lists skin-conditioning emollient. |
| `hexylene glycol` | `solvent` | `general` | COSMILE Europe lists solvent. |

For Caprylyl Glycol, Ceramide NP and Cholesterol, duplicate maintained records also contain a raw missing-category row. Wave 15 does not rewrite those source records. Hexylene Glycol has only the unsupported raw `general` category; that legacy value is likewise preserved for audit.

Runtime precedence is explicit: a reviewed `category_verified` value is the public primary `category`, while all observed legacy and verified functions remain in `categories` and any displaced legacy public-role hint is exposed as `legacy_category_values`. Unverified legacy conflicts retain the prior no-winner behavior.


## Wave 16 reviewed set

Wave 16 continues the unsupported-legacy-category cleanup for four identities observed repeatedly in the maintained official-product corpus. No raw recognition record is rewritten.

| Canonical identity | Verified public category | Preserved raw category hint | Source basis |
| --- | --- | --- | --- |
| `hydroxyacetophenone` | `antioxidant` | `preservative booster` | COSMILE Europe lists antioxidant. |
| `palmitic acid` | `emollient` | `general` | COSMILE Europe lists skin-conditioning emollient. |
| `stearic acid` | `cleanser` | `general` | COSMILE Europe lists cleansing. |
| `myristic acid` | `cleanser` | `general` | COSMILE Europe lists cleansing. |

All four records already carried an unsupported legacy category rather than a missing category. The shared runtime therefore exposes the reviewed role as the public primary `category`, keeps the legacy value in the complete `categories` set, and records it in `legacy_category_values` for audit.


## Wave 17 reviewed set

Wave 17 resolves Niacinamide, a high-frequency canonical identity that was recognized by the shared dictionary but remained category-empty in the frozen raw data.

| Canonical identity | Verified public category | Raw category state | Source basis |
| --- | --- | --- | --- |
| `niacinamide` | `smoothing` | category missing | COSMILE Europe lists `SMOOTHING` and describes reducing roughness or irregularities to achieve a more even skin surface. |

The raw Niacinamide record is not rewritten. The verified overlay supplies the public role, while Lite and FastScan both define the same bilingual `smoothing` role label and role-level explanation. This category is intentionally distinct from the pre-existing `soothing` category.


## Wave 18 reviewed set

Wave 18 is prioritized from the maintained 30-product official-label regression corpus. It resolves four directly source-backed public-role gaps accounting for nine ingredient occurrences in that corpus.

| Canonical identity | Verified public category | Preserved raw category state | Source basis |
| --- | --- | --- | --- |
| `hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer` | `viscosity adjuster` | `general` | COSMILE Europe lists `VISCOSITY CONTROLLING` (and emulsion stabilising). |
| `ammonium polyacryloyldimethyl taurate` | `viscosity adjuster` | `polymer` | COSMILE Europe lists `VISCOSITY CONTROLLING` (and emulsion stabilising). |
| `ethylhexyl methoxycrylene` | `skin conditioning` | `general` | COSMILE Europe lists `SKIN CONDITIONING`. |
| `glyceryl stearate se` | `emulsifier` | category missing | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |

Raw recognition records remain unchanged. For the three identities with unsupported raw categories, the reviewed role becomes the public primary `category` while the raw hint remains auditable. Glyceryl Stearate SE remains category-empty in raw data and is resolved only by the verified overlay.


## Wave 19 reviewed set

Wave 19 continues the official-label-priority cleanup with four identities that each appear twice in the maintained 30-product corpus, for eight additional public-role gaps.

| Canonical identity | Verified public category | Preserved raw category hint | Source basis |
| --- | --- | --- | --- |
| `polyacrylate crosspolymer-6` | `viscosity adjuster` | `polymer` | COSMILE Europe lists `VISCOSITY CONTROLLING` (and emulsion stabilising). |
| `polyhydroxystearic acid` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING` (and dispersing). |
| `potassium cetyl phosphate` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING` and `SURFACTANT - CLEANSING`; the reviewed public-primary role is emulsifier. |
| `sorbitan isostearate` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |

The raw dictionary is not rewritten. The source-backed role becomes the public primary category, while the legacy `polymer` / `general` hints remain available in the full internal category set and `legacy_category_values`.


## Wave 20 reviewed set

Wave 20 targets the three largest remaining directly source-backed gaps in the maintained 30-product official-label corpus. Together they account for fourteen ingredient occurrences.

| Canonical identity | Verified public category | Preserved raw category state | Source basis |
| --- | --- | --- | --- |
| `ceramide ap` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists `SKIN CONDITIONING` and `HAIR CONDITIONING`. |
| `ceramide eop` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists `SKIN CONDITIONING` and `HAIR CONDITIONING`. |
| `phytosphingosine` | `skin conditioning` | category missing | COSMILE Europe lists `SKIN CONDITIONING` and `HAIR CONDITIONING`. |

The current public-primary role is `skin conditioning`, matching the skincare-label context and the existing controlled role vocabulary. The raw `barrier lipid` hints for Ceramide AP/EOP are not deleted or rewritten; they remain auditable alongside the verified role. Phytosphingosine remains category-empty in raw data and is resolved only by the verified overlay.


## Wave 21 reviewed set

Wave 21 continues the official-label-priority cleanup with seven identities accounting for eight unresolved ingredient occurrences in the maintained 30-product corpus.

| Canonical identity | Verified public category | Preserved raw category state | Source basis |
| --- | --- | --- | --- |
| `silica` | `viscosity adjuster` | `powder` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `alumina` | `viscosity adjuster` | `powder` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `aluminum stearate` | `viscosity adjuster` | `powder` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `dimethicone crosspolymer` | `viscosity adjuster` | `texture polymer` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `glycol distearate` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |
| `myristyl myristate` | `emollient` | `general` | COSMILE Europe lists `SKIN CONDITIONING - EMOLLIENT`. |
| `lecithin` | `emulsifier` | category missing | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |

Raw recognition data remains unchanged. Unsupported legacy category hints stay auditable, while the verified source-backed category becomes the public primary role. Lecithin remains category-empty in raw data and is resolved only through the overlay.


## Wave 22 reviewed set

Wave 22 resolves six additional source-backed official-label gaps, each observed once in the maintained 30-product corpus.

| Canonical identity | Verified public category | Preserved raw category hint | Source basis |
| --- | --- | --- | --- |
| `calcium gluconate` | `chelating agent` | `general` | COSMILE Europe lists `CHELATING`. |
| `ceramide as` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists `SKIN CONDITIONING`. |
| `ceramide ng` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists `SKIN CONDITIONING - MISCELLANEOUS`. |
| `glyceryl acrylate/acrylic acid copolymer` | `humectant` | `general` | COSMILE Europe lists `HUMECTANT` (and viscosity controlling). |
| `hectorite` | `viscosity adjuster` | `general` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `tapioca starch` | `viscosity adjuster` | `powder` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |

Raw recognition records are not rewritten. Existing broad legacy category hints remain auditable, while the reviewed source-backed role becomes the public primary category.


## Wave 23 reviewed set

Wave 23 resolves eight additional source-backed official-label gaps, each observed once in the maintained 30-product corpus.

| Canonical identity | Verified public category | Preserved raw category state | Source basis |
| --- | --- | --- | --- |
| `helianthus annuus sunflower seed wax` | `skin conditioning` | `texture agent` | COSMILE Europe lists `SKIN CONDITIONING`. |
| `melaleuca alternifolia tea tree leaf oil` | `antioxidant` | `essential oil` | COSMILE Europe lists `ANTIOXIDANT` and fragrance. |
| `peg-120 methyl glucose dioleate` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |
| `peg-30 dipolyhydroxystearate` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |
| `pentaerythrityl tetraethylhexanoate` | `emollient` | `general` | COSMILE Europe lists `SKIN CONDITIONING - EMOLLIENT`. |
| `polyacrylate crosspolymer-11` | `viscosity adjuster` | `polymer` | COSMILE Europe lists `VISCOSITY CONTROLLING`. |
| `polyglyceryl-4 caprate` | `emulsifier` | category missing | COSMILE Europe lists `SURFACTANT - EMULSIFYING`. |
| `sphingolipids` | `skin conditioning` | `barrier lipid` | COSMILE Europe lists `SKIN CONDITIONING` and emollient/skin-protecting functions. |

Raw recognition data remains unchanged. The verified category supplies the answer-first public role while broad legacy hints remain auditable. Polyglyceryl-4 Caprate remains category-empty in the raw dictionary and is resolved only by the verified overlay.


## Wave 24 final official-label set

Wave 24 closes the remaining seven canonical public-role gaps in the maintained 30-product official-label corpus, representing eight unresolved ingredient occurrences before this wave.

| Canonical identity | Verified public category | Preserved raw category hint | Source basis |
| --- | --- | --- | --- |
| `triethoxycaprylylsilane` | `binder` | `general` | COSMILE Europe lists `BINDING`. |
| `p-anisic acid` | `fragrance` | `preservative support` | COSMILE Europe lists `FRAGRANCE`. |
| `polyquaternium-39` | `film former` | `conditioning polymer` | COSMILE Europe lists `FILM FORMING` and antistatic functions. |
| `polyquaternium-53` | `hair conditioning` | `conditioning polymer` | COSMILE Europe lists `HAIR CONDITIONING`. |
| `ppg-5-ceteth-20` | `emulsifier` | `general` | COSMILE Europe lists `SURFACTANT - EMULSIFYING` and cleansing functions. |
| `snail secretion filtrate` | `skin conditioning` | `animal extract` | Korea Cosmetic Association ingredient dictionary lists skin conditioning (miscellaneous). |
| `synthetic beeswax` | `viscosity adjuster` | `texture agent` | COSMILE Europe lists `VISCOSITY CONTROLLING`, binding and emulsion-stabilising functions. |

The Korea Cosmetic Association source is intentionally identified separately from COSMILE Europe and is admitted explicitly in the provenance-source allowlist. No raw recognition row is rewritten.

Wave 24 also introduces `binder` as a bilingual public role because COSMILE's `BINDING` function is distinct from the existing film-forming, emulsifying, conditioning and viscosity roles.
