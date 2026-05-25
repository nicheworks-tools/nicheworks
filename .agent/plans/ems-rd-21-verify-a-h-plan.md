# ExecPlan: EMS-RD-21-VERIFY A〜H

## Scope
- `functions/api/earth-map-suite/safe-result.js` (new)
- `functions/api/earth-map-suite/manifest.js`
- `tools/earth-map-suite/api-status.html`
- `tools/earth-map-suite/validate-browser-self-check-result.mjs`
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_VALIDATOR.md`
- `tools/earth-map-suite/EMS_RD_12_VALIDATION_COMMANDS.md`
- `tools/earth-map-suite/ems-rd-21-safe-result.json` (new)
- `tools/earth-map-suite/EMS_RD_21_SAFE_RESULT_INTAKE.md` (new)
- `tools/earth-map-suite/EMS_RD_21_CANONICAL_SYNC.md` (new)
- `tools/earth-map-suite/EMS_RD_21_BRANCH_CLASSIFICATION.md` (new)
- `tools/earth-map-suite/ems-rd-21-current-gate-result.json` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_22_TASK_SELECTION.md` (new)
- `tools/earth-map-suite/EMS_RD_22_READY_TASKS.md` (new)

## Steps
1. Inspect existing Earth Map Suite endpoint/manifest/api-status/validator behavior and current canonical result files.
2. Implement `/api/earth-map-suite/safe-result` with no upstream fetch and strict method/cache behavior.
3. Wire safe-result into manifest and api-status manual loader (no auto probes, no outbound send).
4. Update validator + docs for `api_safe_bundle` while preserving strict safety failures.
5. Capture safe-result output, create intake/sync/classification/current gate artifacts and update canonical only as instructed.
6. Update plan/status/blocked docs and create EMS-RD-22 selection/ready task docs.
7. Run validation checks (node + python json.tool), review diff, commit, and prepare PR message.

## Manual verification steps
- Open `/api/earth-map-suite/safe-result` and confirm JSON fields/safety flags.
- Open `tools/earth-map-suite/api-status.html`; click "Load server safe result" and verify JSON renders and copy/download still work.
- Run validator command and confirm `api_safe_bundle` is accepted with required endpoint keys.
