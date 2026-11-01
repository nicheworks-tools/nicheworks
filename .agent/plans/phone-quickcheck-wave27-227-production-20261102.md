# Phone QuickCheck Wave27 — prove 227 FCNT phones deployed on real public site
Date: 2026-11-02

## Goal
After Wave26 merged 223→227 first-party Japan phone model records, prove public Cloudflare Pages is actually serving them and rendering the correct accessory affiliate classes, not merely showing source CI green.

## Scope
- scripts/check-phone-quickcheck-production.mjs: assert four exact new model battery/year/charging/box facts, domestic Qi-negative for Be3/Be4. Retain entire canonical phones JSON deep-equality, 22 accessory class parity, user-visible desktop/mobile Chrome five viewport search, JA/EN, responsive and affiliate checks; add F-51A user journey and tracked 3 links, Be3 user journey with no unsourced PD.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: log gate.
- .agent/plans/phone-quickcheck-wave27-227-production-20261102.md: plan.

Do not edit phone data, apps, external tracking, common spec, advertisement slots, donations, unrelated tools or deployment config.

## Acceptance
PR-triggered production smoke must fetch the public site, confirm count 227 and exact canonical JSON, then pass all five real Chrome widths, link presence, tagged destinations and model facts; all PR CI green before merge. If Pages rollout is still in progress use the existing bounded retry rather than announcing success prematurely.
