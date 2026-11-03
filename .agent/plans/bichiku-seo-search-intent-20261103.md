# BichikuCheck search SEO execution — 2026-11-03

Status: organic-search foundation, **no changes to readiness calculations or shopping interactions**.

## Verified search intent and positioning

- Head: 防災備蓄リスト / 防災備蓄チェック / 備蓄品リスト; English emergency stockpile checklist Japan; Chinese 防灾备蓄清单; Vietnamese dự trữ thiên tai tại Nhật.
- Differentiation: household owned quantities, ordinary groceries, conditional substitutes, power and water outage suitability, and selected deficits. Do not claim to be an official agency or to verify safety of individual products.
- Competition: Tokyo's official stockpile navigation already supports household composition, shortage estimates and shopping, so avoid claiming unique possession of those generic functions.
- Grounded references:
  - National guidance: https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html ; at least 3 days, preferably a week, drinking/cooking water ~3L/person/day.
  - Tokyo everyday stockpiles: https://www.bousai.metro.tokyo.lg.jp/1028036/1028901/1008042/1008079/1008086.html ; ordinary foods can complement dedicated supplies.
  - Consumer Affairs Agency: https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063/ ; caution on generators, cassette stoves, batteries.
  - Google titles: https://developers.google.com/search/docs/appearance/title-link
  - Google people-first content: https://developers.google.com/search/docs/essentials
  - Google locale links: https://developers.google.com/search/docs/specialty/international/localized-versions

## Changes in this PR

1. Rewrite four locale-specific HTML titles, descriptions, OG/Twitter metadata, WebApplication JSON-LD language and description, and first heading/introduction, all aligned with existing functionality.
2. Add substantive **static, visible, crawlable** guide sections below the interaction: sample 2 people × 7 days (42L water, 42 staple portions, 70 portable toilet uses under **this tool's planning assumptions**), actual grocery/substitute limitations, four-step instructions, authoritative references. These are independent of dynamic JS results. Avoid keyword-stuffed or near-empty gateway pages.
3. Preserve all 4 self-canonicals, 5 hreflang values (including ja x-default), and existing index,follow metadata; remove literal backslash+n between two alternate links.
4. Add direct static HTML links from JA/EN NicheWorks main pages and JA/EN category indexes with relevant descriptive anchor text.
5. Synchronize shared tool metadata and generated tool index so later generator runs retain the SEO terms.
6. Add a dedicated Node SEO contract test, plus existing sitewide strict SEO and 12+ Playwright UI smoke scenarios.

## Search baseline and timing

Internal owner-managed analytics spreadsheet: \`NicheWorks｜検索・アクセス解析（日次）\` (Google Sheet ID \`173S9-lYe45_kLr0nFDX-s5WxH_T_k8sDYGrMorwG5bE\`).
Read at 2026-11-03 08:26 JST, **GSC reporting period 2026-10-04 to 2026-10-31**. Sitewide totals: 239 clicks, 13,333 impressions in 28 days; this period **precedes BichikuCheck launch**. It must NOT be cited as traffic attributable to this newly launched tool.

After indexing, check (1) indexed/crawled status for each of four URLs, (2) impressions and query mix by exact landing path, (3) CTR for relevant terms when impressions are sufficient, (4) Google search click-throughs to tool page vs GA4 landing sessions; avoid inferring conversions from link visibility, (5) only then title iteration. The Google search results are not guaranteed to use the exact meta description. Allow data lag before interpreting zeros. No manufactured search volume, SERP rank or customer acquisition claim.

## Publication checks

- 4 individual HTML files indexable, self-canonical, correct reciprocal hreflang and language.
- Each static guide includes sourced 3-day/week guidance, separate planning assumptions for food/toilets, and household substitute limitations.
- Link from both homepage language variants and both accessible category indexes.
- JS calculator, option data, affiliate helper, safety UI and donation URLs are unchanged.
- Count of canonical tools unchanged at 90. No increase in AdSense slots, no new affiliate targets.
- CI: Node \`node --test tools/bichiku-check/tests/*.test.cjs\`, Chromium at 320/360/375/390/414/768/1280 and JA/EN/ZH/VI, sitewide SEO integrity checks.
