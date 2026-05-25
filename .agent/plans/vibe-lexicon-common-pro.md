# ExecPlan: Vibe Lexicon common Pro integration

## Scope
- Target only:
  - `tools/vibe-lexicon/index.html`
  - `tools/vibe-lexicon/ja/index.html`
  - `tools/vibe-lexicon/pro-bridge.js`
  - Related local CSS/JS under `tools/vibe-lexicon/` only if required to preserve existing UI behavior.
- Do not touch `_archive/`, `apps/`, common spec files, deployment settings, or unrelated tools.

## Files expected to touch
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/pro-bridge.js`
- `tools/vibe-lexicon/styles.css` only if needed for Pro preview/locked/unlocked display.

## Steps
1. Inspect existing Vibe Lexicon HTML/JS/CSS and current Pro remnants.
2. Wire `/assets/nw-pro.js` into EN/JA pages and ensure `pro-bridge.js` runs after it.
3. Implement `pro-bridge.js` to read `NWPro.getLocalStatus()`, set `document.documentElement.dataset.proActive`, update `[data-pro-status]`, `[data-pro-preview]`, `[data-pro-only]`, and `[data-pro-buy]`.
4. Preserve all free search/catalog/card/detail/compare/copy/favorite/recent/show-more features.
5. Add or update Pro preview and unlocked UI for brand tone memo, style prompt pack, avoid list, use-case prompts, compare handoff, Markdown export, and JSON export.
6. Remove legacy per-tool Stripe/unlock/manual Pro remnants and escape wording.
7. Verify with static searches and, where possible, browserless checks.

## Manual verification for user
- Open `/tools/vibe-lexicon/` and `/tools/vibe-lexicon/ja/`.
- Confirm free search, cards, details, compare, favorites, recent terms, and show more still work.
- In a non-Pro browser, confirm Preview mode and Buy Pro link to the common Payment Link.
- In a Pro-unlocked browser, confirm Pro unlocked status and copy/export actions are enabled.
