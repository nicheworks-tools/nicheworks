# ExecPlan — TrashNavi search-result snippet alignment (2026-11-01)

## Objective
Improve the search-result snippet for the already published TrashNavi landing page, without altering data, municipal pages, routing, or tracking. GSC baseline (2026-10-02 to 2026-10-29): landing page /tools/trashnavi/ had 792 impressions, 2 clicks, ~0.25% CTR, average position ~8.73. This is an SEO hypothesis, not proof that metadata causes the observed CTR.

## Scope
- `tools/trashnavi/index.html`: only the page title, description and matching Open Graph/Twitter descriptions, plus one Japanese on-page intro sentence clarifying that users verify pickup dates on official municipal websites.
- `.agent/plans/trashnavi-snippet-ctr-20261101.md`: this plan.
- No other files; do not touch locale-specific municipality pages, sitemap, robots, JS logic, datasets, Google tags, analytics, donations, advertisements, or styles.

## Steps
1. Inspect the current landing page and analytics baseline.
2. Change snippet copy to explicitly cover the search intention "ゴミの日" while making clear that TrashNavi links to official municipalities rather than itself calculating pickup dates.
3. Verify expected old strings occur exactly, new HTML has one canonical, one each meta description and title, retains GA4/Cloudflare/AdSense tags and all existing municipal anchors, and does not alter other text.
4. Create a focused PR; run existing SEO checks. Merge only if checks and compatibility allow.

## Follow-up
Compare equivalent subsequent 28-day GSC page-level CTR/impressions/clicks and device mix; interpret changes cautiously due to ranking/query mix and seasonality.

## Rollback
Revert the metadata-only commit if regressions occur; preserve municipal data and indexing assets.
