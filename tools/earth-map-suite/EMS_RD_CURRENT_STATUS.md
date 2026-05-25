# EMS-RD Current Status

## 1) Current phase
- `EMS-RD-19-VERIFY`

## 2) branch_decision / next_task_family
- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- result_hash: `null`
- actual browser result recorded: `no`

## 3) Complete
- Real Data First plan maintained.
- route probes/contracts documented.
- browser self-check page implemented.
- self-check endpoint integrated in verification flow.
- validator requires `self_check` endpoint key.
- autorun/download/localStorage flow exists.
- pasted JSON loader exists.

## 4) Not complete
- actual deployed browser result is still missing.
- validated `real_observation` output is not approved.
- Storm real connection is not enabled.
- Compare real connection is not enabled.
- Card real connection is not enabled.
- remaining 15 tools/modes are not in validated real-data state.

## 5) Current blockers
- missing deployed browser safe-check JSON artifact from `api-status.html`.
- without that artifact, route/probe/sample classification cannot advance safely.

## 6) Next 3 actions
1. Run `api-status.html?autorun=safe` on deployed site and download/copy JSON.
2. Paste JSON through intake flow and re-run validator/classification.
3. Route to EMS-RD-20 task family according to updated branch decision.

## 7) Guardrails (must remain)
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- no raw pixel as rainfall
- no synthetic fallback inside real block
- no paid infrastructure

## 8) EMS-RD-20 update
- capture checklist exists: `tools/earth-map-suite/EMS_RD_20_BROWSER_CAPTURE_CHECKLIST.md`
- intake result exists: `tools/earth-map-suite/ems-rd-20-browser-safe-result.json`
- canonical sync result: `no` (placeholder intake, no actual browser artifact yet)
- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- result_hash: `null`

Next gate mapping:
- `VERIFY` -> obtain actual browser safe-check JSON
- `ROUTE` -> fix API route/deployment
- `PROBE` -> run research probe manually
- `SAMPLE` -> validate unit/scale/NoData/geolocation/source/license
- `DECODER` -> isolated decoder feasibility
- `PROBEFIX` -> repair probe chain

Safety guardrails unchanged:
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `storm_real_blocked=true`
- `precipitation-sample-real` is not public real output
- Storm / Compare / Card remain disconnected

## EMS-RD-21 Update (2026-05-20)
- safe-result endpoint: available at `/api/earth-map-suite/safe-result` (safe bundle mode).
- api-status manual loader: available (no auto probe execution).
- validator: `api_safe_bundle` accepted with strict safety flags.
- branch_decision: `health_manifest_reachable`
- next_task_family: `PROBE`
- storm_real_blocked: true
