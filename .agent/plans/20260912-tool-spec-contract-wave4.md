# Per-tool specification contract — wave 4

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Continue the machine-checked per-tool specification layer after PR #510. Wave 4 inspects the next 15 pending tools in registry order and records their current implemented contract at `tools/{slug}/SPEC.md`. This wave is documentation/contract work only; production HTML/JS/CSS changes are out of scope.

## Base and scope

- Base main SHA: `f182a9c4c20e2f713b44cc34b316aa1b0b14eca2`.
- Starting coverage: 46 complete / 41 pending.
- Target coverage: 61 complete / 26 pending.
- Branch: `feat/tool-spec-contract-wave4-20260912`.

## Wave 4 tools

1. `microtool-launch-checklist`
2. `mini-game-utility`
3. `minutes-to-ops`
4. `money-template-checker`
5. `motion-atlas`
6. `moving-checklist-generator`
7. `moving-lease-final-check`
8. `name-old-kanji-checker`
9. `newsletter-kit-generator`
10. `niche-job-starter-kit`
11. `notion-form-design-kit`
12. `og-image-maker`
13. `old-document-kanji-highlighter`
14. `old-kanji-ocr-scanner`
15. `old-kanji-reference`

## Progress

- [x] PR #510 merged at `f182a9c4c20e2f713b44cc34b316aa1b0b14eca2`.
- [x] Created the wave-4 branch from that exact merge SHA.
- [ ] Inspect current implementation of all 15 tools.
- [ ] Add substantive current-state `SPEC.md` files.
- [ ] Raise `tools/tool-spec-manifest.json` to 61 complete / 26 pending with `required_complete: 61`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm changed files are limited to this ExecPlan, 15 SPEC files, and manifest.
- [ ] Open PR, document discoveries, squash merge, and confirm main-side audit.

## Decision Log

- Decision: continue in registry order.
  Rationale: deterministic coverage and no cherry-picking of easy tools.
  Date: 2026-09-12.

- Decision: keep production fixes discovered during inspection out of this wave.
  Rationale: the purpose is to create an implementation-grounded contract that later fixes can be reviewed against.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to be implementation-grounded, machine-valid under `scripts/check-tool-spec-contract.mjs`, coverage to rise to 61/87, no pending placeholders, and zero production HTML/JS/CSS changes.

## Surprises & Discoveries

Populate during implementation inspection.

## Outcomes & Retrospective

Populate after CI and merge.
