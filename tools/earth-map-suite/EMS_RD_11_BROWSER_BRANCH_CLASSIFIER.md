# EMS-RD-11 Browser Self-Check Branch Classifier

This document maps each `branch_decision` from `ems-rd-11-browser-self-check-result.json` to exactly one EMS-RD-12 task family.

| branch_decision | Next task family | Required next work |
|---|---|---|
| `browser_result_missing` | EMS-RD-12-VERIFY | Run deployed browser self-check and record JSON; do not proceed to sampling. |
| `health_manifest_failed` | EMS-RD-12-ROUTE | Fix Pages Functions route/deployment and confirm health/manifest first; do not run probe chain. |
| `health_manifest_reachable` | EMS-RD-12-PROBE | Run research probe from browser self-check and record probe branch; do not connect public UI. |
| `raw_pixel_read` | EMS-RD-12-SAMPLE | Start validated sample validation (unit/scale/NoData/geolocation/source/license); do not connect Storm/Compare/Card. |
| `decoder_strategy_required` | EMS-RD-12-DECODER | Test decoder in isolated endpoint; do not add decoder to public endpoint yet. |
| `endpoint_error` | EMS-RD-12-PROBEFIX | Fix probe chain first, then rerun probe checks. |
| `blocked` | EMS-RD-12-PROBEFIX | Fix probe chain first, then rerun probe checks. |
| `inconclusive` | EMS-RD-12-PROBEFIX | Fix probe chain first, then rerun probe checks. |
| `probe_checked_without_phase` | EMS-RD-12-PROBEFIX | Fix probe branch reporting and rerun probe checks. |
| `network_unverified` | EMS-RD-12-VERIFY | Continue verification and do not infer branch without browser result evidence. |

## Guardrail

Storm real remains blocked. Public real precipitation must remain disabled until full validation/unlock gates are approved.
