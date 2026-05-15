# UI Atlas PR1 Pro Page Copy Update

## Scope
- `tools/ui-atlas/pro/index.html`
- `tools/ui-atlas/ja/pro/index.html`

## Related docs to inspect
- `docs/common-pro-integration.md`
- `docs/common-pro-operating-guide.md`
- `docs/ui-atlas-free-pro-spec.md`

## Out of scope
- Pro Generator 5-mode implementation
- Pro-only 50 sample data implementation
- Compare limit logic in app JavaScript
- Pro-only search/filter integration
- Markdown/JSON export implementation

## Steps
1. Inspect target pages and related docs for current Pro copy and shared Pro assumptions.
2. Replace outdated post-purchase / 404 fallback wording with shared `/pro/unlock/?session_id={CHECKOUT_SESSION_ID}` behavior.
3. Update English and Japanese Pro pages with equivalent sections for Free vs Pro, Preview vs Pro unlocked, Pro-only sample bank, 5-mode generator, and purchase behavior.
4. Ensure buy buttons point to the shared Stripe Payment Link and labels match the requested copy.
5. Search requested legacy terms in the target Pro page area and update any in-scope remnants.
6. Run lightweight validation/search checks, review diff, commit changes, and create PR metadata.

## Manual verification
- Open `/tools/ui-atlas/pro/` and `/tools/ui-atlas/ja/pro/` in a browser.
- Confirm Free 100 / Pro 150, compare 2 / compare 5, Pro-only 50, 5-mode generator, preview/unlocked states, and shared unlock URL are visible.
- Confirm purchase CTA goes to the shared Stripe Payment Link.
