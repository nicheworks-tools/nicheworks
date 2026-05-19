# EMS-RD-07 API smoke workflow

This note records the next gate after EMS-RD-06.

## Purpose

Codex and some hosted environments cannot reliably reach `https://nicheworks.app` directly because outbound HTTPS can be blocked by a CONNECT tunnel policy. The repository now includes a manual GitHub Actions smoke workflow so endpoint reachability can be checked from GitHub Actions instead.

## Workflow

`.github/workflows/ems-rd-api-smoke.yml`

## How to run

1. Open GitHub Actions.
2. Select **EMS RD API smoke check**.
3. Run with:
   - `base_url=https://nicheworks.app`
   - `run_probe=false` first
4. Confirm health and manifest pass.
5. Run again with:
   - `base_url=https://nicheworks.app`
   - `run_probe=true`
   only after the basic routes pass.

Optional second base URL:

- `https://nicheworks.pages.dev`

## Expected health result

`/api/earth-map-suite/health` should return:

- `data_type=earth_map_suite_api_health`
- `status=ok`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`

## Expected manifest result

`/api/earth-map-suite/manifest` should return:

- `data_type=earth_map_suite_api_manifest`
- `status=ok`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`

## Probe result handling

If `probe-status` returns:

- `raw_pixel_read`: proceed only to validated sample validation work; do not connect public UI.
- `decoder_strategy_required`: proceed to decoder feasibility work; do not connect public UI.
- `endpoint_error`, `blocked`, or `inconclusive`: fix the probe chain first.

## Guardrail

This workflow does not approve Storm / Compare / Card real-data connection. It only records endpoint reachability and probe branch data.
