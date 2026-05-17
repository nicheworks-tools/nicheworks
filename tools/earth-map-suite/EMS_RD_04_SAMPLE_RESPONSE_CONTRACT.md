# EMS-RD-04F sample response contract

Last updated: 2026-05-17 (UTC)

## Purpose

This document defines the exact JSON response contract for future real precipitation sample endpoints before any public UI consumes those endpoints.

The contract is intentionally strict so that Storm, Compare, Card, Export, and Report integrations can later distinguish validated real observations from unavailable, research-only, blocked, metadata-only, and synthetic-preview states without guessing.

## Scope

This is a documentation-only contract for future Earth Map Suite precipitation sample endpoints. It does not implement an endpoint, connect UI, alter public behavior, add dependencies, or authorize real precipitation display.

In scope:

- Success response shape for validated real precipitation sample windows.
- Unavailable response shape for explicit failures or missing data.
- Research-only response shape for probe endpoints that do not sample public real values.
- Blocked response shape for pixel-probe paths blocked by compression, layout, or equivalent decoder constraints.
- Integration rules needed by future Storm / Compare / Card / CSV consumers.

Out of scope:

- Endpoint implementation.
- UI implementation.
- Decoder strategy selection.
- Dataset licensing decisions.
- Synthetic preview generation.

## Non-negotiable rules

- No public UI may consume research-only responses as real precipitation data.
- No endpoint may silently fall back to synthetic values when real observation sampling is unavailable, blocked, invalid, unreachable, or unverified.
- All real observation success responses must include `source`, `license_status`, and `retrieved_at`.
- All CSV exports that include Earth Map Suite precipitation-related values or statuses must include `data_type`.
- Numeric precipitation fields must not be emitted as real observations unless unit, NoData handling, source, license status, retrieval timestamp, and sampling status are explicit.
- Research-only and blocked responses must not contain fields that downstream code can mistake for validated precipitation statistics.

## Shared field requirements

### Required discriminator fields

Every response shape in this contract must include both:

| Field | Type | Requirement |
| --- | --- | --- |
| `data_type` | string | Primary discriminator. Consumers must branch on this before reading precipitation fields. |
| `status` | string | Transport-independent application status. Must not be inferred from HTTP status alone. |

### Timestamp format

`retrieved_at` must be an ISO 8601 UTC timestamp string, for example `2026-05-17T00:00:00Z`.

### Bbox format

`bbox` must be an array of four numbers in this order:

```text
[min_lon, min_lat, max_lon, max_lat]
```

The endpoint must not return sampled values if it cannot prove the sample window corresponds to the requested bbox and date range.

### Date range format

`date_range` must contain ISO 8601 date or datetime strings:

```json
{
  "start": "2026-05-17T00:00:00Z",
  "end": "2026-05-17T01:00:00Z"
}
```

The endpoint must not silently substitute another temporal range without making that fact explicit in `processing_note` or returning an unavailable response.

## 1. Success: real observation sample window

Use this shape only when the endpoint has sampled a real precipitation source and the value interpretation is validated enough for downstream public integration.

### Required JSON shape

```json
{
  "data_type": "real_observation",
  "status": "ok",
  "dataset_id": "example_precip_dataset",
  "band": "PRECIP",
  "source": "Example provider / product name",
  "license_status": "confirmed_for_planned_use",
  "sampling_status": "sampled_window",
  "bbox": [139.0, 35.0, 140.0, 36.0],
  "date_range": {
    "start": "2026-05-17T00:00:00Z",
    "end": "2026-05-17T01:00:00Z"
  },
  "unit": "mm/h",
  "summary": {
    "mean": 1.23,
    "min": 0,
    "max": 4.56,
    "nodata_count": 12,
    "sample_count": 3456
  },
  "retrieved_at": "2026-05-17T01:05:00Z",
  "processing_note": "Sampled validated precipitation window; NoData values excluded from statistics."
}
```

### Field contract

