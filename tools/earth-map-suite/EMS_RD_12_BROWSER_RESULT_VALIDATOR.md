# EMS-RD-12 Browser Result Validator

Last updated: 2026-05-19

## Purpose

`validate-browser-self-check-result.mjs` validates the browser self-check result JSON before next-phase routing.

Target JSON:

- `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`

## Run

```bash
node tools/earth-map-suite/validate-browser-self-check-result.mjs
```

## Required top-level fields

- `branch_decision`
- `public_real_data_enabled`
- `storm_compare_card_connected`
- `endpoints`

## Hard-fail conditions

- `public_real_data_enabled !== false`
- `storm_compare_card_connected !== false`
- `endpoints` missing or not an array
- `branch_decision` missing
- `branch_decision` not in allowed list

## Allowed `branch_decision` values

- `browser_result_missing`
- `health_manifest_failed`
- `health_manifest_reachable`
- `raw_pixel_read`
- `decoder_strategy_required`
- `endpoint_error`
- `blocked`
- `inconclusive`
- `probe_checked_without_phase`
- `network_unverified`

## Printed next task families

- `VERIFY`
- `ROUTE`
- `PROBE`
- `SAMPLE`
- `DECODER`
- `PROBEFIX`

## Notes

- No dependency install is required.
- No endpoint call is made by this validator.
- This validator does not enable public real data.
