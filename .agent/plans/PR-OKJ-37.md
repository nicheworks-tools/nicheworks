# ExecPlan PR-OKJ-37

## Scope
- Target only `tools/old-kanji-reference/`.
- No changes to SEO/sitemap/tools-index/tools-meta/analytics/footer/donations/data schema.

## Files to touch
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/app-meaning-v4.js`

## Steps
1. Inspect current render flow and i18n handling in `app-meaning-v4.js`.
2. Add shortcut containers (palette/presets/recent/favorites) to HTML near search/popular blocks.
3. Implement shortcut/favorites/recent state and render functions in `app-meaning-v4.js` with localStorage helpers.
4. Add compact CSS for chips and favorite toggle, including mobile wrapping.
5. Run required validation commands and verify only scoped files changed.

## Manual verification
1. Open Old Kanji Reference in JP mode.
2. Click palette chip 國 -> query updates and detail opens/entry visible.
3. Click preset 名前で見かける字 -> name/place entries shown.
4. Open detail for 齋 -> appears in recent.
5. Add 齋 to favorites -> favorites section appears and persists after reload.
6. Remove favorite -> removed from favorites section.
7. Switch EN -> new sections/buttons English only.
8. Switch JP -> new sections/buttons Japanese only.
9. Confirm on 360px viewport chips wrap and no horizontal overflow.
