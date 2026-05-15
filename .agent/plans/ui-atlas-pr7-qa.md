# UI Atlas PR7 QA / Finishing Plan

## Scope
- Only `tools/ui-atlas/` and `tools/ui-atlas/ja/` runtime files for fixes.
- Read-only reference: `docs/common-pro-integration.md`, `docs/common-pro-operating-guide.md`, `docs/ui-atlas-free-pro-spec.md`.
- No Stripe/Webhook/D1/Cloudflare configuration changes.

## Files to inspect
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/pro/index.html`
- `tools/ui-atlas/ja/pro/index.html`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/pro-bridge.js`
- `tools/ui-atlas/pro-link-bridge.js`
- `tools/ui-atlas/pro-generator.js`
- `tools/ui-atlas/pro-preview-bridge.js`
- `tools/ui-atlas/pro-samples.js`
- `tools/ui-atlas/display-guard.js`
- `tools/ui-atlas/styles.css`
- `tools/ui-atlas/ui-atlas-polish.css`

## Steps
1. Inspect script ordering, Pro mount points, links, and existing prose in EN/JA pages.
2. Search for specified residue terms under `tools/ui-atlas` and fix public HTML/JS residue if found.
3. Run static syntax checks and `git diff --check`.
4. Use local HTTP server and DOM/browser automation to verify four pages, Pro sample counts/categories, preview filters, Generator modes/exports, compare limits, handoff URLs, and 360px layout.
5. Apply only minor text/CSS/script-order/path fixes needed for QA findings.
6. Re-run checks and capture screenshots if a perceptible UI change is made.

## Manual verification for user
- Open `/tools/ui-atlas/`, `/tools/ui-atlas/ja/`, `/tools/ui-atlas/pro/`, `/tools/ui-atlas/ja/pro/`.
- Verify Free catalog search/filters/details/compare and Pro preview search/category.
- Verify Pro Generator all 5 modes and export/copy controls.
- Verify 360px mobile width has no major horizontal overflow.
