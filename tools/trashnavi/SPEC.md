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

Wave 5では、Search Consoleで葛飾区の粗大ごみ需要が確認されたため、葛飾区に2026年度収集カレンダーと粗大ごみ案内のofficial linkを追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **12自治体** とする。

- 東京都 葛飾区 — `/tools/trashnavi/tokyo/katsushika/`

Wave 6では、Search Consoleの過去180日データで猪苗代町のごみカレンダー需要を確認したため、町公式の家庭ごみ分別、令和8年度ごみリサイクルカレンダー、粗大ごみの3導線を追加し、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **13自治体** とする。

- 福島県 猪苗代町 — `/tools/trashnavi/fukushima/inawashiro/`

Wave 7では、Search Consoleの過去180日データを再確認したが、公開済み・対応済み自治体以外に新しいmunicipality-specific demand signalは確認できなかった。そのため需要閾値を下げず、既存direct-link coverageのうち1種類止まりの県庁所在地から、current official sourceで3種類へ到達できる自治体を供給側候補として選ぶ。松山市について、既存のごみ分別導線に2026年度地区別ごみカレンダーと粗大ごみ収集申込み方法を追加し、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **14自治体** とする。

- 愛媛県 松山市 — `/tools/trashnavi/ehime/matsuyama/`

Wave 8では、Wave 7と同じ供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から奈良市を選定した。奈良市公式の2026年度ごみ収集カレンダーと大型ごみ案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **15自治体** とする。

- 奈良県 奈良市 — `/tools/trashnavi/nara/nara/`

Wave 9では、Search Consoleに新しいmunicipality-specific demand signalがない状態を維持したまま、供給側拡張として鹿児島市を選定した。既存の市公式ごみ導線に、令和8年版家庭のごみ出しカレンダーと粗大ごみ案内を追加し、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **16自治体** とする。

- 鹿児島県 鹿児島市 — `/tools/trashnavi/kagoshima/kagoshima/`

Wave 10では、Wave 9と同じ供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から宮崎市を選定した。宮崎市公式の令和8年度家庭ごみ・資源物収集日程表と粗大ごみ案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **17自治体** とする。

- 宮崎県 宮崎市 — `/tools/trashnavi/miyazaki/miyazaki/`

Wave 11では、Wave 10と同じ供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から高松市を選定した。高松市公式の令和8年度ごみ収集カレンダーと臨時・粗大ごみ案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **18自治体** とする。

- 香川県 高松市 — `/tools/trashnavi/kagawa/takamatsu/`

Wave 12では、Wave 11と同じ供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から大分市を選定した。大分市公式の2026年度（令和8年度）ごみ収集カレンダー（住所別検索）と粗大ごみ・一時的多量ごみ案内を追加し、既存のごみ導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **19自治体** とする。

- 大分県 大分市 — `/tools/trashnavi/oita/oita/`

Wave 13では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から津市を選定した。津市公式の令和8年度家庭ごみ収集カレンダーと大型家具の処分案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **20自治体** とする。

- 三重県 津市 — `/tools/trashnavi/mie/tsu/`

Wave 14では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から山口市を選定した。山口市公式の令和8年度版ごみ収集カレンダー（ごみ分別の手引き）と粗大ごみ案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **21自治体** とする。

- 山口県 山口市 — `/tools/trashnavi/yamaguchi/yamaguchi/`

Wave 15では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から大津市を選定した。大津市公式の令和8年4月〜令和9年3月ごみ収集カレンダー導線と大型ごみ案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **22自治体** とする。

- 滋賀県 大津市 — `/tools/trashnavi/shiga/otsu/`

Wave 16では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から松江市を選定した。松江市公式のごみ分別導線を現行ページへ更新し、令和8年度家庭ごみ収集日程と粗大ごみ回収申込み案内を追加して、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **23自治体** とする。

- 島根県 松江市 — `/tools/trashnavi/shimane/matsue/`

Wave 17では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から佐賀市を選定した。佐賀市公式のごみ分別導線を現行ページへ更新し、令和8年度ごみカレンダーと粗大ごみ定期収集案内を追加して、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **24自治体** とする。

