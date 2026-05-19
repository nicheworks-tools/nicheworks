# EMS-RD-11 ExecPlan

## Scope
- `tools/earth-map-suite/*` only.
- No endpoint/app logic changes beyond instruction text in `api-status.html`.

## Files to touch
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json` (new)
- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json` (new)
- `tools/earth-map-suite/EMS_RD_11_BROWSER_RESULT_NOTE.md` (new)
- `tools/earth-map-suite/EMS_RD_11_BROWSER_BRANCH_CLASSIFIER.md` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md`
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md`
- `tools/earth-map-suite/EMS_RD_12_TASK_SELECTION.md` (new)
- `tools/earth-map-suite/api-status.html`
- `tools/earth-map-suite/EMS_RD_12_READY_TASKS.md` (new)

## Steps
1. Inspect current EMS-RD-10/11 context files and existing guardrails language.
2. Add template JSON and canonical placeholder JSON using null for unknown endpoint values.
3. Add EMS-RD-11 result note + branch classifier + EMS-RD-12 selection and ready tasks docs.
4. Update `REAL_DATA_FIRST_PLAN.md` and `EMS_RD_06_STORM_REAL_BLOCKED.md` with EMS-RD-10/11 gate and current branch.
5. Add concise copy instructions block to `api-status.html` near browser self-check controls.
6. Validate JSON files and verify no disallowed files changed.

## Manual verification
- Open `tools/earth-map-suite/api-status.html` and confirm instruction block is visible near self-check controls.
- Confirm buttons remain: Run safe check / Run research probes / Copy JSON result.
- Confirm both JSON files parse and preserve:
  - `public_real_data_enabled=false`
  - `storm_compare_card_connected=false`
