# ExecPlan: PR-OKJ-38 Old Kanji Reference display mode switch

## Scope
- Target: `tools/old-kanji-reference/` only.
- Files to touch:
  - `tools/old-kanji-reference/index.html`
  - `tools/old-kanji-reference/app-meaning-v4.js`
  - `tools/old-kanji-reference/style.css`
- Out of scope: SEO/sitemap/tools-index/tools-meta/meta files/dict counts/GA4/AdSense/Cloudflare/footer/donation links/unrelated tools.

## Steps
1. Inspect current list rendering and identify insertion point for display mode controls above entry list.
2. Add display mode state + localStorage persistence + JP/EN labels in `app-meaning-v4.js`.
3. Refactor list rendering to support compact/detail cards and table rows, while reusing existing `getFilteredEntries()`.
4. Add display mode UI container in `index.html` near filters/search area above list.
5. Add minimal CSS for mode buttons, compact cards, and table/stacked mobile rows in `style.css`.
6. Run required validation commands.
7. Commit changes and prepare PR body including manual verification checklist.

## Manual verification for user
1. Open Old Kanji Reference desktop.
2. Confirm default mode is detail unless localStorage overrides it.
3. Switch to compact; verify shorter cards, no meaning/usage in list, copy/favorite work.
4. Switch to detail; verify richer card display returns.
5. Switch to table; verify dense rows, detail opens from row, copy/favorite work.
6. Search `邊`; verify display mode remains active.
7. Apply preset `名前で見かける字`; verify display mode remains active.
8. Open detail from table row; verify recent history updates.
9. Switch EN; verify display mode labels and row labels are English only.
10. On mobile width (360px), verify compact default and table mode stacks without horizontal overflow.
