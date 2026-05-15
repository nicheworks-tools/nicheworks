# UI Atlas PR2 — Pro Generator 5-mode implementation

## Scope
- Target tool: `tools/ui-atlas/` and `tools/ui-atlas/ja/` Pro pages.
- Primary implementation file: `tools/ui-atlas/pro-generator.js`.
- Reference-only files: `tools/ui-atlas/pro/index.html`, `tools/ui-atlas/ja/pro/index.html`, `assets/nw-pro.js`, and relevant docs.
- No changes to free catalog data, compare limits in `app.js`, Stripe/Webhook/D1, or common spec files.

## Files to touch
- `tools/ui-atlas/pro-generator.js`.

## High-level steps
1. Inspect current Pro Generator loading, Pro status checks, URL param handling, copy flow, and bilingual behavior.
2. Refactor the generator JS to render a responsive 5-mode UI with shared EN/JA labels.
3. Implement Markdown section builders for Decision Memo, Multi-Pattern Compare, Codex/GitHub Issue Prompt, Acceptance Criteria, and Full Markdown Export.
4. Wire Common Pro status through `/assets/nw-pro.js` and `NWPro.getLocalStatus()`, with Preview vs Full output behavior.
5. Add copy/export controls for all requested Markdown sections plus JSON export.
6. Preserve and extend URL parameter initialization for `pattern`, `ui`, `slug`, `compare`, `goal`, `use_case`, `risk`, `avoid`, `context`, and `device`.
7. Search for listed legacy/pro-placeholder remnants near the generator and correct any in-scope issues.
8. Run syntax/static checks and targeted residual searches.

## Manual verification for the user
- Open `/tools/ui-atlas/pro/` and `/tools/ui-atlas/ja/pro/`.
- Confirm all 5 modes switch visibly and generate localized output.
- Test inactive preview behavior with 3+ compare candidates.
- Unlock Common Pro in the browser and confirm Full output has no Preview marker and compare accepts up to 5 candidates.
- Test URL parameters such as `?pattern=Modal&compare=modal,toast,drawer&goal=Checkout&risk=dropoff&context=Mobile&device=mobile`.
- Verify copy buttons, Markdown download, and JSON download.
