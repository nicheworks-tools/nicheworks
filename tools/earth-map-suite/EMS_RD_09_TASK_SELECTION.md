# EMS-RD-09 Task Selection

This selection document defines the EMS-RD-09 path from EMS-RD-08 branch outcomes.

## Global constraints (always apply)

- Storm real remains **blocked**.
- Synthetic fallback must not hide real endpoint failures.
- Raw/debug pixel must not be shown as rainfall.
- No paid infrastructure should be introduced.
- JAXA/EORC source/license/provenance must remain visible when real data is eventually enabled.

## Path A: `network_unverified`

- Continue verification work.
- Do not touch sampling.
- Do not connect UI.
- Next task family: **EMS-RD-09-VERIFY**.

## Path B: `health_manifest_failed`

- Fix Cloudflare Pages Functions route/deployment.
- Do not run probe chain until health/manifest pass.
- Next task family: **EMS-RD-09-ROUTE**.

## Path C: `raw_pixel_read`

- Start validated sample validation.
- Validate unit / scale / offset / NoData / geolocation / source / license.
- Do not connect Storm / Compare / Card.
- Next task family: **EMS-RD-09-SAMPLE**.

## Path D: `decoder_strategy_required`

- Start decoder feasibility.
- Test decoder in isolated research endpoint.
- Do not add decoder to public endpoint yet.
- Next task family: **EMS-RD-09-DECODER**.

## Path E: `endpoint_error` / `blocked` / `inconclusive`

- Fix probe chain.
- Do not proceed to sample endpoint.
- Next task family: **EMS-RD-09-PROBEFIX**.
