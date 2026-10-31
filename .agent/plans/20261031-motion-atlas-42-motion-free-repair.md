# ExecPlan — Motion Atlas 42-pattern free catalog and browser QA (2026-10-31)

## Intent
Improve the existing Motion Atlas; do not create a duplicate animation tool. Preserve its canonical ADS_DONATION classification: all current and newly added catalog/demos/compare/handoffs are free, with advertising and voluntary donations only.

## Declared scope
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/styles.css`
- `tools/motion-atlas/data/motions.json`
- `tools/motion-atlas/tests/behavior.test.mjs` (new)
- `tools/motion-atlas/tests/browser-smoke.mjs` (new)
- `scripts/check-tool-runtime-contracts-wave4.mjs` (update old paid-contract expectation)
- `.github/workflows/motion-atlas-browser-smoke.yml` (new dedicated Chrome QA; no runtime dependencies)
- `.agent/plans/20261031-motion-atlas-42-motion-free-repair.md` (this plan)

Outside scope: other tools, root site layout, shared monetization, payment/auth infrastructure, common-spec, production deployment config, archived files and apps.

## Steps / changes
1. Inspect the existing mainline Motion Atlas, per-tool docs, runtime and old Pro compatibility.
2. Materialize the 30 existing seed patterns into the previously empty bilingual JSON catalog with distinct descriptions, use and non-use cases, comparisons, AI prompts and implementation notes.
3. Correct count-up, stagger and stroke-draw demonstrations so they actually demonstrate the named technique.
4. Add 12 lightweight, replayable techniques from the supplied social post (burst, line draw, mask reveal, kinetic typography, easing comparison, overshoot, squash/stretch, morph, stylized liquid, motion trail, particles, parallax). Keep aliases to existing techniques for pop-in, typewriter and stagger.
5. Ensure all four-item comparison, prompts and Markdown/JSON file downloads work without Pro status. Remove obsolete purchase link and Pro gating in tool runtime.
6. Extend the existing wave-4 contract test to assert free compare and no paid lock. Add one tool-specific static behavior contract test and a Chromium smoke test that exercises English/Japanese page at wide and narrow layouts.
7. Require GitHub Actions audit, data checks, browser smoke and Cloudflare Pages preview to pass before considering production. Do not interpret the unrelated `url-title-proxy` Workers build as evidence about Motion Atlas.
8. Merge to main only after reviewing preview / checks, then verify production Cloudflare Pages deployment and the tool's public URL.

## Manual verification
- Desktop: inspect representative demo playback, pause/replay, count-up completion, stagger delays, line SVG stroke and new morph/particle examples.
- Smartphone: inspect at a true 390px viewport if possible; the current Chrome CLI uses a minimum 500px viewport despite requesting 390px, so this remains a known QA limitation.
- Check 42 search/filter entries, compare cap 4, local favorites, bilingual language links, reduced-motion setting, clipboard, Markdown/JSON download, AdSense/GA unchanged and donation links.
- Check for no Stripe purchase CTA and no locked action. Restore main state on regression.

## Status
Implementation and GitHub browser smoke test are recorded in PR #1399. Cloudflare preview and all Motion Atlas-specific checks passed at head `704af44485e03aa28cf59dde5fb82bcfaf9bcd4e`. The unrelated `url-title-proxy` Workers build failed. Production rollout and true 390px mobile test must be reported separately.
