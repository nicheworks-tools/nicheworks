# ExecPlan: PDF2CSV Local Manual Selection

- Scope: tools/pdf2csv-local/
- Files to touch: tools/pdf2csv-local/app.js, tools/pdf2csv-local/index.html, tools/pdf2csv-local/style.css

## Steps
1. Inspect existing UI/logic for PDF preview/extraction and identify hooks for manual selection.
2. Add manual selection UI controls (reset/re-extract) and canvas selection overlay with coordinates display.
3. Implement selection filtering to pass only intersecting text items into existing row/column inference logic.
4. Verify manual/auto toggle state stability and update styles as needed.

## Manual verification
- Load a PDF, switch to Manual mode, drag to select a table area, and click Re-extract to confirm rows[][] updates.
- Reset selection clears overlay and disables Re-extract until a selection is present.
- Switch between Auto and Manual without state breakage.
