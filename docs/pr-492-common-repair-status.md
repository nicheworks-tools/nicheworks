# PR #492 common repair status

## Schedule position

- PR #482–#491: merged
- PR #492: current common residual repair and navigation work
- PR #493–#496: planned operational tool batches
- PR #497: planned final publication checks

## Changes

- Added `scripts/audit-common-breakage.mjs` to detect known shared HTML regressions.
- Added the common breakage audit to the SEO audit workflow.
- Fixed the malformed AdSense loader URL on Construction Tools Atlas.
- Added static category navigation to the Japanese and English home pages.
- Added an English static category page and linked the Japanese and English category pages.

## Publication note

The Japanese and English category pages remain `noindex,follow` in this PR. Their index activation and sitemap registration should be performed together during the final publication pass so strict SEO and sitemap state remain consistent.

The `url-title-proxy` deployment failure remains outside this repair flow.
