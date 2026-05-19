# EMS-RD-12 Ready Tasks

Use this ready list once `branch_decision` is known from browser self-check JSON.

## EMS-RD-12-VERIFY
- trigger branch_decision: `browser_result_missing`, `network_unverified`
- objective: obtain verified browser self-check JSON from deployed `api-status.html`
- first 3 tasks:
  1. Run safe check (`health` + `manifest`) on deployed page.
  2. Copy JSON result and paste into `ems-rd-11-browser-self-check-result.json`.
  3. Re-validate JSON and update branch-dependent docs.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure

## EMS-RD-12-ROUTE
- trigger branch_decision: `health_manifest_failed`
- objective: restore reachable Pages Functions routes for health/manifest before probe work
- first 3 tasks:
  1. Verify `_routes` and `functions/earth-map-suite/*` path mappings.
  2. Check Pages build/deploy settings and latest deployment logs.
  3. Re-run deployed safe check and record updated JSON.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure

## EMS-RD-12-PROBE
- trigger branch_decision: `health_manifest_reachable`
- objective: run research probe checks and classify the probe branch
- first 3 tasks:
  1. Run research probes manually from `api-status.html`.
  2. Record probe-related endpoint results in JSON file.
  3. Classify branch for SAMPLE / DECODER / PROBEFIX next.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure

## EMS-RD-12-SAMPLE
- trigger branch_decision: `raw_pixel_read`
- objective: perform validated sampling gates before any UI connection
- first 3 tasks:
  1. Validate unit and scale/offset conversion.
  2. Validate NoData handling and geolocation mapping.
  3. Validate source/license/provenance metadata completeness.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure

## EMS-RD-12-DECODER
- trigger branch_decision: `decoder_strategy_required`
- objective: verify decoder feasibility in isolated endpoint only
- first 3 tasks:
  1. Define decoder strategy candidates and expected outputs.
  2. Test decoder behavior in isolated research endpoint.
  3. Record performance/accuracy limits and go/no-go decision.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure

## EMS-RD-12-PROBEFIX
- trigger branch_decision: `endpoint_error`, `blocked`, `inconclusive`, `probe_checked_without_phase`
- objective: repair probe chain and produce a conclusive branch
- first 3 tasks:
  1. Inspect failing probe endpoint contract and error codes.
  2. Fix route/data/decoder blockers in probe chain order.
  3. Re-run browser probe check and record new branch.
- forbidden actions:
  - public real-data enablement
  - Storm / Compare / Card connection
  - raw pixel as rainfall
  - synthetic fallback inside real result block
  - paid infrastructure