| Field | Type | Required value / rule |
| --- | --- | --- |
| `data_type` | string | Must be exactly `real_observation`. |
| `status` | string | Must be exactly `ok`. |
| `dataset_id` | string | Required. Must identify the actual dataset used. |
| `band` | string | Required. Must be exactly `PRECIP` for this EMS-RD-04 precipitation contract. |
| `source` | string | Required. Must identify provider and product/source. Must not be blank. |
| `license_status` | string | Required. Must describe the license/use status. Must not be blank or omitted. |
| `sampling_status` | string | Must be exactly `sampled_window`. |
| `bbox` | number[4] | Required. Must be `[min_lon, min_lat, max_lon, max_lat]`. |
| `date_range.start` | string | Required ISO 8601 date/datetime string. |
| `date_range.end` | string | Required ISO 8601 date/datetime string. |
| `unit` | string | Required. Must be the verified physical unit of the summary values. |
| `summary.mean` | number | Required numeric mean after excluding NoData. |
| `summary.min` | number | Required numeric minimum after excluding NoData. |
| `summary.max` | number | Required numeric maximum after excluding NoData. |
| `summary.nodata_count` | number | Required non-negative integer count of excluded NoData samples. |
| `summary.sample_count` | number | Required positive integer count of valid sampled pixels used in statistics. |
| `retrieved_at` | string | Required ISO 8601 UTC timestamp for real source retrieval. |
| `processing_note` | string | Required. Must summarize validation, interpretation, NoData, or limitation details. |

### Success invariants

A success response is invalid if any of the following are true:

- `source`, `license_status`, or `retrieved_at` is missing.
- `unit` is guessed, unknown, or inferred only from UI copy.
- `summary` includes NoData, fill, mask, invalid sentinel, or unverified raw encoded values as valid precipitation.
- `sample_count` is `0`.
- `sampling_status` is anything other than `sampled_window`.
- The endpoint substituted synthetic preview values, climatology, mock data, or metadata-derived estimates.
- The endpoint could not verify bbox, date range, band, scale/offset behavior, and NoData handling.

If any invariant cannot be satisfied, the endpoint must return an unavailable, research-only, or blocked response instead of this success shape.

## 2. Unavailable: explicit non-sampling state

Use this shape when real observation sampling cannot produce a validated public value because data is missing, upstream access failed, decoding failed, validation failed, licensing is unresolved, parameters are invalid, or the product is otherwise unavailable.

### Required JSON shape

```json
{
  "data_type": "unavailable",
  "status": "error",
  "error_code": "source_unavailable",
  "message": "Real precipitation sampling is unavailable for the requested dataset, area, or date range.",
  "guidance": "Do not display synthetic values as real observations. Show an unavailable state or metadata-only status."
}
```

### Field contract

| Field | Type | Required value / rule |
| --- | --- | --- |
| `data_type` | string | Must be exactly `unavailable`. |
| `status` | string | Must be exactly `error`. |
| `error_code` | string | Required stable machine-readable code. |
| `message` | string | Required human-readable explanation. |
| `guidance` | string | Required downstream handling instruction. |

### Recommended `error_code` values

The final endpoint may define additional stable codes, but consumers must be able to handle at least these categories:

| `error_code` | Meaning |
| --- | --- |
| `source_unavailable` | Upstream source is missing, unreachable, expired, or unavailable for the request. |
| `dataset_not_supported` | Requested dataset is not enabled for real sampling. |
| `date_range_unavailable` | Requested temporal range is unavailable. |
| `bbox_out_of_range` | Requested bbox is outside the dataset coverage or cannot be safely sampled. |
| `license_unresolved` | Source/license status is not confirmed for planned use. |
| `unit_unverified` | Physical unit cannot be verified. |
| `nodata_unverified` | NoData, fill, mask, or valid-range handling cannot be verified. |
| `decode_failed` | Payload could not be decoded into validated sample values. |
| `validation_failed` | Sample output failed contract or quality validation. |
| `endpoint_error` | Endpoint failed before producing a validated response. |

### Unavailable invariants

- Must not include `summary` with numeric precipitation statistics.
- Must not include synthetic replacement values.
- Must not be interpreted as a successful real observation by public UI.
- May be displayed as an unavailable state, metadata-only status, or internal diagnostic according to the consuming feature.

## 3. Research-only: probe response without public sampling

Use this shape for research/probe endpoints that confirm reachability, metadata, byte layout, ranges, or branch decisions but do not produce validated public precipitation samples.

### Required JSON shape

```json
{
  "data_type": "real_observation_range_probe",
  "status": "ok",
  "sampling_status": "range_probe_only",
  "sample_status": "not_sampled"
}
```

### Field contract

| Field | Type | Required value / rule |
| --- | --- | --- |
| `data_type` | string | Must match `real_observation_*_probe`, such as `real_observation_range_probe`, `real_observation_metadata_probe`, or `real_observation_pixel_probe`. |
| `status` | string | Must be exactly `ok`. |
| `sampling_status` | string | Must end with `_probe_only`, such as `range_probe_only`, `metadata_probe_only`, or `pixel_probe_only`. |
| `sample_status` | string | Must be exactly `not_sampled`. |

### Research-only invariants

