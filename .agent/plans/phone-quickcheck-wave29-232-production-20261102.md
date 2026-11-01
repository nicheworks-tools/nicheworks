# Phone QuickCheck Wave29 — live 232-phone rollout and affiliate parity
Date: 2026-11-02

## Objective
After Wave28 merged 227→232 source-backed Japanese FCNT marketed phones, independently verify the live Cloudflare Pages site, real end-user mobile/desktop model selection and source-backed Amazon accessory link behavior. No production app/data changes in this PR.

## Scope
- scripts/check-phone-quickcheck-production.mjs: HTTP 232 count and exact full JSON parity (existing), five targeted new model battery/packaging/charging/official Qi-negative assertions, live Chrome search and select all 5 across 320/390/414/768/1280px, actual Amazon Associates tag and no unsupported PD upsell.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: Wave29 gate.
- .agent/plans/phone-quickcheck-wave29-232-production-20261102.md: this plan.

## Acceptance
PR-triggered public browser workflow must show `HTTP PASS: 232 verified public phones`, `Wave28 FCNT PASS` for all 5 viewports, and other Phone QuickCheck tests green. Global unrelated Screenshot Canvas SEO/spec checks are separately tracked and must not be misreported as source data failures. No added pages, ads, affiliate links by user input or conversions invented.
