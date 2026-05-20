# ExecPlan: EMS-RD-20 VERIFY A-H

## Scope
- tools/earth-map-suite/** docs and JSON only
- .agent/plans/EMS-RD-20-VERIFY-A-H.md

## Files to touch
- tools/earth-map-suite/EMS_RD_20_BROWSER_CAPTURE_CHECKLIST.md (new)
- tools/earth-map-suite/ems-rd-20-browser-safe-result.json (new)
- tools/earth-map-suite/EMS_RD_20_BROWSER_SAFE_RESULT_INTAKE.md (new)
- tools/earth-map-suite/EMS_RD_20_CANONICAL_SYNC.md (new)
- tools/earth-map-suite/EMS_RD_20_BRANCH_CLASSIFICATION.md (new)
- tools/earth-map-suite/ems-rd-20-current-gate-result.json (new)
- tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md (update)
- tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md (update)
- tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md (update)
- tools/earth-map-suite/EMS_RD_21_TASK_SELECTION.md (new)
- tools/earth-map-suite/EMS_RD_21_READY_TASKS.md (new)
- tools/earth-map-suite/ems-rd-11-browser-self-check-result.json (conditional sync)

## Steps
1. Inspect current canonical result and status docs for existing state.
2. Create EMS-RD-20 checklist/intake/sync/classification/current-gate docs and JSON with placeholder-safe values when actual browser JSON is unavailable.
3. Validate JSON files and run browser result validator.
4. Update status docs to reflect EMS-RD-20 gate outputs and next-gate mapping.
5. Create EMS-RD-21 task selection and ready tasks docs.
6. Re-run validations, commit, and prepare PR message.

## Manual verification
- Open checklist and confirm exact deployed URL and manual steps are present.
- Confirm intake and current-gate JSON files are valid via python json.tool.
- Confirm validator output and branch mapping consistency across EMS-RD-20/21 docs.
