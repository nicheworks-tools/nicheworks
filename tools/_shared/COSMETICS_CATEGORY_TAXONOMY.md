# Cosmetics Verified Category Taxonomy

PR46 defines the controlled vocabulary used only by the source-backed verified category overlay. PR47 promotes two mappings that PR46 had already reviewed. PR53 adds Tocopheryl Acetate using an already-authorized function term, and PR54 adds Butylene Glycol, Dipropylene Glycol and Sodium Hydroxide using already-authorized terms. The taxonomy does not rewrite or normalize legacy raw dictionary category fields.

## Why this exists

External authorities do not always use the same function labels as NicheWorks. A source may say `viscosity increasing agent - aqueous`, while the runtime uses the stable internal label `viscosity adjuster`. Those translations must be reviewed explicitly rather than inferred from similar wording.

The registry is `cosmetics-category-taxonomy.json`.

## Contract

- `scope` is `verified_category_overlay_only`.
- `mapping_policy` is `explicit_only`.
- Every internal verified category lists the authority function terms that are allowed to map to it.
- One normalized authority function term may map to only one internal category.
- Every reviewed ingredient mapping stores the reviewed source function, source organization, and HTTPS source URL.
- `runtime_verified: true` means the mapping must exactly match `verifiedCategoryEvidence` in `cosmetic-ingredient-parser.js`.
- Similar wording that is not listed in the taxonomy is not accepted automatically.

## Current internal verified categories

- `solvent`
- `humectant`
- `preservative`
- `thickener`
- `pH adjuster`
- `antioxidant`
- `viscosity adjuster`
- `chelating agent`

This list is intentionally narrower than the legacy raw category vocabulary. The taxonomy is not a full rewrite of every historical category string.

## Explicit cross-terminology mappings

### Sodium Chloride

Authority wording: `viscosity increasing agent - aqueous`

Internal verified category: `viscosity adjuster`

Source: https://www.cosmeticsinfo.org/ingredient/sodium-chloride/

The source explains that Sodium Chloride can increase the thickness of the aqueous portion of cosmetic products and lists it as a viscosity increasing agent - aqueous. PR46 reviewed this mapping; PR47 promotes it to `runtime_verified: true`.

### Disodium EDTA

Authority wording: `chelating agents`

Internal verified category: `chelating agent`

Source: https://www.cosmeticsinfo.org/ingredient/disodium-edta/

The source states that EDTA and related ingredients function as chelating agents in cosmetics and personal care products. PR46 reviewed this mapping; PR47 promotes it to `runtime_verified: true`.

## Direct terminology mappings added in wave 4

### Tocopheryl Acetate

Authority wording: `antioxidant`

Internal verified category: `antioxidant`

Source: https://www.cosmeticsinfo.org/ingredient/tocopherol/

No cross-terminology normalization is needed: Cosmetics Info directly states that Tocopheryl Acetate functions as an antioxidant.

Sodium Citrate was considered in PR53 but is intentionally not registered. Its raw canonical category is `buffer`, while the reviewed source supports `pH adjuster`; the checker fails closed until that relationship is explicitly resolved.

## Direct terminology mappings added in wave 5

### Butylene Glycol

Authority wording: `solvent`

Internal verified category: `solvent`

Source: https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/

Cosmetics Info groups Butylene Glycol with related glycols and states that they function as solvents and viscosity decreasing agents. Wave 5 records only the already-authorized `solvent` function.

### Dipropylene Glycol

Authority wording: `solvent`

Internal verified category: `solvent`

Source: https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/

Cosmetics Info directly states that Dipropylene Glycol and related glycols are used as solvents. No taxonomy expansion is needed.

### Sodium Hydroxide

Authority wording: `pH adjuster`

Internal verified category: `pH adjuster`

Source: https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/

Cosmetics Info states that sodium hydroxide can be used in lesser quantities as a pH adjuster for cosmetic products. Wave 5 records only that direct function.

## Existing provenance mappings

All thirteen runtime-verified canonical identities from waves 1-5 are represented in the taxonomy registry. The taxonomy checker requires their category, authority and source URL to remain identical to the runtime evidence overlay.

## Fail-closed behavior

CI fails when any of the following occurs:

- an unregistered internal verified category is introduced;
- an authority function term is assigned to more than one internal category;
- a reviewed mapping uses an authority function term not explicitly allowed for its category;
- a runtime-verified taxonomy mapping differs from runtime provenance evidence;
- an unapproved or non-HTTPS source is used;
- an ambiguous exact token such as AHA, BHA, PHA, Iron Oxides or 酸化鉄 enters the taxonomy;
- Sodium Citrate is promoted without resolving the existing raw `buffer` vs external `pH adjuster` semantic mismatch.

## Validation

