# Tool Specification — Unicode Kanji Checker

- Slug: `unicode-kanji-checker`
- Public URL: `https://nicheworks.app/tools/unicode-kanji-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

漢字、旧字体、異体字についてUnicode code point、HTML entity、UTF-16、旧字体対応、表示環境上の注意をbrowser内で確認するreference toolを提供する。

## Search cluster role

- Primary intent: inspect kanji code points, HTML entities, UTF-16, and rendering concerns.
- Primary query families: `漢字 Unicode`, `旧字体 Unicode`, `異体字 Unicode`.
- Supporting query families: `漢字 コードポイント`, `CJK compatibility ideograph`.
- The page is the cluster's encoding/rendering inspector and does not decide official or legal glyph validity.
- Primary task handoffs are Variant Kanji Compare, Old Kanji Reference, and Kanji Modernizer.

## Current functional contract

- 入力文字列からwhitespaceを除き、unique character単位で解析する。
- 各文字についてUnicode `U+...`、decimal code point、HTML hexadecimal/decimal entity、UTF-16 code unitsを表示する。
- CJK Compatibility Ideographs、supplementary-plane character、variation selectorの該当数と注意を表示する。
- Old Kanji Referenceのsame-site dataを読み込み、old→modern mapping、modern→old candidates、reading、meaning、category、usage、compatibility noteを補足する。
- character / Unicode / HTML entity / UTF-16を個別copyでき、全結果とCSV形式もcopyできる。
- Kanji Modernizerへ入力文字列をquery付きで引き継ぐlinkを提供する。
- same-site toolからの`?q=` handoffを受け取り、leading/trailing whitespaceや改行を削らず入力へ復元して解析する。
- verified purchase pathがない間は、fixed Pro price・disabled purchase CTA・billing-unavailable sales panelをpublic pageへ表示しない。

## Inputs

- 任意の文字列。
- JA / EN UI language。
- Analyze、Copy all、Copy CSV、各value copy action。

## Outputs

- total character countとunique count。
- compatibility ideograph / supplementary-plane / variation-selector counts。
- characterごとのUnicode、decimal、HTML entities、UTF-16。
- old/modern mappingとvariant candidates。
- reading、meaning、category、usage、rendering notes。
- clipboard向けsummary / CSV。

## State and persistence

- 入力、解析結果、copy結果はpage memoryのみで永続保存しない。
- 辞書・metadataはNicheWorks内のstatic resourceからloadする。
- paid entitlement UIはcurrent public functional contractに含めない。

## Privacy and network behavior

- 入力文字列の解析はbrowser内で行い、外部character APIへ送信しない。
- 辞書・metadataは`tools/old-kanji-reference/`配下のsame-site JSONをfetchする。
- analytics / ads resourceはpage display時にloadされ得る。

## Language mode

`bilingual single-page`

同一page上でJA/ENを切り替える。

## Layout class

`hybrid`

入力後にcharacter cardsを縦・grid状に表示し、desktop/mobile双方で利用する。

## Limits and non-goals

- Unicode/字形referenceであり、戸籍・登記・契約・行政登録等の正式字体を確定しない。
- fontやOSによるglyph rendering差を解消しない。
- compatibility characterやvariation selectorがtarget systemで利用可能か保証しない。
- dictionaryに存在しないvariant関係を推測して確定しない。
- billing未接続の間はunfinished Pro sales UIをpublic pageへ表示しない。

## Acceptance criteria

- [x] 入力したunique characterごとにUnicode、decimal、HTML hex/decimal、UTF-16を表示する。
- [x] Compatibility Ideograph、supplementary-plane、variation-selectorを該当rangeに基づき識別する。
- [x] Old Kanji Reference dataに対応がある文字ではold/modern mappingやmetadataを表示する。
- [x] 全結果とCSVをclipboardへcopyできる。
- [x] 入力内容をexternal character APIへ送信しない。
- [x] same-site `?q=` handoffで入力文字列を欠落・trimせず復元できる。
- [x] verified billing activation前にfixed Pro price、disabled purchase CTA、billing-unavailable sales panelを表示しない。

## Implementation evidence

- `tools/unicode-kanji-checker/index.html` — input/copy/result UI、privacy notice。
- `tools/unicode-kanji-checker/app.js` — code point/entity/UTF-16解析、BMPとSupplement両方のcompatibility ideograph判定、variation selector判定、Old Kanji Reference data load、exact `?q=` handoff、copy/render logic。
- `tools/unicode-kanji-checker/tests/behavior.test.mjs` — BMP/supplementary code point、UTF-16 surrogate pair、Compatibility Ideographs Supplement、Variation Selectors Supplement、reverse mapping、CSV escaping、exact query handoffのdurable regression QA。
- `tools/old-kanji-reference/dict.json` and metadata files — mapping/reference source consumed by this tool。