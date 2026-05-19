# EMS-RD-12 Browser Result Validator

Last updated: 2026-05-19

## Purpose

`validate-browser-self-check-result.mjs` validates the browser self-check result JSON before next-phase routing.

## Run

```bash
node tools/earth-map-suite/validate-browser-self-check-result.mjs
```

## Required top-level fields

- `branch_decision`
- `public_real_data_enabled`
- `storm_compare_card_connected`
- `endpoints` (array)

## Required endpoint keys

- `self_check`
- `health`
- `manifest`
- `probe_status`
- `precipitation_sample_real`

## Allowed `branch_decision` values

- `browser_result_missing`
- `network_unverified`
- `health_manifest_failed`
- `health_manifest_reachable`
- `raw_pixel_read`
- `decoder_strategy_required`
- `endpoint_error`
- `blocked`
- `inconclusive`
- `probe_checked_without_phase`

## Next task family mapping

- `browser_result_missing` / `network_unverified` → `VERIFY`
- `health_manifest_failed` → `ROUTE`
- `health_manifest_reachable` → `PROBE`
- `raw_pixel_read` → `SAMPLE`
- `decoder_strategy_required` → `DECODER`
- `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase` → `PROBEFIX`

## Validator output

The script prints:

- `branch_decision`
- `next_task_family`
- `required_endpoints_found`
- `required_endpoints_missing`

## Hard-fail conditions

- `public_real_data_enabled !== false`
- `storm_compare_card_connected !== false`
- `branch_decision` missing or invalid
- `endpoints` missing or not an array
- any required endpoint key missing

## Safety notes

- No dependency install required.
- No endpoint invocation is performed by this validator.
- No public real data is enabled.
