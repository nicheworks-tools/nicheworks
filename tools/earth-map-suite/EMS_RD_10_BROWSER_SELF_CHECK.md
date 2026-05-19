# EMS-RD-10 browser self-check

## Purpose

EMS-RD-09 remained `network_unverified` because hosted environments could not reach GitHub/API endpoints due to CONNECT tunnel restrictions.

This phase improves `tools/earth-map-suite/api-status.html` so a human can open the public page in a normal browser, run safe route checks, optionally run research probes, and copy a JSON result back into the project.

## Updated page

`/tools/earth-map-suite/api-status.html`

## Safe check

The safe check fetches only:

- `/api/earth-map-suite/health`
- `/api/earth-map-suite/manifest`

Expected branch decision:

- `health_manifest_reachable` if both endpoints return HTTP OK
- `health_manifest_failed` otherwise

## Research probe check

The research probe check fetches:

- `/api/earth-map-suite/health`
- `/api/earth-map-suite/manifest`
- `/api/earth-map-suite/probe-status`
- `/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low`

Possible branch decisions include:

- `raw_pixel_read`
- `decoder_strategy_required`
- `endpoint_error`
- `blocked`
- `inconclusive`
- `probe_checked_without_phase`
- `health_manifest_failed`

## Guardrails

- This page does not approve public real precipitation output.
- `public_real_data_enabled` remains `false`.
- `storm_compare_card_connected` remains `false`.
- Storm / Compare / Card remain blocked.
- Raw/debug pixel output must not be shown as rainfall.
- Synthetic fallback must not hide real endpoint failures.

## Next step

Open the page on the deployed site, run the safe check first, then copy the JSON result. Run the research probe only after health and manifest are reachable.