```bash
node tools/_shared/check-cosmetics-category-taxonomy.mjs
node tools/_shared/check-cosmetics-category-provenance.mjs
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

Recognition coverage, OCR behavior, legacy safety isolation, note provenance, Amazon affiliate behavior and privacy metadata remain unchanged.


## Wave 11 taxonomy expansion

Wave 11 adds three explicit authority-function translations because the prior verified taxonomy intentionally covered only the earlier narrow function set:

- COSMILE `skin conditioning` → NicheWorks `skin conditioning`
- COSMILE `skin conditioning - emollient` → NicheWorks `emollient`
- COSMILE `cleansing` → NicheWorks `cleanser`

The reviewed runtime mappings are Ethylhexylglycerin, Squalane, Sodium Cocoyl Glutamate and Dimethicone. These mappings are exact and source-backed; the change does not infer mappings for other legacy categories.


## Wave 12 mappings

Wave 12 requires no new authority-function vocabulary. It reuses the reviewed Wave 11 translations for `skin conditioning - emollient` → `emollient` and `cleansing` → `cleanser` for Cetearyl Alcohol, Cetyl Alcohol, Disodium Lauryl Sulfosuccinate and Hydrogenated Polyisobutene.


## Wave 13 taxonomy extension

Wave 13 adds the exact COSMILE authority term `surfactant - cleansing` as an explicit second source-function vocabulary entry for the existing internal `cleanser` category. No fuzzy or inferred terminology mapping is introduced.


## Wave 14 taxonomy expansion

Wave 14 adds `emulsifier` to the verified overlay taxonomy with the exact COSMILE authority term `surfactant - emulsifying`. The four reviewed mappings are Polysorbate 80, Sorbitan Olivate, Steareth-2 and Steareth-21.


## Wave 15 taxonomy expansion

Wave 15 adds the exact COSMILE authority term `skin conditioning - miscellaneous` as an explicit source-function synonym for the existing internal `skin conditioning` category. It does not create a new public category.

The reviewed mappings are:

- Caprylyl Glycol: `skin conditioning - emollient` → `emollient`
- Ceramide NP: `skin conditioning - miscellaneous` → `skin conditioning`
- Cholesterol: `skin conditioning - emollient` → `emollient`
- Hexylene Glycol: `solvent` → `solvent`

This wave also formalizes precedence for reviewed provenance over unsupported legacy category hints. The verified mapping controls the public primary role, while legacy values remain visible for audit and are not rewritten in the raw dictionaries.


## Wave 16 mappings

Wave 16 requires no new authority-function vocabulary. It reuses exact reviewed mappings already present in the controlled taxonomy:

- Hydroxyacetophenone: COSMILE `antioxidant` → NicheWorks `antioxidant`
- Palmitic Acid: COSMILE `skin conditioning - emollient` → NicheWorks `emollient`
- Stearic Acid: COSMILE `cleansing` → NicheWorks `cleanser`
- Myristic Acid: COSMILE `cleansing` → NicheWorks `cleanser`

As in Wave 15, these source-backed mappings control the public primary role without deleting or rewriting the raw legacy category hints.


## Wave 17 taxonomy expansion

Wave 17 adds one exact authority-function mapping:

- COSMILE `smoothing` → NicheWorks `smoothing`

This is a new public role category because `smoothing` and the existing `soothing` category describe different functions and must not be conflated. Niacinamide is the first reviewed canonical identity using the category.

Public copy is synchronized across both tools:

- Japanese role label: `肌をなめらかに`
- English role label: `Smoothing`
- Japanese explanation: `肌表面の粗さや凹凸を減らし、なめらかに整える目的で使われる成分です。`
- English explanation: `Used to smooth the skin surface by reducing roughness or irregularities.`


## Wave 18 mappings

Wave 18 introduces no new authority-function vocabulary. It reuses existing explicit mappings:

- `viscosity controlling` → `viscosity adjuster`
- `skin conditioning` → `skin conditioning`
- `surfactant - emulsifying` → `emulsifier`

The reviewed mappings are Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer, Ammonium Polyacryloyldimethyl Taurate, Ethylhexyl Methoxycrylene and Glyceryl Stearate SE. Where COSMILE lists multiple functions, Wave 18 records only the directly supported public role needed by the current controlled taxonomy and does not invent an `emulsion stabilising` public category.


## Wave 19 mappings

Wave 19 introduces no new category or authority-function vocabulary. It reuses:

- `viscosity controlling` → `viscosity adjuster`
- `surfactant - emulsifying` → `emulsifier`

Polyhydroxystearic Acid also has a COSMILE `dispersing` function, and Potassium Cetyl Phosphate also has `surfactant - cleansing`. The current runtime overlay supports one reviewed public-primary category, so Wave 19 records the directly supported role already represented by the controlled taxonomy and preserves other source/raw semantics outside that primary slot rather than inventing a compound public label.


## Wave 20 mappings

Wave 20 requires no new taxonomy vocabulary. All three identities reuse the existing exact authority mapping:

- COSMILE `skin conditioning` → NicheWorks `skin conditioning`

COSMILE also lists `hair conditioning` for Ceramide AP, Ceramide EOP and Phytosphingosine. The current overlay supports one reviewed public-primary category, so Wave 20 selects the directly supported skin-conditioning role for the skincare ingredient-results surface without deleting the additional source function or the raw barrier-lipid metadata.


## Wave 21 mappings

Wave 21 introduces no new public category or authority-function vocabulary. It reuses:

- `viscosity controlling` → `viscosity adjuster`
- `surfactant - emulsifying` → `emulsifier`
- `skin conditioning - emollient` → `emollient`

Several source pages list additional cosmetic functions beyond the selected public-primary role. Those functions are not collapsed into invented compound public labels. The controlled overlay records the reviewed primary role needed by the current answer-first UI while raw/source semantics remain auditable.


## Wave 22 mappings

Wave 22 introduces no new public category or authority-function vocabulary. It reuses existing explicit mappings:

- `chelating` → `chelating agent`
- `skin conditioning` → `skin conditioning`
- `skin conditioning - miscellaneous` → `skin conditioning`
- `humectant` → `humectant`
- `viscosity controlling` → `viscosity adjuster`

Where a source lists multiple functions, the overlay records one reviewed public-primary role already supported by the controlled taxonomy and does not invent compound labels.
