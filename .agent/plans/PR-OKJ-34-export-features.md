# ExecPlan: PR-OKJ-34 Old Kanji Reference export features

## Scope
- Target: `tools/old-kanji-reference/` only
- Out of scope: SEO/meta updates, sitemap, tools-index, other tools

## Files to touch
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/app-meaning-v4.js`

## Steps
1. Inspect current rendering/filtering flow and identify the single source for current visible entries.
2. Add Export UI block with JA/EN labels and buttons for CSV, JSON, Markdown copy, and Print.
3. Implement export logic based on current filtered entries (including pair-only entries), with CSV/JSON download and Markdown table copy.
4. Add print stylesheet rules to reduce non-essential controls and optimize PDF-friendly layout while preserving visible results.
5. Ensure i18n switching updates export labels and messages without language mixing.
6. Run required checks and summarize manual verification steps.

## Manual verification
- Search `邊` and save CSV.
- Search `さわ` and copy Markdown table.
- Apply `確認済みのみ` filter and save JSON.
- Open print preview and verify action buttons are not intrusive.
- Switch JP/EN and verify export button labels follow selected language.
