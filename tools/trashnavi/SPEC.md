# Tool Specification — TrashNavi

- Slug: `trashnavi`
- Public URL: `https://nicheworks.app/tools/trashnavi/`
- Specification status: `complete`
- Expansion status: `official-gateway Phase 1 defined`
- Common specification: `common-spec/spec-ja.md`
- Data model: `tools/trashnavi/DATA_MODEL.md`

## Purpose

日本の自治体公式ごみ関連ページを、都道府県・市区町村・link type・keywordから探すためのdirectoryを提供する。ごみの分別可否をNicheWorks自身が判定したり、粗大ごみ申込みを代行したりするものではない。

中長期的には、単一のlink検索pageだけでなく、確認済みofficial linkを自治体単位で整理し、十分なcoverageを持つ自治体のみindexable landing pageへ展開できる「全国自治体の公式ごみ情報gateway」を目指す。この拡張でも自治体official sourceが正本であり、TrashNavi自身が自治体固有ルールのauthorityにはならない。

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

## Official-information gateway expansion contract

### Expansion order

1. 現在の自治体data / official direct link coverageを横断auditする。
2. official direct linkとverification metadataを拡充する。
3. landing-page readinessを満たした自治体だけ自治体別static pageを生成する。
4. broken link / redirect / freshnessを定期確認できる仕組みへ進める。
5. 全国共通guideや収益面を追加する場合も、自治体official linkと明確に分離する。

### Forward data fields

今後のofficial waste-link recordは、既存の `pref` / `city` / `name` / `type` / `url` / `lgcode` との互換性を維持しつつ、必要に応じて以下を持てるようにする。

- canonical `link_type`
- `fiscal_year`
- `last_checked`
- `status`
- `final_url`
- `language`

`last_checked`、`status`、`final_url` は実際の確認結果がある場合だけ保存し、推測で埋めない。

canonical taxonomyとmigration ruleの正本は `DATA_MODEL.md` とする。

### Coverage audit

`tools/trashnavi/scripts/audit-coverage.mjs` をrepository-local auditとして使用する。

最低限、以下を測定できること。

- source file / record count
- invalid record / duplicate
- runtime-declared missing dataset
- app未ロードのdirect-link dataset
- municipality count
- official-home coverage
- waste-specific direct-link coverage
- canonical link type別coverage
- prefecture別coverage
- municipality別coverage
- landing-page candidate count

外部networkへ接続せず、repository内dataのみを評価する。

### Municipality landing-page readiness

自治体別pageはURL数を増やすためだけに生成しない。

first-pass candidateは、`municipal_home` を除いて **2種類以上の異なるwaste-specific official link type** を持つ自治体とする。

3種類以上を持つ自治体をpreferred candidateとする。特に以下の情報が複数揃う自治体を優先する。

- waste sorting / official waste search
- collection calendar
- bulky-waste guidance / application

generic municipal top pageしか持たない自治体はthin landing pageを生成しない。

## Monetization boundary

- AdSense等のsite-wide monetization基盤はcommon specificationに従う。
- monetizationを理由に自治体固有ルールを水増し・推測・転載しない。
- Amazon等のaffiliateを将来追加する場合、自治体official link cardと商品recommendationを同一のauthorityに見せない。
- affiliate/related-product surfaceはofficial municipality informationとは視覚的・意味的に分離する。
- Phase 1ではaffiliate block自体を追加しない。

## Limits and non-goals

- NicheWorksがごみ分別ルールを最終判定しない。
- 粗大ごみ申込み、収集予約、自治体への申請を実行しない。
- direct waste linkは全自治体で同じ深さまで揃っているわけではない。
- URL変更、link切れ、制度改定があり得るため最新情報は自治体official siteで確認する。
- 表示dataの更新日やcoverageは永続的な完全性を保証しない。
- 全国の品目別分別ルールを一括してNicheWorks側で正規化することは、現時点のPhase 1対象外。
- 自治体pageの大量生成をdata coverageより先に行わない。

## Acceptance criteria

### Current runtime

- [ ] repository内自治体dataを読み込み、prefecture/municipality選択肢とresult listを生成できる。
- [ ] prefecture、municipality、type、keywordを組み合わせてbrowser-sideで絞り込める。
- [ ] result linkは該当official external pageへ遷移し、NicheWorks内で分別を確定しない。
- [ ] resetでfilterを解除し、全件表示へ戻せる。
- [ ] missing/broken link報告導線がGitHub Issueへ接続する。
- [ ] JA/EN表示を切り替えられる。

### Gateway Phase 1

- [ ] forward data modelとcanonical link taxonomyがdocument化されている。
- [ ] repository dataだけからcoverage auditを実行できる。
- [ ] auditがmunicipality / prefecture / link type単位のcoverageを出せる。
- [ ] runtime-declared missing datasetとunloaded direct-link datasetを検出できる。
- [ ] landing-page readinessがraw URL数ではなくdistinct waste-specific link type数で判定される。
- [ ] Phase 1では自治体固有ルールを新たに推測・転載しない。

## Implementation evidence

- `tools/trashnavi/index.html` — filter/result/report UI、official-source disclaimer、JA/EN copy。
- `tools/trashnavi/app.js` — self-hosted JSON load、dedupe、filtering、result rendering、official external link behavior。
- `tools/trashnavi/data/` — nationwide/local supplementary/direct waste link datasets。
- `tools/trashnavi/DATA_MODEL.md` — forward schema、canonical taxonomy、landing-page readiness。
- `tools/trashnavi/scripts/audit-coverage.mjs` — repository-local coverage/data-quality audit。
