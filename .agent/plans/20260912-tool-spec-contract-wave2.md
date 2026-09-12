# Per-tool specification contract — wave 2

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

Continue the machine-checked per-tool specification layer introduced by PR #508. Wave 2 inspects the next 15 pending tools in registry order and records their current implemented contract at `tools/{slug}/SPEC.md`. The goal is not to rewrite production behavior in this PR; it is to make current behavior explicit enough that later quality repairs can be bounded and reviewed against a tool-specific contract.

## Base and scope

- Base main SHA: `e96904fe8cd04e768d9d6c774a872622e6e30db7`.
- Starting coverage: 16 complete / 71 pending.
- Final wave-2 coverage: 31 complete / 56 pending.
- Branch: `feat/tool-spec-contract-wave2-20260912`.
- Production HTML/JS/CSS is unchanged by this PR.

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
- [x] Inspected current implementation of all 15 tools.
- [x] Added substantive current-state `SPEC.md` files using `docs/tool-spec-standard.md`.
- [x] Updated `tools/tool-spec-manifest.json` to 31 complete / 56 pending with `required_complete: 31`.
- [x] Opened PR #509.
- [x] Tool spec audit run `34671349478` succeeded, including clean working tree.
- [x] SEO audit run `34671349530` succeeded across the full existing SEO chain.
- [x] Construction Tools Atlas data validation run `34671349501` succeeded.
- [x] Confirmed branch diff is limited to this ExecPlan, 15 SPEC files, and manifest; production HTML/JS/CSS is unchanged.
- [ ] Squash merge PR #509 and confirm main-side Tool spec audit.

## Surprises & Discoveries

- `cover-letter-lite` is intentionally English-only and uses deterministic templates; it does not call an AI API. Its language exception now has an explicit per-tool contract instead of relying on page copy.
- `dry-meter` cannot be described as fully local. Manual scoring is browser-side, but current-location/coordinate weather retrieval sends latitude/longitude to Open-Meteo. The spec records this external data flow explicitly.
- `earth-alerts` and `earth-timeseries` are genuine Coming Soon pages. Their current contract is to accurately state non-availability; no speculative alert/timeseries behavior is treated as shipped functionality.
- `earth-map-suite` deliberately mixes two data classes: deterministic synthetic Storm/Compare/Card previews and real metadata reachability/status from `/api/earth-map-suite/precipitation`. The spec makes `synthetic preview != observed precipitation` an acceptance boundary.
- `filetype-sniffer` reads the leading 4096 bytes for Magic Number detection and is explicitly not antivirus/malware analysis.
- `image-redact` handles visual masking only. EXIF/metadata cleaning remains a separate EXIF Cleaner Mini concern; Solid is the safer option for critical visual information while weak blur/pixelation can remain readable.
- `inci-fastscan` performs ingredient/image analysis in the browser but loads Tesseract.js from `unpkg.com`; therefore “fully offline” would be inaccurate. OCR accuracy is also explicitly non-guaranteed.
- The existing `docs/tool-spec-standard.md` represented all wave-2 tool classes without schema expansion, so no format change was required.

## Decision Log

- Decision: continue in registry order rather than cherry-picking easy tools.
  Rationale: registry order gives deterministic coverage and prevents difficult/special tools from being postponed indefinitely.
  Date: 2026-09-12.

- Decision: use the PR #508 specification standard without adding new schema fields during wave 2.
  Rationale: the existing Purpose/Input/Output/State/Privacy/Language/Layout/Limits/Acceptance structure represented interactive tools, status pages, external-data tools, and image/OCR tools without ambiguity.
  Date: 2026-09-12.

- Decision: document actual external data/library dependencies instead of repeating generic “browser-only” wording.
  Rationale: a per-tool contract must distinguish local transformation from Open-Meteo, same-origin Earth API, external OCR CDN, ads, and analytics.
  Date: 2026-09-12.

- Decision: preserve Coming Soon pages as valid current contracts rather than invent future functionality.
  Rationale: regression protection requires truth about what is shipped today.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires:

- all 15 wave-2 specs reflect implementation evidence rather than registry descriptions alone;
- complete coverage rises monotonically from 16 to 31 while registry total remains 87;
- each new spec passes identity, heading, language/layout, and acceptance-criteria checks;
- pending tools do not receive placeholder specs;
- production HTML/JS/CSS remains unchanged;
- Tool spec audit and existing repository checks are green.

## Outcomes & Retrospective

Wave 2 raises explicit per-tool contract coverage to 31/87 without changing production behavior. The specifications now capture several boundaries that generic suite rules cannot safely represent: English-only versus bilingual UI, real external weather lookup, coming-soon non-functionality, synthetic-versus-real Earth data, browser-local binary/image processing, and external-CDN OCR. This gives subsequent quality PRs a more reliable basis for deciding whether a code change is a bug fix, a contract change, or a new feature.

## Artifacts and Notes

- PR: #509.
- Base main SHA: `e96904fe8cd04e768d9d6c774a872622e6e30db7`.
- Initial successful wave-2 Tool spec audit: run `34671349478`, job `103493153926`.
- Successful SEO audit: run `34671349530`, job `103493153492`.
- Successful Construction Tools Atlas data validation: run `34671349501`, job `103493155054`.
