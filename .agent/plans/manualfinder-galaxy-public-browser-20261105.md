# ExecPlan — ManualFinder × Phone QuickCheck public-browser referral QA (2026-11-05)

## Goal
Guard the existing four verified Japan/Docomo Galaxy referral links against deployment and rendering regressions. Do not change the 255-phone dataset, Amazon tracking ID, unsupported S24 FE routing, layout or language support.

## Scoped files
- `scripts/check-phone-quickcheck-production.mjs` — add real Chromium rendering/link click checks for the ManualFinder Japanese and English pages.
- `.github/workflows/phone-quickcheck-production-smoke.yml` — trigger on applicable ManualFinder funnel changes, without adding dependencies or deployment settings.

## Implementation
1. Preserve the current 5-viewport Phone QuickCheck coverage.
2. Navigate to deployed ManualFinder in Chromium for Japanese and English, wait until the directory has loaded.
3. Search each exact Samsung SKU, assert the corresponding visible card leads to the verified Phone QuickCheck SEO page. Ensure S24 FE does not auto-link.
4. Click the A23 referral in each locale and assert it navigates to the expected on-site product guide. Validate the coarse GA4 event contract without forwarding user input.
5. Run static verification through existing affiliate CI, then production-browser smoke CI, review failures, merge only after passing.
6. Re-check production run on the merged main SHA. If public deployment remains stale, report it rather than claiming completion.

## Privacy / monetization constraints
- No query strings, full SKU, personal identifiers or device identifiers in GA4 payloads.
- Retain `nicheworks09-22`, `rel="sponsored noopener noreferrer"` and the existing disclosure.
- Never equate affiliate clicks with actual Amazon orders or commission.
