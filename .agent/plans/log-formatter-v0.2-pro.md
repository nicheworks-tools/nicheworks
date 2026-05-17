# ExecPlan: LogFormatter v0.2 Common Pro Integration

## Scope
- Target: `tools/log-formatter/` only.
- New file: `tools/log-formatter/pro-bridge.js`.
- Existing files expected to touch: `tools/log-formatter/index.html`, `tools/log-formatter/app.js`, `tools/log-formatter/style.css`.
- Do not touch `_archive/`, `common-spec/`, deployment settings, or other tools.

## Goals
- Integrate LogFormatter with the shared NicheWorks Pro client `/assets/nw-pro.js`.
- Preserve all current free v0.1 features.
- Add v0.2 Pro features: CSV/JSON/Markdown exports, regex filter, simple JSON log parsing, UA/bot summary, IP/URL details, and sensitive string warning details.
- Avoid any per-tool Stripe, webhook, D1, manual unlock, or placeholder implementation.

## Steps
1. Inspect current LogFormatter HTML/CSS/JS and existing behavior.
2. Add shared Pro bridge and HTML attributes/UI required by the common Pro foundation.
3. Extend app logic while preserving free Nginx parsing/filter/copy/TXT/sample/i18n/dark behavior.
4. Add Pro-only export/report/analysis features gated by `document.documentElement.dataset.proActive`.
5. Add CSS for Pro cards, previews, disabled states, and detail tables.
6. Run static checks/searches for prohibited remnants and syntax.
7. Commit changes and create PR metadata.

## Manual verification for user
- Open `tools/log-formatter/index.html` in a browser.
- Confirm free mode can parse/filter/copy/save Nginx logs.
- Confirm Pro preview is visible when Pro is inactive and Pro buttons are disabled.
- Confirm Buy Pro points to the shared Payment Link.
- Simulate Pro by setting `document.documentElement.dataset.proActive = 'true'` and dispatching `nw-pro-status-change`, then verify Pro controls enable and outputs use current logs.
