# ExecPlan: Task 4 – Construction Tools Atlas UI adjustments

## Scope
- Target: `tools/construction-tools-atlas/`
- Files:
  - `tools/construction-tools-atlas/index.html`
  - `tools/construction-tools-atlas/style.css`
  - `tools/construction-tools-atlas/app.js`

## Steps
1. Inspect current layout for duplicated title, search block, and results rendering.
2. Update HTML structure to remove/disable duplicate title block, streamline search area, and ensure a single results list container.
3. Update CSS for mobile-first compact search area, single-row chips, and dense results rows without nested scrolling.
4. Update JS results renderer to output row-based layout with favorite button behavior.
5. Validate that no nested scroll remains and that the topbar is the only visible title on mobile.

## Manual Verification
- On ~360px width, confirm the title appears once, search area is compact, and results rows are visible near the top.
- Verify result rows open details on row click and favorite star does not open detail.
- Confirm the page uses only window scroll (no internal results scroll).
