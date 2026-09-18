# Old Kanji Completion Wave 13 — Unicode + Variant QA

Date: 2026-09-18
Scope: `unicode-kanji-checker` and `variant-kanji-compare` only.

## Goal

Close the core functional acceptance criteria for Unicode Kanji Checker and Variant Kanji Compare with direct durable evidence. Do not mix Wave 15 browser-layout/accessibility work, Wave 16 search reconciliation, measurement changes, SEO inventory expansion, dictionary edits, or billing work into this wave.

## Baseline

Branch created from main `da90ca18071b47ae750509fce73fe39c7942b19a`.

Wave 12 is already merged as PR #1212. Completion ledger therefore advances to Wave 13.

## Findings

1. Both tools recognized only `U+F900–U+FAFF` as compatibility ideographs and missed CJK Compatibility Ideographs Supplement `U+2F800–U+2FA1F`.
2. Variant Compare checked generic supplementary-plane status before the supplementary variation-selector range, so `U+E0100–U+E01EF` lost its more specific variation-selector warning.
3. Variant Compare used one `compatibility` string both as a rendering-note flag and as its “compatibility ideograph” summary count, causing the compatibility count to include ordinary supplementary characters and other rendering notes.
4. Variant Compare already generated a query handoff to Unicode Checker, but Unicode Checker did not consume `?q=`; the cross-tool boundary was therefore incomplete.

## Repair

- Centralize compatibility and variation-selector range predicates.
- Cover both compatibility ideograph blocks.
- Give variation-selector classification precedence over generic supplementary-plane wording in Variant Compare.
- Separate Variant summary dimensions for compatibility ideographs, supplementary-plane characters, variation selectors, mappings, and rendering notes.
- Add exact `?q=` restoration to Unicode Checker without trimming.
- Strengthen both existing behavior tests for supplementary Unicode ranges, UTF-16 surrogate pairs, presets/custom comparison, mapping/reverse mapping, CSV behavior, multi-font wiring, summary separation, and handoff preservation.
- Close only directly evidenced SPEC acceptance criteria and synchronize the completion audit.

## Guardrails

- No dictionary mapping changes.
- No individual-kanji page or sitemap expansion.
- No billing/entitlement changes.
- No analytics/affiliate changes.
- No browser-visual completion claims.
- No claim that font rendering is authoritative or legally valid.

## Exit

Wave 13 may merge only when repository CI is green and the final PR diff remains limited to the Wave 13 plan, the two target implementations/tests/SPECs, and `tools/OLD_KANJI_COMPLETION_AUDIT.md`.
