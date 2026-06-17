# PR #492 common repair status

## Schedule position

- PR #482–#491: merged
- PR #492: completed in branch, pending merge
- PR #493–#496: planned operational tool batches
- PR #497: planned final publication checks

## Completed changes

- Added `scripts/audit-common-breakage.mjs` to detect known shared HTML regressions.
- Added the common breakage audit to the SEO audit workflow.
- Repaired 27 public HTML pages:
  - 20 invalid `stable content` placeholder attributes
  - 7 malformed AdSense loader URLs
- Fixed the malformed AdSense loader URL on Construction Tools Atlas.
- Added static category navigation to the Japanese and English home pages.
- Added `/en/categories/` and linked the Japanese and English category pages.
- Repaired malformed JSON field boundaries across the Construction Tools Atlas quality packs.
- Removed 334 deterministic duplicate records across the Construction Tools Atlas base and quality packs.
- Updated duplicate and dedupe scripts so CI can report concise results while preserving one-record-per-line JSON formatting.

## Verification

- Common HTML breakage audit: passed
- Strict SEO audit: passed
- Construction Tools Atlas duplicate audit: passed
- Construction Tools Atlas data validation: passed in both validation workflows
- Duplicate IDs after repair: 0
- Duplicate exact JA+EN terms after repair: 0

## Publication note

The Japanese and English category pages remain `noindex,follow` in this PR. Their index activation and sitemap registration should be performed together during the final publication pass so strict SEO and sitemap state remain consistent.

The `url-title-proxy` deployment failure remains outside this repair flow.
