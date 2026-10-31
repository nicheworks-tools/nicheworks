# ExecPlan: Motion Atlas actual production and 390px mobile verification

Date: 2026-10-31

## Objective
Close the two known verification gaps after PR #1399: Cloudflare production content must be exercised directly; Chrome's 390px command-line window was actually a 500px layout viewport.

## Scope
- `tools/motion-atlas/tests/production-viewport.test.mjs` (new)
- `.github/workflows/motion-atlas-production-viewport.yml` (new)
- `.agent/plans/20261031-motion-atlas-production-mobile-qa.md` (this plan)

No changes to Motion Atlas product code, HTML, monetization, shared specifications or deployment settings.

## Steps
1. Use Node 22 WebSocket and Chrome DevTools Protocol (without third-party dependencies) to set an exact 390x844 CSS viewport with mobile emulation and compare with 1280px desktop.
2. Browse the publicly deployed `https://nicheworks.app/tools/motion-atlas/` and `ja/`, not the repository checkout or a mocked local server.
3. Check 42 loaded cards, filtering/reset, 4-way compare, paid-lock absence, count-up completion, mask reveal, reduced-motion fallback, and horizontal overflow.
4. Run a GitHub Actions workflow with results for all four language/viewport combinations.
5. On failures, distinguish test-harness errors, live deployment errors, and real responsive layout bugs; fix only proven issues in a subsequent scoped PR.
6. Keep an explicit warning if only a browser emulator, not a physical device, was used.

## Completion criteria
All four scenarios pass on GitHub Actions against the public URL and report an exact 390px or 1280px measured `window.innerWidth`; public page and catalog must actually load. If blocked, do not claim production/browser QA passed.

## Restrictions
No new dependencies. No additional paid locks. Existing NicheWorks `ADS_DONATION` plan remains unchanged.
