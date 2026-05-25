# Earth Map Suite

Earth Map Suite is a NicheWorks tool for checking Earth-observation metadata reachability and creating clearly labeled synthetic preview outputs for map-view workflows.

## Current status

Current release classification:

```text
Earth Map Suite v0.1 metadata-only MVP
```

Storm, Compare, and Card modes can call the GSMaP metadata endpoint and display real metadata reachability. The visible maps/charts/cards remain synthetic previews and are not observed precipitation.

For the detailed release state, see:

- `METADATA_ONLY_MVP_STATUS.md`
- `REAL_DATA_INVESTIGATION.md`

## Files

- `index.html`: Main tool UI (JP/EN toggle, mode-scoped inputs, metadata status panels, synthetic previews).
- `usage.html`: Japanese usage guide.
- `usage-en.html`: English usage guide.
- `style.css`: Shared styling for the tool and usage pages.
- `app.js`: Mode logic, synthetic preview generation, and metadata-only status rendering.
- `REAL_DATA_INVESTIGATION.md`: investigation notes for the JAXA/EORC GSMaP metadata path.
- `METADATA_ONLY_MVP_STATUS.md`: current v0.1 release status and future guardrails.

## Real data endpoint status

- `/api/earth-map-suite/precipitation` is a JSON-only GSMaP daily precipitation metadata sampler.
- It validates `bbox`, `start`, `end`, and `preset`, fetches JAXA/EORC GSMaP STAC collection/item metadata, and discovers `PRECIP` COG assets when upstream data is reachable.
- Raster values are not sampled yet; successful responses use `sampling_status: "metadata_only"` with null summary statistics.
- Storm mode is connected to the endpoint as a metadata-only status panel.
- Compare mode is connected to the endpoint as metadata-only Period A / Period B status panels.
- Card mode is connected to the endpoint as a metadata-only point-area status panel.
- Storm replay, Compare A/B/Diff, Card mini chart, Card summary, and CSV numeric values remain synthetic preview outputs.

## Verified metadata examples

### Storm

```text
bbox=139.5,35.4,140.0,35.9
start=2025-08-01
end=2025-08-03
preset=low
```

### Compare

```text
bbox=139.5,35.4,140.0,35.9
Period A=2025-08-01 to 2025-08-03
Period B=2025-08-04 to 2025-08-06
preset=low
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

## Notes

- This tool is no longer purely browser-only because metadata status checks call `/api/earth-map-suite/precipitation`.
- Raw bbox/lat/lon should not be sent to GA4.
- It follows the NicheWorks common spec for ads, donation block, and footer.
- Endpoint errors must remain visible and must not be silently replaced with fake real data.

## Commercial Use Notice (JAXA)

Before treating this as a real-data product or expanding beyond metadata reachability, confirm JAXA/EORC data usage requirements, attribution, and commercial-use conditions. Donations and ads are site-level support mechanisms; do not present synthetic previews as JAXA-derived observed values.
