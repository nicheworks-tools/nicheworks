# Outsource Spec Generator Common Pro Integration

## Scope
- Target only `tools/outsource-spec-generator/` plus this plan file.
- Do not touch common specs, assets, deployment, apps, or unrelated tools.

## Files to touch
- `tools/outsource-spec-generator/index.html`
- `tools/outsource-spec-generator/style.css`
- `tools/outsource-spec-generator/app.js`
- `tools/outsource-spec-generator/pro-bridge.js` (new)
- `.agent/plans/outsource-spec-generator-common-pro.md`

## High-level steps
1. Inspect existing Outsource Spec Generator HTML/CSS/JS and current Pro remnants.
2. Add common Pro UI hooks in HTML: `/assets/nw-pro.js`, `pro-bridge.js`, `data-pro-status`, `data-pro-preview`, `data-pro-only`, `data-pro-buy`, and FAQ purchase-after behavior.
3. Refactor `app.js` so free generation remains available, Pro output builders are tool-specific, and copy/export actions are gated by `document.documentElement.dataset.proActive` rather than any individual Stripe/D1/Webhook logic.
4. Create `pro-bridge.js` to read `NWPro.getLocalStatus()`, set `data-pro-active`, update Pro status/preview/only visibility, wire buy buttons to the shared Payment Link, and fail safely into Preview mode.
5. Update `style.css` for Pro card/preview/unlocked/locked buttons/toast/mobile layout without fixed 600px desktop width.
6. Run syntax/static checks and residual string searches for removed legacy patterns.

## Manual verification for user
- Load `/tools/outsource-spec-generator/` with no Pro state: free generation and copy work, Pro Preview is visible, locked Pro buttons show the buy guidance.
- Confirm every `data-pro-buy` link points to the shared Stripe Payment Link.
- Simulate Pro active state through the shared `/assets/nw-pro.js` local status and confirm `data-pro-only` sections and Pro copy/export buttons are enabled.
- Temporarily block `/assets/nw-pro.js` or run offline and confirm the page stays usable in free/Preview mode with the unknown-status message.
