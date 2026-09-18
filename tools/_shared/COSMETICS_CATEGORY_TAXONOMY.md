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
