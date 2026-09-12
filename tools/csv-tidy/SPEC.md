# Tool Specification — CSV Tidy

- Slug: `csv-tidy`
- Public URL: `https://nicheworks.app/tools/csv-tidy/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Load a CSV locally, reorganize and clean its columns/values, preview the result, and download a new UTF-8 CSV without modifying the source file.

## Current functional contract

- Load a local CSV or built-in accounting, e-commerce, contact-list, or generic sample.
- Support input encoding selection including auto, UTF-8, and Shift_JIS subject to browser support.
- Support delimiter selection including auto, comma, TAB, and semicolon plus header-row on/off.
- Let users reorder, rename, and exclude columns.
- Apply implemented cleanup rules including leading/trailing whitespace trim, repeated-space normalization, and full-width/half-width conversion.
- Preview transformed rows and output summary before saving.
- Produce UTF-8 output with the implemented BOM option for Excel-oriented compatibility.

## Inputs

- Local CSV file or built-in sample data.
- Input encoding, delimiter, header-row, and preview-size settings.
- Column order/name/include state.
- Cleanup options and output options.

## Outputs

- Parsed/cleaned CSV preview and summary.
- Newly generated UTF-8 CSV download.
- Built-in sample CSV download where provided.

## State and persistence

Loaded CSV content and transformation settings are current-page working state. The source file is not modified and the current contract does not include server-side or cross-session CSV history.

## Privacy and network behavior

CSV reading, transformation, preview, and output generation run in the browser and the selected CSV is not intentionally uploaded by the tool workflow. Suite-wide advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same workbench UI.

## Layout class

`pc-oriented`

Column editing and table preview benefit substantially from desktop width; narrow-screen support must preserve access to the controls rather than redefine the tool as a simple form.

## Limits and non-goals

- Shift_JIS decoding availability can vary by browser environment.
- Output is UTF-8-oriented; this is not a full spreadsheet application or arbitrary encoding converter.
- The source file remains unchanged; transformations apply only to the newly generated output.
- Complex malformed CSV structures may not be recoverable automatically.

## Acceptance criteria

- [ ] A supported CSV or built-in sample can be loaded and parsed with the selected delimiter/header settings.
- [ ] Reordering, renaming, excluding, and enabled cleanup rules are reflected in the preview and downloaded output.
- [ ] Saving creates a new UTF-8 CSV and does not mutate the original local file.
- [ ] JP/EN switching preserves the same CSV editing workflow and local-processing notice.

## Implementation evidence

- `tools/csv-tidy/index.html`
- `tools/csv-tidy/app.js`
- `tools/csv-tidy/style.css`
