# Old Kanji Completion Wave 14 — Name + Place QA

Date: 2026-09-18
Scope: `name-old-kanji-checker` and `place-old-kanji-checker` only.

## Goal

Close the core functional and safety acceptance criteria for Name Old Kanji Checker and Place Old Kanji Checker with durable evidence. Do not mix Wave 15 rendered UX/accessibility, Wave 16 search reconciliation, measurement, SEO inventory, dictionary-authority changes, or billing work into this wave.

## Baseline

Branch created from main `d6a449c408c051c635d82c2a26113a296435932b`, the merged Completion Wave 13 baseline.

## Findings

1. Name → Modernizer whole-text handoff was built from trimmed input and silently removed leading/trailing whitespace or line breaks.
2. Name compatibility detection covered only the BMP compatibility-ideograph block.
3. Place reverse lookup assumed scalar mappings and did not correctly support array-valued old→modern data.
4. Place metadata rendering read legacy generic fields instead of the current bilingual Old Kanji Reference metadata schema.
5. Place shape/stroke rendering read obsolete field names instead of the current shape-note and stroke-count schemas.
6. Place EN rendering notes preferred Japanese fields.
7. Place had no explicit degraded/safe load state for optional or primary reference-data failure.
8. Place compatibility fallback missed the supplementary compatibility block and did not prioritize variation selectors.

## Repair

- Preserve exact Name and Place whole-text Modernizer handoffs.
- Cover both CJK Compatibility Ideographs blocks.
- Support scalar and array-valued reverse mappings with candidate deduplication.
- Read current bilingual metadata, shape, stroke, and rendering-note schemas.
- Track optional-data degradation separately from primary dictionary failure.
- Prevent analysis against an unavailable primary dictionary.
- Add/strengthen behavior tests for mapping directionality, optional-data failure, exact handoffs, Unicode edge cases, privacy, and official-use non-authority wording.
- Close only directly evidenced SPEC acceptance criteria and synchronize the completion audit.

## Guardrails

- No dictionary mapping changes.
- No claim that candidate mappings prove legal validity or official spelling.
- No SEO inventory/sitemap expansion.
- No billing/entitlement changes.
- No analytics/affiliate changes.
- No browser-visual completion claims.
- No CI weakening.

## Exit

Wave 14 may merge only when repository CI is green and the final diff is limited to the two target tools, their tests/SPECs, this plan, and `tools/OLD_KANJI_COMPLETION_AUDIT.md`.
