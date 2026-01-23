# ExecPlan: PDF2CSV Local export (Task 07/08)

## Scope
- tools/pdf2csv-local/index.html
- tools/pdf2csv-local/app.js
- tools/pdf2csv-local/vendor/xlsx.full.min.js (new)

## Objectives
- Enable CSV and XLSX downloads with naming rules.
- Align multi-page handling (CSV concatenation with page separators, XLSX multi-sheet).
- Keep output consistent with preview settings (delimiter, header, filters).

## Steps
1. Review current PDF2CSV Local UI and extraction flow.
2. Add UI controls for CSV BOM toggle and hook download buttons.
3. Implement export data model derived from preview settings, including page separators and per-page sheets.
4. Add SheetJS vendor asset and wire XLSX export logic.
5. Sanity check formatting and ensure UI updates/disabled states on reset/extraction.

## Manual verification
- Load a multi-page PDF, extract, and download CSV/XLSX.
- Confirm CSV includes separators and respects delimiter/BOM.
- Confirm XLSX has Page1/Page2 sheets and matches preview rows.
