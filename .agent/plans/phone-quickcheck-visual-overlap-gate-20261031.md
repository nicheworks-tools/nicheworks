# Phone QuickCheck — production close-button geometry regression, 2026-10-31

## Inputs and observed defect
Actual deployed Chrome screenshots from PR #1445 showed Quick Check header badge overlapping the × close control at mobile widths 320/390. PR #1446 reserved 46px in mobile .bottom-sheet .detail-title and passed source CI; it was merged to main.

## Scope
- scripts/check-phone-quickcheck-production.mjs: require newly deployed CSS rule; in real Chrome on four mobile/tablet widths compare badge and close-button DOM rectangles and assert no overlap, preserving 32x32 minimum close target.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: add measured screenshot/regression evidence.
- .agent/plans/phone-quickcheck-visual-overlap-gate-20261031.md: this scope.

No changes to tool UI, counts, data, common spec, ads, affiliate, analytics, or other tools; no dependencies.

## Validation
PR triggers live production smoke (5 viewports), using the publicly deployed CSS and model data, before merge. Failing public browser outcome requires investigation, not bypass. After merge the smoke remains automated on relevant main pushes.
