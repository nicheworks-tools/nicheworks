# ExecPlan: AI Interaction Atlas Common Pro Integration

## Scope
- `tools/ai-interaction-atlas/`
- `tools/ai-interaction-atlas/ja/`

No files outside this tool scope will be changed except this plan file.

## Files expected to touch
- `tools/ai-interaction-atlas/index.html`
- `tools/ai-interaction-atlas/ja/index.html`
- `tools/ai-interaction-atlas/pro/index.html`
- `tools/ai-interaction-atlas/ja/pro/index.html`
- `tools/ai-interaction-atlas/app.js`
- `tools/ai-interaction-atlas/styles.css`
- `tools/ai-interaction-atlas/pro-bridge.js` (create or update)

## High-level steps
1. Inspect current AI Interaction Atlas Pro/UI implementation and existing scripts.
2. Add Common Pro bridge using `/assets/nw-pro.js` and `NWPro.getLocalStatus()`.
3. Add Pro preview/unlocked/failed status handling via shared `data-pro-*` attributes.
4. Add Pro handoff pack UI below the comparison tray for English and Japanese root pages.
5. Generate Product spec, Codex task, GitHub Issue, UX risk, Safety/fallback, Markdown, and JSON outputs from the selected pattern without external AI/API calls.
6. Preserve free search/filter/cards/details/2-item compare/basic copy behavior.
7. Enable 3–4 item comparison only when Common Pro is active while preserving the free 2-item comparison.
8. Update `/pro/` and `/ja/pro/` pages with Common Pro status, free/Pro differences, purchase explanation, and output samples.
9. Run residue searches and static/runtime checks.

## Manual verification steps for user
- Free state: search/filter/cards/details/2-item compare/basic prompt copy; verify Pro Preview and common Buy link.
- Pro state: activate Common Pro, verify Pro unlocked message, Pro outputs copy/export, and 3–4 item compare.
- Failure state: simulate unavailable `NWPro.getLocalStatus()` and verify free features remain available with failure message.
