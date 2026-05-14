# ExecPlan: Minutes to Ops completion check after #314

## Scope
- Target only: `tools/minutes-to-ops/`
- Do not edit common specs, shared Pro assets, deployment settings, or unrelated tools.

## Files expected to inspect
- `tools/minutes-to-ops/index.html`
- `tools/minutes-to-ops/app.js`
- `tools/minutes-to-ops/pro-bridge.js`
- `tools/minutes-to-ops/style.css`
- Existing docs/FAQ pages under `tools/minutes-to-ops/` if needed for purchase persistence wording.

## High-level steps
1. Inspect current Minutes to Ops implementation and common Pro wiring.
2. Run static searches for requested leftovers:
   - `stable content`
   - `REPLACE_STRIPE_PAYMENT_LINK`
   - `manualProBtn`
   - `payBtn`
   - `Pro予定`
   - `準備中`
   - `未実装機能`
3. Serve the static site locally and use browser automation or lightweight DOM checks to verify:
   - `/tools/minutes-to-ops/` opens without console errors.
   - Free workflow works: paste minutes, generate, extract ToDo/decisions/SOP, previews, downloads, copy actions.
   - Preview/locked Pro state uses common Payment Link and shows expected gated UI.
   - Simulated unlocked Pro state persists across reload and enables history, comparison, output pack, GitHub Issue, Codex task, and SOP handoff copy/generation.
4. Apply the smallest fixes necessary inside `tools/minutes-to-ops/` only.
5. Re-run relevant checks and searches.
6. Commit changes and create PR.

## Manual verification for user
- Open `/tools/minutes-to-ops/` in production/staging.
- Confirm common Pro unlock remains active after visiting `/pro/unlock/?session_id={CHECKOUT_SESSION_ID}` and reloading Minutes to Ops.
- Confirm generated CSV/Markdown contents match expected operational output for real meeting notes.
