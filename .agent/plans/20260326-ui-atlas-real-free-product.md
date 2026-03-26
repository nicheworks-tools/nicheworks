# ExecPlan — UI Atlas urgent real-product completion

## Scope
- Target only `tools/ui-atlas/`.
- In scope files:
  - `tools/ui-atlas/index.html`
  - `tools/ui-atlas/ja/index.html`
  - `tools/ui-atlas/app.js`
  - `tools/ui-atlas/data/patterns.free.v1.json`
  - `tools/ui-atlas/about/index.html`
  - `tools/ui-atlas/usage/index.html`
  - `tools/ui-atlas/pro/index.html`
  - `tools/ui-atlas/ja/about/index.html`
  - `tools/ui-atlas/ja/usage/index.html`
  - `tools/ui-atlas/ja/pro/index.html`
- Out of scope: other tools, specs, deployment/CI, full layout redesign.

## Steps
1. Inspect current EN/JA UI Atlas pages and app logic for placeholder wording and hardcoded-card rendering.
2. Expand seed dataset fields so each pattern has required product fields (`purpose`, `mobile_fit`, `difficulty`) while keeping EN source + JA localization.
3. Convert card rendering in `app.js` to data-driven loading from `tools/ui-atlas/data/patterns.free.v1.json` and keep existing interaction model.
4. Keep existing mock-based layout and swap inline demo cards to an app-rendered grid container.
5. Remove placeholder/internal-stage wording across EN/JA public pages.
6. Run validation checks and prepare commit + PR message.

## Manual verification
- Open `/tools/ui-atlas/` and `/tools/ui-atlas/ja/`.
- Confirm catalog renders many cards (target 50), not 4 demos.
- Confirm search, category chips, select filters, detail open/close, compare (max 2), favorites, recents, and prompt copy work.
- Confirm wording no longer describes the product as a placeholder/foundation stage.
