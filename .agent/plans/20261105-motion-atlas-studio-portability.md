# ExecPlan — Motion Atlas Studio non-billing completion (2026-11-05)

## User decision
- Motion Atlas Studio future price is **JPY 980, one-time**. This is an approved planning amount, **not** a live Stripe price.
- Billing/checkout activation is explicitly deferred until the ongoing GitLab migration has completed. Do **not** set an active Stripe Price ID, enable checkout, migrate production billing, or accept real payments here.
- The 42-motion free Motion Atlas catalogue and all existing free outputs remain free.
- Deployment cutover is a separate workstream. Keep this feature change limited to this repository; do not alter another deployment project or expose account-to-account relationships in public documentation.

## Goal
Close non-billing gaps in Studio as a usable motion-composition editor. Local preset persistence alone is not portable across devices or hosting migration. Add self-contained project export/import with strict schema and visible error handling, then expand usability tests.

## Scope
- `tools/motion-atlas/studio/studio.js`
- `tools/motion-atlas/studio/index.html`
- `tools/motion-atlas/ja/studio/index.html`
- `tools/motion-atlas/studio/studio.css`
- `tools/motion-atlas/tests/studio-browser.test.mjs`
- `tools/motion-atlas/tests/studio-contract.test.mjs`
- `.agent/plans/20261105-motion-atlas-studio-portability.md`

## Requirements
1. Export and import a stable, versioned JSON project containing only preview text and validated effect tracks. No browser keys, sessions, history, billing data or user identifier.
2. Preserve track order, delay, duration and easing, with EN/JA labels and meaningful errors.
3. Reject malformed JSON, unknown versions/effects/easings, invalid timings, oversized data and excessive track count without mutating the current project.
4. Fix malformed browser-local saved preset loading to avoid corrupting the active editing state.
5. Maintain all existing Studio features: WAAPI preview, reduced-motion fallback, local presets, separate CSS/React/Markdown paid code exports, checkout disabled.
6. Automated browser QA at actual 390px and 1280px, both locales; independent full free Atlas and billing checks. Cloudflare Pages preview success before merge.

## Out of scope / honest completion
No claim that a payment product is fully completed until real Stripe checkout, webhook refund/recovery and GitLab target deployment are tested. Physical handset accessibility/gesture usability still requires a final device check; tests are browser-emulated.
