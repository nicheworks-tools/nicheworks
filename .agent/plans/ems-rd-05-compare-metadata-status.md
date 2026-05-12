# EMS-RD-05 Compare metadata-only status ExecPlan

## Scope
- `tools/earth-map-suite/index.html`
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/style.css`
- `tools/earth-map-suite/usage.html`
- `tools/earth-map-suite/usage-en.html`
- `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md` if status notes need updating

No endpoint limit changes, raster sampling, card metadata connection, or unrelated SEO fixes.

## Steps
1. Inspect existing compare/storm metadata code and mode switching behavior.
2. Add compare-only validation and metadata-only A/B endpoint fetches while preserving synthetic preview rendering.
3. Add a separate compare metadata status panel and styling.
4. Update compare example defaults, CSV metadata fields, and usage/status copy.
5. Run syntax/SEO checks and targeted local metadata URL checks where possible.

## Manual verification
- Open `/tools/earth-map-suite/`, switch to Compare, click compare example, run compare.
- Confirm A/B metadata status shows reachable with dataset/matched dates/asset count/sampling status.
- Confirm synthetic compare cards/maps remain explicitly synthetic preview.
- Confirm storm/card panels remain hidden in compare mode.
- Test invalid Period B range over endpoint limit and confirm Period A can remain independent while Period B shows `limit_exceeded`.
