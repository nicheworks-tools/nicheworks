# EMS-RD-14 Task Selection

Current `next_task_family` from EMS-RD-13: **VERIFY**.

## Path A: VERIFY
- Trigger: `browser_result_missing` or `network_unverified`
- Action: Continue browser self-check collection.
- Constraint: Do not touch sampling.
- Next: `EMS-RD-14-VERIFY`

## Path B: ROUTE
- Trigger: `health_manifest_failed`
- Action: Fix Cloudflare Pages Functions route/deployment.
- Next: `EMS-RD-14-ROUTE`

## Path C: PROBE
- Trigger: `health_manifest_reachable`
- Action: Run research probe from browser self-check and record probe branch.
- Next: `EMS-RD-14-PROBE`

## Path D: SAMPLE
- Trigger: `raw_pixel_read`
- Action: Start validated sample validation.
- Constraint: Do not connect public UI.
- Next: `EMS-RD-14-SAMPLE`

## Path E: DECODER
- Trigger: `decoder_strategy_required`
- Action: Test decoder in isolated research endpoint.
- Constraint: Do not add decoder to public endpoint.
- Next: `EMS-RD-14-DECODER`

## Path F: PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- Action: Fix probe chain.
- Constraint: Do not proceed to sampling.
- Next: `EMS-RD-14-PROBEFIX`

## Non-negotiables
- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real failures.
- No paid infrastructure.