- Public Storm / Compare / Card UI must not consume this shape as real precipitation data.
- Public CSV exports must not put research-only probe values in real observation columns.
- Research-only responses must not include `summary.mean`, `summary.min`, `summary.max`, or any equivalent numeric precipitation statistics.
- Research-only responses may include diagnostic metadata in future extensions only if those fields are clearly labeled diagnostics and cannot be mistaken for validated precipitation values.
- Research-only success means the probe completed; it does not mean precipitation was sampled.

## 4. Blocked: pixel probe blocked by compression or layout

Use this shape when a pixel-probe path reaches a hard blocker such as unsupported compression, tiled layout ambiguity, byte-order ambiguity, COG/TIFF structure uncertainty, or another decoder/layout issue that prevents safe sampling.

### Required JSON shape

```json
{
  "data_type": "real_observation_pixel_probe",
  "status": "blocked",
  "block_reason": "blocked_by_compression_or_layout"
}
```

### Field contract

| Field | Type | Required value / rule |
| --- | --- | --- |
| `data_type` | string | Must be exactly `real_observation_pixel_probe`. |
| `status` | string | Must be exactly `blocked`. |
| `block_reason` | string | Must be exactly `blocked_by_compression_or_layout` for this blocked shape. |

### Blocked invariants

- Must not include `summary` with numeric precipitation statistics.
- Must not include guessed raw pixel values as public precipitation.
- Must not trigger synthetic fallback in the endpoint or consuming UI.
- Must keep the blocked state visible to downstream code and research notes.
- Must be treated as a stop condition for public real-data integration until a separate decoder/layout decision resolves the blocker.

## Consumer integration requirements

Future Storm, Compare, Card, Export, and Report integrations must follow this decision order:

1. Read `data_type`.
2. Read `status`.
3. If `data_type === "real_observation"` and `status === "ok"`, require every success field before consuming `summary`.
4. If `data_type === "unavailable"`, show unavailable or metadata-only state; do not substitute synthetic values into real fields.
5. If `data_type` matches `real_observation_*_probe`, treat it as research-only unless a future contract explicitly promotes a different shape.
6. If `status === "blocked"`, show or log a blocked state; do not attempt public real precipitation display.
7. If the response shape is unknown, malformed, or missing `data_type`, treat it as unavailable/invalid rather than real data.

## CSV export requirements

All CSV exports that include Earth Map Suite precipitation-related values, statuses, comparisons, or diagnostics must include `data_type` for every row.

Minimum CSV behavior:

| Response shape | Required CSV treatment |
| --- | --- |
| `real_observation` success | Include `data_type=real_observation`, `dataset_id`, `band`, `source`, `license_status`, `unit`, `retrieved_at`, `sampling_status`, and relevant summary fields. |
| `unavailable` | Include `data_type=unavailable`, `status=error`, `error_code`, `message`, and `guidance`; leave real precipitation numeric fields blank. |
| `real_observation_*_probe` | Include the research `data_type`, `sampling_status`, and `sample_status=not_sampled`; do not export probe diagnostics as real precipitation values. |
| `blocked` pixel probe | Include `data_type=real_observation_pixel_probe`, `status=blocked`, and `block_reason`; leave real precipitation numeric fields blank. |

## Synthetic fallback prohibition

Real sample endpoints and their consumers must not silently fall back to synthetic values.

Forbidden behavior:

- Returning `status: "ok"` with synthetic values when upstream real data fails.
- Filling `summary.mean`, `summary.min`, or `summary.max` from preview/mock/synthetic data.
- Exporting synthetic values in columns labeled as real observations.
- Hiding `unavailable`, `research-only`, or `blocked` states behind a normal-looking real-data card, chart, map, comparison, CSV, or report.

Allowed behavior:

- Showing a clearly labeled synthetic preview in separate UI or export fields.
- Showing an unavailable, metadata-only, research-only, or blocked status.
- Keeping diagnostic probe details in internal/research contexts when they are clearly marked as not sampled and not public real observations.

## Public UI gate

A public UI integration may consume a response as real precipitation only when all of the following are true:

- `data_type` is exactly `real_observation`.
- `status` is exactly `ok`.
- `sampling_status` is exactly `sampled_window`.
- `band` is exactly `PRECIP`.
- `summary.mean`, `summary.min`, `summary.max`, `summary.nodata_count`, and `summary.sample_count` are present and valid.
- `unit`, `source`, `license_status`, `retrieved_at`, and `processing_note` are present and non-empty.
- NoData, unit, scale/offset, bbox, date range, and source retrieval validation have completed.

Any other response must remain unavailable, metadata-only, research-only, or blocked in public UI.
