# EMS-RD-12 Browser Result Paste Guide

Last updated: 2026-05-19

## Steps

1. Open `/tools/earth-map-suite/api-status.html` on deployed site.
2. Run **safe check first**.
3. Safe check must include: `self-check` + `health` + `manifest`.
4. Copy the JSON result exactly.
5. Paste into `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`.
6. Validate JSON and validator output.

## Expected `self_check` facts in safe result

- `data_type=earth_map_suite_self_check`
- `status=ok`
- `external_fetch=false`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`

## Probe handling

- Probe check remains manual/research-only.
- Do **not** run research probes unless `self-check` / `health` / `manifest` are reachable.

## Non-negotiables

- Do not fabricate endpoint values.
- Keep `public_real_data_enabled=false`.
- Keep `storm_compare_card_connected=false`.
- Do not connect Storm / Compare / Card.
