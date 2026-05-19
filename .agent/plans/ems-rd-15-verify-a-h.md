# ExecPlan: EMS-RD-15-VERIFY A-H

## Scope
- `tools/earth-map-suite/` only.

## Files to touch
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json`
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`
- `tools/earth-map-suite/validate-browser-self-check-result.mjs`
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_VALIDATOR.md`
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_PASTE_GUIDE.md`
- `tools/earth-map-suite/EMS_RD_12_VALIDATION_COMMANDS.md`
- `tools/earth-map-suite/EMS_RD_14_SELF_CHECK_ENDPOINT.md`
- `tools/earth-map-suite/EMS_RD_15_BROWSER_RESULT_INTAKE.md` (create/update)
- `tools/earth-map-suite/ems-rd-15-current-gate-result.json` (create)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_16_TASK_SELECTION.md` (create)
- `tools/earth-map-suite/EMS_RD_16_READY_TASKS.md` (create)

## High-level steps
1. Inspect current schema/result/validator/docs to preserve existing constraints.
2. Update JSON schema+placeholder with `self_check` endpoint using null unknown values.
3. Update validator rules, branch mapping, and output logs.
4. Update related docs for self-check-first flow and validation commands.
5. Record intake status without fabricating deployed endpoint results.
6. Create EMS-RD-15 gate result JSON derived from placeholder state.
7. Update plan/status/blocked/task-selection docs for EMS-RD-15 and RD-16.
8. Validate JSON and run validator.
9. Commit changes and create PR message.

## Manual verification steps
1. Confirm `ems-rd-11-browser-self-check-result*.json` include `self_check` endpoint and remain valid JSON.
2. Run validator and confirm required endpoints include `self_check` and safety flags remain strict.
3. Confirm docs state safe-check order: self-check → health → manifest.
4. Confirm gate and status docs keep `public_real_data_enabled=false` and Storm blocked.
