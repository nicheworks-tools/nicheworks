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
