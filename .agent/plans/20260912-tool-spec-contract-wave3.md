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
- [x] Inspected current implementation of all 15 tools.
- [x] Added substantive current-state `SPEC.md` files for all 15 tools.
- [x] Raised `tools/tool-spec-manifest.json` to 46 complete / 41 pending with `required_complete: 46`.
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

- Decision: treat runtime behavior as authoritative where MetadataSnap's public privacy copy conflicts with its implementation.
  Rationale: `tools/metadatasnap/app.js` sends the encoded target URL to the NicheWorks Worker and falls back to AllOrigins, so the current FAQ claim that entered URLs are not sent to a server cannot be recorded as the functional contract. The production copy defect is intentionally separated from this documentation-only wave.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to be implementation-grounded, machine-valid under `scripts/check-tool-spec-contract.mjs`, coverage to rise to 46/87, no pending placeholders, and zero production HTML/JS/CSS changes.

## Surprises & Discoveries

- `incident-update-generator` has a real Free/Pro boundary: Free generates customer/internal/social updates and selected TXT output; Pro adds the Markdown Incident Communication Pack.
- `jp-postal-lite` loads only same-site `./data/*.json` for all 47 prefectures and has no external backup JSON fetch path.
- `json-repair` has materially different Free/Pro repair behavior, including aggressive repair, candidate/schema/history/report tooling on the Pro side.
- `laundry-code-decode` photo search is not OCR; it is a browser-side visual comparison against SVG templates and must be presented only as candidate search.
- `light-check` exposes relative camera-derived brightness/color/contrast/variation metrics and is not a lux, color-temperature, or flicker meter.
- `logistics-compliance-kit-jp` is Japanese-only and is an operational self-check/planning aid, not a legal-compliance or administrative-filing determination.
- `message-generator` is a local phrase/template generator with random variants, not an AI generation backend.
- `metadatasnap` has a public privacy-copy contradiction: the page says entered URLs are not sent to a server, but `app.js` sends them to a NicheWorks Worker and then to AllOrigins on fallback. The SPEC records the actual network behavior and marks the copy as a separate production defect.

## Outcomes & Retrospective

Pending CI, PR, and merge. No production HTML/JS/CSS changes are intended in this wave.
