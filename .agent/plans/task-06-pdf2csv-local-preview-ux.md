# ExecPlan: PDF2CSV Local Preview + Edit + UX (Task 06)

## Scope
- Target tool: `tools/pdf2csv-local/`
- Files:
  - `tools/pdf2csv-local/index.html`
  - `tools/pdf2csv-local/style.css`
  - `tools/pdf2csv-local/app.js`

## Steps
1. Inspect current UI/JS structure and existing extraction flow.
2. Add preview table (first 50 rows), edit controls (remove empty rows/cols, header rename, delimiter toggle) in HTML/CSS.
3. Implement preview rendering + light edit actions in JS; ensure progress/reset/error behaviors follow spec.
4. Verify responsive layout at <=480px and update CSS for stacked layout + table scroll.

## Manual Verification
- Load a PDF, run extraction, confirm progress shows then hides.
- Preview shows first 50 rows with horizontal scroll on small screens.
- Apply edits (remove empty rows/cols, rename headers) and confirm output changes.
- Reset clears inputs, settings, selection, results, errors, and progress.
- Trigger errors (invalid range or empty result) and confirm error box and progress hide.
