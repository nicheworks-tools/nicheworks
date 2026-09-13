# ExecPlan — Reconcile quality, performance, and UX hardening

## Scope

Work only on NicheWorks Reconcile quality/performance hardening and a Reconcile-specific CI check.

Allowed final-diff paths:
- `tools/reconcile/**`
- `.github/workflows/reconcile-quality-check.yml`
- `.agent/plans/2026-09-13-reconcile-quality-performance.md`

Temporary execution bridge:
- `.github/workflows/ems-rd-api-smoke.yml` may be modified on this branch only to run the scoped patch because newly added workflows are not executable from this branch before merge. It must be restored byte-for-byte to the current `main` version before opening the PR and must not appear in the final PR diff.

Do not modify billing implementation, common specs, other tools, deployment settings, or leave changes in unrelated workflows.

## Goal

Close development phases 1–4 before Stripe production work:
1. realistic-data quality audit,
2. matching boundary/abnormal-case audit,
3. Pro-scale performance audit,
4. UX hardening discovered by those audits.

## Known issues to address

- The Pro contract allows CSV up to 100,000 rows per file and XLSX up to 50,000 rows per file, but the result UI currently renders the entire filtered result set into the DOM at once. Large unmatched/candidate result sets can therefore freeze the browser even when the reconciliation engine itself completes.
- CSV encoding/delimiter settings are captured in saved profiles, but changing those controls after a CSV is loaded does not reparse the current file. Applying a saved profile therefore may not apply its parser settings to an already loaded CSV.

## Files expected to change

- `tools/reconcile/app.mjs`
- `tools/reconcile/index.html`
- `tools/reconcile/development.html`
- `tools/reconcile/SPEC.md`
- `tools/reconcile/tests/reconcile-quality.test.mjs` (new)
- `tools/reconcile/tests/reconcile-stress.test.mjs` (new)
- `.github/workflows/reconcile-quality-check.yml` (new)

Additional Reconcile-local files may be changed only if a failing audit demonstrates the need.

## Implementation steps

1. Add realistic-data regression cases covering quoted CSV, blank physical rows, duplicate headers, ambiguous dates, common amount formats, exact/tolerant/conflict/candidate/duplicate/unmatched outcomes, sign modes, group matching, and deterministic reruns.
2. Add stress coverage using synthetic Pro-scale data. Verify 100,000-row CSV-side exact reconciliation completes correctly without requiring all result rows to be rendered at once. Keep timing informational rather than asserting a brittle wall-clock threshold.
3. Add bounded result pagination so only a small page of result rows is rendered to the DOM at one time while filtering/searching/export continue to operate on the complete result set.
4. Keep the original in-memory CSV `File` object and reparse loaded CSV sides when encoding/delimiter settings change. Make saved-profile application reparse loaded CSVs before applying saved mappings. Do not persist file bytes or transaction rows.
5. Preserve all Free/Pro limits, matching semantics, entitlement behavior, privacy behavior, and export contents.
6. Add a Reconcile-only GitHub Actions workflow that syntax-checks the relevant modules and runs the Reconcile tests, including quality/stress coverage, only when Reconcile-scoped paths change.
7. Update the Reconcile tool specification with the resulting parser-setting and large-result rendering contracts.
8. Restore the temporary execution-bridge workflow to the exact current `main` content before PR creation.

## Verification

Automated:
- `node --check` on Reconcile modules touched by this plan.
- Existing Reconcile tests.
- New realistic-data quality tests.
- New stress test at the declared Pro CSV row ceiling and XLSX parsing ceiling.
- Reconcile-specific GitHub Actions check on main after merge, plus generic PR checks before merge.

Manual/preview:
- Load two CSVs, then change delimiter/encoding and confirm loaded CSV data is reparsed without re-upload.
- Apply a saved parser profile to loaded CSVs and confirm parser settings take effect before saved mappings are restored.
- Reconcile a result set larger than one UI page and confirm only one page is rendered, page controls work, filtering resets to page 1, and CSV/XLSX exports still contain the complete result set.
- Confirm transaction data remains browser-local and no billing behavior changed.
