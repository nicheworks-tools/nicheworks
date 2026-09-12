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
- comparison summaryとdifference hintsを生成する。
- comparison全体、CSV、各character/code valueをclipboardへcopyできる。
- Old Kanji Reference / Unicode Kanji Checkerへのlinkを提供する。
- Old Kanji Toolkit Proは現状`billing-unavailable`でCTA disabled。

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
- current Pro panelはbilling unavailableで、active entitlement stateをfunctional contractに含めない。

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
- Old Kanji Toolkit Proはbilling未接続である。

## Acceptance criteria

- [ ] 任意character群をdedupeしてcomparison gridへ表示できる。
- [ ] preset buttonから代表的variant pair/groupを即時比較できる。
- [ ] 各characterについてmulti-font glyphとUnicode/HTML/UTF-16を表示する。
- [ ] reference dataに存在するmapping、shape、stroke、metadataを補足表示する。
- [ ] comparison結果とCSVをclipboardへcopyできる。
- [ ] Pro panelをbilling unavailableとして扱い、disabled CTAを有効機能と誤認させない。

## Implementation evidence

- `tools/variant-kanji-compare/index.html` — input/preset/comparison/copy/Pro-billing-unavailable UI。
- `tools/variant-kanji-compare/app.js` — input parsing、presets、Old Kanji Reference data load、glyph/code/mapping/shape/stroke comparison、copy output。
- `tools/old-kanji-reference/` — comparison reference datasets。