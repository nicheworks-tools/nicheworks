# EMS-RD-22 Task Selection

## Path A: VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- Action: use `/api/earth-map-suite/safe-result` or api-status browser capture.
- Constraint: do not touch sampling.
- Next: `EMS-RD-22-VERIFY`

## Path B: ROUTE
- Trigger: `health_manifest_failed`
- Action: fix Cloudflare Pages Functions route/deployment.
- Next: `EMS-RD-22-ROUTE`

## Path C: PROBE
- Trigger: `health_manifest_reachable`
- Action: run research probe from api-status page and record probe branch.
- Next: `EMS-RD-22-PROBE`

## Path D: SAMPLE
- Trigger: `raw_pixel_read`
- Action: start validated sample validation; do not connect public UI.
- Next: `EMS-RD-22-SAMPLE`

## Path E: DECODER
- Trigger: `decoder_strategy_required`
- Action: test decoder in isolated research endpoint; do not add decoder to public endpoint.
- Next: `EMS-RD-22-DECODER`

## Path F: PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- Action: fix probe chain and do not proceed to sampling.
- Next: `EMS-RD-22-PROBEFIX`

## Non-negotiables
- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real failures.
- No paid infrastructure.
