# Tool Specification — Variant Kanji Compare

- Slug: `variant-kanji-compare`
- Public URL: `https://nicheworks.app/tools/variant-kanji-compare/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

見た目が近い漢字、旧字体、異体字を並べ、glyph、Unicode、HTML entity、UTF-16、旧新対応、画数・字形note、表示環境上の注意を比較するreference toolを提供する。

## Search cluster role

- Primary intent: compare visually similar old/variant glyphs side by side.
- Primary query families: `異体字 比較`, `漢字 字形 比較`, `<字> <字> 違い`.
- Supporting query families: `旧字体 異体字 違い`, `髙 高 違い`, `﨑 崎 違い`.
- The page is the cluster's multi-glyph visual/code comparison tool. It is not the generic old/new dictionary.
- Primary task handoffs are Unicode Kanji Checker, Old Kanji Reference, and Name Old Kanji Checker.

## Current functional contract

- 入力からwhitespace、comma、slash等を除き、unique characterとして比較する。
- preset comparisonとして`崎 﨑`、`高 髙`、`吉 𠮷`、`辺 邊 邉`、`斎 齋 齊`、`浜 濱`、`沢 澤`、`国 國`、`学 學`を提供する。
- 各characterをserif / sans-serif / system fontで拡大表示する。
- Unicode、HTML hex/decimal entity、UTF-16 code unitsを表示する。
- Old Kanji Referenceのsame-site dataからold→modern mapping、modern candidates、reading、meaning、usage、category、shape hint、stroke count、compatibility/rendering noteを補足する。
- comparison summaryとdifference hintsを生成する。compatibility ideograph件数とrendering-note件数は独立して集計する。
- comparison全体、CSV、各character/code valueをclipboardへcopyできる。
- Old Kanji Reference / Unicode Kanji Checkerへのlinkを提供する。
- verified purchase pathがない間は、fixed Pro price・disabled purchase CTA・billing-unavailable sales panelをpublic pageへ表示しない。

## Amazon affiliate contract

- Canonical monetization class: `AFFILIATE`.
- Amazon Associates is active for Variant Kanji Compare under the all-eight Old Kanji affiliate decision.
- The affiliate panel appears only after comparison results exist.
- Curated purchase intent: `異体字の世界 最新版`, `実例で読み解く名前の漢字辞典`, and glyph/form dictionaries.
- Amazon destinations are fixed tool-specific searches; compared characters, presets, code points, comparison results, and rendering notes must never be inserted into an affiliate URL or affiliate event.
- Shared `/assets/amazon-affiliate.js` owns URL validation, disclosure, `rel="sponsored noopener"`, and the canonical `affiliate_outbound` event.
- Shared `/assets/old-kanji-amazon-context.js` owns the reviewed tool-specific offer/placement catalog; it does not derive Amazon search terms from user input.
- The free tool task remains usable without interacting with Amazon.

## Inputs

- 比較したいcharacter群。
- preset selection。
- JA / EN UI language。
- Compare、Copy comparison、Copy CSV、各value copy。

## Outputs

- compared character count、compatibility/supplementary/mapping/rendering summary。
- multi-font glyph comparison。
- Unicode / HTML entity / UTF-16 details。
- mapping、metadata、shape/stroke/rendering notes。
- difference hints。
- clipboard comparison / CSV output。

## State and persistence

- input、comparison result、selected presetはpage memoryのみで永続保存しない。
- reference dataはsame-site Old Kanji Reference JSONからloadする。
- paid entitlement UIはcurrent public functional contractに含めない。

## Privacy and network behavior

- user input comparisonはbrowser内で行い、external character APIへ送信しない。
- `tools/old-kanji-reference/`配下のsame-site dict/metadata/shape/stroke/compatibility JSONをfetchする。
- analytics / ads resourceはpage display時にloadされ得る。

## Language mode

`bilingual single-page`

同一pageでJA/ENを切り替える。

## Layout class

`hybrid`

comparison cardsはscreen幅に応じてgrid/stack化し、desktop/mobile双方で確認できる。

## Limits and non-goals

- glyph見た目はfont、OS、browserによって変わるため固定された字形を保証しない。
- 戸籍、登記、契約、official system registrationで利用可能な字体か判定しない。
- similarityやvariant relationをdictionary外まで自動推論して確定しない。
- 法的有効性、正式表記、印刷品質を保証しない。
- billing未接続の間はunfinished Pro sales UIをpublic pageへ表示しない。

## Acceptance criteria

- [x] 任意character群をdedupeしてcomparison gridへ表示できる。
- [x] preset buttonから代表的variant pair/groupを即時比較できる。
- [x] 各characterについてmulti-font glyphとUnicode/HTML/UTF-16を表示する。
- [x] reference dataに存在するmapping、shape、stroke、metadataを補足表示する。
- [x] Compatibility Ideographs SupplementとVariation Selectors Supplementを含むedge rangeを誤分類しない。
- [x] compatibility ideograph件数とrendering-note件数を独立してsummaryへ表示する。
- [x] comparison結果とCSVをclipboardへcopyできる。
- [x] verified billing activation前にfixed Pro price、disabled purchase CTA、billing-unavailable sales panelを表示しない。

- [x] Contextual Amazon affiliate handoffs follow the reviewed only after comparison results exist contract, use fixed tool-specific destinations, and exclude user-derived values from outbound URLs/events. Evidence: `assets/old-kanji-amazon-context.js`, `assets/amazon-affiliate.js`, and `scripts/check-old-kanji-amazon.mjs`.

## Implementation evidence

- `assets/amazon-affiliate.js`
- `assets/old-kanji-amazon-context.js`

- `tools/variant-kanji-compare/index.html` — input/preset/comparison/copy UI。
- `tools/variant-kanji-compare/app.js` — input parsing、presets、Old Kanji Reference data load、glyph/code/mapping/shape/stroke comparison、BMP/Supplement compatibility判定、variation selector判定、独立したsummary counts、copy output。
- `tools/variant-kanji-compare/tests/behavior.test.mjs` — custom dedupe、preset inventory、supplementary UTF-16、Compatibility Ideographs Supplement、Variation Selectors Supplement、mapping、multi-font wiring、summary count separation、CSVのdurable regression QA。
- `tools/old-kanji-reference/` — comparison reference datasets。