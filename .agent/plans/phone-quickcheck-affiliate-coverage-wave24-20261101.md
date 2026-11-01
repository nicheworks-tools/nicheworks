# Phone QuickCheck Wave 24 — Fix affiliate coverage gaps from model growth
Date: 2026-11-01

## Current audit
- 223 published phone records. All have a physical charging connector and at least the standard cable and power-bank class in the dynamic `accessoryKeysFor` classifier.
- 20 static, maintained accessory classes are mapped to verified fixed-query Amazon JP tagged-search offers via existing `nicheworks09-22` tag. `affiliateKeys: []` and `amazonUrl: null` are intentionally unused in the current dynamic workflow, not zero affiliate links.
- Evaluated classifier yields 719 potential affiliate CTA placements across 223 phone detail panels (not impressions, clicks, sales, or distinct retail products). Four newest FCNT phones had two each.
- 25 phones advertise source-backed USB-PD support, have no included adapter and no manufacturer-verified charger recommendation wattage. These were missing a charger search CTA, despite likely purchaser intent. Two source-backed 90W recommended FCNT phones were receiving an overly coarse 45W+ class.

## Scope
- tools/phone-quickcheck/app.js: add generic USB-PD *unknown wattage* CTA only when manufacturer supports USB-PD, `wiredRecommendedW` is unknown and adapter explicitly not included. For source-backed `wiredRecommendedW >= 90`, choose 90W+ charger search class, not existing 45W+ fallback. Neither case infers device-side maximum charging or PPS.
- tools/phone-quickcheck/data/accessories.json: two new maintained, bilingual accessory classes with clear safety/compatibility language, not Amazon retail product URLs.
- tools/phone-quickcheck/affiliate-config.js: two fixed, sanitized Amazon.co.jp search queries with existing verified Associates tracking ID, existing helper and explicit disclosure; no user free-text, no personal data.
- tools/phone-quickcheck/tests/behavior.test.mjs and scripts/check-phone-quickcheck-affiliate.mjs: deterministic contract tests for source-backed mapping, no false 20W claim, 90W class, valid Amazon URL and tag; existing behavior preserved.
- tools/phone-quickcheck/SPEC.md and COMPLETION_AUDIT.md: maintain developer contract and measured non-revenue metrics.
- .agent/plans/phone-quickcheck-affiliate-coverage-wave24-20261101.md: this plan.

No changes to shared assets/common specs, other tool pages, production domains, charging data/provenance, AdSense, donation, GA4 or affiliate tracking tag. No external dependencies and no extra ad slots.

## Gate
PR: Phone QuickCheck affiliate check, data/source/completion/behavior/responsive, SEO/runtime CI all green. Merge. Then run real public Chrome smoke to confirm 22 classes and live CTAs for We3 and Alpha2 with valid external href, tag, rel=sponsored, user-controlled click only, disclosure on desktop and mobile. Never count potential links as affiliate income.
