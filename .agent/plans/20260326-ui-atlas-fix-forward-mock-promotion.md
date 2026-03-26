# ExecPlan — UI Atlas fix-forward mock promotion (2026-03-26)

## Scope
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/styles.css`
- (If needed for rewire only) `tools/ui-atlas/app.js`

## Goals
1. Replace both EN root and JA root public pages with approved mock-based desktop-first layout.
2. Keep EN and JA as separate single-language production pages (no inline language toggle behavior).
3. Preserve/re-attach current free interactions: search, filters, detail open/close, compare up to 2, local favorites/history, prompt copy.
4. Keep common-spec constraints: ad-top, separate donation area, usage/about/pro links, no always-visible logo image in header.

## Steps
1. Inspect existing `index.html`, `ja/index.html`, `styles.css`, `app.js`, and `mock/ui-atlas-mock.html`.
2. Promote mock-based layout into both public entry pages while keeping current data attributes/wiring points.
3. Update shared stylesheet to reflect approved mock visual structure and maintain desktop-first 3-column experience.
4. Run quick static validation checks (search for required links/slots and script/style paths).
5. Commit and prepare PR note.

## Manual verification
- Open `/tools/ui-atlas/` and `/tools/ui-atlas/ja/` and confirm both visually match mock direction (not thin scaffold).
- Confirm left filters / center results / right detail, compare tray, favorites/history, FAQ blocks are present.
- Confirm usage/about/pro links work from both EN and JA pages.
- Confirm search/filter/detail/compare/favorites/history/prompt-copy interactions work.
