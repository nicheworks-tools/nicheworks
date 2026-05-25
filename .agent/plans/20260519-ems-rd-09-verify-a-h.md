# ExecPlan: EMS-RD-09-VERIFY A〜H

## Scope
- `tools/earth-map-suite/EMS_RD_09_WORKFLOW_VISIBILITY.md`
- `tools/earth-map-suite/EMS_RD_09_HEALTH_MANIFEST_RUN.md`
- `tools/earth-map-suite/ems-rd-09-health-manifest-result.json`
- `tools/earth-map-suite/EMS_RD_09_PROBE_RUN.md`
- `tools/earth-map-suite/ems-rd-09-probe-branch-result.json`
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_10_TASK_SELECTION.md`

## Steps
1. Inspect existing EMS-RD-09 related files and current state in `tools/earth-map-suite`.
2. Verify workflow visibility using GitHub API/tooling (not local-only), and write VERIFY-A report.
3. If dispatchable, dispatch smoke workflow with `run_probe=false`, monitor run, and write VERIFY-B report.
4. Collect health/manifest outputs from logs/artifacts and write machine-readable VERIFY-C JSON.
5. Conditionally dispatch probe smoke with `run_probe=true` only if VERIFY-C is `health_manifest_reachable`; write VERIFY-D report.
6. Collect probe outputs and generate VERIFY-E JSON from actual run data or blocker state.
7. Update VERIFY-F/G/H documentation files based on observed branch decision.
8. Validate JSON files, run basic checks, commit changes, and prepare PR message.

## Manual verification
- Confirm Markdown/JSON files are present under `tools/earth-map-suite`.
- Confirm JSON parses cleanly with `jq`.
- Review recorded workflow run URLs/IDs and decisions for consistency.
- Confirm `public_real_data_enabled=false` and `storm_compare_card_connected=false` remain unchanged in result docs.