- 佐賀県 佐賀市 — `/tools/trashnavi/saga/saga/`

Wave 18では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から鳥取市を選定した。鳥取市公式のごみ分別導線を現行ページへ更新し、令和8年度収集曜日一覧と大型ごみ案内を追加して、preferred candidateへ引き上げた。data enrichment検証後、公開対象を **25自治体** とする。

- 鳥取県 鳥取市 — `/tools/trashnavi/tottori/tottori/`

Wave 19では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から那覇市を選定した。那覇市公式の家庭ごみ分別導線を現行ページへ更新し、ごみ・資源分別検索、ごみ収集日検索、そ大ごみ案内を追加して、4種類のwaste-specific canonical typeを持つpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **26自治体** とする。

- 沖縄県 那覇市 — `/tools/trashnavi/okinawa/naha/`

Wave 20では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から徳島市を選定した。徳島市公式のごみ分別導線を具体的な現行ページへ更新し、令和8年度家庭ごみ収集日程表と粗大ごみ案内を追加して、3種類のwaste-specific canonical typeを持つpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **27自治体** とする。

- 徳島県 徳島市 — `/tools/trashnavi/tokushima/tokushima/`

Wave 21では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から長崎市を選定した。長崎市公式の家庭ごみ分別導線を現行ページへ更新し、町別のごみ収集曜日と粗大ごみ案内を追加して、3種類のwaste-specific canonical typeを持つpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **28自治体** とする。

- 長崎県 長崎市 — `/tools/trashnavi/nagasaki/nagasaki/`

Wave 22では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から高知市を選定した。高知市公式の家庭ごみ分別導線を現行ページへ更新し、ごみ収集日、ごみの収集日検索、家庭ごみの自己搬入案内を追加して、4種類のwaste-specific canonical typeを持つpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **29自治体** とする。

- 高知県 高知市 — `/tools/trashnavi/kochi/kochi/`

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

### Wave 10 verified coverage baseline

2026-09-13のWave 10 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,198 / 2,198 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 17
- preferred candidates (3+ types): 17
- collection calendar coverage: 17 municipalities
- bulky-waste coverage: 16 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- invalid records: 0
- unknown type labels: 0

### Wave 11 verified coverage baseline

2026-09-13のWave 11 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,200 / 2,200 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 18
- preferred candidates (3+ types): 18
- collection calendar coverage: 18 municipalities
- bulky-waste coverage: 17 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- invalid records: 0
- unknown type labels: 0

### Wave 12 verified coverage baseline

2026-09-13のWave 12 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,202 / 2,202 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 19
- preferred candidates (3+ types): 19
- collection calendar coverage: 19 municipalities
- bulky-waste coverage: 18 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- invalid records: 0
- unknown type labels: 0


### Wave 13 verified coverage baseline

2026-09-14のWave 13 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,204 / 2,204 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 20
- preferred candidates (3+ types): 20
- collection calendar coverage: 20 municipalities
- bulky-waste coverage: 19 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 16 datasets / 136 records / 117 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 14 verified coverage baseline

2026-09-14のWave 14 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,206 / 2,206 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 21
- preferred candidates (3+ types): 21
- collection calendar coverage: 21 municipalities
- bulky-waste coverage: 20 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 17 datasets / 138 records / 119 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 15 verified coverage baseline

2026-09-14のWave 15 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,208 / 2,208 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 22
- preferred candidates (3+ types): 22
- collection calendar coverage: 22 municipalities
- bulky-waste coverage: 21 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 18 datasets / 140 records / 121 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 16 verified coverage baseline

2026-09-14のWave 16 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,210 / 2,210 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 23
- preferred candidates (3+ types): 23
- collection calendar coverage: 23 municipalities
- bulky-waste coverage: 22 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 19 datasets / 142 records / 123 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 17 verified coverage baseline

2026-09-14のWave 17 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,212 / 2,212 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 24
- preferred candidates (3+ types): 24
- collection calendar coverage: 24 municipalities
- bulky-waste coverage: 23 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 20 datasets / 144 records / 125 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 18 verified coverage baseline

