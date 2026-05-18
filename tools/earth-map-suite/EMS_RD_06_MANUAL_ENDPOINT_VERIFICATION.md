# EMS-RD-06 Manual Endpoint Verification Runbook

Last updated: 2026-05-18

## Purpose

Run manual verification outside Codex restricted network to confirm whether `/api/earth-map-suite/*` is deployed and routed.

> Public real precipitation values are **not enabled**. Do not connect Storm / Compare / Card to real output during this phase.

## Target URLs

### Health

- https://nicheworks.app/api/earth-map-suite/health
- https://nicheworks.pages.dev/api/earth-map-suite/health

### Manifest

- https://nicheworks.app/api/earth-map-suite/manifest
- https://nicheworks.pages.dev/api/earth-map-suite/manifest

### Probe status

- https://nicheworks.app/api/earth-map-suite/probe-status
- https://nicheworks.pages.dev/api/earth-map-suite/probe-status

### Safe unavailable check (`precipitation-sample-real`)

- https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low
- https://nicheworks.pages.dev/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low

## Expected responses

## 1) Health expected shape

- HTTP: `200` for GET
- `data_type`: `earth_map_suite_api_health`
- `status`: `ok`
- `api_namespace`: `/api/earth-map-suite`
- `deployed_function`: `health`
- `public_real_data_enabled`: `false`
- `storm_compare_card_connected`: `false`
- `checked_at`: ISO timestamp

## 2) Manifest expected shape

- HTTP: `200`
- `data_type`: `earth_map_suite_api_manifest`
- `status`: `ok`
- `public_real_data_enabled`: `false`
- `storm_compare_card_connected`: `false`
- `endpoints`: includes health/probe/precipitation-related paths
- `generated_at`: ISO timestamp

## 3) Probe-status expected shape

- `data_type`: `earth_map_suite_probe_status`
- `status`: `ok`
- `decision.phase`: one of branch states (e.g. `endpoint_error`, `raw_pixel_read`, `decoder_strategy_required`, etc.)
- `pixel_probe_summary`: included

## 4) precipitation-sample-real expected safe response

Current expected mode is still safe blocked/unavailable for public real output.

Expected characteristics:

- `status`: `error` (or non-public-ready blocked shape)
- `data_type`: `unavailable` (current contract)
- `public_ui_allowed`: `false`
- indicates validation/readiness blocker (unit/scale/NoData/geolocation/license/probe branch)
- must not return validated public real observation output

## Classification rules

Use these labels in your record:

- `route_missing`
  - 404/route-level not found for health/manifest/probe namespace.
- `functions_not_deployed`
  - static site is up but function namespace consistently unavailable (e.g. 500/404 patterns indicating missing function bundle).
- `health_ok_probe_error`
  - health works, but probe-status fails.
- `probe_status_raw_pixel_read`
  - probe-status `decision.phase` is `raw_pixel_read`.
- `probe_status_decoder_strategy_required`
  - probe-status `decision.phase` is `decoder_strategy_required`.
- `network_unverified`
  - request not possible from tester environment.

## Fields to copy back into project log

For each checked endpoint, record:

- HTTP status
- `data_type`
- `status`
- `decision.phase` (if present)
- `error_code` (if present)
- `public_ui_allowed` (if present)
- `retrieved_at` / `checked_at` / `generated_at` timestamp fields

## Suggested command examples

```bash
curl -i https://nicheworks.app/api/earth-map-suite/health
curl -i https://nicheworks.app/api/earth-map-suite/manifest
curl -i https://nicheworks.app/api/earth-map-suite/probe-status
curl -i "https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low"
```

Repeat for `https://nicheworks.pages.dev`.

## Branch decision after verification

- If `health` + `manifest` reachable and probe branch recorded, continue EMS-RD-06 branch decision.
- If routes are missing, resolve Cloudflare Pages deploy config before any Storm/Compare/Card real connection work.
- Do not connect Storm/Compare/Card to `precipitation-sample-real` until validated real observation output is explicitly approved.
