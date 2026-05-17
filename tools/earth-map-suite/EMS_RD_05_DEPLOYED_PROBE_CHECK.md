# EMS-RD-05A deployed probe-status re-check

Check date: 2026-05-17 (UTC)

## Scope

This note re-checks the currently deployed Earth Map Suite research endpoints after the EMS-RD-04A through EMS-RD-04H notes were merged. It records the current branch decision for the Real Data First path based only on the deployed responses available from this verification environment.

No public UI was changed by this check. Storm / Compare / Card remain disconnected from these research endpoints, and public real precipitation values are still not enabled.

## Target deployment base

The deployed URLs checked in this run use the existing production host recorded by the Earth Map Suite EMS-RD-04 deployment note:

```text
https://nicheworks.app
```

## Endpoint results

| Endpoint | Exact endpoint URL | HTTP status if available | data_type | status | sampling_status | sample_status | decision.phase | decision.next | error_code | Usable for next implementation? |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| Probe status | `https://nicheworks.app/api/earth-map-suite/probe-status` | `403 Forbidden` from outbound CONNECT tunnel (`server: envoy`) | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | No. This environment could not verify the deployed branch fields. |
| Precipitation pixel probe | `https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01` | `403 Forbidden` from outbound CONNECT tunnel (`server: envoy`) | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | No. This environment could not verify raw pixel readability or decoder requirements. |
| Precipitation sample real | `https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low` | `403 Forbidden` from outbound CONNECT tunnel (`server: envoy`) | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | Not available: deployed JSON was not reached | No. This environment could not verify the sample contract response. |

## Exact network failure observed

All three deployed checks failed before the deployed origin response body could be inspected. `curl` reported:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```

Because the response failed at the outbound CONNECT tunnel, this run did not retrieve endpoint JSON. The fields `data_type`, `status`, `sampling_status`, `sample_status`, `decision.phase`, `decision.next`, and `error_code` are therefore intentionally recorded as unavailable rather than inferred.

## Current branch decision

Current EMS-RD-05A deployed branch classification: **`network_unverified`**.

Rationale:

- The verification environment had network access in the sense that `curl` attempted outbound HTTPS requests.
- The outbound tunnel returned `403 Forbidden` from `envoy` before the deployed origin JSON was available.
- The deployed endpoint payloads were not inspected, so this check cannot honestly classify the branch as `raw_pixel_read`, `decoder_strategy_required`, `blocked`, `inconclusive`, or `endpoint_error` based on deployed JSON.

## EMS-RD-05 next-step decision

EMS-RD-05 should **not** proceed to validated sampling based on this deployed check alone.

EMS-RD-05 should also **not** start a decoder strategy solely from this run, because this run did not retrieve deployed probe fields proving that a decoder strategy is required.

Recommended path: re-run the exact endpoint checks from an environment that can reach `https://nicheworks.app`, then choose one of the Real Data First branches from the deployed JSON:

- `raw_pixel_read` → proceed toward validated sampling, while still keeping public UI disconnected until unit, scale, NoData, source, and license handling are validated.
- `decoder_strategy_required` → begin decoder strategy research.
- `blocked`, `inconclusive`, or `endpoint_error` → fix or investigate the endpoint state before validated sampling work.

## Public real precipitation status

Public real precipitation values are still **not enabled**. This note does not connect Storm, Compare, Card, or any public UI to real precipitation sampling.

## Commands run

```bash
curl -sS -L -D - --max-time 30 "https://nicheworks.app/api/earth-map-suite/probe-status"
```

```bash
curl -sS -L -D - --max-time 30 "https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01"
```

```bash
curl -sS -L -D - --max-time 30 "https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low"
```
