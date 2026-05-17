# JSON Repair Common Pro Integration ExecPlan

## Scope
- Target only `tools/json-repair/` and this plan file.
- Do not edit `common-spec/`, other tools, `apps/`, `assets/`, `nicheworks/`, or `_archive/`.

## Files to touch
- `tools/json-repair/index.html`
- `tools/json-repair/app.js`
- `tools/json-repair/style.css`
- Delete if obsolete and present:
  - `tools/json-repair/app-complete.js`
  - `tools/json-repair/app-pro-commerce.js`
  - `tools/json-repair/jr-complete.js`
  - `tools/json-repair/jr-structure-hotfix.js`
  - `tools/json-repair/jr-i18n-fix.js`
  - `tools/json-repair/jr-validate-polish.js`

## High-level steps
1. Inspect current JSON Repair HTML/CSS/JS and identify legacy Pro/payment/unlock remnants.
2. Refactor `index.html` so the public entry loads only `/assets/nw-pro.js` and `./app.js`, and includes required Pro card elements and data attributes.
3. Refactor `app.js` to keep all free JSON repair operations local and integrate common Pro state via `NWPro.getLocalStatus()`.
4. Implement Pro preview/active behavior for aggressive repair, candidates, schema check, local history, report copy, advanced export, and Pro samples.
5. Update `style.css` for wide desktop layout and mobile wrapping/one-column behavior.
6. Remove obsolete JS entry/hotfix files.
7. Run syntax/static checks and residual-string searches for deleted legacy artifacts.
8. Commit changes and create a pull request.

## Manual verification steps for the user
- Open `tools/json-repair/index.html` in a clean/private browser and confirm Preview status, free functions, locked Pro actions, and common Payment Link.
- Simulate common Pro local status so `NWPro.getLocalStatus()` returns active, then confirm Pro status, unlocked Pro actions, history, report copy, and exports.
- Confirm no JSON content is transmitted externally by reviewing the tool behavior/network panel.
