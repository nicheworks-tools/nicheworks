# ExecPlan — CSV Tidy browser acceptance (2026-10-31)

## Goal

Resolve the *environment-blocked* real-browser acceptance evidence for CSV Tidy without reopening its G1–G9 correctness wave or changing product behavior. NicheWorks GitHub `main` is the source of truth; PR #1307 remains merged and accepted programmatically.

## Scope / permitted edits

- `tools/csv-tidy/tests/browser-acceptance.html`: browser-only in-page harness against production `../index.html`.
- `.github/workflows/csv-tidy-browser-acceptance.yml`: scoped CI runner which serves the static root and exercises installed Chromium/Chrome.
- This ExecPlan only (`.agent/plans/csv-tidy-browser-acceptance-20261031.md`).

No changes to `tools/csv-tidy/app.js`, `complete.js`, `index.html`, `style.css`, other tools, assets, shared specifications, deploy settings, or main branch. No new JS/NPM dependencies. Use built-in browser File/DataTransfer APIs, the existing production page and browser download, Python standard-library CSV for independent output validation.

## Verification

1. Load actual CSV bytes through browser file input.
2. Verify actual populated preview, editing/renaming/exclusion, download enabled and resulting downloaded bytes independently reparsed.
3. Verify EN/JA toggle and keyboard focus.
4. Check viewport overflow for 1440, 1024, 768, 375, and 320px.
5. Verify failed replacement with malformed quotes disables export; next valid load recovers.
6. Record first-party page/script errors; do not classify blocked third-party ad/analytics requests as product failures.
7. Run on pull request to GitHub (not Work), inspect CI logs, refine only harness/CI if needed.

## Acceptance boundary

Passing this small browser suite establishes browser evidence for its named scenarios, not full device/browser certification or a guaranteed upper performance bound. Download must occur on disk, be independently reparsed, and preserve the specified values. Any missing Chrome/Actions capability is BLOCKED, not an automatic product FAIL. Keep PR draft until CI has been inspected. Do not merge on an unverified assumption.

## Monetization follow-up (not in implementation scope)

Inspect existing `assets/nw-pro-entitlement.js` and server billing contract before proposing reuse for CSV Tidy. No checkout/product pricing UI, new payment routes, subscription, instrumentation, user data transfer, or Pro feature implementation is authorized by this browser acceptance ExecPlan.
