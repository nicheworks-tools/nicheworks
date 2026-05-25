# UI Atlas PR4: Free compare 2 / Pro compare 5

## Scope
- Target only `tools/ui-atlas/`, `tools/ui-atlas/ja/`, and references needed to verify the shared Pro client in `assets/nw-pro.js`.
- Do not modify Stripe/Webhook/D1 settings or common spec files.

## Files expected to touch
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/pro-link-bridge.js` if needed for compare handoff labels/params
- `tools/ui-atlas/pro-bridge.js` if a small common-Pro bridge is cleaner
- `tools/ui-atlas/index.html` / `tools/ui-atlas/ja/index.html` only if a new bridge script must be loaded

## Steps
1. Inspect current compare state, rendering, limits, Pro handoff, and JS loading on EN/JA pages.
2. Add/reuse a small bridge that loads `/assets/nw-pro.js`, reads `NWPro.getLocalStatus()`, writes `document.documentElement.dataset.proActive`, and emits a refresh event.
3. Update compare limit logic to use Free=2 / Pro=5, with EN/JA status text and limit messages.
4. Add unobtrusive compare tray status and inactive upgrade CTA using the shared Payment Link.
5. Preserve compare-to-Pro Generator handoff with compare/goal/risk params for EN and JA paths.
6. Run syntax checks and residue searches for banned/obsolete terms in touched scope.
7. Commit changes and open a PR.

## Manual verification for user
- EN and JA inactive: add two compare items; third attempt is blocked with Pro CTA and Free status text.
- EN and JA active: with cached common Pro active status, add five compare items; sixth attempt shows Pro 5-limit text.
- Click “Create Pro compare memo” / “この比較でProメモを作る” and confirm Pro Generator receives `compare`, `goal`, and `risk` query params.
