# ExecPlan: EMS-RD-18 VERIFY A-H

## Scope
- `tools/earth-map-suite/*` documentation and JSON status artifacts only.
- No endpoint/app code changes.

## Files to touch
- tools/earth-map-suite/ems-rd-17-downloaded-browser-result.json
- tools/earth-map-suite/ems-rd-11-browser-self-check-result.json
- tools/earth-map-suite/EMS_RD_18_DOWNLOADED_SAFE_RESULT.md
- tools/earth-map-suite/EMS_RD_18_CANONICAL_RESULT_SYNC.md
- tools/earth-map-suite/EMS_RD_18_BRANCH_CLASSIFICATION.md
- tools/earth-map-suite/ems-rd-18-current-gate-result.json
- tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md
- tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md
- tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md
- tools/earth-map-suite/EMS_RD_19_TASK_SELECTION.md
- tools/earth-map-suite/EMS_RD_19_READY_TASKS.md

## Steps
1. Inspect current downloaded/canonical browser result JSON.
2. Preserve missing-state JSON without fabricating endpoint values.
3. Write EMS-RD-18 intake/sync/classification/current-gate artifacts.
4. Update status/plan blocked-marker docs.
5. Create EMS-RD-19 task selection and ready tasks docs.
6. Validate JSON + run validator.
7. Commit and produce PR message.

## Manual verification
- Confirm no endpoint code changed.
- Confirm safety flags remain false and storm blocked true.
- Confirm next_task_family mapping is single-valued and consistent.
