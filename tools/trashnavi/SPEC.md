# Tool Specification — TrashNavi

- Slug: `trashnavi`
- Public URL: `https://nicheworks.app/tools/trashnavi/`
- Specification status: `complete`
- Expansion status: `official-gateway municipality expansion active`
- Common specification: `common-spec/spec-ja.md`
- Data model: `tools/trashnavi/DATA_MODEL.md`

## Purpose

日本の自治体公式ごみ関連ページを、都道府県・市区町村・link type・keywordから探すためのdirectoryを提供する。ごみの分別可否をNicheWorks自身が判定したり、粗大ごみ申込みを代行したりするものではない。

中長期的には、単一のlink検索pageだけでなく、確認済みofficial linkを自治体単位で整理し、十分なcoverageを持つ自治体のみindexable landing pageへ展開できる「全国自治体の公式ごみ情報gateway」を目指す。この拡張でも自治体official sourceが正本であり、TrashNavi自身が自治体固有ルールのauthorityにはならない。

## Current functional contract

- 自サイト内の自治体JSON dataを読み込み、全国の自治体top pageと確認済みのごみ分別・収集calendar・粗大ごみ・検索page等を一覧化する。
- prefecture、municipality、link type、keywordでbrowser-side filteringする。
- quick prefecture filterとして東京都、大阪府、神奈川県、愛知県、福岡県を提供する。
- runtimeのlink type filterは自治体公式ページ、ごみ分別ページ、収集カレンダー、粗大ごみ、粗大ごみ申込み、検索ページ、持込施設、ごみ分別アプリを扱う。
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
- drop-off facility / official waste app などの自治体公式補助導線

generic municipal top pageしか持たない自治体はthin landing pageを生成しない。

### Municipality page publication contract

自治体別indexable pageは `tools/trashnavi/municipality-page-manifest.json` を公開対象のallowlistとし、`tools/trashnavi/scripts/generate-municipality-pages.mjs` から静的生成する。

初期pilotでは東京都のpreferred candidate 7自治体を公開した。

- 千代田区
- 港区
- 新宿区
- 世田谷区
- 渋谷区
- 杉並区
- 練馬区

Wave 3ではSearch Consoleで需要が確認され、3種類以上のofficial link typeへ到達した次の3自治体を追加し、公開対象を **10自治体** とする。

- 三重県 御浜町 — `/tools/trashnavi/mie/mihama/`
- 岐阜県 海津市 — `/tools/trashnavi/gifu/kaizu/`
- 茨城県 結城市 — `/tools/trashnavi/ibaraki/yuki/`

Wave 4では、第三のofficial link typeとして収集曜日を確認できた東京都中央区を追加し、公開対象を **11自治体** とする。

- 東京都 中央区 — `/tools/trashnavi/tokyo/chuo/`

生成器は公開対象ごとにrepository dataを再集約し、`municipal_home` を除くdistinct waste-specific canonical typeが **3種類未満なら生成を拒否**する。manifestに追加しただけでthin pageを公開してはならない。

各自治体pageは最低限以下を持つ。

- municipality固有title / description / canonical / OGP
- official-source disclaimer
- 確認済みofficial link cards
- `fiscal_year` がある場合の年度表示
- `last_checked` がある場合のみ確認日表示
- 2026 collection calendarがある場合の明示導線
- TrashNavi本体へのbreadcrumb
- 公開自治体間のrelated links
- site-wide analytics / advertising hooks
- WebPage / BreadcrumbList structured data

生成対象URLは正規の `sitemap.xml` に必ず1回収録し、`sitemap-trashnavi.xml` にもTrashNavi専用の補助一覧として収録する。`robots.txt` は既存の単一root sitemap宣言を維持し、`sitemap-index.xml` には補助の `sitemap-trashnavi.xml` を登録する。

生成結果のdriftは次で検査する。

```bash
node tools/trashnavi/scripts/generate-municipality-pages.mjs --check
```

CIではcoverage strict auditと生成drift checkの両方を必須とし、公開URLがroot sitemapから欠落しても失敗させる。

### Wave 4 verified coverage baseline

2026-09-13のWave 4 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,185 / 2,185 valid HTTP(S)
- municipalities with any waste-specific direct link: 77
- publish candidates (2+ types): 11
- preferred candidates (3+ types): 11
- collection calendar coverage: 11 municipalities
- bulky-waste coverage: 10 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- invalid records: 0
- unknown type labels: 0

### Direct-link health monitoring — Phase 4

Phase 4では、単一legacy fileだけを確認していたlink checkを、`tools/trashnavi/data/direct-waste-links*.json` に一致する全direct-link datasetへ拡張する。

`scripts/check-trashnavi-direct-links.mjs` は次の契約で動作する。

- 対象datasetをdirectory scanから決定し、固定file listへ依存しない。
- root valueがarrayであることと、各recordの`url`がHTTP(S)であることを検証する。
- 同一URLは1回だけrequestしつつ、source file / row indexの参照を全件保持する。
- HEADを先に試し、status 0 / 403 / 405 / 429ではGETへfallbackする。
- 404 / 410だけをhard broken linkとして扱う。
- timeout / block / transient server errorはwarning扱いとし、自動でsource dataを無効化しない。
- redirectはfinal URLをreportするが、source URLを自動書換えしない。
- `--inventory` は外部network requestなしでdataset discovery / URL validityだけをCI検証する。
- `TRASHNAVI_LINK_REPORT` 指定時はmachine-readable JSON reportを生成する。
- `TRASHNAVI_STRICT_LINK_CHECK=1` でもhard errorだけをfailure条件とする。

