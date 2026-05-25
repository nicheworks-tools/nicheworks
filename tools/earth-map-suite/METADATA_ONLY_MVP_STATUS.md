# Earth Map Suite metadata-only MVP status

Last updated: 2026-05-12

## Current release status

Earth Map Suite now has a working metadata-only real-data layer for the first three core modes:

- Storm
- Compare
- Card

These modes call the existing precipitation endpoint:

```text
/api/earth-map-suite/precipitation
```

The endpoint checks GSMaP STAC/COG metadata reachability and returns metadata fields such as dataset, source, license, matched dates, item count, asset count, and sampling status.

## Dataset currently used for metadata reachability

```text
dataset_id: JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily
band: PRECIP
source: JAXA Earth API / EORC GSMaP STAC COG
sampling_status: metadata_only
```

## What is real in the current UI

The following are real metadata reachability checks:

- Storm metadata status
- Compare Period A metadata status
- Compare Period B metadata status
- Card point-area metadata status

These statuses indicate whether relevant GSMaP metadata/assets are reachable for the requested bbox/date/preset.

## What is still synthetic preview

The following visible outputs remain synthetic preview only:

- Storm replay map/canvas
- Storm cumulative frame
- Compare Period A map
- Compare Period B map
- Compare A/B/Diff map
- Compare summary numeric values
- Card point map
- Card mini chart
- Card summary numeric values
- CSV grid/point/frame values

The current UI must not describe these synthetic values as observed precipitation, real rainfall, real point time-series, or real A/B difference.

## Current mode status

| Mode | Metadata endpoint | Raster values | Visible preview |
|---|---:|---:|---|
| Storm | connected | not sampled | synthetic preview |
| Compare | connected for A/B | not sampled | synthetic preview |
| Card | connected via point bbox | not sampled | synthetic preview |

## Current endpoint limits

The public metadata endpoint is intentionally limited for low-cost operation:

- `preset=low`: up to 14 days
- `preset=mid`: up to 7 days
- large bbox/date ranges return visible errors

The UI must keep those errors visible and must not silently shorten user-entered ranges.

## Verified examples

### Storm

```text
bbox=139.5,35.4,140.0,35.9
start=2025-08-01
end=2025-08-03
preset=low
```

Expected metadata:

```text
matched_dates=2025-08-01,2025-08-02,2025-08-03
sampling_status=metadata_only
```

### Compare

```text
bbox=139.5,35.4,140.0,35.9
Period A=2025-08-01 to 2025-08-03
Period B=2025-08-04 to 2025-08-06
preset=low
```

Expected metadata:

```text
Period A matched_dates=2025-08-01,2025-08-02,2025-08-03
Period B matched_dates=2025-08-04,2025-08-05,2025-08-06
sampling_status=metadata_only
```

### Card

```text
lat=35.68
lon=139.76
start=2025-08-01
end=2025-08-03
preset=low
metadata_bbox≈139.51,35.43,140.01,35.93
```

Expected metadata:

```text
matched_dates=2025-08-01,2025-08-02,2025-08-03
sampling_status=metadata_only
```

## Guardrails for future work

Do not do any of the following without a separate explicit task:

- Claim the synthetic canvases are real precipitation maps
- Add real raster/COG sampling silently
- Rename metadata-only status to observed values
- Remove source/license/dataset display
- Hide endpoint errors behind synthetic fallback
- Send raw bbox/lat/lon to GA4
- Add checkout/payment buttons
- Remove donation/support blocks

## Next implementation phases

The next Earth Map Suite work should proceed in this order:

1. Report mode: one-page report using existing metadata status + synthetic preview blocks.
2. Export mode: synthetic PNG/CSV packaging with metadata status fields.
3. Dataset picker: registry/status UI for available vs candidate datasets.
4. Codegen: generate safe metadata-endpoint example code only; do not generate unverified raster sampling code.
5. Raster sampling research: separate branch, dependency/cost review required.

## Release classification

Current classification:

```text
Earth Map Suite v0.1 metadata-only MVP
```

This is not yet a real precipitation map product. It is a metadata reachability and synthetic preview tool.
