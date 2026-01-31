1. **Goal**
   - Implement compare mode (A/B + diff outputs) for Earth Map Suite per task requirements while keeping existing tool behavior.

2. **Scope**
   - targets: `tools/earth-map-suite/index.html`, `tools/earth-map-suite/app.js`, `tools/earth-map-suite/style.css`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation beyond the allowed footer links.
   - Do not modify files outside the scope.
   - Do not modify `common-spec/spec-ja.md`.
   - Keep bilingual support intact (JA/EN).
   - No new external dependencies.

4. **Change List**
   - `index.html`: add compare-specific inputs (period A/B), result containers for A/B/Diff cards, summary, and download buttons with clear labels/units.
   - `app.js`: add compare mode logic to validate inputs, generate placeholder precipitation grids for A/B, compute diff, render canvases, generate summaries + CSV, and hook download actions.
   - `style.css`: add styling for compare result cards, grid layout, labels, and download buttons.

5. **Step-by-step Procedure**
   1) Update HTML to include compare inputs and result area placeholders.
   2) Implement JS logic for compare mode data generation, rendering, summary, CSV, and downloads.
   3) Add CSS for compare layout and cards.
   4) Manually verify via example presets.

6. **Test Plan**
   - Open the tool in a browser and try compare example to confirm three result cards, summary, and downloads.
   - Toggle language to confirm labels update.

7. **Rollback Plan**
   - Revert the three modified files to the previous commit using git checkout.
