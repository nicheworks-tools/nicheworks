# ExecPlan: Contract Risk Highlighter common Pro integration

## Scope
- Target: `tools/contract-risk-highlighter/` only.
- Plan file: `.agent/plans/contract-risk-highlighter-pro.md`.
- Do not modify common specs, assets, deployment config, `_archive/`, `apps/`, or other tools.

## Files to inspect
- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/app-complete.js`
- `tools/contract-risk-highlighter/style.css`
- `tools/contract-risk-highlighter/usage.html`
- `tools/contract-risk-highlighter/usage-en.html`

## Files expected to touch
- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app.js` or `app-complete.js` depending on current script wiring
- `tools/contract-risk-highlighter/pro-bridge.js` (new)
- `tools/contract-risk-highlighter/style.css`
- `tools/contract-risk-highlighter/usage.html`
- `tools/contract-risk-highlighter/usage-en.html`

## High-level steps
1. Inspect current HTML script tags and existing Pro/payment/manual-unlock remnants.
2. Decide the authoritative app script and keep public loading to one app script plus common Pro bridge.
3. Add `/assets/nw-pro.js` and a local `pro-bridge.js` that reads `NWPro.getLocalStatus()`, sets `document.documentElement.dataset.proActive`, updates `[data-pro-status]`, preview, Pro-only, and buy elements.
4. Update application logic so free mode preserves Analyze, max 3 findings, Lite Markdown preview/copy, JP/EN toggle, paste example, FAQ/usage links, and browser-only analysis notices.
5. Unlock Pro mode from common Pro state only: all findings, full review Markdown, download `.md`, print/save PDF via `window.print()`, consultation memo, counterparty questions, missing clause checklist, next action memo, and Pro copy/export buttons.
6. Update usage pages and FAQ/purchase explanation with shared Pro activation rules and PDF extraction wording.
7. Search for forbidden remnants (`REPLACE_STRIPE_PAYMENT_LINK`, `manualProBtn`, `payBtn`, `stable content`, misleading PDF wording, etc.).
8. Run static checks and a lightweight browser/DOM check where feasible.

## Manual verification for user
- Free/incognito: Pro status shows Preview mode, paste example/analyze works, findings limited to 3, Lite Markdown copy works, download/print are locked, Buy Pro uses common Payment Link.
- Pro-active browser: `data-pro-active` becomes `true`, Pro status shows Pro unlocked, all findings and full output pack are visible, Pro copy/download/print actions work.
