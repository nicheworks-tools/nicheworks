# ExecPlan: UI Atlas live samples correction

## Scope
- Target only `tools/ui-atlas/**`.
- Preserve existing mock-based desktop-first layout structure.

## Files to touch
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/styles.css`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/data/patterns.free.v1.json`

## Steps
1. Inspect current EN/JA page copy, dataset fields, and app rendering/search behavior.
2. Extend dataset schema with practical search wording fields and live sample metadata.
3. Implement reusable sample renderers (card mini + detail large) in plain HTML/CSS/JS.
4. Wire richer search over new fields and improve compare output readability.
5. Replace development/internal public copy on EN/JA while keeping existing layout blocks.
6. Validate behavior (search/filter/detail/compare/favorites/recent/copy) and run static checks.
7. Commit changes and create PR message.

## Manual verification (for reviewer)
- Open EN and JA pages and confirm each card has a mini live sample.
- Open details on multiple patterns and confirm enlarged interactive sample works.
- Verify modal, accordion, select/input, and layout-style samples are truly interactive.
- Confirm search matches novice/use-case/best-for/not-for terms.
- Confirm compare tray shows readable explanation text, not only raw internal values.
