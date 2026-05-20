# EMS-RD-06 Storm Real Connection Blocked Marker

Status: **BLOCKED**

Storm real connection is currently blocked.

## EMS-RD-08 sync status

- workflow availability: workflow file exists locally (`.github/workflows/ems-rd-api-smoke.yml`); GitHub Actions visibility is unverified from this environment.
- health / manifest status: `network_unverified` (dispatch not executed in this environment).
- probe branch status: `network_unverified` (not run).
- current blocker: remote GitHub Actions dispatch/visibility could not be confirmed from this environment, so reachability/probe evidence is still missing.

## EMS-RD-09 sync status

- workflow visibility: `unknown` (GitHub API/Actions access from this environment failed: `curl: (56) CONNECT tunnel failed, response 403`).
- health / manifest status: `network_unverified` (dispatch unavailable in this environment).
- probe branch decision: `network_unverified` (not dispatched; prerequisite not met).
- current blocker: workflow visibility/dispatch/run artifacts could not be obtained from GitHub Actions/API in this environment, so reachability and probe evidence remain unverified.

## Blocking reasons

- deployed endpoint branch is not manually verified yet
- `precipitation-sample-real` remains safe-unavailable by design
- unit / scale / NoData / geolocation validation is still pending
- source/license/provenance validation is still pending
- `public_ui_allowed` is false

## Required unlock conditions

1. `/api/earth-map-suite/health` is reachable on deployed domains.
2. `/api/earth-map-suite/manifest` is reachable on deployed domains.
3. `probe-status` branch result is manually recorded.
4. `precipitation-sample-real` is validated (unit / scale / NoData / geolocation).
5. source/license/provenance are visible in approved output.
6. `EMS_RD_05_STORM_REAL_PRECHECK.md` is explicitly approved.

Storm real must stay blocked unless **all** conditions above are true.

## Forbidden until unlocked

- connecting `app.js` Storm flow to `precipitation-sample-real` as real data
- showing `debug_first_pixel` as rainfall value
- using synthetic fallback inside real result block
- labeling synthetic preview as JAXA/EORC observed precipitation


## EMS-RD-10/11 sync status

- browser self-check page exists: `tools/earth-map-suite/api-status.html`.
- browser result intake file exists: `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json` (currently placeholder).
- current branch_decision: `browser_result_missing`.

Storm real stays blocked unless all of the following are true:

1. `health` endpoint reachable.
2. `manifest` endpoint reachable.
3. probe branch recorded.
4. `precipitation-sample-real` returns validated `real_observation`.
5. unit / scale / offset / NoData / geolocation verified.
6. source / license / provenance verified.
7. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved.

### Explicitly forbidden while blocked

- connecting `app.js` to `precipitation-sample-real` as real data.
- showing raw/debug pixel as rainfall.
- falling back from real failure to synthetic in the same result block.
- labeling synthetic preview as JAXA/EORC data.

## EMS-RD-12 status

- current `branch_decision`: `browser_result_missing`
- browser JSON result must be pasted and validated before branch routing
- Storm real remains blocked

Required unlock conditions remain:

1. health endpoint reachable
2. manifest endpoint reachable
3. probe branch recorded
4. `precipitation-sample-real` returns validated `real_observation`
5. unit / scale / offset / NoData / geolocation verified
6. source / license / provenance verified
7. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved

Explicitly forbidden while blocked:

- `app.js` real connection
- raw/debug pixel as rainfall
- synthetic fallback inside real result block
- JAXA/EORC label on synthetic preview


## EMS-RD-13 status

- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- current blocker: actual deployed browser self-check JSON is still missing, so route/probe/sample gating cannot advance.

Storm real remains blocked unless all are true:

1. health endpoint reachable
2. manifest endpoint reachable
3. probe branch recorded
4. `precipitation-sample-real` returns validated `real_observation`
5. unit / scale / offset / NoData / geolocation verified
6. source / license / provenance verified
7. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved

Explicitly forbidden while blocked:

- connecting `app.js` to `precipitation-sample-real` as real data
- showing raw/debug pixel as rainfall
- falling back from real failure to synthetic in the same result block
- labeling synthetic preview as JAXA/EORC data

## EMS-RD-15 status

- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- self_check result recorded: `no` (placeholder preserved)
- current blocker: deployed browser safe-check JSON has not been recorded yet.

Storm real remains blocked unless all are true:

1. self-check endpoint reachable
2. health endpoint reachable
3. manifest endpoint reachable
4. probe branch recorded
5. `precipitation-sample-real` returns validated `real_observation`
6. unit / scale / offset / NoData / geolocation verified
7. source / license / provenance verified
8. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved

Explicitly forbidden while blocked:

- connecting `app.js` to `precipitation-sample-real` as real data
- showing raw/debug pixel as rainfall
- synthetic fallback inside real result block
- labeling synthetic preview as JAXA/EORC data

## EMS-RD-16 status

- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- self_check reachable: `unknown`
- health reachable: `unknown`
- manifest reachable: `unknown`
- current blocker: deployed browser safe-check JSON result has not been recorded yet, so endpoint reachability/probe evidence remains missing.

Storm real remains blocked unless all are true:

1. self-check endpoint reachable
2. health endpoint reachable
3. manifest endpoint reachable
4. probe branch recorded
5. `precipitation-sample-real` returns validated `real_observation`
6. unit / scale / offset / NoData / geolocation verified
7. source / license / provenance verified
8. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved

Explicitly forbidden while blocked:

- connecting `app.js` to `precipitation-sample-real` as real data
- showing raw/debug pixel as rainfall
- synthetic fallback inside real result block
- labeling synthetic preview as JAXA/EORC data

## EMS-RD-17 status
- browser flow supports safe autorun + copy/download/local restore.
- probes remain manual.
- branch_decision browser_result_missing; next_task_family VERIFY.

## EMS-RD-18 Status Sync (2026-05-19)
- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- downloaded browser JSON recorded: no
- canonical result synced: no (no actual downloaded browser JSON source)
- current blocker: missing downloaded safe-check JSON from deployed browser run

Storm real remains blocked unless **all** required gates are satisfied:
1. self-check endpoint reachable
2. health endpoint reachable
3. manifest endpoint reachable
4. probe branch recorded
5. precipitation-sample-real returns validated `real_observation`
6. unit / scale / offset / NoData / geolocation verified
7. source / license / provenance verified
8. `EMS_RD_05_STORM_REAL_PRECHECK.md` approved

Explicitly forbidden:
- connecting `app.js` to `precipitation-sample-real` as real data
- showing raw/debug pixel as rainfall
- synthetic fallback inside real result block
- labeling synthetic preview as JAXA/EORC data

## EMS-RD-19 status

- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- result_hash: `null` (no actual browser artifact yet)
- pasted JSON loader added to `api-status.html` for intake, but Storm real remains blocked.

Storm/Compare/Card stay disconnected and `public_real_data_enabled` remains `false`.

## EMS-RD-20 status

- capture checklist: `tools/earth-map-suite/EMS_RD_20_BROWSER_CAPTURE_CHECKLIST.md`
- intake file: `tools/earth-map-suite/ems-rd-20-browser-safe-result.json`
- canonical sync: `no` (placeholder intake)
- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- result_hash: `null`
- current blocker: actual deployed browser safe-check JSON artifact is still missing.

Storm real remains blocked unless all required gates are satisfied, and remains explicitly blocked in EMS-RD-20 (`storm_real_blocked=true`).

Still forbidden while blocked:
- public real-data enablement
- Storm / Compare / Card connection
- raw/debug pixel as rainfall
- synthetic fallback inside real result block
- paid infrastructure

## EMS-RD-21 Gate Marker (2026-05-20)
- branch_decision: `health_manifest_reachable`
- next_task_family: `PROBE`
- `/api/earth-map-suite/safe-result` is route-level safe bundle only.
- `public_real_data_enabled=false` (unchanged)
- `storm_compare_card_connected=false` (unchanged)
- `storm_real_blocked=true` (unchanged)
- `precipitation-sample-real` remains non-public research output.
- Next gate mapping: VERIFY obtain safe/browser result; ROUTE fix deployment; PROBE run manual probe; SAMPLE validate unit/scale/NoData/geolocation/source/license; DECODER isolated feasibility; PROBEFIX repair probe chain.
