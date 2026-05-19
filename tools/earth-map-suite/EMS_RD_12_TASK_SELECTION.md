# EMS-RD-12 Task Selection

Use this selection after reading `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json`.

## Path A: `browser_result_missing`
- Run deployed browser self-check.
- Record JSON result.
- Do not modify sampling.
- Next task family: **EMS-RD-12-VERIFY**.

## Path B: `health_manifest_failed`
- Fix Pages Functions route/deployment.
- Check `_routes`, `functions` directory, and Pages build settings.
- Next task family: **EMS-RD-12-ROUTE**.

## Path C: `health_manifest_reachable`
- Run research probe check from browser self-check page.
- Record probe branch.
- Next task family: **EMS-RD-12-PROBE**.

## Path D: `raw_pixel_read`
- Start validated sample validation.
- Validate unit / scale / offset / NoData / geolocation / source / license.
- Do not connect Storm / Compare / Card.
- Next task family: **EMS-RD-12-SAMPLE**.

## Path E: `decoder_strategy_required`
- Start isolated decoder feasibility.
- Do not add decoder to public endpoint yet.
- Next task family: **EMS-RD-12-DECODER**.

## Path F: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- Fix probe chain.
- Do not proceed to sampling.
- Next task family: **EMS-RD-12-PROBEFIX**.

## Non-negotiable constraints

- Storm real remains blocked.
- Public real precipitation remains disabled.
- Raw/debug pixel must not be shown as rainfall.
- Synthetic fallback must not hide real endpoint failures.
- No paid infrastructure should be introduced.
