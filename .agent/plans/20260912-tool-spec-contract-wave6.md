# Per-tool specification contract — wave 6

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Finish the machine-checked per-tool specification layer after PR #512. Wave 6 covers the final 11 pending tools and records current implemented contracts at `tools/{slug}/SPEC.md`. Production HTML/JS/CSS changes remain out of scope for this documentation wave.

## Base and scope

- Base main SHA: `44c2fd501096d0e59fa9ee9114b550323c91b46f`.
- Starting coverage: 76 complete / 11 pending.
- Target coverage: 87 complete / 0 pending.
- Branch: `feat/tool-spec-contract-wave6-20260912`.

## Wave 6 tools

1. `tiny-audio-meter`
2. `trashnavi`
3. `ui-atlas`
4. `unicode-kanji-checker`
5. `unitmaster`
6. `url-title-collector`
7. `variant-kanji-compare`
8. `vibe-lexicon`
9. `weatherdiff`
10. `webp-avif-converter`
11. `wifi-meter`

## Progress

- [x] PR #512 merged at `44c2fd501096d0e59fa9ee9114b550323c91b46f`.
- [x] Created the wave-6 branch from that exact merge SHA.
- [ ] Inspect current implementation of all 11 tools.
- [ ] Add substantive current-state `SPEC.md` files.
- [ ] Raise manifest to 87 complete / 0 pending with `required_complete: 87`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm documentation-only diff, open PR, squash merge, and confirm main-side audit.

## Decision Log

- Decision: finish the remaining pending registry entries in one final wave.
  Rationale: only 11 remain and the checker already enforces parity and complete-spec requirements.
  Date: 2026-09-12.

- Decision: continue to record runtime behavior rather than marketing copy where they diverge.
  Rationale: the final 87/87 contract must be an implementation-grounded SSOT for later quality repair.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all final 11 specs to pass `scripts/check-tool-spec-contract.mjs`, manifest coverage to reach 87/87 with zero pending entries, and no production HTML/JS/CSS changes.

## Surprises & Discoveries

Populate during implementation inspection.

## Outcomes & Retrospective

Populate after CI and merge.
