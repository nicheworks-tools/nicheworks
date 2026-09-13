# ExecPlan — Reconcile quality, performance, and UX hardening

## Scope

Work only on NicheWorks Reconcile quality/performance hardening and a Reconcile-specific CI check.

Allowed final-diff paths:
- `tools/reconcile/**`
- `.github/workflows/reconcile-quality-check.yml`
- `.agent/plans/2026-09-13-reconcile-quality-performance.md`

Temporary execution bridge:
- `.github/workflows/ems-rd-api-smoke.yml` was used transiently while bootstrapping the branch-only apply path and was restored byte-for-byte to the current `main` version. It does not appear in the final diff.
- `.agent/plans/reconcile-quality-apply.py` was a temporary branch-local apply script and deleted itself before the implementation commit. It does not appear in the final diff.

Do not modify billing implementation, common specs, other tools, deployment settings, or leave changes in unrelated workflows.

## Goal

Close development phases 1–4 before Stripe production work:
1. realistic-data quality audit,
2. matching boundary/abnormal-case audit,
3. Pro-scale performance audit,
4. UX hardening discovered by those audits.

## Findings closed

- The Pro contract allows CSV up to 100,000 rows per file and XLSX up to 50,000 rows per file, but the result UI rendered the entire filtered result set into the DOM at once. This was replaced with bounded 250-row result pages while filters/search and exports still operate on the complete result set.
- CSV encoding/delimiter settings were captured in saved profiles, but changing those controls after a CSV was loaded did not reparse the current file. Loaded CSV `File` objects are now retained only in page memory and reparsed when parser settings change; applying a saved profile reparses before saved mappings are restored.
- A realistic financial amount form such as `JPY (5,000)` was rejected because the parenthesized-negative check ran before currency-code removal. Normalization now recognizes a parenthesized negative after currency/symbol cleanup as well.

## Files changed

- `tools/reconcile/app.mjs`
- `tools/reconcile/index.html`
- `tools/reconcile/development.html`
- `tools/reconcile/normalize.mjs`
- `tools/reconcile/SPEC.md`
- `tools/reconcile/tests/reconcile-quality.test.mjs` (new)
- `tools/reconcile/tests/reconcile-stress.test.mjs` (new)
- `.github/workflows/reconcile-quality-check.yml` (new)
- `.agent/plans/2026-09-13-reconcile-quality-performance.md`

## Implementation

1. Added realistic-data regression cases covering quoted CSV, blank physical rows, ambiguous dates, common Japanese/European amount formats, exact/tolerant/conflict/candidate/duplicate/unmatched outcomes, sign modes, group matching, and deterministic reruns.
2. Added synthetic Pro-scale stress coverage for the declared 100,000-row CSV ceiling and 50,000-row XLSX ceiling. Timing is reported as evidence rather than used as a brittle pass/fail threshold.
3. Added bounded result pagination so only 250 rows are rendered to the DOM at one time while filtering/searching/export continue to operate on the complete result set.
4. Retain the selected CSV `File` object only in page memory and reparse loaded CSV sides when encoding/delimiter settings change. Saved-profile application reparses loaded CSVs before restoring saved mappings. No file bytes or transaction rows are persisted.
5. Preserved Free/Pro limits, matching semantics, entitlement behavior, privacy behavior, and export contents.
6. Added a Reconcile-only GitHub Actions workflow that syntax-checks the relevant modules and runs all Reconcile tests when Reconcile-scoped paths change.
7. Updated the Reconcile specification with parser-reparse, result-pagination, and stress-test contracts.

## Verification evidence

The branch apply run `34728060777` completed successfully through implementation, the full existing Reconcile test suite, the new quality suite, and the implementation commit/push.

Observed stress evidence on GitHub-hosted Ubuntu / Node 20.20.2:
- CSV: 100,000 rows parsed successfully; observed parse time 214 ms.
- Reconciliation: 100,000 A rows against 100,000 B rows produced 100,000 exact matches; observed reconciliation time 1,220 ms.
- XLSX: 50,000 rows were written with the pinned SheetJS CE 0.20.3 vendor and read back successfully; observed write/read test time 2,503 ms and workbook size 2,674,240 bytes.
- Observed process heap at the end of the stress test: about 447 MB.
- Existing parser, normalization, matching-engine, export, saved-profile, XLSX-adapter, and real-vendor tests all passed in the same run.

Final pre-PR diff check confirms only the nine files listed above differ from the starting `main` SHA `cc994091f8ae0ec3792d341665b0ec9b06f6fb2d`; the unrelated EMS workflow and temporary apply script are absent.

## Remaining release verification

- Run generic PR checks and Cloudflare Pages preview.
- After merge, require the permanent `Reconcile quality check` workflow to pass on `main`.
- Smoke-check the production deployment after the merge.
- Stripe production connection remains a later phase and is intentionally out of scope here.
