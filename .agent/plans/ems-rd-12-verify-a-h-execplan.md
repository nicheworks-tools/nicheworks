# ExecPlan: EMS-RD-12-VERIFY A〜H

## Scope
- Target directory: `tools/earth-map-suite/`
- GitHub PR state verification for PR #409/#410
- No endpoint code changes, no `app.js` changes, no Storm/Compare/Card connection.

## Files to touch
- `tools/earth-map-suite/EMS_RD_12_VERIFY_BASELINE.md` (new)
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_PASTE_GUIDE.md` (new)
- `tools/earth-map-suite/validate-browser-self-check-result.mjs` (new)
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_VALIDATOR.md` (new)
- `tools/earth-map-suite/EMS_RD_12_VALIDATION_COMMANDS.md` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md` (update)
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md` (update)
- `tools/earth-map-suite/EMS_RD_13_TASK_SELECTION.md` (new)
- `tools/earth-map-suite/EMS_RD_13_READY_TASKS.md` (new)

## Steps
1. Inspect current `tools/earth-map-suite` baseline docs and JSON status.
2. Verify PR #409 merged and PR #410 closed/superseded via GitHub CLI if available.
3. Add new EMS-RD-12/13 docs and validator script per requirements.
4. Update existing plan/block docs to include EMS-RD-12 validation gate.
5. Run local validation commands (`python -m json.tool`, `node validator`).
6. Commit changes.
7. Create PR message using `make_pr` tool.

## Manual verification
- Confirm `EMS_RD_12_VERIFY_BASELINE.md` records PR #409 merged / PR #410 superseded, `browser_result_missing`, and Storm blocked.
- Run:
  - `python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`
  - `python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json`
  - `node tools/earth-map-suite/validate-browser-self-check-result.mjs`
- Confirm no changes to endpoint implementation files or `tools/earth-map-suite/app.js`.
