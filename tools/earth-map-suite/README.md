# Earth Map Suite

Earth Map Suite is a static tool scaffold for organizing map view requirements and generating a shareable preview memo.

## Files

- `index.html`: Main tool UI (JP/EN toggle, input panel, preview output).
- `usage.html`: Japanese usage guide.
- `usage-en.html`: English usage guide.
- `style.css`: Shared styling for the tool and usage pages.
- `app.js`: Placeholder logic for example input and preview generation.

## Notes

- This tool runs entirely in the browser.
- It follows the NicheWorks common spec for ads, donation block, and footer.

## Real data endpoint status

- `/api/earth-map-suite/precipitation` is a JSON-only GSMaP daily precipitation metadata sampler for RD-02.
- It validates `bbox`, `start`, `end`, and `preset`, fetches JAXA/EORC GSMaP STAC collection/item metadata, and discovers `PRECIP` COG assets when upstream data is reachable.
- Raster values are not sampled yet; successful responses use `sampling_status: "metadata_only"` with null summary statistics.
- Storm mode is connected to the endpoint as a metadata-only status panel, while the visible storm replay remains a synthetic preview; compare/card are still placeholder/synthetic and are not connected.
- RD-03 production metadata reachability is verified by a human browser test for the small Tokyo-area bbox/date example: the endpoint returned `data_type: "real_observation_metadata"`, `status: "ok"`, dataset `JAXA.EORC_GSMaP_standard.Gauge.00Z-23Z.v6_daily`, `asset_count: 3`, matched dates `2025-08-01` through `2025-08-03`, and `sampling_status: "metadata_only"`. This Codex environment is still blocked by an outbound proxy before reaching Cloudflare, so agent-side deployed rechecks remain an environment limitation.

## Commercial Use Notice (JAXA)

Before enabling donations, ads, or paid features tied to JAXA/EORC data, contact JAXA to confirm commercial use requirements and permissions.