`.github/workflows/check-trashnavi-coverage.yml` はPR時に`--inventory`を実行し、live municipality siteへのrequestを発生させない。`.github/workflows/check-trashnavi-direct-links.yml` は既存のmonthly schedule / manual dispatchでnetwork health checkを実行し、report artifactを保存する。

CI probeの結果だけで`last_checked`、`status`、`final_url`等のsource recordを自動更新してはならない。source変更はofficial pageのmanual verificationを経て行う。

## Monetization boundary

- AdSense等のsite-wide monetization基盤はcommon specificationに従う。
- monetizationを理由に自治体固有ルールを水増し・推測・転載しない。
- Amazon等のaffiliateを将来追加する場合、自治体official link cardと商品recommendationを同一のauthorityに見せない。
- affiliate/related-product surfaceはofficial municipality informationとは視覚的・意味的に分離する。
- 現在のmunicipality expansionではaffiliate block自体を追加しない。

## Limits and non-goals

- NicheWorksがごみ分別ルールを最終判定しない。
- 粗大ごみ申込み、収集予約、自治体への申請を実行しない。
- direct waste linkは全自治体で同じ深さまで揃っているわけではない。
- URL変更、link切れ、制度改定があり得るため最新情報は自治体official siteで確認する。
- 表示dataの更新日やcoverageは永続的な完全性を保証しない。
- 全国の品目別分別ルールを一括してNicheWorks側で正規化することは、現時点の対象外。
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

- [x] forward data modelとcanonical link taxonomyがdocument化されている。
- [x] repository dataだけからcoverage auditを実行できる。
- [x] auditがmunicipality / prefecture / link type単位のcoverageを出せる。
- [x] runtime-declared missing datasetとunloaded direct-link datasetを検出できる。
- [x] landing-page readinessがraw URL数ではなくdistinct waste-specific link type数で判定される。
- [x] Phase 1では自治体固有ルールを新たに推測・転載しない。

### Municipality page expansion

- [x] preferred readiness 3種類以上を生成時に再検証する。
- [x] 公開11自治体をmanifest allowlistで管理する。
- [x] 自治体pageをgeneratorから静的生成する。
- [x] generator `--check` で11ページの生成driftを検出する。
- [x] 公開URLをroot sitemapと専用sitemapへ収録する。
- [x] robotsの既存root sitemap契約を維持し、sitemap indexから専用sitemapを発見可能にする。
- [x] Wave 3で御浜町・海津市・結城市をpreferred candidateへ引き上げる。
- [x] Wave 4で中央区をpreferred candidateへ引き上げ、自治体pageを公開する。
- [ ] PR CIでcoverage strict / generated-page check / repository SEO auditがすべてgreenになる。

### Link health Phase 4

- [x] 全`direct-waste-links*.json` datasetを自動discoverする。
- [x] `--inventory`でnetwork accessなしのPR validationを実行できる。
- [x] unique URL単位でrequestをdedupeし、全source referenceを保持する。
- [x] scheduled/manual checkがJSON report artifactを生成できる。
- [x] 404 / 410だけをstrict modeのhard failureにする。
- [x] redirect / timeout / block結果からsource URLやverification metadataを自動変更しない。

## Implementation evidence

- `tools/trashnavi/index.html` — filter/result/report UI、published municipality links、official-source disclaimer、JA/EN copy。
- `tools/trashnavi/app.js` — self-hosted JSON load、dedupe、filtering、forward link-type rendering、official external link behavior。
- `tools/trashnavi/data/` — nationwide/local supplementary/direct waste link datasets。
- `tools/trashnavi/data/direct-waste-links-demand-wave3.json` — 御浜町・海津市・結城市のWave 3 official-link enrichment。
- `tools/trashnavi/data/direct-waste-links-demand-wave4.json` — 中央区のWave 4 collection-calendar enrichment。
- `tools/trashnavi/DATA_MODEL.md` — forward schema、canonical taxonomy、landing-page readiness。
- `tools/trashnavi/scripts/audit-coverage.mjs` — repository-local coverage/data-quality audit。
- `tools/trashnavi/municipality-page-manifest.json` — indexable municipality page allowlist。
- `tools/trashnavi/scripts/generate-municipality-pages.mjs` — deterministic municipality page / sitemap generator and drift checker。
- `tools/trashnavi/tokyo/*/index.html` — initial Tokyo municipality pages。
- `tools/trashnavi/mie/mihama/index.html` / `tools/trashnavi/gifu/kaizu/index.html` / `tools/trashnavi/ibaraki/yuki/index.html` — Wave 3 municipality pages。
- `tools/trashnavi/tokyo/chuo/index.html` — Wave 4 municipality page。
- `scripts/check-trashnavi-direct-links.mjs` — all-direct-link dataset inventory / scheduled link-health checker。
- `.github/workflows/check-trashnavi-direct-links.yml` — monthly/manual live link-health check and report artifact upload。
- `.agent/plans/20260912-trashnavi-link-freshness-phase4.md` — Phase 4 implementation / safety contract。
- `sitemap.xml` — indexable municipality URLの正規sitemap収録先。
- `sitemap-trashnavi.xml` — TrashNavi municipality補助sitemap。
- `.github/workflows/check-trashnavi-coverage.yml` — coverage strict audit、direct-link inventory validation、generated-page drift check。
