# EMS-RD-14 self-check endpoint

## Purpose

EMS-RD-13 stayed on the VERIFY path because browser result intake still lacked a confirmed deployed API result. EMS-RD-14 adds a route-level self-check endpoint that does not call any upstream Earth observation data source.

## Endpoint

`/api/earth-map-suite/self-check`

## Expected response

- `data_type=earth_map_suite_self_check`
- `status=ok`
- `external_fetch=false`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `real_observation_public_ready=false`

## Updated status page

`/tools/earth-map-suite/api-status.html` now includes self-check in the safe browser check.

Safe check now fetches:

- `/api/earth-map-suite/self-check`
- `/api/earth-map-suite/health`
- `/api/earth-map-suite/manifest`

## Guardrails

- This endpoint does not sample precipitation.
- This endpoint does not approve public real precipitation output.
- Storm / Compare / Card remain disconnected.
- Research probes remain manual.
- Raw/debug pixel must not be shown as rainfall.

## Next step

After deployment, run the safe browser check. If self-check, health, and manifest are reachable, run research probes only if needed and record the copied JSON result.
