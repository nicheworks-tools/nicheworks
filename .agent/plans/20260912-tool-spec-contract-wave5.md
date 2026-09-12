# Per-tool specification contract — wave 5

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Continue the machine-checked per-tool specification layer after PR #511. Wave 5 inspects the next 15 pending tools in registry order, skipping `screenshot-stitcher` because it is already complete, and records current implemented contracts at `tools/{slug}/SPEC.md`. Production HTML/JS/CSS changes are out of scope.

## Base and scope

- Base main SHA: `8223def0f0dc5a2eb3a4cd9d619e3cb1eca14706`.
- Starting coverage: 61 complete / 26 pending.
- Target coverage: 76 complete / 11 pending.
- Branch: `feat/tool-spec-contract-wave5-20260912`.

## Wave 5 tools

1. `ops-weekly-report-generator`
2. `outsource-spec-generator`
3. `pages-deploy-guide`
4. `pattern-atlas`
5. `pdf-page-tools-mini`
6. `pdf2csv-local`
7. `place-old-kanji-checker`
8. `product-founder-os`
9. `redirect-unwrapper`
10. `release-guardian`
11. `rename-wizard`
12. `size-converter`
13. `sponsor-page-builder`
14. `sql-db-risk-checker`
15. `sukima-baito-income`

## Progress

- [x] PR #511 merged at `8223def0f0dc5a2eb3a4cd9d619e3cb1eca14706`.
- [x] Created the wave-5 branch from that exact merge SHA.
- [ ] Inspect current implementation of all 15 tools.
- [ ] Add substantive current-state `SPEC.md` files.
- [ ] Raise manifest to 76 complete / 11 pending with `required_complete: 76`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm documentation-only diff, open PR, squash merge, and confirm main-side audit.

## Decision Log

- Decision: continue pending tools in registry order and skip only entries already marked complete.
  Rationale: deterministic coverage while preserving the existing Screenshot Stitcher migration.
  Date: 2026-09-12.

- Decision: record runtime behavior rather than marketing/FAQ claims where conflicts appear.
  Rationale: later quality repair must have a truthful current-state contract.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to pass the tool-spec checker, coverage to reach 76/87, pending to fall to 11, and no production HTML/JS/CSS changes.

## Surprises & Discoveries

Populate during implementation inspection.

## Outcomes & Retrospective

Populate after CI and merge.
