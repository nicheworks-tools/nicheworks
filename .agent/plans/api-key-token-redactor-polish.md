# ExecPlan: API Key Token Redactor Pro polish

## Scope
- Target only: `tools/api-key-token-redactor/`
- Plan file: `.agent/plans/api-key-token-redactor-polish.md`

## Files to touch
- `tools/api-key-token-redactor/pro-bridge.js`
- `tools/api-key-token-redactor/app.js`

## Steps
1. Inspect existing Pro status display and export generation code.
2. Update `data-pro-status` text selection for JA/EN and error fallback text.
3. Add an export safety note to Audit Markdown, GitHub Issue, Support, Discord, and handoff pack outputs.
4. Run syntax checks and requested residue searches.
5. Commit changes and create PR.

## Manual verification
- Toggle JP/EN and verify Pro status messages update appropriately.
- Verify free redact features, Pro export buttons, custom rules, and profile switching still work in-browser.
