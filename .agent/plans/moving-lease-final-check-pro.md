# ExecPlan: Moving / Lease Final Check Common Pro Integration

## Scope
- Target only `tools/moving-lease-final-check/`.
- Do not touch `_archive/`, `apps/`, `common-spec/`, deployment settings, or unrelated tools.

## Files to touch
- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/pro-bridge.js`
- `tools/moving-lease-final-check/style.css`

## High-level steps
1. Inspect current HTML/JS/CSS and existing Pro remnants.
2. Ensure `/assets/nw-pro.js` and `./pro-bridge.js` are loaded from the tool HTML.
3. Add/update a Pro card using shared attributes: `data-pro-status`, `data-pro-preview`, `data-pro-only`, `data-pro-buy`.
4. Implement `pro-bridge.js` to load shared Pro client if needed, read `NWPro.getLocalStatus()`, set `document.documentElement.dataset.proActive`, update status text, toggle preview/unlocked UI, and wire the common Payment Link.
5. Extend `app.js` with Pro pack generation and gated Pro copy/save/print actions while preserving all free features.
6. Add/update CSS for Pro preview/unlocked states, locked buttons, output areas, responsive layout, and print Pro layout.
7. Add FAQ copy explaining post-purchase handling.
8. Run searches for prohibited remnants and syntax checks.

## Verification
- Confirm free controls still exist and basic copy/save/print handlers remain.
- Confirm Preview mode is visible when Pro is inactive and Buy Pro points to the shared Payment Link.
- Confirm Pro-only elements display when `data-pro-active="true"` and Pro actions are wired.
- Confirm no per-tool Stripe/Webhook/D1/product/pro unlock page is introduced.
- Search for prohibited remnants: `PRO_URL_PDF`, `PRO_URL_MEMO`, `PRO_URL_ADDR`, `goPro`, `manualProBtn`, `payBtn`, `REPLACE_STRIPE_PAYMENT_LINK`, setup-alert wording, `Pro予定`, `準備中`, `未実装機能`, `stable content`, `alert(`.
