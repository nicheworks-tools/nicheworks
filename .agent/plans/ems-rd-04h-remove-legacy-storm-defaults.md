# EMS-RD-04H Remove legacy invalid storm defaults

## Scope
- Target: `tools/earth-map-suite/`
- Primary file: `tools/earth-map-suite/app.js`
- Supporting docs/examples only where the required legacy search found stale strings: `tools/earth-map-suite/usage.html`, `tools/earth-map-suite/usage-en.html`, `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`

## Files to touch
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/usage.html`
- `tools/earth-map-suite/usage-en.html`
- `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`
- This plan file

## Steps
1. Inspect Earth Map Suite for legacy storm defaults using the required `rg` query.
2. Identify initial state, example preset, URL restore, and localStorage restore paths.
3. Replace exact legacy default restoration with the verified valid storm example while preserving all other user-entered invalid ranges.
4. Ensure storm example button and setup summary use the valid example.
5. Remove stale legacy strings found in usage/investigation examples so the required search returns no matches.
6. Run syntax and available repository checks.
7. Commit changes and prepare PR notes.

## Manual verification for user
1. Open `/tools/earth-map-suite/`.
2. Confirm initial storm fields show bbox `139.5,35.4,140.0,35.9`, start `2025-08-01`, end `2025-08-03`, preset `low`, frames `24`.
3. Press Run storm and confirm GSMaP metadata reachable, dataset_id, matched_dates for 2025-08-01 through 2025-08-03, asset_count `3`, and sampling_status `metadata_only`.
4. Enter the old 30-day range manually and confirm `limit_exceeded` remains visible.
5. Refresh and confirm old invalid defaults do not return unless explicitly present in the URL.