2026-09-14のWave 18 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,214 / 2,214 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 25
- preferred candidates (3+ types): 25
- collection calendar coverage: 25 municipalities
- bulky-waste coverage: 24 municipalities
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 21 datasets / 146 records / 127 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0


### Wave 19 verified coverage baseline

2026-09-14のWave 19 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,217 / 2,217 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 26
- preferred candidates (3+ types): 26
- collection-calendar coverage: 26 municipalities
- bulky-waste coverage: 25 municipalities
- waste-search coverage: 1 municipality
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 22 datasets / 149 records / 130 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0


### Wave 20 verified coverage baseline

2026-09-14のWave 20 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,219 / 2,219 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 27
- preferred candidates (3+ types): 27
- collection-calendar coverage: 27 municipalities
- bulky-waste coverage: 26 municipalities
- waste-search coverage: 1 municipality
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 23 datasets / 151 records / 132 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 21 verified coverage baseline

2026-09-14のWave 21 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,221 / 2,221 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 28
- preferred candidates (3+ types): 28
- collection calendar coverage: 28 municipalities
- bulky-waste coverage: 27 municipalities
- waste-search coverage: 1 municipality
- drop-off facility coverage: 1 municipality
- waste-app coverage: 1 municipality
- direct-link inventory: 24 datasets / 153 records / 134 unique URLs / 0 invalid URLs
- invalid records: 0
- unknown type labels: 0

### Wave 22 verified coverage baseline

2026-09-14のWave 22 CI基準値は次のとおり。

- municipalities: 1,916
- records: 2,224 / 2,224 valid HTTP(S)
- municipalities with any waste-specific direct link: 78
- publish candidates (2+ types): 29
- preferred candidates (3+ types): 29
- collection calendar coverage: 29 municipalities
- bulky-waste coverage: 27 municipalities
- waste-search coverage: 2 municipalities
- drop-off facility coverage: 2 municipalities
- waste-app coverage: 1 municipality
- direct-link inventory: 25 datasets / 156 records / 137 unique URLs / 0 invalid URLs
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
- municipality pageのaffiliate blockは自治体official linkと視覚的・意味的に分離し、自治体固有情報やuser/runtime stateをAmazon queryへ渡さない。

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

- [x] repository内自治体dataを読み込み、prefecture/municipality選択肢とresult listを生成できる。
- [x] prefecture、municipality、type、keywordを組み合わせてbrowser-sideで絞り込める。
- [x] result linkは該当official external pageへ遷移し、NicheWorks内で分別を確定しない。
- [x] resetでfilterを解除し、全件表示へ戻せる。
- [x] missing/broken link報告導線がGitHub Issueへ接続する。
- [x] JA/EN表示を切り替えられる。

### Gateway Phase 1

- [x] forward data modelとcanonical link taxonomyがdocument化されている。
- [x] repository dataだけからcoverage auditを実行できる。
- [x] auditがmunicipality / prefecture / link type単位のcoverageを出せる。
- [x] runtime-declared missing datasetとunloaded direct-link datasetを検出できる。
- [x] landing-page readinessがraw URL数ではなくdistinct waste-specific link type数で判定される。
- [x] Phase 1では自治体固有ルールを新たに推測・転載しない。

### Municipality page expansion

