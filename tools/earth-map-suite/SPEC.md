# Tool Specification — Earth Map Suite

- Slug: `earth-map-suite`
- Public URL: `https://nicheworks.app/tools/earth-map-suite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Organize Earth/map-view conditions and provide Storm, Compare, and Card preview workflows while keeping synthetic visualization separate from the real metadata-reachability checks currently available through the Earth Map Suite precipitation endpoint.

## Current functional contract

- Provide three selectable modes: `storm`, `compare`, and `card`.
- Accept mode-specific inputs including BBox, dates, preset/detail level, frame count, focus/area, layers, notes, and compare/card fields.
- Validate bounded inputs such as BBox span, date range, preset values, and storm frame limits.
- Generate deterministic synthetic storm/compare/card grids and previews in the browser; these visual previews are not observed precipitation.
- Call `/api/earth-map-suite/precipitation` to check real precipitation-metadata reachability/status for the relevant BBox/date/preset inputs.
- Keep the returned metadata status separately labeled from the synthetic preview.
- Produce a shareable text/check memo from the selected inputs and support the implemented copy/download actions.
- Persist selected display language locally as implemented.

## Inputs

- Mode selection.
- BBox and/or point coordinates depending on mode.
- Date range(s), preset/detail level, frames, focus area, layers, and notes.
- JP/EN selection.

## Outputs

- Synthetic Storm/Compare/Card visualization and summaries.
- Real metadata reachability/status from the internal precipitation endpoint.
- Shareable map-view/check memo and implemented copy/download output.

## State and persistence

Most mode/input/result state is current-session browser state; selected language is stored in `localStorage` under the shared `nw_lang` key. Synthetic replay data may be cached in memory during the session.

## Privacy and network behavior

Synthetic preview generation runs in the browser. Metadata-status checks make same-origin requests to `/api/earth-map-suite/precipitation`; that backend may contact upstream Earth-observation sources. Suite-wide analytics/advertising may also load. The current tool must not be described as fully offline when metadata checks are used.

## Language mode

`bilingual single-page`

JP/EN controls switch the same multi-mode workspace.

## Layout class

`pc-oriented`

The multi-mode workspace, input/edit panels, metadata status, and visual preview are information-dense and benefit from desktop width, with responsive behavior required for narrow screens.

## Limits and non-goals

- Storm/Compare/Card rendered grids are synthetic previews, not measured precipitation values.
- Current real-data behavior is metadata reachability/status rather than raster value sampling.
- The tool is not a weather-warning or emergency-alert service.
- Input limits such as maximum BBox/date span and frame count are intentional safeguards.

## Acceptance criteria

- [ ] Each of Storm, Compare, and Card modes can be selected and produces its implemented synthetic preview from valid inputs.
- [ ] Synthetic preview content is visibly distinguished from real metadata reachability/status.
- [ ] A metadata check uses the same-origin precipitation endpoint and failure/unavailable states are surfaced without relabeling synthetic data as observed data.
- [ ] Invalid/out-of-bound BBox, date, preset, or frame inputs are rejected by the implemented validation path.

## Implementation evidence

- `tools/earth-map-suite/index.html`
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/style.css`
- `tools/earth-map-suite/usage.html`
- `tools/earth-map-suite/usage-en.html`
