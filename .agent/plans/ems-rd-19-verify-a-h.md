# ExecPlan EMS-RD-19-VERIFY A-H

## Scope
- `tools/earth-map-suite/*` only.
- No endpoint code changes.
- No `app.js` changes.

## Files to touch
- `tools/earth-map-suite/api-status.html`
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json`
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`
- `tools/earth-map-suite/ems-rd-17-downloaded-browser-result.json`
- `tools/earth-map-suite/validate-browser-self-check-result.mjs`
- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_VALIDATOR.md`
- `tools/earth-map-suite/ems-rd-19-downloaded-browser-result.json` (new)
- `tools/earth-map-suite/ems-rd-19-current-gate-result.json` (new)
- `tools/earth-map-suite/EMS_RD_19_DOWNLOADED_RESULT_INTAKE.md` (new)
- `tools/earth-map-suite/EMS_RD_19_BRANCH_CLASSIFICATION.md` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_CURRENT_STATUS.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_20_TASK_SELECTION.md` (new)
- `tools/earth-map-suite/EMS_RD_20_READY_TASKS.md` (new)

## Steps
1. Inspect current `api-status.html` UI/script behavior.
2. Implement manual pasted JSON loader + safety validation.
3. Implement result hash generation/storage/render/copy/download behavior.
4. Update schema placeholders + validator and validator doc.
5. Add EMS-RD-19 intake/gate/classification docs and JSON files.
6. Update EMS-RD status/planning docs for EMS-RD-19.
7. Add EMS-RD-20 task selection + ready task docs.
8. Run validator and JSON sanity checks.
9. Commit and create PR message.

## Manual verification
1. Open `tools/earth-map-suite/api-status.html` in browser.
2. Paste valid safe JSON and click `Load pasted JSON`.
3. Confirm summary renders and localStorage restore works.
4. Confirm invalid JSON and unsafe flags are rejected.
5. Confirm copy/download include `result_hash` and `result_hash_algorithm`.
