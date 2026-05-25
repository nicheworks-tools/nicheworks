# ExecPlan PR-OKJ-45
- Scope: `tools/old-kanji-reference/` only.
- Files to touch:
  - `tools/old-kanji-reference/index.html`
  - `tools/old-kanji-reference/app-meaning-v4.js`
  - `tools/old-kanji-reference/style.css`
- Steps:
  1. Inspect current layout and language rendering hooks.
  2. Add compact/collapsible quiz panel markup in `index.html`.
  3. Implement quiz state, presets, question generation, scoring, detail-link integration, and bilingual labels in JS using `entriesCache`.
  4. Add minimal responsive quiz styles.
  5. Run requested validation commands.
  6. Verify only scoped files changed, then commit and create PR message.
- Manual verification:
  - Switch JP/EN and confirm quiz labels/messages update without score reset.
  - Test all 3 modes and all presets, ensure 4 unique choices with randomized position.
  - Confirm “この字を詳しく見る / View details” opens existing detail panel and keeps quiz state.
  - Check mobile width (~360px) has no quiz overflow.
