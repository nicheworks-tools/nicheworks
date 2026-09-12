# SPEC conformance audit — wave 2

## Purpose

Continue implementation-quality work from the completed 87/87 per-tool specifications. This wave audits registry tools 16–30 against their documented acceptance criteria, fixes concrete production mismatches, and extends the runtime-contract audit added in wave 1.

## Base and scope

- Base main SHA: `9133d853b3fa1b059ed6dca5c12667546cdc61e6`.
- Branch: `audit/spec-conformance-wave2-20260912`.
- Scope: registry tools 16–30.

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

## Audit method

For each tool:
1. Read `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the active runtime referenced by the public page, not stale files that merely remain in the directory.
3. Classify criteria as satisfied, ambiguous, or failing.
4. Fix P0/P1 failures in this branch; synchronize SPEC only when implementation evidence or actual contract is wrong.
5. Extend `scripts/check-tool-runtime-contracts.mjs` with stable structural checks for the audited behavior.
6. Keep unrelated redesigns/new features out of scope.

## Priority

- P0: privacy/security/data-loss/misleading behavior, broken core action, destructive behavior.
- P1: acceptance criterion failure, broken export/copy/state/language flow, material mobile/desktop failure.
- P2: misleading copy or weak edge-case handling that does not block the core workflow.

## Findings

### P0

None found in this wave.

### P1 — fixed

#### `growth-log-template-generator`

The `Anonymize numbers` toggle only replaced entire KPI field values with `XXX`, while numeric values written inside Hypothesis, Learnings, and Notes remained untouched. The generated log nevertheless said that numbers had been anonymized, creating a misleading privacy signal.

Fix:
- added numeric-substring scrubbing for KPI values and the three freeform user fields;
- preserved non-numeric KPI text such as a top keyword instead of replacing the whole field;
- changed the generated notice to say precisely that numeric values in user-entered fields are replaced while names/project labels/other text remain;
- synchronized `SPEC.md` acceptance/privacy wording.

### P2 / cleanup backlog

- `cover-letter-lite`: blank identity/company/role fields fall back to generic placeholders rather than being rejected. The current SPEC acceptance does not require hard validation, so this is not a conformance failure, but the product may later choose stricter required-field UX.
- `habit-plan-generator`: the shared helper object still exposes an unused `hasPro()` implementation based on legacy tool-local `nw_pro_key`. No current Habit Plan path calls it and the tool has no Pro-gated function, so it is not an active entitlement bypass. Remove it in the later legacy/dead-code cleanup rather than silently changing unrelated billing behavior here.
- `exif-cleaner-mini`: generated download URL is revoked immediately after the synthetic anchor click. This generally works in current browsers but can be hardened later with delayed revocation if cross-browser testing exposes a failure.

## Per-tool result

- `cover-letter-lite`: core deterministic template/style/length/copy/TXT contract satisfied; no P0/P1.
- `csv-tidy`: encoding/delimiter/header/column cleanup and UTF-8/BOM export contract satisfied; no P0/P1.
- `design-request-builder`: required five-field validation and short/standard/detailed bilingual output satisfied; no P0/P1.
- `dry-meter`: manual scoring, local state, and explicit Open-Meteo coordinate weather lookup satisfied; no P0/P1.
- `earth-alerts`: correctly remains a non-active coming-soon page; no false notification/real-data claim.
- `earth-map-suite`: synthetic previews are repeatedly distinguished from real metadata-only reachability in UI/error/CSV paths; validation limits present; no P0/P1.
- `earth-timeseries`: correctly remains a no-observed-values/no-raster-sampling coming-soon page.
- `exif-cleaner-mini`: browser Canvas regeneration, supported formats, post-output metadata-container scan, and non-guarantee boundary satisfied.
- `filetype-sniffer`: reads `file.slice(0, 4096)` and explicitly does not claim antivirus/safety verification.
- `form-tool-selector`: returns generic tool categories rather than named vendor recommendations and preserves provider-verification warnings.
- `growth-log-template-generator`: P1 privacy/anonymization mismatch fixed as above.
- `habit-plan-generator`: deterministic presets/schedule/checklist/language contract satisfied; unused legacy helper recorded as P2 cleanup.
- `image-compression-inspector`: static PNG/JPEG/WebP path, 40MP guard, JPEG white flatten for transparency, generated preview/size/download satisfied.
- `image-redact`: manual Solid/Blur/Pixelate masks, weak-mask preflight, PNG flattened export, and EXIF separation satisfied.
- `inci-fastscan`: external Tesseract CDN is disclosed, OCR executes through browser Tesseract, and medical/OCR uncertainty wording is present.

## Progress

- [x] Branch created from current main.
- [x] Audit tools 1–5.
- [x] Audit tools 6–10.
- [x] Audit tools 11–15.
- [x] Apply concrete P0/P1 fixes and synchronize affected SPECs.
- [x] Extend runtime-contract audit to 30 tools.
- [ ] Run CI, open PR, and merge only when green.

## Acceptance

This wave closes only after all 15 tools have been inspected against their acceptance criteria, every discovered P0/P1 failure in scope is fixed or explicitly documented with a concrete reason, runtime-contract coverage is extended, and repository checks are green.
