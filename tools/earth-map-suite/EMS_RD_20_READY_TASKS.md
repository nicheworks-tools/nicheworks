# EMS-RD-20 Ready Tasks

## 1. EMS-RD-20-VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- First tasks:
  - open `api-status.html?autorun=safe`
  - download or copy JSON result
  - paste into intake file
  - validate and reclassify

## 2. EMS-RD-20-ROUTE
- Trigger: `health_manifest_failed`
- First tasks:
  - inspect Cloudflare Pages Functions routing
  - inspect deploy output
  - fix self-check/health/manifest reachability

## 3. EMS-RD-20-PROBE
- Trigger: `health_manifest_reachable`
- First tasks:
  - run research probes manually
  - download/copy JSON
  - classify SAMPLE / DECODER / PROBEFIX

## 4. EMS-RD-20-SAMPLE
- Trigger: `raw_pixel_read`
- First tasks:
  - verify unit/scale
  - verify NoData
  - verify geolocation
  - verify source/license/provenance

## 5. EMS-RD-20-DECODER
- Trigger: `decoder_strategy_required`
- First tasks:
  - choose decoder candidate
  - build isolated decoder probe
  - record go/no-go note

## 6. EMS-RD-20-PROBEFIX
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
