# Old Kanji SEO Wave 6 — 計画 / 計畫 destination consolidation

## Goal
Route observed Google Search Console demand for `計画 旧字体` to the existing audited `画 / 畫` guide instead of creating another page or duplicating the same answer on a new URL.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized enhanced-precision data for 2026-03-21 through 2026-09-16:

- `計画 旧字体`: 11 impressions, 0 clicks, average position 9.0909.
- All 11 impressions currently land on `/tools/old-kanji-reference/`.
- A query restricted to `/tools/old-kanji-reference/kanji/` returns no rows for the same 180-day period, so the existing `/kanji/ga-kaku/` guide has not yet captured Search Console demand.

## Dictionary and source gate
- Repository dictionary: `畫 → 画`.
- The existing `ga-kaku` page is already source-backed and states `計画 → 計畫`.
- Primary source: Agency for Cultural Affairs / 常用漢字表 presents `画（畫）` and includes `計画` among the examples for 画.
- The 常用漢字表 usage notes explain that the parenthesized form is the so-called Kangxi-dictionary type shown to indicate its relationship with the current form.

## Scope
1. Keep the existing canonical URL `/tools/old-kanji-reference/kanji/ga-kaku/`.
2. Reorder the Japanese title/H1/article headline so the observed query intent `計画 旧字体` is answered first, while preserving the `画 / 畫` explanation.
3. Change the Old Kanji Reference root anchor to explicitly name `計画の旧字体は計畫` and keep it pointing to the existing guide.
4. Add one contextual link from Kanji Modernizer to the same guide next to the existing `畫→画` example.
5. Refresh only the existing `ga-kaku` sitemap lastmod.

## Explicit exclusions
- No new individual-kanji or compound page.
- No dictionary change.
- No conversion-logic change.
- No mass pSEO.
- No unrelated tools.
- No CI weakening.

## Validation
- Canonical URL remains unchanged.
- `ga-kaku` remains the only destination for this guide.
- Root and Modernizer links both resolve to the canonical guide.
- Primary-source wording remains accurate and does not imply legal/registry authority.
- Sitemap contains the canonical guide once with `lastmod=2026-09-17`.
- Run repository CI and re-read latest main plus mergeability before squash merge.
