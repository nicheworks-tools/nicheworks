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
- [x] Inspected current implementation of all 15 tools.
- [x] Added substantive current-state `SPEC.md` files for all 15 tools.
- [x] Raised `tools/tool-spec-manifest.json` to 61 complete / 26 pending with `required_complete: 61`.
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

- Decision: where Old Kanji Toolkit Pro copy conflicts with active runtime wiring, record runtime behavior as the contract and leave production copy/gating repair for a separate PR.
  Rationale: `old-kanji-reference/app-meaning-v4.js` directly wires CSV/JSON/Markdown/print actions without an entitlement check, while the page says export/report is Pro. The specification cannot claim a gate that the runtime does not enforce.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to be implementation-grounded, machine-valid under `scripts/check-tool-spec-contract.mjs`, coverage to rise to 61/87, no pending placeholders, and zero production HTML/JS/CSS changes.

## Surprises & Discoveries

- `mini-game-utility` keeps up to 50 score entries in `nw_mini_game_scores`, but timer elapsed/running state is not persisted.
- `minutes-to-ops` is explicitly rule-based, not AI summarization; Pro history uses `nw_mto_history_v2`, and UI switching does not translate pasted notes.
- `money-template-checker` is JPY-only even in English UI; amounts/results are not persisted and the 60%/50%/30% values are only reference thresholds.
- `motion-atlas` uses separate EN/JA pages and a three-pane desktop-oriented decision workspace; free compare is two motions.
- `moving-checklist-generator` persists check state keyed by move date/household/home type but intentionally does not persist the print memo.
- `moving-lease-final-check` is Japanese-only and uses browser print for PDF rather than dedicated PDF generation.
- `name-old-kanji-checker`, `old-document-kanji-highlighter`, and `old-kanji-ocr-scanner` show Old Kanji Toolkit Pro in a billing-unavailable/locked state; the billing path is not currently connected.
- `newsletter-kit-generator` always generates both JP and EN sections from local templates; it is not AI generation.
- `notion-form-design-kit` does not connect to the Notion API or create workspace objects.
- `og-image-maker` stores non-logo design settings in `nw_og_settings`; uploaded logos remain page-memory only. Batch generation is gated by the browser-local Pro key.
- `old-kanji-ocr-scanner` runs Tesseract.js in-browser with Japanese OCR but loads the OCR engine/script/data over network resources; it is not guaranteed offline.
- `old-kanji-reference` persists favorites, recent entries, display mode, and quiz stats. Its visible Pro copy says exports/reports are Pro, but the current implementation directly enables CSV, JSON, Markdown copy, and print without an entitlement check. Runtime Free export behavior is therefore the current contract and the copy/gating mismatch is a separate production defect.

## Outcomes & Retrospective

Wave 4 specification content is complete at 61/87 target coverage. CI, final diff verification, PR, and merge remain.
