# EMS-RD-21 Task Selection

## Path A: VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- Action: use `api-status.html?autorun=safe`, download/copy JSON, paste/load JSON or intake file.
- Constraint: do not touch sampling.
- Next: `EMS-RD-21-VERIFY`

## Path B: ROUTE
- Trigger: `health_manifest_failed`
- Action: fix Cloudflare Pages Functions route/deployment.
- Next: `EMS-RD-21-ROUTE`

## Path C: PROBE
- Trigger: `health_manifest_reachable`
- Action: run research probe from browser self-check and record probe branch.
- Next: `EMS-RD-21-PROBE`

## Path D: SAMPLE
- Trigger: `raw_pixel_read`
- Action: start validated sample validation.
- Constraint: do not connect public UI.
- Next: `EMS-RD-21-SAMPLE`

## Path E: DECODER
- Trigger: `decoder_strategy_required`
- Action: test decoder in isolated research endpoint.
- Constraint: do not add decoder to public endpoint.
- Next: `EMS-RD-21-DECODER`

## Path F: PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- Action: fix probe chain.
- Constraint: do not proceed to sampling.
- Next: `EMS-RD-21-PROBEFIX`

## Non-negotiables
- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real failures.
- No paid infrastructure.
