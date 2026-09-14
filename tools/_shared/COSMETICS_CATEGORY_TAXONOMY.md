# Cosmetics Verified Category Taxonomy

PR46 defines the controlled vocabulary used only by the source-backed verified category overlay. PR47 promotes two mappings that PR46 had already reviewed. The taxonomy does not rewrite or normalize legacy raw dictionary category fields.

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
- `runtime_verified: false` means the mapping has been reviewed but must not reach runtime until a dedicated provenance wave promotes it.
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

## Existing provenance mappings

All nine runtime-verified canonical identities from PR44-47 are represented in the taxonomy registry. The taxonomy checker requires their category, authority and source URL to remain identical to the runtime evidence overlay.

## Fail-closed behavior

CI fails when any of the following occurs:

- an unregistered internal verified category is introduced;
- an authority function term is assigned to more than one internal category;
- a reviewed mapping uses an authority function term not explicitly allowed for its category;
- a runtime-verified taxonomy mapping differs from runtime provenance evidence;
- an unapproved or non-HTTPS source is used;
- an ambiguous exact token such as AHA, BHA, PHA, Iron Oxides or 酸化鉄 enters the taxonomy.

## Validation

```bash
node tools/_shared/check-cosmetics-category-taxonomy.mjs
node tools/_shared/check-cosmetics-category-provenance.mjs
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

Recognition coverage, OCR behavior, legacy safety isolation, note provenance, Amazon affiliate behavior and privacy metadata remain unchanged.
