# Cosmetics Completion Baseline

Baseline main SHA: `c979c8a06a2a6491d66a0647533cb572a183602d`

This document records the starting point for completing Cosmetic Ingredient Checker Lite and INCI FastScan. It is a product-completion baseline, not a claim that the current data is complete.

## Current inventory

- Maintained dictionary files: 9
- Source records: 725
- Canonical identities: 599
- Canonical identities with a currently supported public role explanation: 408 / 599 (68.11%)
- Canonical identities without a supported public role explanation: 191
- Records missing a category: 187
- Records whose category exists but has no current public role explanation: 122
- Records missing `note_short`: 538
- Records with explicit evidence/provenance metadata: 0
- Records missing a maintained Japanese name: 113

## Completion interpretation

### Lite core completion

Lite is functionally complete when a pasted ingredient identity resolves to a supported public role and bilingual role explanation whenever the maintained data actually supports that result, while unsupported data remains explicit as `情報不足 / Information incomplete`.

The first completion priority is therefore to reduce the 191 canonical identities that cannot currently produce a supported role-first public result. This must be done by reviewed category/semantic work, not by fabricating descriptions.

### Shared data strong completion

The stronger shared-data target additionally requires ingredient-specific notes and provenance/evidence metadata. The current source layer is not close to that target: 538 records lack `note_short`, and none of the 725 records currently carry evidence metadata recognized by the shared audit.

Ingredient-specific notes must not be bulk-generated or silently inferred from category labels.

### FastScan completion

FastScan inherits the shared-data requirements and additionally needs the OCR/review workflow to be reliable on real cosmetic labels. Match-route and dictionary-debug metadata remain secondary to the public role/explanation result.

## Ordered work

1. Ratchet the current debt so new dictionary growth cannot silently make completion metrics worse.
2. Review existing unsupported categories and add public role labels/explanations only where the category semantics are clear and defensible.
3. Resolve records with no category using source-backed review rather than inference from legacy safety/note text.
4. Add provenance/evidence metadata and reviewed ingredient-specific notes in bounded waves.
5. Finish FastScan OCR image handling and real-photo regression after the shared data layer is substantially cleaner.

## Current largest unsupported public-role categories

- `general`: 19
- `powder`: 15
- `protein`: 12
- `fragrance allergen`: 11
- `barrier lipid`: 10
- `essential oil`: 7
- `polymer`: 5
- `wax`: 5
- `animal extract`: 4
- `conditioning polymer`: 4
- `humectant/solvent`: 4

`general` is intentionally not a public role and should be resolved through record-level semantic review, not exposed as a meaningful ingredient function.


## Runtime provenance correction

The original baseline intentionally counted only raw dictionary fields. That remains useful as raw-data debt, but it no longer represents runtime provenance after the verified overlay work.

Current runtime provenance on main:

- verified category overlay identities: 116
- verified note overlay identities: 30
- verified note identities with maintained Japanese naming: 30
- strong runtime data identities (supported public role + Japanese name + source-backed verified ingredient-specific note): 30 / 599

Accordingly, completion readiness must report raw dictionary debt and runtime verified provenance separately. A raw evidence count of zero must not be interpreted as zero runtime provenance.

The runtime provenance floors are ratcheted at 119 verified categories, 30 verified notes, and 30 strong runtime identities so later changes cannot silently discard completed provenance work. Wave 7 adds source-backed ingredient-specific notes for Xanthan Gum, Niacinamide, Ceramide NP, and Ethylhexylglycerin after the Wave 6 common-label expansion.
