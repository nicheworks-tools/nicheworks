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
- [x] Inspected current implementation of all 15 tools.
- [x] Added substantive current-state `SPEC.md` files for all 15 tools.
- [x] Raised manifest to 76 complete / 11 pending with `required_complete: 76`.
- [ ] Run Tool spec audit and existing repository checks.
- [ ] Confirm documentation-only diff, open PR, squash merge, and confirm main-side audit.

## Decision Log

- Decision: continue pending tools in registry order and skip only entries already marked complete.
  Rationale: deterministic coverage while preserving the existing Screenshot Stitcher migration.
  Date: 2026-09-12.

- Decision: record runtime behavior rather than marketing/FAQ claims where conflicts appear.
  Rationale: later quality repair must have a truthful current-state contract.
  Date: 2026-09-12.

- Decision: treat network-loaded libraries separately from user-content upload.
  Rationale: tools such as PDF2CSV and Sukima Baito perform user-data processing locally while still loading runtime assets from CDNs; the privacy contract must describe both facts accurately.
  Date: 2026-09-12.

## Validation and Acceptance

Acceptance requires all 15 specs to pass the tool-spec checker, coverage to reach 76/87, pending to fall to 11, and no production HTML/JS/CSS changes.

## Surprises & Discoveries

- `pattern-atlas` still describes itself in visible copy as a production shell, but current JavaScript loads the actual pattern dataset and implements filtering, details, color editing, previews, and SVG/PNG/CSS export. The specification follows runtime behavior rather than stale shell wording.
- `pages-deploy-guide` does not use the common Pro bridge. It validates and persists its own `pdg_pro_key` in localStorage and gates diagnosis/handoff/Markdown output with that browser-local code.
- `pdf2csv-local` is genuinely no-OCR and text-PDF-only, but its XLSX shim loads SheetJS from `cdn.sheetjs.com`; "local processing" therefore does not mean fully offline operation.
- Old Kanji place checks retain the same billing-unavailable boundary identified in wave 4: the UI advertises Pro capabilities while the billing route is not connected.
- `product-founder-os` and `release-guardian` are repository assets/guides, not browser SaaS workflows. Their public pages explain and link to separate GitHub repositories.
- `rename-wizard` generates candidate names only. It reads filenames, not file contents, and deliberately does not rename real files or emit execution commands.
- `sql-db-risk-checker` is a browser-side heuristic/rule-based preflight, not a SQL parser or DB connection. Environment and DB type are user-declared and SQL is neither executed nor auto-fixed.
- `sukima-baito-income` keeps income entries only in page memory, persists only input-assist/settings state, and lazy-loads Tesseract.js from jsDelivr for OCR. OCR is therefore online-dependent while income aggregation itself remains browser-local.

## Outcomes & Retrospective

Pending CI and merge. The implementation review established truthful contract boundaries for all 15 wave-5 tools and raised the manifest floor to 76/87 without production HTML/JS/CSS changes.
