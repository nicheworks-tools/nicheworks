# Old Kanji SEO Wave 8 — route name / family-register intent to Name Old Kanji Checker

## Goal
Use actual Search Console demand already landing on Old Kanji Reference to strengthen the existing `name-old-kanji-checker` page and route name-specific intent to that dedicated tool, without creating a new SEO page family or claiming legal/registry authority.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, finalized data for 2026-03-21 through 2026-09-16:

- `戸籍 旧字体 一覧`: 3 impressions, 0 clicks, average position 1.
- `旧 字体 名前 一覧`: 1 impression, 0 clicks, average position 49.
- `旧 漢字 名前`: 1 impression, 0 clicks, average position 80.
- Total observed name / family-register intent covered by this wave: 5 impressions.
- All observed rows currently land on `/tools/old-kanji-reference/`; `name-old-kanji-checker` has no observed row in the extracted cluster data.

## Product-contract gate
`tools/name-old-kanji-checker/SPEC.md` defines the tool as a reference aid that:

- accepts arbitrary name text and checks characters one by one;
- surfaces old-form, modern-form, and variant candidates from the Old Kanji Reference data;
- does not establish legal validity, official spelling, or registration eligibility;
- requires verification of the actually registered glyph for family registers and other official uses.

Wave 8 must preserve these limits.

## Authority gate
Primary official reference checked before implementation:

- Ministry of Justice, 戸籍 / 戸籍統一文字情報
  - https://www.moj.go.jp/MINJI/koseki
  - https://houmukyoku.moj.go.jp/KOSEKIMOJIDB/M01.html
- The official service provides search of family-register unified characters. It is the appropriate follow-up for official registered-glyph confirmation.

## Scope
1. Reframe the existing Name Old Kanji Checker metadata and H1 around `名前の旧字体・異体字を調べる` while retaining the existing canonical URL and bilingual product identity.
2. Add short visible guidance explaining that the tool is a reference aid and that official family-register spelling must be checked against official records / Ministry of Justice resources.
3. Add a contextual internal link from the Old Kanji Reference root to `name-old-kanji-checker` for name / family-register intent.
4. Refresh only the existing `name-old-kanji-checker` sitemap `lastmod`.

## Explicit exclusions
- No new landing page.
- No dictionary change.
- No conversion-logic change.
- No claim that a candidate is the user's legally registered glyph.
- No claim that the tool determines name-registration eligibility.
- No bulk or programmatic SEO.
- No unrelated tools.
- No CI weakening.

## Validation
- Existing canonical remains `https://nicheworks.app/tools/name-old-kanji-checker/`.
- Existing input/check workflow remains intact.
- Official-use caution remains visible.
- Ministry of Justice official reference is linked visibly.
- Root contains one explicit contextual link to Name Old Kanji Checker.
- Sitemap contains the existing Name Old Kanji Checker URL once with `lastmod=2026-09-17`.
- Final diff contains only the plan, Name Old Kanji Checker page, Old Kanji Reference root, and sitemap.
- Standard repository CI passes.
- Re-read latest main and PR mergeability immediately before squash merge.
