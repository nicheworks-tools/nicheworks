# EMS-RD-03A / EMS-RD-04 ExecPlan

## Scope
- RD-03A documentation and endpoint validation recheck:
  - `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`
  - `tools/earth-map-suite/README.md`
  - `functions/api/earth-map-suite/precipitation.js` only if validation bug is confirmed
- RD-04 Storm metadata-only UI connection:
  - `tools/earth-map-suite/index.html`
  - `tools/earth-map-suite/app.js`
  - `tools/earth-map-suite/style.css`
  - `tools/earth-map-suite/usage.html`
  - `tools/earth-map-suite/usage-en.html`
  - `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md` if status notes need updating

## Branching note
The local checkout has no configured remote and no local `main` branch, so the work will start from the current `work` branch state. RD-03A will be committed first, then RD-04 will build on top in a second commit.

## Steps
1. Inspect existing Earth Map Suite docs, UI, analytics helpers, CSV export, and API validation logic.
2. Recheck deployed valid, invalid bbox, and too-large date-range endpoint behavior with `curl`.
3. If the invalid bbox behavior is wrong, fix only the API validation order/behavior required by the task.
4. Update RD-03 documentation and README short status to record human browser verification and validation recheck.
5. Add a storm-mode real metadata status panel that calls `/api/earth-map-suite/precipitation` after validation without connecting raster values.
6. Keep existing synthetic preview, but clearly label it as synthetic and not observed precipitation in JA/EN copy.
7. Update storm CSV export to include metadata status fields without labeling values as real observations.
8. Add analytics event through the existing helper, avoiding raw bbox/lat/lon.
9. Update usage pages to explain metadata-only real endpoint status.
10. Run available checks and manual endpoint/UI smoke tests.

## Manual verification for user
- Open storm mode with bbox `139.5,35.4,140.0,35.9`, dates `2025-08-01` to `2025-08-03`, preset `low` and confirm dataset ID and matched dates appear.
- Open storm mode with an invalid bbox and confirm the metadata panel shows an actionable error while the synthetic preview remains separate.
