# EMS-RD-06 Storm Real Connection Blocked Marker

Status: **BLOCKED**

Storm real connection is currently blocked.

## Blocking reasons

- deployed endpoint branch is not manually verified yet
- `precipitation-sample-real` remains safe-unavailable by design
- unit / scale / NoData / geolocation validation is still pending
- `public_ui_allowed` is false

## Required unlock conditions

1. `/api/earth-map-suite/health` is reachable on deployed domains.
2. `/api/earth-map-suite/manifest` is reachable on deployed domains.
3. `probe-status` branch result is manually recorded.
4. `precipitation-sample-real` returns validated `real_observation` only after full validation gates pass.
5. source/license/provenance are visible in approved output.
6. `EMS_RD_05_STORM_REAL_PRECHECK.md` is explicitly approved.

## Forbidden until unlocked

- connecting `app.js` Storm flow to `precipitation-sample-real` as real data
- showing `debug_first_pixel` as rainfall value
- falling back from real failure to synthetic inside the same unlabeled block
- labeling synthetic preview as JAXA/EORC observed precipitation
