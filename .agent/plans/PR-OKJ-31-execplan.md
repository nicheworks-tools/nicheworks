# ExecPlan: PR-OKJ-31 Old Kanji Reference UX completion

## Scope
- Target: `tools/old-kanji-reference/` only.
- Excluded: SEO audit, sitemap, tools-index, other tools.

## Files to touch
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/app-meaning-v4.js`

## Steps
1. Inspect existing search/filter/render/mobile behavior.
2. Add search mode selector and grouped-by-modern summary view.
3. Rework filter set (including pair-only filter) and count/status logic.
4. Improve zero-result message details and ensure pair-only entries suppress empty reading/meaning text.
5. Add mobile collapsible search/filter panels with no horizontal overflow at 360px.
6. Preserve detail panel, mobile detail toggle, copy, and JP/EN switch behavior.
7. Run required validation commands and sanity checks for acceptance examples.

## Manual verification
- Search mode `新字` + query `辺` shows `邊` and `邉`.
- Search mode `読み` + query `さわ` shows `澤`.
- Search mode `Unicode` + query `U+570B` shows `國`.
- Filter `対応のみ` works.
- 360px viewport has no horizontal scroll.
- `node --check tools/old-kanji-reference/app-meaning-v4.js` passes.
- `node tools/old-kanji-reference/validate-meta.js` passes.