- [x] preferred readiness 3種類以上を生成時に再検証する。
- [x] 公開29自治体をmanifest allowlistで管理する。
- [x] 自治体pageをgeneratorから静的生成する。
- [x] generator `--check` で29ページの生成driftを検出する。
- [x] 公開URLをroot sitemapと専用sitemapへ収録する。
- [x] robotsの既存root sitemap契約を維持し、sitemap indexから専用sitemapを発見可能にする。
- [x] Wave 3で御浜町・海津市・結城市をpreferred candidateへ引き上げる。
- [x] Wave 4で中央区をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 5で葛飾区をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 6で猪苗代町をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 7で松山市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 8で奈良市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 9で鹿児島市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 10で宮崎市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 11で高松市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 12で大分市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 13で津市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 14で山口市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 15で大津市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 16で松江市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 17で佐賀市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 18で鳥取市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 19で那覇市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 20で徳島市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 21で長崎市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] Wave 22で高知市をpreferred candidateへ引き上げ、自治体pageを公開する。
- [x] PR CIでcoverage strict / generated-page check / repository SEO auditがすべてgreenになる。

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
- `tools/trashnavi/data/direct-waste-links-demand-wave5.json` — 葛飾区のWave 5 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-demand-wave6.json` — 猪苗代町のWave 6 waste-sorting / collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave7.json` — 松山市のWave 7 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave8.json` — 奈良市のWave 8 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave9.json` — 鹿児島市のWave 9 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave10.json` — 宮崎市のWave 10 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave11.json` — 高松市のWave 11 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave12.json` — 大分市のWave 12 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave13.json` — 津市のWave 13 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave14.json` — 山口市のWave 14 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave15.json` — 大津市のWave 15 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave16.json` — 松江市のWave 16 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave17.json` — 佐賀市のWave 17 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave18.json` — 鳥取市のWave 18 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave19.json` — 那覇市のWave 19 waste-search / collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave20.json` — 徳島市のWave 20 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave21.json` — 長崎市のWave 21 collection-calendar / bulky-waste enrichment。
- `tools/trashnavi/data/direct-waste-links-supply-wave22.json` — 高知市のWave 22 collection-calendar / waste-search / drop-off enrichment。
- `tools/trashnavi/DATA_MODEL.md` — forward schema、canonical taxonomy、landing-page readiness。
- `tools/trashnavi/scripts/audit-coverage.mjs` — repository-local coverage/data-quality audit。
- `tools/trashnavi/scripts/check-runtime-contract.mjs` — Current runtime 6項目と公開自治体のroot internal-link整合性をCI検証する。
- `tools/trashnavi/municipality-page-manifest.json` — indexable municipality page allowlist。
- `tools/trashnavi/ai-reference.json` — 公開自治体pageのmachine-readable discovery index。
- `tools/trashnavi/scripts/generate-municipality-pages.mjs` — deterministic municipality page / sitemap generator and drift checker。
- `tools/trashnavi/tokyo/*/index.html` — initial Tokyo municipality pages。
- `tools/trashnavi/mie/mihama/index.html` / `tools/trashnavi/gifu/kaizu/index.html` / `tools/trashnavi/ibaraki/yuki/index.html` — Wave 3 municipality pages。
- `tools/trashnavi/tokyo/chuo/index.html` — Wave 4 municipality page。
- `tools/trashnavi/tokyo/katsushika/index.html` — Wave 5 municipality page。
- `tools/trashnavi/fukushima/inawashiro/index.html` — Wave 6 municipality page。
- `tools/trashnavi/ehime/matsuyama/index.html` — Wave 7 municipality page。
- `tools/trashnavi/nara/nara/index.html` — Wave 8 municipality page。
- `tools/trashnavi/kagoshima/kagoshima/index.html` — Wave 9 municipality page。
- `tools/trashnavi/miyazaki/miyazaki/index.html` — Wave 10 municipality page。
- `tools/trashnavi/kagawa/takamatsu/index.html` — Wave 11 municipality page。
- `tools/trashnavi/oita/oita/index.html` — Wave 12 municipality page。
- `tools/trashnavi/mie/tsu/index.html` — Wave 13 municipality page。
- `tools/trashnavi/yamaguchi/yamaguchi/index.html` — Wave 14 municipality page。
- `tools/trashnavi/shiga/otsu/index.html` — Wave 15 municipality page。
- `tools/trashnavi/shimane/matsue/index.html` — Wave 16 municipality page。
- `tools/trashnavi/saga/saga/index.html` — Wave 17 municipality page。
- `tools/trashnavi/tottori/tottori/index.html` — Wave 18 municipality page。
- `tools/trashnavi/okinawa/naha/index.html` — Wave 19 municipality page。
- `tools/trashnavi/tokushima/tokushima/index.html` — Wave 20 municipality page。
- `tools/trashnavi/nagasaki/nagasaki/index.html` — Wave 21 municipality page。
- `tools/trashnavi/kochi/kochi/index.html` — Wave 22 municipality page。
- `scripts/check-trashnavi-direct-links.mjs` — all-direct-link dataset inventory / scheduled link-health checker。
- `.github/workflows/check-trashnavi-direct-links.yml` — monthly/manual live link-health check and report artifact upload。
- `.agent/plans/20260912-trashnavi-link-freshness-phase4.md` — Phase 4 implementation / safety contract。
- `sitemap.xml` — indexable municipality URLの正規sitemap収録先。
- `sitemap-trashnavi.xml` — TrashNavi municipality補助sitemap。
- `.github/workflows/check-trashnavi-coverage.yml` — coverage strict audit、direct-link inventory validation、generated-page drift check。


