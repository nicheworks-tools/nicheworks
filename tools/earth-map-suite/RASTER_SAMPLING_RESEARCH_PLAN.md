# Earth Map Suite raster sampling research plan

Last updated: 2026-05-13

## Current baseline

Earth Map Suite v0.1 is a metadata-only MVP.

Current modes:

- Storm: GSMaP metadata reachability connected; visible replay remains synthetic preview.
- Compare: Period A/B metadata reachability connected; visible A/B/Diff outputs remain synthetic preview.
- Card: point-area metadata reachability connected; visible point values remain synthetic preview.

The existing endpoint is:

```text
/api/earth-map-suite/precipitation
```

It currently returns metadata and asset reachability. It does not sample raster values.

## Purpose of this research phase

The goal is to decide whether real raster/COG sampling can be added safely without breaking the zero-fixed-cost operating requirement.

This research phase must answer:

1. Can Cloudflare Pages Functions read a small COG window reliably?
2. Can this be done with acceptable bundle size and cold-start behavior?
3. Can it be done without paid infrastructure?
4. Can endpoint limits prevent abuse?
5. Can the UI label real sampled values without mixing them with synthetic preview?

## Hard guardrails

Do not change public UI behavior during research.

Do not silently replace synthetic preview values with sampled values.

Do not claim real precipitation maps until values are actually sampled, checked, and labeled.

Do not add paid services or fixed-cost infrastructure.

Do not send raw bbox, lat, or lon to GA4.

Do not remove source, license, attribution, dataset, or sampling status display.

## Candidate approaches

### Approach A: Server-side lightweight COG sampling

Use a small dependency or minimal reader inside Cloudflare Pages Functions to read only the required raster window.

Research checks:

- dependency size
- ESM/CJS compatibility
- Cloudflare runtime compatibility
- request timeout behavior
- memory behavior
- CORS / range request behavior
- ability to fetch only required byte ranges

Risk:

- GeoTIFF/COG libraries may be too heavy for Pages Functions.
- Range request behavior may not work as expected against the upstream asset host.

### Approach B: Metadata-only plus external link-out

Keep current metadata-only behavior and link to source dataset/asset references where possible.

Pros:

- lowest cost
- safest legal/attribution posture
- avoids fake precision

Cons:

- not a real map product
- less useful for end users expecting values

### Approach C: Precomputed tiny sample cache

For a few built-in examples only, store static sample outputs generated offline.

Pros:

- cheap at runtime
- good for demo

Cons:

- not general user input
- must be clearly labeled as example cache
- needs source/date reproducibility notes

## Required proof before implementation

A future raster-sampling PR must prove all of the following before touching public UI labels:

- one valid Tokyo-area example returns numeric sampled values
- output includes units and no-data handling
- sample date aligns with matched STAC item date
- source asset URL is recorded in debug/status output
- endpoint returns visible errors for unsupported ranges
- rate/size limits are enforced
- CSV labels clearly distinguish real sampled values from synthetic preview
- old synthetic preview remains available as fallback only when labeled synthetic

## Proposed endpoint shape for research branch only

Do not expose as final public behavior yet.

```text
/api/earth-map-suite/precipitation-sample?bbox=...&start=...&end=...&preset=low&sample=mean
```

Potential response:

```json
{
  "data_type": "real_observation_sample",
  "status": "ok",
  "dataset_id": "JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily",
  "band": "PRECIP",
  "sampling_status": "sampled_window",
  "unit": "pending verified source unit",
  "matched_dates": ["2025-08-01"],
  "summary": {
    "mean": 0,
    "min": 0,
    "max": 0
  },
  "warnings": [
    "Research endpoint; unit and raster interpretation require verification."
  ]
}
```

## UI requirements if sampling later succeeds

If real sampling becomes available, UI must show three separate layers:

1. Metadata status
2. Real sampled values
3. Synthetic preview

The UI must not replace synthetic preview silently.

Suggested labels:

- Real sampled values
- Metadata status
- Synthetic preview
- Not observed / placeholder where applicable

## Recommended next implementation task

Create a separate proof branch:

```text
research/earth-map-suite-cog-sampling-probe
```

Add only:

- isolated endpoint prototype
- no public UI connection
- debug-only response
- small bbox/date hard limits
- docs describing failure modes

Do not connect Storm / Compare / Card until the research endpoint proves reliable.
