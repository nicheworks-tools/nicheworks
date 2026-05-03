# ExecPlan: Fix Construction Tools Atlas loading stall

## Scope
- Target: `tools/construction-tools-atlas/` only
- Also add this plan file under `.agent/plans/`

## Files to inspect/touch
- `tools/construction-tools-atlas/index.html`
- `tools/construction-tools-atlas/app.js`
- `tools/construction-tools-atlas/tools.basic.json`
- `tools/construction-tools-atlas/data-priority-loader.js`
- `tools/construction-tools-atlas/ui-polish.js`
- `tools/construction-tools-atlas/ux-final.js`

## Steps
1. Inspect current load/boot script chain and app init flow.
2. Trace `init`/`loadData`/`normalize`/`render`/status update behavior to identify why loading never clears.
3. Implement root-cause fix in `app.js` while preserving `tools.basic.json` full dataset flow.
4. Remove/disable unnecessary post-hoc loaders/force-list/priority replacement behavior that interferes.
5. Verify functionality: immediate list render, status clear, search/filter/detail/favorites/JA-EN behavior and no console errors.

## Manual verification
- Open page and confirm list appears immediately without persistent loading state.
- Confirm `tools.basic.json` fetch status is 200 in Network.
- Check search, category/work filters, detail sheet, favorites, language toggle.
- Check 360px width for no horizontal overflow.
