# ExecPlan: Task 01 UI Atlas free version foundation

## Scope
- Target: `tools/ui-atlas/`
- Files to touch:
  - `tools/ui-atlas/index.html`
  - `tools/ui-atlas/ja/index.html`
  - `tools/ui-atlas/usage/index.html`
  - `tools/ui-atlas/ja/usage/index.html`
  - `tools/ui-atlas/about/index.html`
  - `tools/ui-atlas/ja/about/index.html`
  - `tools/ui-atlas/pro/index.html`
  - `tools/ui-atlas/ja/pro/index.html`
  - `tools/ui-atlas/styles.css`
  - `tools/ui-atlas/app.js`

## Steps
1. Inspect existing mock/spec and current public pages; align with English-first + `/ja/` separated routing.
2. Rebuild public pages with practical tool layout blocks: header, intro, ad-top, 3-column workspace, FAQ, ad-bottom, donation, footer.
3. Add localized EN/JA copy for index/usage/about/pro pages and fix intra-site links so EN and JA counterparts are not broken.
4. Implement lightweight interactive placeholders (search/filter/detail/compare tray) in `app.js` for root pages only, without paid gating.
5. Update shared stylesheet for dashboard layout and placeholder components while keeping tool-first look.
6. Run static checks for navigation paths and staged changes.

## Manual verification
- Open EN root `/tools/ui-atlas/` and JA root `/tools/ui-atlas/ja/`.
- Confirm search narrows cards, filter chips toggle, detail panel updates, compare tray add/remove works (max 2 items).
- Navigate to Usage/About/Pro and back in both languages with no broken links.
- Confirm Pro page explains upcoming premium value but does not block free use.
