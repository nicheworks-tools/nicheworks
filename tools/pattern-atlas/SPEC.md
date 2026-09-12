# Tool Specification — Pattern Atlas

- Slug: `pattern-atlas`
- Public URL: `https://nicheworks.app/tools/pattern-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a visual dictionary for world pattern references with searchable metadata, live SVG previews, color editing, cultural-context cautions, and client-side asset export.

## Current functional contract

- Load the current pattern dataset from local JavaScript data rather than relying on the three hardcoded shell cards.
- Search patterns across English/Japanese names, aliases, regions, cultures, categories, motifs, use cases, and summaries.
- Filter by region, category, and use case.
- Open pattern detail/edit state and render live SVG previews through the registered renderer implementation.
- Edit pattern colors and apply palette presets with synchronized previews.
- Export the current rendered pattern as SVG, PNG, or CSS.
- Support PNG size selection and build CSS using an SVG data URI plus the pattern tile dimensions.
- Require an explicit cultural-context acknowledgement before export for patterns marked with an export warning.
- Provide separate English and Japanese public pages.

## Inputs

- Search query and catalog filters.
- Selected pattern.
- Color/palette edits.
- Export format and PNG size.
- Cultural-warning acknowledgement when required.

## Outputs

- Filtered visual pattern catalog.
- Pattern detail, context, and live SVG preview.
- Color-edited pattern preview.
- Downloaded SVG, PNG, or CSS asset.

## State and persistence

Search, selected pattern, and color-edit state are current-page state. The current implementation does not provide a saved pattern library or account-synced palette history.

## Privacy and network behavior

Catalog search, rendering, color editing, PNG conversion, CSS generation, and downloads run in the browser from same-site code/data. Ads and analytics may load separately.

## Language mode

`separate JA/EN pages`

The English root and `/ja/` page are separate language surfaces.

## Layout class

`pc-oriented`

The catalog, filters, detail/editor preview, color tools, and export controls are primarily a desktop creative-workspace layout while remaining responsive.

## Limits and non-goals

- Exported designs are modern programmatic reconstructions, not certified cultural assets or official historical reproductions.
- Cultural, religious, or ethnic context may require additional research before public/commercial use.
- The page still contains stale copy describing itself as an initial production shell even though runtime data/render/filter/color/export modules are implemented; runtime behavior is authoritative for this specification.
- The tool does not establish copyright, trademark, cultural permission, or commercial-use rights.

## Acceptance criteria

- [ ] Runtime cards are populated from the current pattern dataset and searchable/filterable by the documented metadata.
- [ ] Selecting/editing a pattern updates the live SVG preview and export uses the current edited render.
- [ ] SVG, PNG, and CSS exports are generated client-side and produce the selected current pattern rather than shell placeholder content.
- [ ] Patterns marked as requiring export caution cannot be exported until the user acknowledges the cultural warning.
- [ ] Documentation must not treat the stale production-shell paragraph as the current implementation state.

## Implementation evidence

- `tools/pattern-atlas/index.html`
- `tools/pattern-atlas/ja/index.html`
- `tools/pattern-atlas/js/app.js`
- `tools/pattern-atlas/js/data/patterns-all.js`
- `tools/pattern-atlas/js/renderers/index.js`
- `tools/pattern-atlas/js/export-ui.js`
- `tools/pattern-atlas/css/pattern-atlas.css`
