# ExecPlan: Command Safety Checker Common Pro Integration

## Scope
- Target only: `tools/command-safety-checker/`
- Do not modify common specs, assets, deployment, or other tools.

## Files to touch
- `tools/command-safety-checker/index.html`
- `tools/command-safety-checker/pro-bridge.js` (create or replace)
- `tools/command-safety-checker/style.css`
- `tools/command-safety-checker/pro.html` to remove the old tool-specific unlock page and point to shared Pro
- `tools/command-safety-checker/functions/api/verify.js` to remove the tool-specific Stripe verification endpoint
- `tools/command-safety-checker/howto/en/index.html` only to remove stale placeholder wording caught by residue checks
- `tools/command-safety-checker/app-core.js` only if needed to keep free-result data available without adding Pro checks

## High-level steps
1. Inspect current Command Safety Checker structure, existing Pro addon, and free app APIs.
2. Update `index.html` to load `/assets/nw-pro.js` and `./pro-bridge.js`, remove `pro-addon.js` from execution, and add the required `data-pro-*` UI blocks and purchase explanations.
3. Implement `pro-bridge.js` as the sole bridge to the common `NWPro.getLocalStatus()` client, handling preview/active/fallback UI and Pro copy/export/save actions.
4. Add minimal CSS for Pro preview/active/locked states without changing free tool behavior.
5. Run static checks and residue searches for removed placeholders/old Pro flow strings.
6. Commit changes and create a PR record.

## Manual verification for user
- Open in private browsing and confirm Preview mode plus free checks work.
- Confirm locked Pro buttons and common Buy Pro URL while not active.
- Complete `/pro/unlock/?session_id=...` in a browser and confirm common Pro remains active.
- Confirm Pro-only actions copy/export/save current report data when active.
- Clear site data and confirm Preview mode returns.
