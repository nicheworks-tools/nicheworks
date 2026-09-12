# Tool Specification — Codex Usage Forecaster

- Slug: `codex-usage-forecaster`
- Public URL: `https://nicheworks.app/tools/codex-usage-forecaster/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Record user-entered Codex usage percentages and estimate consumption rate, depletion timing, and reset-related context for five-hour and weekly usage windows.

## Current functional contract

- Accept manual weekly and five-hour usage percentages together with optional mode, status, model, and note metadata.
- Save usage observations locally and derive simple forecast KPIs from the stored log history.
- Filter observations by mode, status, model, and note text; optionally make forecasts respect those filters.
- Save, apply, overwrite, and delete named filter profiles.
- Accept manual weekly and five-hour reset timestamps that take precedence when supplied.
- Export logs, profiles, settings, and reset data as JSON and import compatible exported JSON to replace current local data.
- List stored observations and support deletion/clearing.
- Provide separate Japanese and English page sets plus usage/how-to documentation.

## Inputs

- Weekly usage percentage and five-hour usage percentage.
- Optional mode, status, model, and note fields.
- Filter controls and named profile data.
- Optional manual reset date/time values.
- Compatible JSON import file.
- Theme and language/page selection.

## Outputs

- Weekly and five-hour consumption/ETA KPIs.
- Reset display based on automatic or manual reset context.
- Filtered log table and counts.
- Saved local profiles/settings.
- User-triggered JSON export.

## State and persistence

Usage logs, filter profiles, manual reset settings, and theme settings are stored in browser `localStorage`. Data is browser-local and is not automatically synchronized to another browser or device. Import replaces current local tool data with the imported compatible export payload.

## Privacy and network behavior

Forecast calculation and storage run locally in the browser. The usage observations entered into the tool are not intentionally uploaded by the forecasting workflow. Suite-wide advertising and analytics scripts may load independently.

## Language mode

`separate JA/EN pages`

Japanese is served at the canonical root and the English interface is under `/en/`.

## Layout class

`pc-oriented`

The dashboard contains KPI groups, configuration panels, filters, profiles, and a horizontally rich log table; narrow-screen support is secondary to the information-dense dashboard layout.

## Limits and non-goals

- Forecasts are simple estimates from user-entered observations and do not guarantee actual OpenAI/Codex limits, reset times, remaining quota, or service policy.
- The tool does not read the user's Codex account automatically.
- Notes may contain sensitive work context, so users are expected to redact private project or customer names when needed.
- `app-fixed.js` is the active page runtime. The older `app.js` file is not the implementation evidence for the current page contract.

## Acceptance criteria

- [ ] Saving at least two usable observations can produce forecast information for the applicable usage window.
- [ ] Filters and saved profiles affect the visible log set and, when enabled, the forecast source set.
- [ ] Exported JSON can be downloaded and a compatible import can replace the current local logs/profiles/settings.
- [ ] Manual reset values override automatic reset presentation when present, and clearing them returns to automatic behavior.

## Implementation evidence

- `tools/codex-usage-forecaster/index.html`
- `tools/codex-usage-forecaster/app-fixed.js`
- `tools/codex-usage-forecaster/en/`
- `tools/codex-usage-forecaster/usage.html`
- `tools/codex-usage-forecaster/howto.html`
