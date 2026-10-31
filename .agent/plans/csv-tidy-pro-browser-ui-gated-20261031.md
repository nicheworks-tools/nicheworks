# ExecPlan — CSV Tidy Pro verified-only browser controls (2026-10-31)

## Goal
Connect the previously merged preset, batch and ZIP engines to a *real browser interaction*, **only after the existing NicheWorks server entitlement verifies all required CSV Tidy Pro feature IDs**. No checkout, payment UI, purchase claims or pricing display. Existing CSV Tidy Free remains usable and its existing controls/output behavior remain unchanged.

## Scope
- `tools/csv-tidy/app.js`: additive, non-mutating read-only snapshot/codec bridge for Pro. Existing parse/transform/export paths unchanged.
- `tools/csv-tidy/index.html`: load shared entitlement helper and Pro module only; no visible static Pro sales surface.
- `tools/csv-tidy/pro/ui.mjs` and `ui.css`: hidden unless server verification is successful, local preset save/import/export/delete, batch file selection and ZIP download.
- `tools/csv-tidy/tests/pro-browser-acceptance.html` and `scripts/ops/csv-tidy-pro-qa-server.py`: browser acceptance with *test-only* entitlement response server; disabled/non-entitled controls never mount.
- `.github/workflows/csv-tidy-pro-browser-acceptance.yml`: local Chrome, independent ZIP data verification.
- PRO-SPEC status, this plan.

## Strict constraints
- Checkout remains product-disabled. Product price draft unchanged.
- Never trust `localStorage` or URL params as proof: UI calls `NicheWorksProEntitlement.refreshProState` and requires `source=server`, `active=true`, all 3 namespaced features. Rechecks before each privileged operation.
- A test-only fake entitlement may exist in QA server under `scripts/ops`, **never** in production HTML/module/Functions.
- No raw CSV sent to API or analytics. Presets stored locally by explicit user action, bounded. Shared entitlement fetch transmits only checkout session and product identifiers.
- DOM uses `textContent` for user strings. No new external packages/scripts.
- Source browser accepts 32 files at a time, all previous per-file/aggregate limits remain enforced. Server-attested active rights allow Pro operations; users without rights see no new panel/buttons.
- WARNING: browser JS is not tamper-proof; paid business security has this inherent limitation. Do not claim robust DRM.
- Cross-device purchase recovery, receipts, refunds and live checkout are NOT activated. Live public Free remains Free.

## Acceptance
- Server-unverified session (including missing/revoked) keeps Pro UI absent.
- Test-only verified session gives bilingual Pro UI.
- Save current editable Free mapping, persist, restore, import/export preset.
- Choose valid and invalid CSV, intercept the actual browser-created ZIP Blob in the isolated CI harness (without navigating a headless download), and use Python `zipfile` and `csv.reader` to verify output and report; no invalid CSV included. Existing Free acceptance separately covers an on-disk browser download.
- Existing 18/18 Free browser and all repository CI pass.
- Do not merge on a failing acceptance.
