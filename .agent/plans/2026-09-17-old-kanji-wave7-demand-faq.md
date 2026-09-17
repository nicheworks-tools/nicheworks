# Old Kanji SEO Wave 7 — demand-backed FAQ for non-publishable individual queries

## Goal
Answer observed Google Search Console queries for characters that must not be turned into individual SEO pages under the current audited dictionary rules. Improve the existing Old Kanji Reference root rather than creating unsafe or duplicate character pages.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized enhanced-precision data for 2026-03-21 through 2026-09-16:

- `臨 旧字体`: 6 impressions, average position 11.83.
- `御 旧字体`: 4 impressions, average position 10.25.
- `魂 旧字体`: 4 impressions, average position 9.25.
- `霧 旧字体`: 2 impressions.
- Total observed demand covered by this wave: 16 impressions.
- These queries currently land on the Old Kanji Reference root rather than a safe dedicated character guide.

## Dictionary gate
Current repository audit state:

- `臨`: identity; not eligible for an individual SEO page.
- `魂`: identity; not eligible for an individual SEO page.
- `霧`: identity; not eligible for an individual SEO page.
- `禦 → 御`: unresolved; `seoSafe=false`; therefore `御` must not be published as an individual `御の旧字体=禦` guide.

The existing rule remains unchanged: `identity` and `unresolved` records cannot be published as individual-kanji SEO pages.

## Authority gate
Primary / authoritative sources checked before implementation:

1. Agency for Cultural Affairs, 常用漢字表の音訓索引
   - https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/joyokanjisakuin/
   - The current table shows `御`, `魂`, `霧`, and `臨` without a parenthesized Kangxi-dictionary form, unlike entries where such a form is explicitly shown.
2. Agency for Cultural Affairs, 常用漢字表「表の見方及び使い方」 / related guidance
   - Parenthesized forms in the table are so-called 康熙字典体 shown as reference forms; absence of such a form must not be expanded into a blanket claim that no historical variant exists.
3. Agency for Cultural Affairs, 同音の漢字による書きかえ
   - https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kakuki/03/pdf/doon.pdf
   - Shows `制馭（禦）→制御`; this is evidence for a historical word-level rewrite, not evidence that `禦` should be universally presented as `御`'s old form.

## Scope
1. Add four demand-backed questions to the existing visible FAQ:
   - 臨の旧字体は？
   - 御の旧字体は？
   - 魂の旧字体は？
   - 霧の旧字体は？
2. State only what the authoritative sources and current dictionary audit support.
3. For `御`, explicitly avoid the unsafe equation `御の旧字体=禦` and explain the `制禦→制御` word-level evidence.
4. Add the same four questions to the existing FAQPage structured data.
5. Refresh only the existing Old Kanji Reference root sitemap `lastmod`.

## Explicit exclusions
- No new individual-kanji page.
- No dictionary change.
- No conversion-logic change.
- No reclassification of identity or unresolved records.
- No mass/programmatic SEO.
- No unrelated tools.
- No CI weakening.

## Validation
- Four visible FAQ questions and four structured-data questions are present exactly once.
- No text states that `禦` is universally the old form of `御`.
- No new `/kanji/` page is created.
- Old Kanji Reference root canonical remains unchanged.
- Sitemap contains the root once with `lastmod=2026-09-17`.
- Repository CI passes.
- Re-read latest main and PR mergeability immediately before squash merge, especially because PR #1127 also touches the root and sitemap.
