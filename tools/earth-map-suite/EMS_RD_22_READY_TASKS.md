# EMS-RD-22 Ready Tasks

## 1) EMS-RD-22-VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- First tasks:
  - open `/api/earth-map-suite/safe-result`
  - copy JSON result
  - validate and sync canonical result

## 2) EMS-RD-22-ROUTE
- Trigger: `health_manifest_failed`
- First tasks:
  - inspect Cloudflare Pages Functions routing
  - inspect deploy output
  - fix self-check/health/manifest/safe-result reachability

## 3) EMS-RD-22-PROBE
- Trigger: `health_manifest_reachable`
- First tasks:
  - run research probes manually from api-status
  - download/copy JSON
  - classify SAMPLE / DECODER / PROBEFIX

## 4) EMS-RD-22-SAMPLE
- Trigger: `raw_pixel_read`
- First tasks:
  - verify unit/scale
  - verify NoData
  - verify geolocation
  - verify source/license/provenance

## 5) EMS-RD-22-DECODER
- Trigger: `decoder_strategy_required`
- First tasks:
  - choose decoder candidate
  - build isolated decoder probe
  - record go/no-go note

## 6) EMS-RD-22-PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive`
- First tasks:
  - inspect failing probe endpoint
  - fix canonical error
  - rerun browser probe

## Forbidden for all
- public real-data enablement
- Storm / Compare / Card connection
- raw pixel as rainfall
- synthetic fallback inside real result block
- paid infrastructure
