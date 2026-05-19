# EMS-RD-16 VERIFY A-H ExecPlan

## Scope
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`
- `tools/earth-map-suite/EMS_RD_16_SAFE_CHECK_RESULT.md` (new)
- `tools/earth-map-suite/EMS_RD_16_BRANCH_CLASSIFICATION.md` (new)
- `tools/earth-map-suite/ems-rd-16-current-gate-result.json` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_17_TASK_SELECTION.md` (new)
- `tools/earth-map-suite/EMS_RD_17_READY_TASKS.md` (new)

## Steps
1. Inspect existing EMS-RD-15/16 artifacts and current browser result JSON.
2. Preserve or update self-check result JSON without fabricating endpoint values.
3. Run JSON and branch validator checks.
4. Create EMS-RD-16/17 documentation files and update status/plan docs based on current branch_decision.
5. Re-run validations, review diff, commit, and prepare PR body.

## Manual verification
- Confirm `branch_decision` and endpoint statuses are consistent across all new/updated docs.
- Confirm `public_real_data_enabled=false`, `storm_compare_card_connected=false`, `storm_real_blocked=true` remain unchanged.
- Confirm no app/runtime code changed and only docs + gate JSON updated.
