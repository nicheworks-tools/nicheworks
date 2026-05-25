# ExecPlan: Task 11 Location Card (earth-map-suite)

## Scope
- Target tool: `tools/earth-map-suite/`
- Files:
  - `tools/earth-map-suite/index.html`
  - `tools/earth-map-suite/style.css`
  - `tools/earth-map-suite/app.js`

## Plan
1. Inspect current earth-map-suite UI, data flow, and existing mode handling.
2. Add Location Card mode UI markup and styling for a single-card summary.
3. Implement point time series (precip only for Sprint 1), mini chart rendering, and CSV export.
4. Verify layout responsiveness (mobile) and functionality for inputs/preset/date range.

## Manual verification
- Open the tool in a browser and confirm:
  - Clicking the map or entering lat/lon updates the location card.
  - Selecting a preset updates the start/end fields.
  - The card shows preview, chart, and stats.
  - CSV download produces a time series file.
  - Layout remains readable on mobile widths.
