# UI Atlas PR6B Pro-only Preview Controls

## Scope
- Target tool only: `tools/ui-atlas/` and `tools/ui-atlas/ja/`.
- Primary files to touch:
  - `tools/ui-atlas/pro-preview-bridge.js`
  - `tools/ui-atlas/styles.css`
  - `tools/ui-atlas/index.html` if needed
  - `tools/ui-atlas/ja/index.html` if needed
- No changes to common specs, payment infrastructure, deployment config, or unrelated tools.

## Files to inspect
- `tools/ui-atlas/pro-samples.js`
- `tools/ui-atlas/pro-bridge.js`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/pro-generator.js`
- `tools/ui-atlas/pro-link-bridge.js`
- `docs/common-pro-integration.md`
- `docs/common-pro-operating-guide.md`
- `docs/ui-atlas-free-pro-spec.md`

## Steps
1. Inspect existing Pro-only preview section implementation, Pro sample data shape, page language detection, Pro status detection, and CSS hooks.
2. Update `pro-preview-bridge.js` so preview controls are isolated from the public 100-example catalog:
   - add section explanation, search input, category buttons, count text, empty state;
   - filter by search and category using AND logic;
   - render locked vs unlocked card content based on common Pro status;
   - build language-correct Pro Generator links with `URLSearchParams` and bounded parameter lengths;
   - keep common Stripe Payment Link only for inactive unlock CTA.
3. Update `styles.css` for locked/unlocked badges, controls, card wrapping, 360px mobile layout, and non-overflow CTA/button behavior.
4. Touch EN/JA HTML only if existing mounting/scripts need adjustment.
5. Run syntax/static checks and targeted residue searches.
6. Verify existing catalog code paths remain independent from the Pro preview controls.

## Manual verification for user
- Open `/tools/ui-atlas/` and `/tools/ui-atlas/ja/`.
- Confirm the Pro-only preview bank appears below the public catalog.
- Search `AI`, choose `Billing / Account UI`, combine search + category, and test a no-match keyword.
- Confirm locked CTA uses the shared Stripe Payment Link and Pro Generator links point to the matching language Pro page.
- Confirm existing public catalog search/filter/detail/compare still works and Pro preview controls do not affect public catalog counts.
- Check a 360px viewport for no horizontal scroll.
