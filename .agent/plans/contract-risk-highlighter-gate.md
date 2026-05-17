# Contract Risk Highlighter public gate verification

## Scope
- Target only `tools/contract-risk-highlighter/` and any verification-only temporary scripts outside the final patch if needed.
- Do not touch `_archive/`, common specs, deployment settings, or unrelated tools.

## Files expected to inspect/touch
- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/pro-bridge.js`
- Usage/how-to pages under `tools/contract-risk-highlighter/` only if stale gate wording is found.

## Steps
1. Inspect the tool markup/scripts for public gate, Pro bridge, Stripe URL, and banned placeholder strings.
2. Verify the public URL behavior with a browser-style check where possible.
3. If issues are found, make the smallest text/logic changes inside scope.
4. Run targeted string checks and browser/static checks.
5. Commit the change and prepare a PR summary.

## Manual verification for user
- Open `https://nicheworks.app/tools/contract-risk-highlighter/` in a normal browser with no NicheWorks Pro localStorage.
- Confirm Preview mode, Paste example → Analyze, max 3 free findings, Lite Markdown copy, and Pro-locked downloads/print.
- Set `localStorage.setItem('nicheworks:pro','true')` and reload, then confirm Full Review Pack and Pro copy/export actions.
