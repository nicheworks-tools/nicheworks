# EMS-RD-04E: Unit / NoData / Scale Technical Note

Last updated: 2026-05-17

## Decision

Public real precipitation values are **blocked** until unit, NoData, scale, offset, and tile geolocation handling are verified for the selected dataset, band, and source asset.

A raw raster sample is not automatically a precipitation value. It is only an uninterpreted source sample until the full metadata and processing chain below is known, recorded, and validated.

Until these requirements are resolved, any real sampling endpoint may remain **research-only**. Public Storm / Compare / Card / Export / Report output must stay metadata-only or clearly labeled `synthetic_preview` / `unavailable` as appropriate.

## Relationship to the Real Data First plan

This note supports the Earth Map Suite **Real Data First** plan by keeping real-data adapter work isolated until sampling is proven. It does not authorize public UI conversion, endpoint behavior changes, dependency changes, or synthetic fallback disguised as real data.

Real Data First means verified real data first, not raw bytes first. Public precipitation claims require a validated interpretation path from source asset to displayed value.

## Required fields before any public real output

Before any public real precipitation value, chart value, map value, card value, CSV value, PNG value, A/B difference, summary, or ranking is shown, the output record must include or be directly traceable to these fields:

| Field | Requirement |
| --- | --- |
| `dataset_id` | Stable dataset identifier used by the Earth Map Suite adapter or registry. |
| `band` | Exact source band sampled or decoded. If the asset has multiple bands, the selected band must be explicit. |
| `source` | Upstream provider, catalog, item, or asset source used for the sample. |
| `license_status` | License / application / notification status for the dataset and source usage. |
| `retrieved_at` | Timestamp when metadata and/or raster source was retrieved. |
| `unit` | Verified physical unit for the interpreted value, not guessed from product name or UI context. |
| `scale` | Verified multiplier or scale factor. Use `1` only when confirmed, not as a silent default. |
| `offset` | Verified offset/additive correction. Use `0` only when confirmed, not as a silent default. |
| `nodata_value` | Verified NoData / fill / missing value sentinel or mask rule. |
| `valid_min` / `valid_max` | Valid physical range if known from authoritative metadata or product documentation. Mark unknown explicitly if not known. |
| `processing_note` | Human-readable note describing sample interpretation, scale/offset handling, NoData handling, validation status, and any limitations. |

If any required interpretation field is missing or unverified, the value must not be presented publicly as observed precipitation. The response should be treated as research output, metadata-only output, `unavailable`, or synthetic preview depending on the context.

## Raw pixel interpretation requirements

### Raw pixel is not rainfall

A raw pixel read confirms only that a source sample was accessed. It does **not** prove that the number can be displayed as rainfall, precipitation intensity, accumulation, or observed precipitation.

The following checks are mandatory before interpreting a raw sample as a real precipitation value:

1. **Sample format must be interpreted.** The decoder or parser must know the raster sample type, byte order, layout, compression, band organization, and whether the sampled value is integer, float, categorical, packed, masked, or otherwise encoded.
2. **Scale / offset may apply.** The stored sample may need a scale factor and/or offset before it becomes a physical value. Silent defaults are not acceptable unless confirmed by source metadata or documentation.
3. **NoData must be excluded.** NoData, fill values, masks, invalid sentinels, and out-of-range samples must be filtered before statistics, display values, CSV export, PNG encoding, summaries, or comparisons are produced.
4. **Unit must be verified.** The UI and exports must not infer units from variable names alone. Units such as `mm/h`, `mm/day`, accumulated `mm`, or dimensionless encoded samples have different meanings and cannot be interchanged.
5. **Tile geolocation must be verified.** The sample window must be proven to align with the requested bbox / point / date. Coordinate reference system, transform, pixel origin, pixel size, axis order, antimeridian handling, and tile boundaries must be validated before a value is tied to a public location.

### Minimum conversion posture

For a sampled source value `raw`, a public physical value may only be emitted after the following are verified:

```text
if raw is NoData or masked:
  value = unavailable
else:
  value = raw * scale + offset
  unit = verified_unit
```

This formula is illustrative, not a universal implementation guarantee. Some products may require additional decoding, quality flags, temporal aggregation, resampling rules, or product-specific transformations. If those rules are unknown, public real output remains blocked.

## Public UI requirements

Public Earth Map Suite UI must follow these rules until validated sampling is complete:

- Never show a raw pixel value as rainfall.
- Never label unverified values as “observed precipitation”, “real precipitation”, “actual rainfall”, or equivalent public claims.
- If a real fetch, decode, validation, or interpretation step fails, show `unavailable` or a clear metadata-only status instead of silently falling back to synthetic values.
- Keep synthetic preview visually and semantically separate from real-data status.
- Do not merge synthetic preview and real sampled values in one unlabeled chart, map, card, CSV, PNG, summary, or comparison.
- Preserve explicit `data_type` labeling such as `real_observation_sample`, `range_probe_only`, `metadata_only`, `synthetic_preview`, or `unavailable`.
- Public text must communicate that research-only raw samples are not public precipitation observations.

## CSV / PNG export requirements

Any CSV, PNG, image, report, or downloadable artifact that includes precipitation-related output must include or be accompanied by the following metadata:

| Field | Requirement |
| --- | --- |
| `data_type` | Required. Must distinguish verified real samples from metadata-only, synthetic preview, range probe, and unavailable output. |
| `dataset_id` | Required. Must match the dataset used for the value or artifact. |
| `unit` | Required for values. Must be verified before public real values are exported. |
| `processing_note` | Required. Must describe interpretation and validation status. |
| `retrieved_at` | Required. Must indicate when the real source metadata/data was retrieved. |
| `source` / `license` | Required. Must identify source/provider and license or license-status information. |

If the export contains only synthetic preview values, the artifact must say so and must not imply that the numbers are observed precipitation. If the real-data path fails, the export should mark the real value as `unavailable` rather than substituting a synthetic number in the same field.

## Research-only endpoint posture

The real endpoint may remain research-only while unit / NoData / scale / offset / geolocation handling is unresolved. Research responses may expose diagnostic values only when they are labeled as diagnostics and not as public precipitation observations.

Research output should prefer explicit status fields over ambiguous numeric fields. For example:

```json
{
  "data_type": "range_probe_only",
  "dataset_id": "example-dataset",
  "value_status": "not_public_real_output",
  "unit_status": "unverified",
  "scale_status": "unverified",
  "nodata_status": "unverified",
  "geolocation_status": "unverified",
  "processing_note": "Raw access or metadata reachability only; no public precipitation value is authorized."
}
```

The example above is illustrative only and does not define an endpoint contract.

## Public release blocker checklist

Public real precipitation output remains blocked until all items below are complete:

- Dataset, band, source, license status, and retrieval timestamp are recorded.
- Unit is verified from authoritative metadata or documentation.
- Scale and offset are verified from authoritative metadata or documentation.
- NoData / fill / mask handling is verified and applied before statistics or display.
- Valid range is recorded where known, or explicitly marked unknown.
- Tile geolocation is verified for requested bbox / point / date.
- Processing notes explain the interpretation path and limitations.
- Public UI and exports preserve `data_type` and do not hide real-data failures behind synthetic fallback.

Until every relevant checklist item is satisfied, Storm / Compare / Card / Export / Report must not publish numeric values as observed precipitation.
