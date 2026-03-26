# ExecPlan — Task 02 / UI Atlas free version core interactions

## Scope
- Target only `tools/ui-atlas`.
- No changes outside this tool directory.

## Files to touch
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/styles.css`

## Steps
1. Inspect existing EN/JA index markup and current JS/CSS hooks.
2. Expand pattern card metadata and filter controls to support free-version requirements.
3. Implement JS data/state layer for search, multi-filters, detail panel sections, compare tray (2 max), short prompt copy, favorites, and recent history in `localStorage`.
4. Add responsive behavior for collapsible filters and mobile-friendly detail panel/compare tray.
5. Run static checks (syntax/readability via simple node parse) and verify git diff.

## Manual verification
- EN and JA pages:
  - Search by EN name, JA name, alias, novice wording, and use-case wording.
  - Filter by category/purpose/mobile fit/difficulty.
  - Open detail and confirm all required sections.
  - Compare tray allows add/remove and enforces max 2.
  - Copy prompt works.
  - Favorites and recent views persist after reload.
  - On small viewport, filters collapse and detail behaves as modal/full-screen while compare remains usable.
