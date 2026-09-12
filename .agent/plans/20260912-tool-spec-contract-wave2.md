# Per-tool specification contract — wave 2

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Continue the machine-checked per-tool specification layer introduced by PR #508. Wave 2 inspects the next 15 pending tools in registry order and records their current implemented contract at `tools/{slug}/SPEC.md`. The goal is not to rewrite production behavior in this PR; it is to make current behavior explicit enough that later quality repairs can be bounded and reviewed against a tool-specific contract.

## Base and scope

- Base main SHA: `e96904fe8cd04e768d9d6c774a872622e6e30db7`.
- Starting coverage: 16 complete / 71 pending.
- Target coverage: 31 complete / 56 pending.
- Branch: `feat/tool-spec-contract-wave2-20260912`.
- Production HTML/JS/CSS changes are out of scope; implementation defects discovered during specification review are recorded and repaired separately unless a contract cannot be truthfully stated otherwise.

## Wave 2 tools

1. `cover-letter-lite`
2. `csv-tidy`
3. `design-request-builder`
4. `dry-meter`
5. `earth-alerts`
6. `earth-map-suite`
7. `earth-timeseries`
8. `exif-cleaner-mini`
9. `filetype-sniffer`
10. `form-tool-selector`
11. `growth-log-template-generator`
12. `habit-plan-generator`
13. `image-compression-inspector`
14. `image-redact`
15. `inci-fastscan`

## Progress

- [x] Confirmed PR #508 is merged and main-side Tool spec audit / SEO audit are green.
- [x] Created wave-2 branch from exact main SHA.
- [ ] Inspect current implementation of all 15 tools.
- [ ] Add substantive current-state `SPEC.md` files using `docs/tool-spec-standard.md`.
- [ ] Update `tools/tool-spec-manifest.json` to 31 complete / 56 pending with `required_complete: 31`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm changed files are limited to this ExecPlan, 15 SPEC files, and manifest.
- [ ] Open PR, document discoveries/results, squash merge, and confirm main-side audit.

## Decision Log

- Decision: continue in registry order rather than cherry-picking easy tools.
  Rationale: registry order gives deterministic coverage and prevents difficult/special tools from being postponed indefinitely.
  Date: 2026-09-12.

- Decision: use the PR #508 specification standard without adding new schema fields during wave 2 unless a real implementation class cannot be represented.
  Rationale: stability of the contract format is more valuable than speculative schema expansion.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires:

- all 15 wave-2 specs reflect implementation evidence rather than registry descriptions alone;
- complete coverage rises monotonically from 16 to 31 while registry total remains 87;
- each new spec passes identity, heading, language/layout, and acceptance-criteria checks;
- pending tools do not receive placeholder specs;
- production HTML/JS/CSS remains unchanged;
- Tool spec audit and existing repository checks are green.

## Surprises & Discoveries

Populate as implementation inspection finds notable contract boundaries or inconsistencies.

## Outcomes & Retrospective

Populate after CI and merge.
