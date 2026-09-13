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

Wave 3A result:

- Source boundary: Nikon official Japanese Web-manual portal, mirrorless-camera section.
- Accepted models: 14/14 explicitly listed mirrorless-camera models.
- Unique primary Web-manual targets: 12.
- Direct rows: 10.
- Vendor-shared rows: 4 (`Z7II`/`Z6II`, `Z7`/`Z6`).
- Supplemental HLG/Nikon Imaging Cloud error documents are not promoted as the primary manual.
- Nikon becomes `expanded`, not company-complete; DSLR, compact, lenses and other product sections remain outside this pass.

### Wave 3B — Brother

Wave 3B result:

- Official MFC-J product search reports 96 products.
- Bounded target: the first 14 single-model results before the first grouped MFC-J700D/MFC-J700DW entry.
- Accepted exact product-manual pages: 13.
- Held: `MFC-J6990CDW` because its direct manual page was not confirmed in this pass.
- Direct rows: 13; shared rows: 0.
- No product URL was inferred merely from the visible URL pattern; each accepted destination was confirmed on Brother's official support domain.
- Brother becomes `expanded`, not company-complete; the remaining MFC-J catalog and other Brother product families remain outside this pass.

### Wave 3C — Sony

Wave 3C result:

- Source boundary: Sony official Japanese E-mount body support, complete current α1 and α9 series only.
- α1 series: 2/2 (`ILCE-1M2`, `ILCE-1`).
- α9 series: 3/3 (`ILCE-9M3`, `ILCE-9M2`, `ILCE-9`).
- Accepted exact model-manual pages: 5.
- Direct rows: 5; shared rows: 0.
- Broader α7/ZV-E/α6000 and other Sony series remain outside this pass.
- Sony becomes `expanded`, not company-complete.

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
- [x] Implement and merge Wave 3A Nikon (#708).
- [x] Implement and merge Wave 3B Brother (#711).
- [x] Implement Wave 3C Sony from latest main.
- [ ] Merge Wave 3C after repository CI.
- [ ] Implement Wave 3D Epson or Canon from latest main.
- [ ] Continue rotation with Panasonic before revisiting deep-covered makers.