## Amazon affiliate monetization (2026-09-14)

- Published municipality pages include one separate `[PR]` commerce block after the official municipal-information area.
- Amazon Associates tracking uses the maintained NicheWorks tag `nicheworks09-22` and the existing `/assets/amazon-affiliate.js` helper.
- The block is limited to four fixed, tool-owned Amazon Japan searches: sorting bins, compression bags, trash-bag storage, and packing supplies.
- Municipality name, prefecture, `lgcode`, address, waste item, search input, link choice, and other user/runtime state must never enter the Amazon query or affiliate analytics.
- The official municipal links remain primary and visually separate. The commerce block explicitly states that the products are general household supplies and are not evidence of compliance with municipal disposal rules.
- Affiliate click analytics remain coarse: tool, provider, fixed target key, and placement only. Amazon price, inventory, rating, review count, seller claims, and product images are not copied into TrashNavi.
- If the shared helper or affiliate config is unavailable/invalid, the commerce section fails closed and remains hidden.

## Wave 23 batch publication

Wave 23から、1自治体ずつではなく複数自治体を同一Waveで検証・公開するbatch expansionへ移行する。公開閾値は従来どおり `municipal_home` を除く **3種類以上の異なるwaste-specific official link type** とし、速度向上のために閾値やauthority要件を緩和しない。

Wave 23では次の5自治体を同時にpreferred candidateへ引き上げ、公開対象を **29自治体から34自治体** へ拡張する。

- 栃木県 宇都宮市 — `/tools/trashnavi/tochigi/utsunomiya/` — waste sorting / collection calendar / bulky waste
- 富山県 富山市 — `/tools/trashnavi/toyama/toyama/` — waste sorting / collection calendar / drop-off facility
- 福井県 福井市 — `/tools/trashnavi/fukui/fukui/` — waste sorting / collection calendar / bulky waste
- 長野県 長野市 — `/tools/trashnavi/nagano/nagano/` — waste sorting / collection calendar / drop-off facility
- 岐阜県 岐阜市 — `/tools/trashnavi/gifu/gifu/` — waste sorting / collection calendar / bulky waste

Wave 23 readiness baselineは、1,916 municipalities、2,234 valid HTTP(S) records、34 preferred candidates、26 direct-link datasets / 166 records / 147 unique URLs / 0 invalid URLs。publication acceptanceでは、5ページ各3 official cards、canonical、current official URLs、Amazon `[PR]` block、共有Amazon helper/config/runtime、AI reference 34/34、両sitemap canonical各1件を検証する。`fiscal_year: 2026` を持つ岐阜市・長野市だけ2026 calendar calloutを表示する。Amazon契約は `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を変更せず継承する。

## Wave 24 batch publication

Wave 24はWave 23で成立した5自治体batch expansionを継続し、公開閾値を変更せず **34自治体から39自治体** へ拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeであり、外部委託先を閾値の穴埋めには使わない。

- 北海道 札幌市 — `/tools/trashnavi/hokkaido/sapporo/` — waste sorting / collection calendar / bulky waste
- 神奈川県 横浜市 — `/tools/trashnavi/kanagawa/yokohama/` — waste sorting / collection calendar / bulky waste
- 山梨県 甲府市 — `/tools/trashnavi/yamanashi/kofu/` — waste sorting / collection calendar / waste app
- 愛知県 名古屋市 — `/tools/trashnavi/aichi/nagoya/` — waste sorting / collection calendar / bulky waste
- 和歌山県 和歌山市 — `/tools/trashnavi/wakayama/wakayama/` — waste sorting / bulky waste / drop-off facility

Wave 24 readiness baselineは1,916 municipalities、2,244 valid HTTP(S) records、39 preferred candidates、27 direct-link datasets / 176 records / 157 unique URLs / 0 invalid URLsとする。

Publication acceptanceでは5ページすべてについてexactly 3 official cards、canonical URL、現在のofficial source URL、Amazon affiliate block `[PR]`、AI reference 39/39、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する甲府市だけ2026 calendar calloutを表示し、札幌市・横浜市・名古屋市・和歌山市には年次calloutを生成しない。甲府市はbulky sourceを持たないためmetadata/heroで粗大ごみcoverageを広告しない。Amazon契約は既存の `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。

