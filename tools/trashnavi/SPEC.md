# Tool Specification — TrashNavi

- Slug: `trashnavi`
- Public URL: `https://nicheworks.app/tools/trashnavi/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

日本の自治体公式ごみ関連ページを、都道府県・市区町村・link type・keywordから探すためのdirectoryを提供する。ごみの分別可否をNicheWorks自身が判定したり、粗大ごみ申込みを代行したりするものではない。

## Current functional contract

- 自サイト内の自治体JSON dataを読み込み、全国の自治体top pageと確認済みのごみ分別・収集calendar・粗大ごみ・検索page等を一覧化する。
- prefecture、municipality、link type、keywordでbrowser-side filteringする。
- quick prefecture filterとして東京都、大阪府、神奈川県、愛知県、福岡県を提供する。
- link typeは自治体公式ページ、ごみ分別ページ、収集カレンダー、粗大ごみ、検索ページを扱う。
- duplicateはlgcode/type/URLの組合せを基準に除外する。
- 結果から自治体公式external pageを新しいtabで開く。
- missing/broken linkはGitHub Issue templateへの報告導線を持つ。
- JA/EN UIを同一ページで切り替える。

## Inputs

- 都道府県。
- 市区町村。
- link type。
- 任意keyword。
- quick prefecture button。
- UI language JA / EN。

## Outputs

- 条件に一致するofficial link件数。
- 自治体名、link title/type、URL、official-page button。
- 現在のfilter条件表示。
- datasetの登録件数表示。

## State and persistence

- filter条件と検索結果は現在ページの状態のみで、永続保存しない。
- UI languageも現行実装ではlocalStorageへ永続保存しない。
- 自治体dataはrepository内JSONをpage load時に取得する。

## Privacy and network behavior

- prefecture/city/type/keyword filteringはbrowser内で行い、検索条件を検索APIへ送信しない。
- data loadはNicheWorks配下のsame-site JSON resourceをfetchする。
- official linkを開くと各自治体等のexternal siteへ移動し、そのsite側のprivacy/termsが適用される。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。

## Language mode

`bilingual single-page`

同一ページでJA/EN表示を切り替える。自治体固有名称やlink typeのsource data自体は日本語中心である。

## Layout class

`hybrid`

filter formとresult cardsをdesktop/mobile両方で利用できるdirectory layout。

## Limits and non-goals

- NicheWorksがごみ分別ルールを最終判定しない。
- 粗大ごみ申込み、収集予約、自治体への申請を実行しない。
- direct waste linkは全自治体で同じ深さまで揃っているわけではない。
- URL変更、link切れ、制度改定があり得るため最新情報は自治体official siteで確認する。
- 表示dataの更新日やcoverageは永続的な完全性を保証しない。

## Acceptance criteria

- [ ] repository内自治体dataを読み込み、prefecture/municipality選択肢とresult listを生成できる。
- [ ] prefecture、municipality、type、keywordを組み合わせてbrowser-sideで絞り込める。
- [ ] result linkは該当official external pageへ遷移し、NicheWorks内で分別を確定しない。
- [ ] resetでfilterを解除し、全件表示へ戻せる。
- [ ] missing/broken link報告導線がGitHub Issueへ接続する。
- [ ] JA/EN表示を切り替えられる。

## Implementation evidence

- `tools/trashnavi/index.html` — filter/result/report UI、official-source disclaimer、JA/EN copy。
- `tools/trashnavi/app.js` — self-hosted JSON load、dedupe、filtering、result rendering、official external link behavior。
- `tools/trashnavi/data/` — nationwide/local supplementary/direct waste link datasets。