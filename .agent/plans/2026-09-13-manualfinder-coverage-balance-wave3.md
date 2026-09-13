# ManualFinder coverage balance and Wave 3 plan

Date: 2026-09-13

## Objective

Move ManualFinder from opportunistic deep expansion of a small number of easy official indexes to balanced manufacturer coverage. Preserve the existing strict evidence contract while giving major generic-only brands a defined rotation.

## Starting state

- Accepted verified model/caliber rows before Wave 3: 1,477.
- Seiko: 443 rows and paused after Wave 2AR.
- Non-Seiko before Wave 3: 1,034 rows.
- Curated baseline brands: 66.
- Baseline brands with accepted model-level expansion before Wave 3: 6.
- Baseline brands still generic-only before Wave 3: 60.
- Additional expanded makers outside the baseline include Aterm, OKI, CASIO, Insta360, FUJIFILM Business Innovation, Hisense, Haier, Roland and Seiko.

The prior row count is therefore not a proxy for broad manufacturer coverage.

## Source audit

Current official manufacturer sources were rechecked before setting the rotation.

- Nikon exposes a dedicated Web-manual index with model-specific documentation and is the cleanest bounded first target.
- Brother exposes exact product-manual search and large explicit product lists.
- Sony exposes large category indexes and exact product names, but the catalog is too large for a single safe wave.
- Epson exposes model/category support manuals and direct official manual documents.
- Canon exposes product-group -> series -> model manual selection.
- Panasonic exposes part-number search and broad product categories.

No inferred/manual URL templates may be used merely because a vendor URL pattern appears regular.

## Execution order

### Inventory PR

- Add `tools/manual-finder/COVERAGE.md` as the cross-maker coverage authority.
- Record accepted row counts and baseline generic-only state.
- Lock a two-consecutive-wave maximum while any P0 brand is still generic-only, except a <=25-row residual closure.
- Explicitly pause Seiko/Roland expansion unless correcting published data.

### Wave 3A — Nikon

- Source only from Nikon official Web manuals / Download Center.
- Begin with a coherent mirrorless-camera batch whose model names and direct Web-manual destinations are explicitly listed by Nikon.
- Prefer Japanese Web manuals where available.
- Store one row per real camera model.
- If Nikon groups documents by model family, preserve that grouping explicitly rather than inventing a distinct destination.
- Keep HLG/cloud error supplements out of the primary-manual field.

Wave 3A implementation result:

- Source boundary: Nikon official Japanese Web-manual portal, mirrorless-camera section.
- Accepted models: 14/14 explicitly listed mirrorless-camera models.
- Unique primary Web-manual targets: 12.
- Direct rows: 10.
- Vendor-shared rows: 4 (`Z7II`/`Z6II`, `Z7`/`Z6`).
- Supplemental HLG/Nikon Imaging Cloud error documents are not promoted as the primary manual.
- Nikon becomes `expanded`, not company-complete; DSLR, compact, lenses and other product sections remain outside this pass.

### Wave 3B — Brother

- Select one bounded printer/MFP family from the official product-manual search.
- Exact model identity and official product-manual page are required.

### Wave 3C — Sony

- Select one category only.
- Do not treat the 1,094-entry camera/camcorder catalog as one wave.
- Use product-specific official manual/support destinations and record vendor-defined sharing if present.

### Wave 3D / 3E

- Rotate to Epson/Canon, then Panasonic, based on clean exact-target batches discovered during the audit.

## Acceptance gates

Every data PR must report:

- accepted row count;
- unique maker+model duplicate count;
- direct/shared resolution counts;
- official source boundary;
- held/unresolved examples instead of guessed URLs;
- whether the maker remains `expanded` or qualifies for `coverage-pass-complete` under `COVERAGE.md`.

## Non-goals

- No attempt to maximize counts by generating maker x model/category combinations.
- No generic support page disguised as model-level coverage.
- No affiliate or monetization changes in coverage PRs.
- No return to consecutive Seiko archive waves during the first Wave 3 rotation.

## Progress

- [x] Reconstruct accepted model-level counts from merged Wave 1 / Wave 2 PR contracts.
- [x] Audit all 66 curated baseline brands for model-level state.
- [x] Recheck official source structures for Nikon, Brother, Sony, Epson, Canon and Panasonic.
- [x] Add cross-maker coverage authority and rotation rule.
- [x] Merge inventory PR after repository CI (#703).
- [x] Implement Wave 3A Nikon from the inventory-locked main baseline.
- [ ] Merge Wave 3A after repository CI.
- [ ] Implement Wave 3B Brother from latest main.
- [ ] Continue rotation with Sony before revisiting deep-covered makers.