## Wave 25 batch publication

Wave 25は5自治体batch expansionを継続し、公開閾値を変更せず **39自治体から44自治体** へ拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeであり、同一のcombined pageを複数種として数えず、外部委託先を閾値の穴埋めにも使わない。

- 宮城県 仙台市 — `/tools/trashnavi/miyagi/sendai/` — waste sorting / collection calendar / bulky waste
- 千葉県 千葉市 — `/tools/trashnavi/chiba/chiba/` — waste sorting / collection calendar / bulky waste
- 新潟県 新潟市 — `/tools/trashnavi/niigata/niigata/` — waste sorting / collection calendar / bulky waste
- 京都府 京都市 — `/tools/trashnavi/kyoto/kyoto/` — waste sorting / collection calendar / bulky waste
- 大阪府 大阪市 — `/tools/trashnavi/osaka/osaka/` — waste sorting / collection calendar / bulky waste

Wave 25 readiness baselineは1,916 municipalities、2,254 valid HTTP(S) records、44 preferred candidates、28 direct-link datasets / 186 records / 167 unique URLs / 0 invalid URLsとする。

Publication acceptanceでは5ページすべてについてexactly 3 official cards、canonical URL、現在のofficial municipal source URL、Amazon affiliate block `[PR]`、AI reference 44/44、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する新潟市だけ2026 calendar calloutを表示し、仙台市・千葉市・京都市・大阪市には年次calloutを生成しない。現行generatorの広告プレースホルダー削除を維持し、新規ページに `ad-slot` を復活させない。Amazon契約は `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。

## Wave 26 batch publication

Wave 26は5自治体batch expansionを継続し、公開閾値を変更せず **44自治体から49自治体** へ拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeであり、同一のcombined pageを複数種として数えず、外部委託先を閾値の穴埋めにも使わない。

- 静岡県 静岡市 — `/tools/trashnavi/shizuoka/shizuoka/` — waste sorting / waste search / bulky waste
- 静岡県 浜松市 — `/tools/trashnavi/shizuoka/hamamatsu/` — waste sorting / collection calendar / bulky application
- 兵庫県 神戸市 — `/tools/trashnavi/hyogo/kobe/` — waste sorting / collection calendar / bulky waste
- 広島県 広島市 — `/tools/trashnavi/hiroshima/hiroshima/` — waste sorting / collection calendar / bulky waste
- 熊本県 熊本市 — `/tools/trashnavi/kumamoto/kumamoto/` — waste sorting / collection calendar / bulky waste

Wave 26 readiness baselineは1,916 municipalities、2,264 valid HTTP(S) records、49 preferred candidates、29 direct-link datasets / 196 records / 177 unique URLs / 0 invalid URLsとする。

Publication acceptanceでは5ページすべてについてexactly 3 official cards、canonical URL、現在のofficial municipal source URL、Amazon affiliate block `[PR]`、AI reference 49/49、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する浜松市・神戸市・広島市・熊本市だけ2026 calendar calloutを表示し、静岡市には年次calloutを生成しない。現行generatorの広告プレースホルダー削除を維持し、新規ページに `ad-slot` を復活させない。Amazon契約は `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。
