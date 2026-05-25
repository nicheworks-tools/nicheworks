# EMS-RD-19 Task Selection

Current `next_task_family`: **VERIFY**.

## Path A: VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- Continue downloaded browser safe-check result collection.
- Do not touch sampling.
- Next: `EMS-RD-19-VERIFY`

## Path B: ROUTE
- Trigger: `health_manifest_failed`
- Fix Cloudflare Pages Functions route/deployment.
- Next: `EMS-RD-19-ROUTE`

## Path C: PROBE
- Trigger: `health_manifest_reachable`
- Run research probe from browser self-check.
- Record probe branch.
- Next: `EMS-RD-19-PROBE`

## Path D: SAMPLE
- Trigger: `raw_pixel_read`
- Start validated sample validation.
- Do not connect public UI.
- Next: `EMS-RD-19-SAMPLE`

## Path E: DECODER
- Trigger: `decoder_strategy_required`
- Test decoder in isolated research endpoint.
- Do not add decoder to public endpoint.
- Next: `EMS-RD-19-DECODER`

## Path F: PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- Fix probe chain.
- Do not proceed to sampling.
- Next: `EMS-RD-19-PROBEFIX`

## Non-negotiables
- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real failures.
- No paid infrastructure.
