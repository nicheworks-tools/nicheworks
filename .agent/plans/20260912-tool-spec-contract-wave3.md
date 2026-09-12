# Per-tool specification contract — wave 3

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Continue the machine-checked per-tool specification layer introduced by PR #508 and expanded by PR #509. Wave 3 inspects the next 15 pending tools in registry order and records their current implemented contract at `tools/{slug}/SPEC.md`. This PR is documentation/contract work only; production behavior is not changed here.

## Base and scope

- Base main SHA: `bd0594802311a7d5108507f44c092af335a60e22`.
- Starting coverage: 31 complete / 56 pending.
- Target coverage: 46 complete / 41 pending.
- Branch: `feat/tool-spec-contract-wave3-20260912`.
- Production HTML/JS/CSS changes are out of scope.

## Wave 3 tools

1. `incident-update-generator`
2. `jp-postal-lite`
3. `json-repair`
4. `json2mermaid`
5. `kanji-modernizer`
6. `laundry-code-decode`
7. `light-check`
8. `linebreak-doctor`
9. `log-formatter`
10. `logistics-compliance-kit-jp`
11. `lp-skeleton-generator`
12. `manual-finder`
13. `membership-offer-builder`
14. `message-generator`
15. `metadatasnap`

## Progress

- [x] PR #509 merged at `bd0594802311a7d5108507f44c092af335a60e22`.
- [x] Created the wave-3 branch from that exact merge SHA.
- [ ] Inspect current implementation of all 15 tools.
- [ ] Add substantive current-state `SPEC.md` files.
- [ ] Raise `tools/tool-spec-manifest.json` to 46 complete / 41 pending with `required_complete: 46`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm the diff is limited to this ExecPlan, 15 SPEC files, and manifest.
- [ ] Open PR, document discoveries, squash merge, and confirm main-side audit.

## Decision Log

- Decision: continue in registry order.
  Rationale: deterministic coverage prevents special or difficult tools from being indefinitely deferred.
  Date: 2026-09-12.

- Decision: keep production repairs out of this specification wave.
  Rationale: discovered defects should be separately reviewable against the newly written contract unless the implementation cannot be truthfully described.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to be implementation-grounded, machine-valid under `scripts/check-tool-spec-contract.mjs`, coverage to rise to 46/87, no pending placeholders, and zero production HTML/JS/CSS changes.

## Surprises & Discoveries

Populate during implementation inspection.

## Outcomes & Retrospective

Populate after CI and merge.
