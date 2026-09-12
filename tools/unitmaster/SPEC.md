# Tool Specification — UnitMaster

- Slug: `unitmaster`
- Public URL: `https://nicheworks.app/tools/unitmaster/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

長さ、重さ、温度、体積、面積、速度、圧力の代表的な単位を相互変換し、複数候補への一括換算や最近の換算履歴をbrowser内で確認できるutilityを提供する。

## Current functional contract

- categoryはlength / weight / temperature / volume / area / speed / pressureを提供する。
- 数値、from unit、to unitを選んで換算する。
- auto calculationをONにすると入力・unit変更へ追随し、OFFではCalculate buttonで実行する。
- 一括変換accordionから同category内の複数unitへの換算を確認できる。
- 直近5件のconversion historyを表示・保存する。
- JA/EN UIとlight/dark themeを提供する。
- UnitMaster配下のunit search、unit meaning、priority units pageへ導線を持つ。
- 一般的換算係数を使用し、尺貫法等のtraditional unitsは代表的近似値として扱う。

## Inputs

- category。
- numeric value。
- from unit。
- to unit。
- auto calculation toggle。
- JA / EN language。
- theme toggle。

## Outputs

- 単一conversion result。
- bulk conversion result。
- 直近5件のhistory。
- unit meaning/search/priority referenceへのlink。

## State and persistence

- 直近5件のconversion historyをbrowser localStorageへ保存する。
- language settingとtheme settingをlocalStorageへ保存する。
- 別device/browserへsyncしない。site data削除で消える。
- 現在のform inputはhistory/settings以外のcloud accountへ保存しない。

## Privacy and network behavior

- unit conversionはbrowser内で計算する。
- 入力値をconversion APIへ送信しない。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。
- unit reference pages/dataはNicheWorks site内resourceを利用する。

## Language mode

`bilingual single-page`

同一pageでJA/ENを切り替える。

## Layout class

`hybrid`

desktopではcategory tabsとside reference cardsを併用し、mobileではselect/stack layoutへ縮退する。

## Limits and non-goals

- 結果は一般的換算係数に基づくreferenceであり、専門規格の認証値ではない。
- traditional unitは時代・地域・用途で差があり、代表的近似値を使う。
- 表示桁数によるrounding errorがあり得る。
- 医療、工業設計、建築、契約、取引、法規制、研究用途ではofficial standardを優先する。
- 単位の物理計測そのものは行わない。

## Acceptance criteria

- [ ] 7 categoryのfrom/to unitを選び、数値を相互変換できる。
- [ ] auto calculation ON時はinput/unit変更へ結果が追随し、OFF時はbutton実行になる。
- [ ] bulk conversionが同categoryの複数unit結果を表示する。
- [ ] conversion historyは直近5件を超えず、localStorageから再読込できる。
- [ ] language/theme settingがlocalStorageへ保存される。
- [ ] input valueをexternal conversion APIへ送信しない。

## Implementation evidence

- `tools/unitmaster/index.html` — 7 categories、auto/manual calculation、bulk/history UI、storage/accuracy notices。
- `tools/unitmaster/runtime-units-adapter.js` — runtime unit definitions/adapter。
- `tools/unitmaster/app-json-runtime.js` — conversion UI、history、language/theme runtime。
- `tools/unitmaster/units/` — unit meaning/search/priority reference pages。