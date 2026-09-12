# Tool Specification — Rename Wizard

- Slug: `rename-wizard`
- Public URL: `https://nicheworks.app/tools/rename-wizard/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate batch filename cleanup candidates from selected local file names without renaming or reading the files themselves.

## Current functional contract

- Accept multiple local files through picker or drag-and-drop and use their file names only.
- Generate candidate names using configurable rules including Unicode NFKC width normalization, whitespace→underscore, lowercase extension, optional lowercase base name, separator collapse, edge trimming, and forbidden-character replacement.
- Detect candidate-name collisions and optionally append `_2`, `_3`, and later suffixes.
- Warn about Windows reserved names and problematic filename shapes such as excessive length, leading dots, trailing dots, or trailing spaces.
- Show an original→candidate preview table with status/warnings.
- Copy the mapping as TSV and download it as CSV.
- Do not rename the actual selected files and do not generate execution commands in the current version.
- Provide separate Japanese and English public tool pages.

## Inputs

- Multiple local file selections.
- Filename cleanup rule toggles.

## Outputs

- Original→candidate filename mapping.
- Per-row status/warnings.
- TSV clipboard copy.
- CSV download.

## State and persistence

Selected file-name data, options, and generated mappings are current-page state and are not stored as rename history.

## Privacy and network behavior

The tool references file names in the browser and does not read/upload file contents for rename candidate generation. Ads/analytics may load separately.

## Language mode

`separate JA/EN pages`

The Japanese root and `/en/` English page are separate public tool surfaces.

## Layout class

`pc-oriented`

Multiple-file controls and the original/candidate/status/warning table are most effective on wider screens, though responsive use remains supported.

## Limits and non-goals

- Actual files are never renamed by this tool.
- It does not generate shell/PowerShell rename commands in the current version because execution carries additional risk.
- Filesystem restrictions vary across Windows/macOS/Linux/cloud services; warnings are a conservative aid, not a universal validator.
- Filename normalization can change semantics; users must review the preview before applying names elsewhere.

## Acceptance criteria

- [ ] Selecting files reads file names for preview without reading/uploading file contents as part of rename logic.
- [ ] Enabled normalization rules deterministically change candidate names and disabled rules do not silently apply.
- [ ] Duplicate candidate names are detected and can be disambiguated with sequential suffixes.
- [ ] TSV/CSV export contains the preview mapping and does not modify the selected local files.
- [ ] The UI continues to state that the tool does not perform actual renames or execution-command generation.

## Implementation evidence

- `tools/rename-wizard/index.html`
- `tools/rename-wizard/app.js`
- `tools/rename-wizard/en/index.html`
- `tools/rename-wizard/en/app.js`
- `tools/rename-wizard/style.css`
