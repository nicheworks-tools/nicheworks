# Phone QuickCheck Wave 23 — 223 phone FCNT production parity proof
Date: 2026-11-01

## Goal
Establish that Wave 22 FCNT four-model backfill is live on Cloudflare Pages, not just in GitHub main. Protect exact Japanese SKU source semantics with targeted asserts and test the actual phone selection UI.

## Scope
- scripts/check-phone-quickcheck-production.mjs: four new FCNT exact-model public JSON facts, including proper USB PD revision, wattage/PPS unknown, excluded charging accessories; real Chrome search/detail on arrows We3 M09 at all five widths.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: record acceptance gate.
- .agent/plans/phone-quickcheck-wave23-fcnt-223-live-20261101.md: plan.

Don't modify model data/UI, old validations, shared specification, advertising, analytics, affiliate, routing, deployment or other tools. No new packages.

## Gate
PR production browser smoke must fetch HTTP 223 verified phones, full checked-in JSON equality and five Chrome viewports with the extended FCNT checks. Other PR CI green required, then merge. Failure to reach public site is investigated, not labeled as success.
