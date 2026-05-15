# ExecPlan: SQL DB Risk Checker common Pro integration

## Scope
- Target only: `tools/sql-db-risk-checker/`
- Files expected to touch:
  - `tools/sql-db-risk-checker/index.html`
  - `tools/sql-db-risk-checker/app.js`
  - `tools/sql-db-risk-checker/style.css`
  - `tools/sql-db-risk-checker/pro-bridge.js` (new)
- Do not modify common specs, assets, deployment settings, `_archive/`, or unrelated tools.

## Goal
Integrate SQL DB Risk Checker with the shared NicheWorks Pro client (`/assets/nw-pro.js`) and remove reliance on any individual Stripe/webhook/D1/manual unlock implementation. Preserve all free SQL checking behavior while adding preview/active Pro UI and copy/export operations.

## Steps
1. Inspect current HTML, JS, CSS, and any existing Pro restore implementation.
2. Update `index.html` to load `/assets/nw-pro.js` and new `pro-bridge.js`, add required `data-pro-*` attributes, FAQ copy, purchase link, and Pro preview/active containers.
3. Implement `pro-bridge.js` to call `NWPro.getLocalStatus()`, set `document.documentElement.dataset.proActive`, maintain UI state, and expose an event/status for app code.
4. Update `app.js` to keep free checks intact, remove old manual unlock/pay/restore assumptions, add Pro pack generation/copy/export gated by common Pro state, and ensure requested SQL risk rules are covered.
5. Update `style.css` for Preview/Active visibility and locked/enabled controls.
6. Run syntax/static checks and targeted browser-like checks where practical.
7. Search for requested legacy remnants and report results.

## Manual verification for user
- In a clean/incognito browser, confirm Preview status, free SQL checking, locked Pro buttons, common Payment Link, Critical for `DELETE FROM users;`, and Medium for `SELECT * FROM users ORDER BY created_at;`.
- After common Pro unlock (`/pro/unlock/?session_id=...`), confirm Active status, Pro-only content, Safe Execution Pack copy, Review Summary copy, and Markdown export.

## Plan update after inspection
- Existing `index.html` loads `pro-restore.js`, and legacy `app.js` contains old localStorage/manual unlock/payment placeholder code. Remove `pro-restore.js` / `pro-restore.css` and replace stale legacy `app.js` content so requested remnant searches are clean across the target folder.
