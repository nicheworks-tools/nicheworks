# Phone QuickCheck mobile detail header collision — 2026-10-31

## Reproduction
Public Chrome 320px and 390px screenshots show the status badge overlaying the X close button on the bottom sheet; DOM/no-horizontal-overflow assertions do not catch it.

## Scope
- tools/phone-quickcheck/style.css: mobile breakpoint only; reserve 46px on bottom sheet detail-title right side, preserving 32px close touch target.
- scripts/check-phone-quickcheck-responsive-contract.mjs: test the expected clearance rule.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: trace screenshot discovery and fix.

No changes to data, count, common spec, advertisements, affiliate, analytics, unrelated tools or deployed routing. No dependencies added.

## Quality gate
CI must pass, then merge; main push reruns real-production browser test and screenshots. Follow-up add actual bounding-rectangle non-overlap assertion after the CSS fix is deployed.
