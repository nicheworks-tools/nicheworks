1. **Goal**
   - Implement Auto extraction in `tools/pdf2csv-local/` to infer table rows/columns from pdf.js text coordinates, with settings UI and state for preview.

2. **Scope**
   - targets: `tools/pdf2csv-local/index.html`, `tools/pdf2csv-local/style.css`, `tools/pdf2csv-local/app.js`
   - excluded: everything else

3. **Rules / Prohibitions**
   - Do not edit files outside `tools/pdf2csv-local/`.
   - No new external dependencies.
   - Follow existing bilingual scheme and common spec layout.

4. **Plan**
   1) Review current `app.js` state and existing UI hooks.
   2) Add settings UI for mode, row tolerance, column gap threshold, and header toggle in `index.html` with styling in `style.css`.
   3) Implement Auto extraction in `app.js` using pdf.js textContent items: group by y (rowTolerance), split by x gaps (colGapThreshold), normalize text, and store `rows[][]` in state for preview.
   4) Add weak extraction warning and state pass-through for preview.

5. **Test Plan**
   - Manual: Load a PDF, adjust rowTolerance/colGapThreshold, run Extract, and verify `rows[][]` changes and warning appears when extraction yields minimal rows/columns.

6. **Rollback Plan**
   - `git restore tools/pdf2csv-local/index.html tools/pdf2csv-local/style.css tools/pdf2csv-local/app.js` and delete this plan file.
