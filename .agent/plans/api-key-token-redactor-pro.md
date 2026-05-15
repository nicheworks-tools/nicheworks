# API Key Token Redactor common Pro integration plan

## Scope
- Target only `tools/api-key-token-redactor/`.
- Add one new file: `tools/api-key-token-redactor/pro-bridge.js`.
- Update existing HTML/CSS/JS for the tool as needed.
- Do not modify common specs, assets, deployment config, or unrelated tools.

## Files to touch
- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/style.css`
- `tools/api-key-token-redactor/pro-bridge.js`
- Potentially `tools/api-key-token-redactor/howto/index.html` and `tools/api-key-token-redactor/howto/en/index.html` only if broken links/wording directly require fixes.

## Steps
1. Inspect the current tool HTML/JS/CSS and identify free-version breakages and legacy Pro remnants.
2. Repair free flow first: placeholders, `placeholderStyle` ID, language-aware howto links, redact/clear/copy/download/sample wiring, and remove forbidden placeholder/remnant wording.
3. Add common Pro bridge using `/assets/nw-pro.js` and `NWPro.getLocalStatus()` with `data-pro-*` attributes.
4. Add/enable Pro preview and Pro-only operations without exposing raw secrets in findings or exports.
5. Implement audit/report/template/export/custom-rule/profile functions client-side, using only local in-memory input/output state.
6. Verify forbidden remnants are absent and run available static/runtime checks.
7. Commit changes and create PR.

## Manual verification for user
- Open the tool in a fresh/incognito browser and verify Preview status, free redact/copy/TXT download, five samples, sanitized finding previews, and common buy URL.
- Simulate `NWPro.getLocalStatus()` returning active and verify Pro-only visibility, audit/template copy actions, JSON/CSV/Markdown exports, custom rules, and profile switching.
- Check responsive widths: 320px, 375px, 414px, 768px, and desktop.
