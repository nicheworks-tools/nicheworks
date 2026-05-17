# Incident Update Generator Common Pro Integration

## Scope
- Target only `tools/incident-update-generator/`.
- Read shared `/assets/nw-pro.js` behavior, but do not modify shared assets or common specs.

## Files to touch
- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/style.css`
- `tools/incident-update-generator/pro-bridge.js` (new)
- `tools/incident-update-generator/pro-app.js` (remove legacy individual Pro implementation if no longer loaded/needed)

## Steps
1. Inspect current Incident Update Generator free generation, output, copy, and download flow.
2. Replace legacy individual Pro script loading with the shared `/assets/nw-pro.js`, the normal app script, and a new `pro-bridge.js`.
3. Add common Pro UI attributes (`data-pro-status`, `data-pro-preview`, `data-pro-only`, `data-pro-buy`) and purchase-aftercare copy.
4. Implement `pro-bridge.js` to read `NWPro.getLocalStatus()`, set `document.documentElement.dataset.proActive`, update status text, toggle preview/Pro-only UI, and point buy links to the common Payment Link.
5. Preserve free generation, copy, and TXT download behavior; add a Pro-only Markdown pack export that is disabled/locked in preview and enabled only when common Pro is active.
6. Remove old individual Pro unlock behavior (`?pro=1`, manual localStorage key, legacy Stripe URL messaging, REPLACE/stable placeholder).
7. Run static checks/searches for legacy patterns and basic syntax validation.

## Manual verification for user
- Load the tool with no Pro entitlement: confirm Preview mode appears, free generation/copy/TXT download work, and Markdown pack export is locked.
- Complete shared Pro unlock flow via `/pro/unlock/?session_id=...`: return to the browser and confirm Pro unlocked appears and Markdown pack export works.
- Test another browser/incognito profile: confirm it falls back to Preview mode and requires reactivation.
