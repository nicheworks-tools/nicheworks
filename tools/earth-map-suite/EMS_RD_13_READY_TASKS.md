# EMS-RD-13 Ready Tasks

Last updated: 2026-05-19

## 1) EMS-RD-13-VERIFY

Trigger: `browser_result_missing` / `network_unverified`

First tasks:

- rerun browser self-check
- paste JSON
- validate with script

## 2) EMS-RD-13-ROUTE

Trigger: `health_manifest_failed`

First tasks:

- inspect Pages Functions route
- inspect deploy output
- fix health/manifest reachability

## 3) EMS-RD-13-PROBE

Trigger: `health_manifest_reachable`

First tasks:

- run research probe
- record probe branch
- update result JSON

## 4) EMS-RD-13-SAMPLE

Trigger: `raw_pixel_read`

First tasks:

- validate unit
- validate NoData
- validate geolocation

## 5) EMS-RD-13-DECODER

Trigger: `decoder_strategy_required`

First tasks:

- choose decoder candidate
- isolated decoder endpoint
- performance/accuracy note

## 6) EMS-RD-13-PROBEFIX

Trigger: `endpoint_error` / `blocked` / `inconclusive`

First tasks:

- inspect failing probe
- fix canonical error
- rerun browser probe

## Forbidden for all sections

- public real-data enablement
- Storm / Compare / Card connection
- raw pixel as rainfall
- synthetic fallback inside real result block
- paid infrastructure
