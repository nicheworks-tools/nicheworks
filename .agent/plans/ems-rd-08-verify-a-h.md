# EMS-RD-08 VERIFY A-H ExecPlan

## Scope
- `tools/earth-map-suite/*` documentation and JSON status artifacts only.
- Workflow inspection target: `.github/workflows/ems-rd-api-smoke.yml` (read-only).

## Files to touch
- `tools/earth-map-suite/EMS_RD_08_VERIFY_WORKFLOW_AVAILABILITY.md`
- `tools/earth-map-suite/EMS_RD_08_WORKFLOW_AVAILABILITY.md` (sync alias for downstream references)
- `tools/earth-map-suite/EMS_RD_08_HEALTH_MANIFEST_RESULT.md`
- `tools/earth-map-suite/ems-rd-08-health-manifest-result.json`
- `tools/earth-map-suite/EMS_RD_08_PROBE_RESULT.md`
- `tools/earth-map-suite/ems-rd-08-probe-branch-result.json`
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_09_TASK_SELECTION.md`

## Steps
1. Inspect existing workflow YAML and EMS-RD docs.
2. Verify what can be confirmed locally; attempt GitHub Actions visibility/dispatch checks and record blockers exactly if unavailable.
3. Update EMS-RD-08 markdown result docs without fabricating remote run outputs.
4. Generate EMS-RD-08 JSON artifacts with only known values and validate JSON syntax.
5. Update plan/blocked/task-selection docs to reflect EMS-RD-08 outcome while preserving all safety constraints.
6. Run lightweight validation checks and commit.

## Manual verification for user
1. Open GitHub Actions and confirm workflow visibility:
   - `EMS RD API smoke check`
2. Manually dispatch with:
   - `base_url=https://nicheworks.app`
   - `run_probe=false`
3. Paste run URL/ID into EMS-RD-08 result docs if you execute it.
