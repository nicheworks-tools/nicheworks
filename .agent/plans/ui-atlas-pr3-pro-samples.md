# UI Atlas PR3 Pro-only Sample Bank ExecPlan

## Scope
- Target tool only: `tools/ui-atlas/` and `tools/ui-atlas/ja/`.
- Files expected to touch:
  - Create `tools/ui-atlas/pro-samples.js`.
  - Update `tools/ui-atlas/pro-generator.js`.
  - Update `tools/ui-atlas/pro/index.html`.
  - Update `tools/ui-atlas/ja/pro/index.html`.
- Do not touch `tools/ui-atlas/app.js`, `tools/ui-atlas/display-guard.js`, free compare limit logic, or the free catalog/search/filter/detail integration.

## Steps
1. Inspect current UI Atlas Pro pages and generator implementation.
2. Add a static browser-readable Pro sample bank exposed as `window.UI_ATLAS_PRO_SAMPLES` with exactly 50 Pro-only entries and bilingual EN/JA fields.
3. Add Pro page mount points and script loading for the sample bank without changing payment/webhook/D1 behavior.
4. Extend `pro-generator.js` to render the sample bank, detect Pro state via `/assets/nw-pro.js` / `NWPro.getLocalStatus()`, show locked previews for inactive users, show full details for active users, and support “Use in generator”.
5. Verify counts/required fields/pro flags with a local Node check.
6. Search the touched scope for requested leftover strings and fix any issues in touched files.
7. Commit changes and create a PR record.

## Manual verification for user
- Open `/tools/ui-atlas/pro/` and `/tools/ui-atlas/ja/pro/`.
- Confirm the Pro sample bank lists 50 cards grouped/labeled by category.
- In inactive state, confirm locked preview message and unlock CTA are shown.
- In active state, confirm full detail fields appear in expandable cards.
- Click “Use in generator” / “Generatorで使う” and confirm Pattern, Context, and Risk fields are populated.
