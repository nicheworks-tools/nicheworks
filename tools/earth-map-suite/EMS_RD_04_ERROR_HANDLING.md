# EMS-RD-04G Error Handling / No Synthetic Fallback

Status: shared rule for Earth Map Suite research endpoints and future real-data integrations.

## Scope

This document applies to Earth Map Suite real-data research endpoints under:

- `functions/api/earth-map-suite/`

It also applies to future real integrations before any Storm, Compare, Card, or public UI wiring is added.

## Required error codes

Real-data endpoints and research probes must use these canonical error codes when the matching condition occurs:

| Error code | Required use |
| --- | --- |
| `missing_or_invalid_params` | Required query parameters are missing, unsupported, malformed, out of order, or otherwise invalid. |
| `limit_exceeded` | The request is syntactically valid but exceeds the endpoint's allowed date range, bbox span, preset, or cost-control limit. |
| `upstream_fail` | A required upstream metadata/source request fails before a more specific local parse/range error can be identified. |
| `asset_missing` | Upstream metadata is reachable, but the required dataset item or PRECIP asset cannot be found for the request. |
| `range_failed` | A required HTTP Range request for a TIFF header, IFD, tile, strip, or other byte window fails. |
| `tiff_parse_failed` | Fetched bytes cannot be parsed as the expected supported TIFF/COG header or IFD structure. |
| `tile_tags_missing` | Required tile/strip offset and byte-count tags are missing or unusable. |
| `blocked_by_compression_or_layout` | A reachable asset uses compression, predictor, samples, bit depth, or layout that is unsafe for the current no-dependency probe path. |
| `validated_sampling_not_ready` | The request targets a future validated real-sampling contract, but decoder/projection/unit/nodata/aggregation/license validation is not complete. |

Endpoints may still use endpoint-specific operational codes such as `method_not_allowed` or `timeout`, but public real-data failure branches should prefer the canonical codes above whenever one applies.

## Response behavior

### Real-data failure must fail explicitly

If a real endpoint or real-data probe cannot retrieve, parse, validate, or safely sample the requested real data, it must return an unavailable/error response:

- `data_type: "unavailable"`
- `status: "error"`
- a non-empty `error_code`
- a short human-readable `message`
- `guidance` that keeps Storm, Compare, Card, and public UI disconnected or in metadata/placeholder mode until the issue is resolved

A failure path must not return `status: "ok"` merely because the endpoint itself executed successfully.

### Probe success is not sampled real data

Research probes may return `status: "ok"` only when the requested probe action itself succeeded, such as locating metadata, reading a TIFF header, reading IFD tags, or fetching a tile range. Such responses must keep sampled precipitation values empty or explicitly unvalidated unless a separate validated sampling plan has been completed.

Probe responses must use wording such as:

- `sampling_status: "metadata_only"`
- `sampling_status: "tiff_header_probe_only"`
- `sampling_status: "ifd_tag_probe_only"`
- `sampling_status: "tile_range_probe_only"`
- `sampling_status: "raw_pixel_probe_only"`
- `sample_status: "not_sampled"` or `sample_status: "single_raw_pixel"`

Raw pixels, headers, metadata, IFD tags, or byte-range probes are not public real precipitation summaries.

### No automatic real-to-synthetic fallback

A real endpoint must never hide a real-data failure by returning synthetic output in the same response shape or output slot.

Required behavior:

- Real endpoint failure returns unavailable/error.
- Synthetic preview may be shown only in clearly separate preview blocks.
- There must be no automatic fallback from real to synthetic in the same output.
- Public UI must show “real data unavailable” when real fetch, parse, validation, or sampling fails.

Synthetic previews are allowed only when clearly labeled as non-real previews and kept separate from real observation outputs. They must not be mixed into `real_observation_*` payloads, summary statistics, map layers, exports, or cards.

## Public UI rule

Do not connect these research endpoints directly to Storm, Compare, Card, `app.js`, or public UI without a separate validation plan. When a future public real integration receives an unavailable/error response from a real endpoint, the UI must surface “real data unavailable” and must not silently substitute synthetic precipitation values.
