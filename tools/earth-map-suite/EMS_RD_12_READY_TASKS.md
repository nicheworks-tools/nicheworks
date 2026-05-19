# EMS-RD-12 Ready Tasks

## EMS-RD-12-VERIFY
- trigger branch_decision: `browser_result_missing` / `network_unverified`
- objective: obtain an authoritative browser self-check JSON result.
- first 3 tasks:
  1. Open deployed `api-status.html` and run safe check.
  2. Copy JSON result and save into `ems-rd-11-browser-self-check-result.json`.
  3. If safe checks pass, run research probes manually and update result JSON.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.

## EMS-RD-12-ROUTE
- trigger branch_decision: `health_manifest_failed`
- objective: restore Pages Functions route/deployment so health/manifest are reachable.
- first 3 tasks:
  1. Audit `_routes` and `functions` directory mapping.
  2. Verify Pages build/deploy configuration and output paths.
  3. Redeploy and rerun safe check on deployed `api-status.html`.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.

## EMS-RD-12-PROBE
- trigger branch_decision: `health_manifest_reachable`
- objective: capture and classify probe branch from browser self-check.
- first 3 tasks:
  1. Run research probes from `api-status.html` (manual only).
  2. Record probe endpoint fields and resulting `branch_decision`.
  3. Update EMS-RD-11 result note and branch-dependent plan docs.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.

## EMS-RD-12-SAMPLE
- trigger branch_decision: `raw_pixel_read`
- objective: validate real sampling contract before any UI connection.
- first 3 tasks:
  1. Validate unit and scale/offset semantics.
  2. Validate NoData handling and geolocation alignment.
  3. Validate source/license/provenance fields and audit trail.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.

## EMS-RD-12-DECODER
- trigger branch_decision: `decoder_strategy_required`
- objective: assess decoder feasibility in an isolated endpoint.
- first 3 tasks:
  1. Define isolated decoder test contract and fixture cases.
  2. Run decoder feasibility checks without changing public endpoint behavior.
  3. Record pass/fail criteria for decoder promotion gate.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.

## EMS-RD-12-PROBEFIX
- trigger branch_decision: `endpoint_error` / `blocked` / `inconclusive` / `probe_checked_without_phase`
- objective: fix probe chain reliability and branch reporting.
- first 3 tasks:
  1. Inspect failing probe endpoint responses and error codes.
  2. Fix probe chain data/decision propagation.
  3. Rerun browser probe check and reclassify branch.
- forbidden actions: no public real-data enablement; no Storm/Compare/Card connection; no raw pixel as rainfall; no synthetic fallback inside real result block; no paid infrastructure.
