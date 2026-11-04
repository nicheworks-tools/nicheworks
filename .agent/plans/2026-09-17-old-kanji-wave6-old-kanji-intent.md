# Old Kanji SEO Wave 6 — 旧漢字検索 / 旧漢字一覧

## Goal
Improve the existing Old Kanji Reference root for observed Google Search Console demand using the wording `旧漢字`, without creating a new page family or changing dictionary semantics.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized enhanced-precision data for 2026-03-21 through 2026-09-16.

Observed root-page demand includes:

- `旧 漢字 一覧`: 4 impressions, 0 clicks, average position 49.25.
- `旧漢字一覧`: 2 impressions, 0 clicks, average position 46.5.
- `旧 漢字 検索`: 4 impressions, 0 clicks, average position 54.75.
- `旧漢字 検索`: 3 impressions, 0 clicks, average position 50.33.
- `旧 漢字`: 2 impressions, 0 clicks, average position 76.5.
- `旧漢字`: 1 impression, 0 clicks, average position 18.

The dedicated Old Kanji Reference root is already the landing page for these queries, but its primary Japanese title/H1 explicitly says `旧字体検索・旧字体一覧` and does not surface the observed `旧漢字` wording.

## Decision
Keep the same canonical root and functionality. Extend the existing search/list language so `旧漢字` is explicit in the title, descriptions, H1, search section, and list heading. Do not create a duplicate `旧漢字` landing page.

## Scope
1. Update `tools/old-kanji-reference/index.html` only where needed to align Japanese metadata and visible headings with both `旧字体` and `旧漢字` demand.
2. Keep the canonical URL unchanged.
3. Preserve all current search, filter, detector, export, quiz, affiliate, analytics, ad, language-switch, and individual-guide behavior.
4. Update only the existing Old Kanji Reference root `lastmod` in `sitemap.xml` to `2026-09-17`.
5. Do not change dictionary data, conversion logic, individual-kanji pages, name/place tools, OCR behavior, billing, or unrelated tools.

## Content constraints
- `旧漢字` is treated as observed user search wording; do not invent a new linguistic classification or claim that it is an official technical category.
- Do not make new historical, legal, registry, or name-authority claims.
- Do not imply every listed record is a strict old-to-modern one-to-one pair.
- Preserve existing caveats and FAQ semantics.

## Validation
- Title/H1 explicitly include both `旧字体` and `旧漢字` while remaining readable.
- Search and list headings include the observed wording without duplicating sections.
- Canonical, robots, GA, AdSense, Cloudflare beacon, OG/Twitter metadata, WebApplication JSON-LD and FAQPage JSON-LD remain present.
- Existing Old Kanji Reference root URL appears once in `sitemap.xml` with `lastmod=2026-09-17`.
- Final diff contains only this ExecPlan, the root HTML, and sitemap.
- Run repository CI without weakening checks.
- Re-read latest `main` and PR mergeability immediately before squash merge.