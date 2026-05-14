# ExecPlan: minutes-to-ops common Pro integration

## Scope
- Target tool only: `tools/minutes-to-ops/`
- Files expected to touch:
  - `tools/minutes-to-ops/index.html`
  - `tools/minutes-to-ops/app.js`
  - `tools/minutes-to-ops/pro-bridge.js` (new if needed)

## Goals
- Integrate the tool with the shared NicheWorks Pro foundation.
- Load `/assets/nw-pro.js` and read `NWPro.getLocalStatus()`.
- Use the shared payment link and shared entitlement (`nicheworks_pro`).
- Preserve free features while enabling Pro-only history, compare, output pack, GitHub Issue, Codex prompt, and SOP handoff exports.
- Remove legacy per-tool unlock/payment placeholders and old marker strings.

## Steps
1. Inspect existing minutes-to-ops HTML/JS and shared Pro helper expectations.
2. Update `index.html` with standard Pro UI markers (`data-pro-status`, `data-pro-preview`, `data-pro-only`, `data-pro-buy`) and shared scripts.
3. Add/update bridge logic so document state reflects `NWPro.getLocalStatus()` via `document.documentElement.dataset.proActive`.
4. Update app logic to keep free outputs available, show Pro preview samples while locked, and unlock Pro copy/export/history features when Pro is active.
5. Search for required legacy strings and run syntax/smoke checks.
6. Commit changes and create PR.

## Manual verification for user
- Open `tools/minutes-to-ops/index.html` without Pro entitlement; generate sample output and confirm free save buttons work while Pro buttons are locked with previews visible.
- Simulate Pro active through the shared Pro state and confirm `data-pro-only` controls unlock and history/output pack exports work.
- Confirm purchase CTA goes to the shared Stripe Payment Link.
