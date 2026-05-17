# EMS-RD-04A probe-status deployment verification

Verification date: 2026-05-17 (UTC)

## Scope

This note records a deployment verification attempt for the current Earth Map Suite research endpoints only. No public Storm / Compare / Card UI is connected to these endpoints by this note, and no public real precipitation values are enabled yet.

## Tested endpoints

| Endpoint | Exact tested URL | HTTP status observed from verification environment | data_type | status | sampling_status | sample_status | decision.phase | decision.next | Result classification |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| Probe status classifier | `https://nicheworks.app/api/earth-map-suite/probe-status` | `403 Forbidden` before origin reachability (`CONNECT tunnel failed`, `server: envoy`) | Not available | Not available | Not available | Not available | Not available | Not available | `inconclusive` |
| Default internal pixel probe target | `https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01` | `403 Forbidden` before origin reachability (`CONNECT tunnel failed`, `server: envoy`) | Not available | Not available | Not available | Not available | Not available | Not available | `inconclusive` |

## Verification details

The verification environment could not reach the deployed origin for either API request. Both `curl` requests failed at the outbound CONNECT tunnel with a `403 Forbidden` response from `envoy`, so the JSON payloads from the deployed endpoints were not available for inspection in this run.

Because the endpoint JSON was unavailable, this verification cannot confirm a `raw_pixel_read` result or a `decoder_strategy_required` result. The current recorded path is therefore the **blocked / inconclusive path** for EMS-RD-04A deployment verification.

## Deployment decision

Current deployment verification result: **blocked / inconclusive path**.

This does **not** validate a sample path. It also does **not** prove that a decoder strategy is required from the deployed response, because the deployed JSON fields (`data_type`, `status`, `sampling_status`, `sample_status`, `decision.phase`, and `decision.next`) were not retrievable from this environment.

## Public UI status

No public real precipitation values are enabled yet. Storm / Compare / Card remain unconnected to these research endpoints for public real sampled precipitation output.

## Commands run

```bash
curl -sS -D - "https://nicheworks.app/api/earth-map-suite/probe-status"
```

Observed result:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```

```bash
curl -sS -D - "https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01"
```

Observed result:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```
