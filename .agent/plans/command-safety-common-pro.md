# ExecPlan: Command Safety Checker Common Pro Integration

## Scope
- Target only: `tools/command-safety-checker/`
- Do not modify common specs, assets, deployment, or other tools.

## Files to touch
- `tools/command-safety-checker/index.html`
- `tools/command-safety-checker/pro-bridge.js`
- `tools/command-safety-checker/style.css`
- `tools/command-safety-checker/pro.html`
- `tools/command-safety-checker/app-core.js` only if needed to confirm the free result contract; no Pro gating here.

## High-level steps
1. Inspect current Command Safety Checker structure, existing shared Pro bridge, and free app result API.
2. Strengthen `pro-bridge.js` so active Pro exports produce a practical handoff pack: full Markdown report, priority checklist, safer command suggestions, Codex task, GitHub Issue draft, and structured JSON.
3. Keep `/assets/nw-pro.js` + `pro-bridge.js` as the only Pro connection and keep free check behavior independent from Pro status.
4. Update `index.html` preview, FAQ, and Pro copy so inactive users see concise samples and active users see enabled Pro actions only.
5. Update `pro.html` with shared Pro explanation, purchase/activation notes, samples, and the safety-guarantee disclaimer.
6. Add only minimal CSS for Pro preview/active/action/sample blocks while preserving the existing free checker UI.
7. Run syntax checks, residue searches, and targeted static/manual verification commands, then commit changes and create a PR record.

## Manual verification for user
- Open in private browsing and confirm Preview mode plus free checks work.
- Confirm Buy Pro points to `https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209` and Pro-only blocks are hidden while inactive.
- Complete `/pro/unlock/?session_id=...` in a browser and confirm common Pro remains active via `/assets/nw-pro.js` local status.
- Run a free check, then confirm Copy Pro Review Report, Save Markdown Review, Copy Codex Safety Check Task, Copy GitHub Issue, Export JSON, and Export Markdown work while active.
- Confirm Pro action buttons show a toast and do not save empty files when no free check has been run.
- Clear site data and confirm Preview mode returns.
