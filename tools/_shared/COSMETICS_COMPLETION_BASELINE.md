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

Reviewed runtime provenance after source-backed Note Wave 28 (the raw inventory above remains frozen):

- verified category overlay identities: **196**
- verified note overlay identities: **185**
- verified note identities with maintained Japanese naming: **185**
- strong runtime data identities (supported public role + Japanese name + source-backed verified ingredient-specific note): **185 / 599**
- runtime public role explanations: **598 / 599 (99.83%)**; **1** intentionally ambiguous identity remains unresolved. This is distinct from the frozen 408/599 raw-canonical baseline.

Accordingly, completion readiness must report raw dictionary debt and runtime verified provenance separately. A raw evidence count of zero must not be interpreted as zero runtime provenance.

The runtime provenance floors are ratcheted at 196 verified categories, 185 verified notes, and 185 strong runtime identities so later changes cannot silently discard completed provenance work. Wave 20 adds source-backed ingredient-specific notes for Glycine, Lactic Acid, PEG-100 Stearate, and Proline.


Wave 21 (2026-10-31) verifies three additional common-label notes against COSMILE Europe: 1,2-Hexanediol, Sodium Citrate, and Urea. Raw recognition records remain unchanged; verified runtime strong readiness is 85/599. Historical baseline metrics above remain frozen inventory, not a statement that all 599 identities have complete descriptions.


Category Wave 26 / Verified Note Wave 22 (2026-10-31) reviews 11 previously public-role-incomplete identities with named official COSMILE Europe ingredient-function URLs. These are exact per-ingredient evidence mappings, not automatic category generalizations. No raw recognition dictionary was rewritten, and no unsupported category or safety conclusion was invented. The stronger incomplete-note backlog is **503/599**.


Category wave27 / note wave23 (2026-10-31): 12 more reviewed source-linked roles and ingredient-specific notes (hydrolyzed proteins, mineral salts, inorganic functions and fragrance) were independently checked against individual COSMILE Europe records. This leaves **55/599** unresolved public role identities and **491/599** identities without the stronger reviewed note. The data inventory is still 725 raw source records / 599 canonical identities; product-safety scoring and raw recognition metadata are unchanged. These are release measurements subject to CI confirmation.


Category wave28 / note wave24 (2026-10-31): 18 independently source-reviewed entries including film-forming polymers, skin-conditioning ceramides, mineral ingredients, and Padimate O UV-filter identity. Adds an explicit reviewed `COLORANT` taxonomy function for Kaolin and Magnesium Stearate. Runtime **562/599 supported primary roles** (37 unresolved) and **126/599 source-backed ingredient-specific notes** (473 unresolved). These are release target values subject to CI validation. Raw 725 records and 599 canonical names unchanged.


Category wave29 / note wave25 (2026-10-31): 14 source-reviewed ingredients including animal-derived extracts, cleansing soap salts, sea salt, camphor, hydrochloric acid, essential oils and lichen extracts. Runtime public roles target **576/599 (96.16%)**, leaving **23** incomplete; source-backed ingredient notes target **140/599 (23.37%)**, leaving **459** incomplete. Exact authoritative COSMILE pages, previous raw category values, and alias/name ambiguity invariants are validated in CI. The raw 725-record dataset stays unchanged.


Category wave30 / verified note wave26 (2026-11-01): 16 individually checked category functions from COSMILE Europe (13) and the U.S. FDA sunscreen active-ingredient list (3). Runtime supported public roles now target **592 / 599 (98.83%)**, leaving **7** unresolved; ingredient-specific source-backed notes **156 / 599 (26.04%)**, leaving **443** without stronger notes. FDA references **function only**, not an assertion of current regulatory safety, approval or effectiveness for any finished product. Individual ingredient name variants in the data are documented, not silently applied to unrelated chemicals. BHA remains intentionally unresolved as an ambiguous identity. Raw 725 rows/599 canonical identities unchanged.


Category Wave 31 / Verified Note Wave 27 (2026-11-01): individual official or peer-reviewed sources clarify Disodium EDTA Dihydrate (Health Canada chelating), Benzyl Cinnamate (Korea Cosmetic Association fragrance), Citrus Aurantium Bergamia (Bergamot) Fruit Oil (Health Canada fragrance), Talc/PTFE (COSMILE BULKING), and Nylon-6 (Cosmetic Ingredient Review journal BULKING and opacifying). A new **bilingual BULKING role** is added to Lite/FastScan rather than reclassifying all powders. The specific canonical label `BHA` is a known ambiguous abbreviation and remains explicitly unresolved, not falsely shown as complete. With 598/599 roles, strong notes are 162/599, leaving 437 source-backed ingredient notes. CI measured values must verify these targets. This does not certify cosmetic-product safety or real-photo OCR accuracy.


Verified ingredient note wave 28 (2026-11-01): 23 additional high-visibility INCI identities (hyaluronic acid, UV-filter minerals, retinol, ascorbic acid, petrolatum, glycolic acid, parabens, humectant sugars and phosphate buffers) were reviewed individually against their COSMILE Europe ingredient-function pages. Existing public-role categories and 599 canonical name recognition records remain unchanged. Target strong provenance completion **185/599 (30.88%)**, **414** identities still missing independent source-backed notes; supported public role **598/599** remains unchanged because ambiguous BHA is intentionally unresolved. CI must verify measurements before release. No safety, product concentration or efficacy scoring is inferred.
