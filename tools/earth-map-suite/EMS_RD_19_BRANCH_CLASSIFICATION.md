# EMS-RD-19 Branch Classification

Current branch classification:

- `branch_decision`: `browser_result_missing`
- `next_task_family`: `VERIFY`

Mapping:
- `browser_result_missing` / `network_unverified` -> `VERIFY`
- `health_manifest_failed` -> `ROUTE`
- `health_manifest_reachable` -> `PROBE`
- `raw_pixel_read` -> `SAMPLE`
- `decoder_strategy_required` -> `DECODER`
- `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase` -> `PROBEFIX`
