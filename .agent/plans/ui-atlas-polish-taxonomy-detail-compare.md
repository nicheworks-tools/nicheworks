# ExecPlan — UI Atlas polish pass (taxonomy + detail + compare)

## Scope
- Target only: `tools/ui-atlas/*`
- In-scope files:
  - `tools/ui-atlas/data/patterns.free.v1.json`
  - `tools/ui-atlas/app.js`
  - `tools/ui-atlas/index.html`
  - `tools/ui-atlas/ja/index.html`
  - `tools/ui-atlas/styles.css`

## Goals
1. Replace coarse category taxonomy with a more browse-friendly structure.
2. Reclassify 50 patterns to curated categories and purpose values where needed.
3. Restructure detail panel into concise, clearly named sections.
4. Improve compare output for decision-making clarity while keeping 2-item max.
5. Increase card-vs-detail live sample differentiation without removing live rendering.
6. Verify no regressions in search/filters/detail/compare/favorites/recent/prompt copy.
7. Verify mobile detail closed-by-default and slide-in open behavior.

## Steps
1. Inspect current taxonomy keys and dataset assignments.
2. Update dataset categories (and specific weak purpose assignments) across all records.
3. Update EN/JA filter chip labels and translation maps for new taxonomy.
4. Refactor detail panel structure in EN/JA HTML and corresponding JS bindings/rendering.
5. Improve compare diff rendering into structured decision blocks and summary recommendation.
6. Enhance `sampleMarkup` to provide richer instructional detail view (large variant) vs card mini sample.
7. Run static checks (node JSON parse + smoke checks), review mobile CSS/JS behavior.
8. Capture screenshots (EN desktop, JA desktop, mobile detail open) if browser tool is available.

## Manual verification for user
- Open EN `/tools/ui-atlas/` and JA `/tools/ui-atlas/ja/`.
- Confirm category chips feel curated and discoverable.
- Confirm detail panel fields are separated and concise.
- Compare two patterns and verify practical recommendation wording.
- On mobile width, confirm detail panel starts hidden and slides in only after opening a card.
