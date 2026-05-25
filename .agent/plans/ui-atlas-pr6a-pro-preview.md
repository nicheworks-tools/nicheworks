# UI Atlas PR6A Pro-only Preview ExecPlan

## Scope
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/pro-preview-bridge.js` (new if needed)
- `tools/ui-atlas/pro-bridge.js` only if existing bridge needs a safe reusable status hook
- Verification reads in `tools/ui-atlas/`, `assets/nw-pro.js`, and relevant docs.

## Out of Scope
- No changes to Stripe, webhook, D1, Cloudflare, common specs, archived files, or non-UI Atlas tools.
- No full integration of Pro samples into existing free search/filter/detail/compare flows.

## Steps
1. Inspect UI Atlas free/pro pages, bridge files, Pro sample data, and docs for current conventions.
2. Add Pro sample loading and a free-page preview mount after the public catalog without changing existing catalog DOM behavior.
3. Implement an isolated `pro-preview-bridge.js` that renders all 50 Pro samples grouped by category, reads Pro status from `NWPro.getLocalStatus()`/existing page state, and builds language-aware Pro Generator/checkout links.
4. Include the bridge in EN/JA pages in a safe defer order.
5. Run static checks, residue searches, and lightweight DOM/link verification for EN/JA pages.
6. Commit changes and create PR.

## Manual Verification for User
- Open `/tools/ui-atlas/` and `/tools/ui-atlas/ja/`.
- Confirm the Pro-only preview section appears below the public catalog with 50 cards across 5 categories.
- Confirm inactive cards show locked text and common Stripe checkout CTA.
- Confirm Pro Generator links point to the correct language Pro URL with pattern/context/risk params.
- Confirm existing public catalog search/filter/detail/favorites/recent/compare still operate as before.
