# EMS-RD-19 Ready Tasks

## 1) EMS-RD-19-VERIFY
- Trigger: `browser_result_missing` / `network_unverified`
- First tasks:
  1. Open `api-status.html?autorun=safe`
  2. Download JSON result
  3. Commit result into intake file
  4. Validate and reclassify

## 2) EMS-RD-19-ROUTE
- Trigger: `health_manifest_failed`
- First tasks:
  1. Inspect Cloudflare Pages Functions routing
  2. Inspect deploy output
  3. Fix self-check/health/manifest reachability

## 3) EMS-RD-19-PROBE
- Trigger: `health_manifest_reachable`
- First tasks:
  1. Run research probes manually
  2. Download/copy JSON
  3. Classify SAMPLE / DECODER / PROBEFIX

## 4) EMS-RD-19-SAMPLE
- Trigger: `raw_pixel_read`
- First tasks:
  1. Verify unit/scale
  2. Verify NoData
  3. Verify geolocation
  4. Verify source/license/provenance

## 5) EMS-RD-19-DECODER
- Trigger: `decoder_strategy_required`
- First tasks:
  1. Choose decoder candidate
  2. Build isolated decoder probe
  3. Record go/no-go note

## 6) EMS-RD-19-PROBEFIX
- Trigger: `endpoint_error` / `blocked` / `inconclusive`
- First tasks:
  1. Inspect failing probe endpoint
  2. Fix canonical error
  3. Rerun browser probe

## Forbidden for all
- public real-data enablement
- Storm / Compare / Card connection
- raw pixel as rainfall
- synthetic fallback inside real result block
- paid infrastructure
