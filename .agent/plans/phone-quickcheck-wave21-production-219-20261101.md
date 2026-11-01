# Phone QuickCheck Wave 21 — public full-parity and CMF material variants
Date: 2026-11-01

## Goal
Verify real https://nicheworks.app/tools/phone-quickcheck/ reflects 219 phones and all four Wave20 devices. Extend existing exact JSON equality production smoke to targeted provenance assertions and real Chrome DOM material variants, without touching production application logic.

## Scope
- scripts/check-phone-quickcheck-production.mjs — 4 new model-specific public JSON assertions and CMF Phone 1 list/search/detail material-specific 8mm/197g and 9mm/202g checks, run across Chrome 320/390/414/768/1280.
- tools/phone-quickcheck/COMPLETION_AUDIT.md — explain quality gate.
- .agent/plans/phone-quickcheck-wave21-production-219-20261101.md — this plan.

Retain existing exact JSON parity, model search, JP/EN, mobile sheet, desktop panel, no horizontal overflow and badge-close geometry. No data, other UI, specs, affiliate, billing, advertising, analytics, Cloudflare settings or other tools changed. No dependencies.

## Acceptance
CI PR must complete green including Phone QuickCheck production smoke. Live public JSON count exactly 219 and structurally deep-equal repo JSON. All four new model facts and both material variants rendered at all five widths; no page overflow or regressions. Only merge after checks pass.
