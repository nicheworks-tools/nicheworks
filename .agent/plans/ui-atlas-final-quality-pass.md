# ExecPlan — UI Atlas final quality pass (50-pattern free catalog)

## Scope
- Target directory: `tools/ui-atlas`
- Primary file: `tools/ui-atlas/data/patterns.free.v1.json`
- Optional validation files/scripts: read-only checks under `tools/ui-atlas`.
- Out of scope: any directory outside `tools/ui-atlas`.

## Files to touch
- `tools/ui-atlas/data/patterns.free.v1.json`

## High-level steps
1. Inspect current schema and enumerate all 50 patterns.
2. Perform full metadata audit and improvements for EN/JA fields.
3. Rework `similar_patterns` links to improve decision usefulness.
4. Improve compare guidance clarity while keeping free compare limits unchanged.
5. Audit and improve `sample_config` for realism and recognizability.
6. Run validation checks (JSON validity + dataset sanity checks).
7. Capture screenshots for required views and improved samples.
8. Commit changes and prepare PR with concrete evidence lists.

## Manual verification steps
1. Open `tools/ui-atlas/index.html` and verify search/filter/detail/compare/favorites/history still work.
2. Validate EN/JA toggle and parity by checking several patterns in both locales.
3. Confirm detail sample teaches more than card sample for improved patterns.
4. Confirm no new patterns were added and catalog count remains 50.
