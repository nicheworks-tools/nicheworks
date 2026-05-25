# ExecPlan: EMS-RD-13-VERIFY A〜H

## Scope
- `tools/earth-map-suite/` only.

## Files to touch
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json` (only if actual browser JSON is available; otherwise leave values and update note)
- `tools/earth-map-suite/EMS_RD_13_BROWSER_RESULT_VALIDATION.md`
- `tools/earth-map-suite/EMS_RD_13_BRANCH_CLASSIFICATION.md`
- `tools/earth-map-suite/ems-rd-13-current-gate-result.json`
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_14_TASK_SELECTION.md`
- `tools/earth-map-suite/EMS_RD_14_READY_TASKS.md`
- `tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md`

## Steps
1. Inspect current EMS-RD-11 self-check JSON and validator behavior.
2. Determine whether actual copied browser JSON exists in repo context; if not, keep placeholder and update note accordingly.
3. Run JSON validation and browser-result validator; capture outputs.
4. Create EMS-RD-13 validation and branch-classification docs.
5. Create machine-readable EMS-RD-13 current gate JSON with null unknowns.
6. Update Real Data First plan and Storm blocked marker with EMS-RD-13 status.
7. Create EMS-RD-14 task selection and ready task docs.
8. Create concise current status handoff doc.
9. Re-run validations and commit.

## Manual verification
- Confirm `branch_decision` and `next_task_family` are consistent across all new/updated files.
- Confirm all guardrails remain: `public_real_data_enabled=false`, `storm_compare_card_connected=false`, Storm real blocked.
- Confirm no endpoint code or `app.js` changed.
