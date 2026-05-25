# ExecPlan: UI Atlas PR5 Pro Generator handoff

## Scope
- Primary scope: `tools/ui-atlas/` and `tools/ui-atlas/ja/` UI Atlas static tool files.
- Supporting documentation/verification scope: read-only inspection of listed docs and shared Pro client files.
- Plan file: `.agent/plans/ui-atlas-pr5-pro-handoff.md`.

## Files expected to touch
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/pro-link-bridge.js`
- `tools/ui-atlas/pro-generator.js`
- This plan file only.

## Files to inspect without modifying unless required
- `tools/ui-atlas/pro-bridge.js`
- `tools/ui-atlas/pro-samples.js`
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/pro/index.html`
- `tools/ui-atlas/ja/pro/index.html`
- `assets/nw-pro.js`
- `docs/common-pro-integration.md`
- `docs/common-pro-operating-guide.md`
- `docs/ui-atlas-free-pro-spec.md`

## High-level steps
1. Inspect current detail-panel, compare-tray, Pro link bridge, and Pro Generator URL-param behavior.
2. Refactor Pro link bridge to build EN/JA-safe Pro memo and compare URLs with compact URLSearchParams.
3. Add or strengthen detail-panel and compare-tray CTAs without duplicating existing buttons.
4. Extend Pro Generator URL-param hydration for additional context fields while preserving existing user/default values where appropriate.
5. Run syntax/static checks and targeted residual-string searches.
6. Commit changes and prepare PR.

## Manual verification steps for user
- Open `/tools/ui-atlas/`, open a card detail, and confirm “Create Pro memo for this UI” links to `/tools/ui-atlas/pro/?pattern=...` with context params populated in Pro Generator.
- Open `/tools/ui-atlas/ja/`, open a card detail, and confirm “このUIでProメモを作る” links to `/tools/ui-atlas/ja/pro/?pattern=...` with Japanese context preserved.
- Add two compare items on EN and JA pages, use the compare memo CTA, and confirm candidate patterns hydrate in Compare mode.
- Confirm Free 2 / Pro 5 compare limits still behave as before.
