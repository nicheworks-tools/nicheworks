# EMS-RD-05A deployed probe-status re-check

Verification date: 2026-05-17 (UTC)

## Scope

This note re-checks the currently deployed Earth Map Suite research probe endpoints after EMS-RD-04A through EMS-RD-04H were merged. It records only deployed endpoint reachability and the current Real Data First branch decision.

No public UI was changed. Storm / Compare / Card remain disconnected from these research endpoints, and public real precipitation values are still not enabled.

## Target deployed endpoints

Primary deployed host used for this check: `https://nicheworks.app`.

| Endpoint | Exact deployed URL |
| --- | --- |
| Probe status classifier | `https://nicheworks.app/api/earth-map-suite/probe-status` |
| Pixel probe | `https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01` |
| Real sample skeleton | `https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low` |

## Result summary

All three primary deployed checks were blocked before the request reached the NicheWorks deployed origin. The verification environment returned a proxy-level CONNECT failure:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```

Because the origin JSON payloads were not retrievable, the endpoint fields below are recorded as unavailable rather than inferred.

| Endpoint | Endpoint URL | HTTP status if available | data_type | status | sampling_status | sample_status | decision.phase | decision.next | error_code | Usable for next implementation? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Probe status classifier | `https://nicheworks.app/api/earth-map-suite/probe-status` | No endpoint HTTP status available. Environment proxy returned `403 Forbidden` during CONNECT (`server: envoy`). | Not available | Not available | Not available | Not available | Not available | Not available | Not available | No. The deployed branch decision cannot be read from this environment. |
| Pixel probe | `https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01` | No endpoint HTTP status available. Environment proxy returned `403 Forbidden` during CONNECT (`server: envoy`). | Not available | Not available | Not available | Not available | Not available | Not available | Not available | No. Raw pixel-read behavior cannot be confirmed from this environment. |
| Real sample skeleton | `https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low` | No endpoint HTTP status available. Environment proxy returned `403 Forbidden` during CONNECT (`server: envoy`). | Not available | Not available | Not available | Not available | Not available | Not available | Not available | No. Validated sampling readiness cannot be confirmed from this environment. |

## Fallback deployed host check

The same paths were also attempted against the Cloudflare Pages host `https://nicheworks.pages.dev` to distinguish a custom-domain issue from a broader network/proxy issue. Those checks failed with the same proxy-level CONNECT failure before origin reachability:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```

Fallback URLs attempted:

- `https://nicheworks.pages.dev/api/earth-map-suite/probe-status`
- `https://nicheworks.pages.dev/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01`
- `https://nicheworks.pages.dev/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low`

## Branch decision

Current EMS-RD-05A branch classification: **`network_unverified`**.

Rationale:

- The deployed JSON response for `/api/earth-map-suite/probe-status` was not available.
- `decision.phase` and `decision.next` could not be read from the deployed classifier response.
- The pixel probe response could not be inspected, so this check does not prove `raw_pixel_read`.
- The sample skeleton response could not be inspected, so this check does not validate sampling readiness.
- The observed failure is a verification-environment network/proxy failure, not a parsed endpoint payload.

## EMS-RD-05 path recommendation

EMS-RD-05 should **not** proceed to validated sampling based on this run alone. The next step is to re-run the deployed checks from an environment that can reach `nicheworks.app` or `nicheworks.pages.dev` and then choose one of the real endpoint-backed branches:

- Proceed toward validated sampling only if the deployed classifier confirms `decision.phase: "raw_pixel_read"` and the required sample validation work is still explicitly scoped.
- Proceed to decoder strategy only if the deployed classifier confirms `decision.phase: "decoder_strategy_required"` or the deployed payload otherwise shows a compression/layout blocker requiring a decoder decision.
- Treat endpoint or upstream failures as blockers, not as successful sampling.

Public real precipitation values are still **not enabled**. Storm / Compare / Card remain metadata-only / preview-only until a later validated sampling task explicitly changes that status.

## Commands run

```bash
curl -sS -i --max-time 30 "https://nicheworks.app/api/earth-map-suite/probe-status"
```

Observed result:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
content-length: 9
content-type: text/plain
date: Sun, 17 May 2026 14:29:07 GMT
server: envoy
connection: close
```

```bash
curl -sS -i --max-time 30 "https://nicheworks.app/api/earth-map-suite/precipitation-pixel-probe?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01"
```

Observed result:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
content-length: 9
content-type: text/plain
date: Sun, 17 May 2026 14:29:07 GMT
server: envoy
connection: close
```

```bash
curl -sS -i --max-time 30 "https://nicheworks.app/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low"
```

Observed result:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
content-length: 9
content-type: text/plain
date: Sun, 17 May 2026 14:29:08 GMT
server: envoy
connection: close
```
