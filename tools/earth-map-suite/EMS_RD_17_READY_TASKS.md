# EMS-RD-17 Ready Tasks

## 1) EMS-RD-17-VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- First tasks:
  - rerun browser safe check
  - paste JSON
  - validate and reclassify

## 2) EMS-RD-17-ROUTE
- Trigger: `health_manifest_failed`
- First tasks:
  - inspect Cloudflare Pages Functions routing
  - inspect deploy output
  - fix self-check/health/manifest reachability

## 3) EMS-RD-17-PROBE
- Trigger: `health_manifest_reachable`
- First tasks:
  - run research probes
  - record probe result
  - classify SAMPLE / DECODER / PROBEFIX

## 4) EMS-RD-17-SAMPLE
- Trigger: `raw_pixel_read`
- First tasks:
  - verify unit/scale
  - verify NoData
  - verify geolocation

## 5) EMS-RD-17-DECODER
- Trigger: `decoder_strategy_required`
- First tasks:
  - choose decoder candidate
  - build isolated decoder probe
  - record go/no-go note

## 6) EMS-RD-17-PROBEFIX
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
