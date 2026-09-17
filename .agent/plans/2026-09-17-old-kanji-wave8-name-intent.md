# Old Kanji Wave 8 — name / family-register search intent

## Baseline
- Start from current main `e7af01e3bdd77f736ecccf0f2ac8a70cc4e82d3a`.
- Scope is limited to the Old Kanji cluster, specifically Old Kanji Reference and Name Old Kanji Checker.

## Search-demand evidence
Google Search Console, 180-day query/page export for `sc-domain:nicheworks.app` shows name/family-register intent landing on Old Kanji Reference rather than the dedicated checker:
- `戸籍 旧字体 一覧`: 3 impressions, position 1
- `旧 字体 名前 一覧`: 1 impression, position 49
- `旧 漢字 名前`: 1 impression, position 80

## Decision
Do not create new programmatic SEO pages. Route this existing intent to the already-published Name Old Kanji Checker and make that page's purpose explicit.

## Changes
1. Improve Name Old Kanji Checker title, description, H1 and structured-data copy around name / old-form / variant lookup.
2. Add a visible explanation that the tool is a candidate/reference checker and does not determine the legally registered glyph.
3. Link to the official Legal Affairs Bureau `戸籍統一文字情報` search as the authoritative follow-up for official-use checks.
4. Add one internal link from Old Kanji Reference to Name Old Kanji Checker for name/family-register intent.
5. Refresh only the Name Old Kanji Checker sitemap `lastmod`.

## Guardrails
- Do not change dictionary mappings or conversion logic.
- Do not claim legal validity or registration eligibility.
- Do not create individual-kanji pages.
- Do not touch unrelated tools.
- Remove any temporary patch script/workflow before PR review.

## Validation
- Final diff limited to this plan, `tools/name-old-kanji-checker/index.html`, `tools/old-kanji-reference/index.html`, and `sitemap.xml`.
- Run repository standard CI and require all required checks to succeed.
- Re-check latest main and mergeability immediately before squash merge.
