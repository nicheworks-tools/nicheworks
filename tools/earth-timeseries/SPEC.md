# Tool Specification — Earth Timeseries

- Slug: `earth-timeseries`
- Public URL: `https://nicheworks.app/tools/earth-timeseries/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Publish an explicit coming-soon status page for a future point-based Earth-observation time-series utility without implying that observed time-series values are already available.

## Current functional contract

- State that Earth Timeseries is not currently usable as a time-series data tool.
- Describe the intended future scope as organizing point-based Earth-observation metadata/data over time.
- Explicitly state that the current page does not retrieve observed values or sample raster precipitation.
- Explain that current real-data work is limited to Earth Map Suite storm metadata status.
- Link to Earth Map Suite as the related active page.
- Provide JP/EN copy on the same page.

## Inputs

Only UI language selection and normal page navigation. There is no current point/date-series input workflow.

## Outputs

- Coming-soon/current-status information.
- Link to Earth Map Suite.

## State and persistence

The current page does not create or store time-series queries, point selections, sampled values, or datasets.

## Privacy and network behavior

No Earth-observation query is submitted by this page because data retrieval/sampling is not implemented. Suite-wide advertising and analytics resources may load normally.

## Language mode

`bilingual single-page`

JP/EN controls switch the same status page.

## Layout class

`mobile-oriented`

The current experience is a simple stacked informational page.

## Limits and non-goals

- No observed time-series values are provided.
- No raster precipitation sampling is performed.
- No point-query, chart, export, or historical-data workflow is active.
- Future plans are not part of the current functional contract until implemented.

## Acceptance criteria

- [ ] The page clearly labels Earth Timeseries as coming soon/not currently usable.
- [ ] The page does not imply that observed values or raster sampling are available.
- [ ] JP/EN modes communicate the same current limitations and provide the Earth Map Suite link.

## Implementation evidence

- `tools/earth-timeseries/index.html`
- shared presentation from `tools/earth-map-suite/style.css`
