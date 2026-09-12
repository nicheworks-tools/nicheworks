# Runtime copy alignment repairs

## Purpose

Remove two stale public-copy contradictions discovered while building the 87/87 implementation-grounded tool specifications, then update the affected SPEC files so public copy and specification remain synchronized.

## Base and scope

- Base main SHA: `4a58c5b1238d8644c2eecddb7ed4c9107dac33b0`.
- Branch: `fix/runtime-copy-alignment-20260912`.
- Targets: `pattern-atlas`, `old-kanji-reference`.

## Required fixes

- [x] Pattern Atlas EN/JA home pages: remove "production shell" / "functions later" wording because dataset, renderers, color editing, preview, and SVG/PNG/CSS export are already implemented.
- [x] Pattern Atlas EN/JA usage pages: replace planned-MVP/localStorage language with current runtime behavior.
- [x] Pattern Atlas SPEC: remove the now-resolved stale-copy mismatch note.
- [x] Old Kanji Reference: stop labeling currently ungated CSV/JSON/Markdown/print actions as Pro-only.
- [x] Old Kanji Reference: make the billing-unavailable panel describe only unavailable/future advanced Pro areas, not current free exports.
- [x] Old Kanji Reference SPEC: remove the now-resolved UI/runtime export contradiction while preserving the current Free export contract.
- [x] Keep Pattern Atlas render/export code and Old Kanji Reference export handlers unchanged.
- [ ] Run Tool spec, SEO, and applicable repository checks before merge.

## Decisions

- Decision: align copy to current runtime instead of removing working features or adding artificial gates.
  Rationale: the 87-tool specification audit established current runtime as the authoritative contract; working exports should not be disabled solely to preserve stale marketing copy.
  Date: 2026-09-12.

- Decision: keep Old Kanji Toolkit billing unavailable and avoid claiming unavailable Pro functionality is purchasable.
  Rationale: no billing route is currently connected on the page.
  Date: 2026-09-12.

- Decision: update affected SPEC files in the same PR as public copy.
  Rationale: otherwise the newly completed 87/87 SSOT would immediately contain resolved-mismatch notes that no longer describe production.
  Date: 2026-09-12.

## Discoveries and outcome so far

- Pattern Atlas public EN/JA home pages and usage pages still used initial-shell / future-MVP wording even though current modules already load the pattern dataset, filter/search, render live SVG, edit colors/palettes, preview, and export SVG/PNG/CSS.
- Pattern Atlas current search/selection/color state is page state; there is no account-synced saved-pattern library or palette-history service.
- Old Kanji Reference export buttons are directly wired and remain Free: CSV, JSON, Markdown copy, and browser print require no Pro entitlement.
- The Old Kanji Toolkit panel remains billing-unavailable. Public copy now treats learning history and saved sets as planned/unavailable areas instead of purchasable current features.
- No Pattern Atlas renderer/export JavaScript or Old Kanji Reference export handler was changed.

## Acceptance

Pattern Atlas must describe implemented catalog/edit/export behavior as current. Old Kanji Reference must describe CSV/JSON/Markdown/print as currently free and must not imply that a disabled Pro purchase path is required for those actions. Corresponding SPEC files must match the repaired public state.

Implementation/copy repair is complete. CI and merge remain.
