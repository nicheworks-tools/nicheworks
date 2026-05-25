# EMS-RD-14 self-check endpoint

Last updated: 2026-05-19

## Endpoint

`/api/earth-map-suite/self-check`

## Expected response

- `data_type=earth_map_suite_self_check`
- `status=ok`
- `external_fetch=false`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `real_observation_public_ready=false`

## Browser safe-check order

1. `self-check`
2. `health`
3. `manifest`

Safe check is run from: `/tools/earth-map-suite/api-status.html`.

## Operator flow

1. Run safe check first.
2. Copy JSON result.
3. Paste into `ems-rd-11-browser-self-check-result.json`.
4. Validate with JSON tool + local validator.
5. Keep probe check manual.

## Warning

Do not run research probes unless self-check, health, and manifest are reachable.

## Guardrails

- No endpoint result fabrication.
- No public real precipitation enablement.
- Storm / Compare / Card remain disconnected.
