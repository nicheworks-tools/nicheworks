# ExecPlan — Screenshot Collector PR1 (2026-10-31)

## Scope
Only `apps/screenshot-collector/` and this plan file. No changes to existing tools, common specs, deployment, CI, billing or site navigation.

## Goal
Implement a local-only Chromium Manifest V3 proof of concept comparing two capture engines: CDP Page.captureScreenshot (debugger permission) and captureVisibleTab plus scroll/stitch. Determine real-browser feasibility before selecting production architecture.

## Steps
1. Inspect main, AGENTS.md and existing Screenshot Stitcher.
2. Add MV3 extension with separate management tab, per-origin permission prompt, one temporary capture tab and local-only image handling.
3. Implement bounded lazy-load preparation and both capture methods; surface permission failures rather than broadening permission silently.
4. Add deterministic tall-page fixture, QA matrix and README.
5. Run static validation; real Chromium visual/permission tests are required for PASS.
6. Keep free-first architecture; do not implement payment, account, artificial page cap, crawler, ZIP or mother-site registration.

## Risks and gates
- captureVisibleTab may not work with origin-scoped permissions on a new tab; do not claim support without evidence.
- debugger is mandatory, privileged and may be denied by enterprise policy.
- Lazy-load, fixed/sticky elements, screenshot dimensions, redirect origin, and long pages require real-browser QA.
- This is PR1 only. Never publish or merge until capture evidence is recorded.
