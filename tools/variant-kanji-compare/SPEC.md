# Tool Specification — Variant Kanji Compare

- Slug: `variant-kanji-compare`
- Public URL: `https://nicheworks.app/tools/variant-kanji-compare/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

見た目が近い漢字、旧字体、異体字を並べ、glyph、Unicode、HTML entity、UTF-16、旧新対応、画数・字形note、表示環境上の注意を比較するreference toolを提供する。

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

## Implementation evidence

- `tools/variant-kanji-compare/index.html` — input/preset/comparison/copy UI。
- `tools/variant-kanji-compare/app.js` — input parsing、presets、Old Kanji Reference data load、glyph/code/mapping/shape/stroke comparison、BMP/Supplement compatibility判定、variation selector判定、独立したsummary counts、copy output。
- `tools/variant-kanji-compare/tests/behavior.test.mjs` — custom dedupe、preset inventory、supplementary UTF-16、Compatibility Ideographs Supplement、Variation Selectors Supplement、mapping、multi-font wiring、summary count separation、CSVのdurable regression QA。
- `tools/old-kanji-reference/` — comparison reference datasets。