# EMS-RD-13 Task Selection

Last updated: 2026-05-19

Use this after browser result JSON is pasted and validated.

## Path A: `browser_result_missing` / `network_unverified`

- Continue verification.
- Do not touch endpoint sampling.
- Next: `EMS-RD-13-VERIFY`.

## Path B: `health_manifest_failed`

- Fix route/deployment.
- Check Cloudflare Pages Functions config.
- Next: `EMS-RD-13-ROUTE`.

## Path C: `health_manifest_reachable`

- Run research probe from browser self-check page.
- Record probe branch.
- Next: `EMS-RD-13-PROBE`.

## Path D: `raw_pixel_read`

- Start validated sample validation only.
- Validate unit / scale / offset / NoData / geolocation / source / license.
- Next: `EMS-RD-13-SAMPLE`.

## Path E: `decoder_strategy_required`

- Start isolated decoder feasibility.
- Do not add decoder to public endpoint.
- Next: `EMS-RD-13-DECODER`.

## Path F: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`

- Fix probe chain.
- Do not proceed to sampling.
- Next: `EMS-RD-13-PROBEFIX`.

## Non-negotiables

- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real failures.
- No paid infrastructure.
