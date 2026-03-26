# ExecPlan — 2026-03-26 Vibe Lexicon phase 1 mock promotion

## Scope
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/styles.css`
- `tools/vibe-lexicon/app.js`
- `tools/vibe-lexicon/data/*` (new dataset for free-tier shell)
- `tools/vibe-lexicon/ja/{usage,about,pro}/index.html` (navigation fix only)

## Files to touch
- Promote approved mock layout/content into EN and JA production roots.
- Replace thin scaffold CSS/JS with real product-shell styling and data-driven rendering.
- Add a structured seed dataset file for free-tier features (terms, aliases, wording, examples, compare relationships).
- Keep existing usage/about/pro pages present and ensure JA pages link to JA routes.

## Steps
1. Inspect current Vibe Lexicon mock and production scaffold.
2. Build EN and JA root pages from approved mock structure (no language toggle).
3. Move visual system into shared `styles.css` and wire `app.js` + dataset file.
4. Implement free-tier interactions (search/filter, detail, compare tray, copy prompt, favorites/recent local storage).
5. Fix broken JA navigation links on subpages.
6. Verify file integrity and run basic checks (`node --check`, link/path sanity).

## Manual verification
1. Open `/tools/vibe-lexicon/` and `/tools/vibe-lexicon/ja/`.
2. Confirm desktop-first 3-column layout and full section density match the approved mock direction.
3. Test search, select term, compare tray (max 2), copy prompt button, favorites/recent persistence.
4. Verify subpage nav links for both EN and JA (`usage/about/pro`).
