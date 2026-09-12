# Tool Specification — 解約どこナビ

- Slug: `unsubscribe-navi`
- Public URL: `https://nicheworks.app/tools/unsubscribe-navi/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Registration status: intentionally unregistered during the current 87-tool quality cycle
- Staged landing: `tools/unsubscribe-navi/index.staged.html` (`noindex,nofollow` until registration)

## Purpose

各種サブスクリプション、会員サービス、SaaS、通信、ゲーム等について、解約・退会・自動更新停止などの公式手続き情報へ到達しやすくする。NicheWorks自身が解約処理を実行したり、事業者を装ったりするものではない。

中長期の製品目標は、単なるリンク集ではなく、公式ソースで検証した100〜200サービス級の解約・退会手続きデータベースとする。

## Current functional contract

monorepoへ吸収済みだが、既存87ツールの品質改善母数を変えないため正式公開前のstaged stateとする。production-intent landingは`index.staged.html`に保持し、正式登録時に`index.html`へ昇格させる。

- `data/services.json` をlegacy migration snapshotとして読み込む。
- `data/additions/*.json` からPhase 2以降の新規serviceを追加する。
- `data/reverification/*.json` のofficial-source review結果を`id`単位でoverlayする。
- merge順は legacy base → additions → re-verification overlays とする。
- additionの`id`は既存recordと衝突不可。overlayは既存`id`だけを上書き可能。
- 後waveで同じ`id`を再確認した場合はlast-winsで新しい判断を正とする。
- runtimeとauditは同じmerge契約を使用する。
- サービス名、alias、keyword、category、summary、procedure type、billing routeを検索対象にする。
- category filterとverification-state filterを提供する。
- `placeholder` recordは通常検索結果に表示しない。
- `verified` / `needs_review` / `retired` / legacy dataをUI上で区別する。
- `procedure_url` がある場合のみ公式手続き・関連情報へのlinkを表示し、無い場合はofficial siteのみ表示する。
- HTTP 200だけでverifiedへ昇格させない。

2026-09-12のPhase 2 Wave 6で100 public-visibleへ到達し、その後Disney+を日本語公式解約記事で再検証した。現在のeffective stateは **104 effective / 100 public-visible / 98 verified / 1 needs_review / 1 retired / 4 placeholder**。Amazonプライムのみ、日本向けの安定した公開procedure sourceを正式公開前に引き続き確認する。

個別service pageは`INDIVIDUAL_PAGE_CANDIDATES.md`で25件をP0/P1/P2へ選定済み。候補選定は公開を意味しない。P0の構造が異なる5件（FODプレミアム / LINE MUSIC / Adobe Creative Cloud / Y!mobile / Leminoプレミアム）について、`individual-page-manifest.staged.json`を正本に`staged-pages/*.html`を生成するtemplateを実装済み。各pageは`noindex,nofollow`で、public sitemap / registry / mother-siteには露出しない。

## Inputs

ユーザー入力は以下のみ。

- 任意の検索語
- category filter
- verification-state filter

入力はブラウザ内filterにのみ使用する。

## Outputs

検索条件に一致するservice cardを表示する。cardは可能な範囲で以下を含む。

- service name
- category
- publication / verification state
- concise procedure summary
- procedure URL（存在する場合）
- official site URL
- verification note / date

staged individual pageは、verified recordと追加の公式source確認から以下を表示する。

- service / plan identity
- official procedure link
- route別の解約先
- cancellation / automatic-renewal stop / carrier termination等のprocedure type
- 解約とaccount deletion / MNP / downgrade等の違い
- official sourceに根拠がある注意事項
- last verified date

## State and persistence

ユーザー入力や検索状態を永続保存しない。localStorage、cookie、account DBは使用しない。データベース本体はrepository内のstatic JSONを正本とする。

現段階では`data/services.json`をmigration snapshot、`data/additions/*.json`を新規収録wave、`data/reverification/*.json`をreview overlayとして保持する。十分な区切りでeffective recordsを新canonical datasetへcompactできる。

individual pageのstaged contentは`individual-page-manifest.staged.json`を追加正本とし、`scripts/generate-individual-pages.mjs`でeffective recordとの整合性を検証してHTMLを生成する。manifestのsource URLとeffective recordの`procedure_url`、verification dateが一致しない場合はgeneratorを失敗させる。

## Privacy and network behavior

検索語は外部送信しない。runtime network accessは同一site上のlocal JSON取得と、ユーザーが明示的にofficial linkを開いた場合に限る。GA4 / AdSenseはNicheWorks共通仕様に従う。

解約先サービスのlogin情報、契約情報、決済情報をNicheWorksへ入力させてはならない。

## Language mode

`Japanese-only`

本ツールは日本居住者・日本語検索を主対象とするため現段階は日本語のみとする。海外サービスも日本から利用されるsubscriptionとして収録できる。

## Layout class

`hybrid`

検索・filterはmobileで1columnへ変形し、結果はdesktopで2column、狭幅で1columnとする。100〜200recordでも一覧性を保つ。480px未満ではaction controlsを縦積みにし、スマホ上で公式手続き導線を押しやすくする。

individual pageもdesktopではroute cardを2column、680px以下で1column、480px以下でprimary actionを縦積みにする。

## Limits and non-goals

- NicheWorks上で直接解約しない。
- login credentialや決済情報を収集しない。
- HTTP statusのみで手続きの正しさを断定しない。
- officialでないblogやaffiliate記事を手続きの一次sourceとして扱わない。
- verifiedでないrecordへ架空のverification dateを入れない。
- countを増やすためだけのplaceholderやgeneric brand entryを公開しない。
- official procedure sourceが弱い候補を件数合わせでverified追加しない。
- cancellationを妨害する収益導線を設置しない。
- staged stateの間はpublic `index.html` を作らない。
- 個別service pageをSEO目的だけでthin pageとして量産しない。
- staged individual pageをpublic sitemap / mother-site / registryへ載せない。

## Acceptance criteria

- [x] 単独repository由来のservice setをmonorepoへmigration-safeに吸収している。
- [x] legacy dataとverified dataを明示的に区別するdata contractを持つ。
- [x] 検索とcategory filterが100〜200record規模へそのまま拡張できる。
- [x] schema / duplicate / state / target progressをnetworkなしで確認できるaudit scriptを持つ。
- [x] 100→150→200 serviceへの拡張方針がrepository内ROADMAPに固定されている。
- [x] current 87-tool registryを変えずにstaged sourceを保持する。
- [x] re-verification waveをmigration provenance付きで段階適用できる。
- [x] legacy recordのofficial-source再検証・分類が完了し、`legacy_review_required`が0になっている。
- [x] Phase 2で新規serviceを既存migration snapshotと分離して追加できる。
- [x] 100 public-visible service以上がverified中心で整理されている。
- [x] 100件規模でcategoryとverification-stateを組み合わせて絞り込める。
- [ ] Amazonプライムの日本向け安定procedure sourceを固定する。
- [x] freshness / stale-source report-only監査を実装する。
- [x] 個別service page候補20〜30件を正式公開前に選定する。
- [x] P0候補から5件のstaged individual-page templateを生成する。
- [x] staged page generatorがeffective recordのverified state / procedure URL / verification dateを検証する。
- [ ] P0残り5件へ拡張する前に、初期5件の実ブラウザ表示・mobile usabilityを最終確認する。

## Implementation evidence

- `tools/unsubscribe-navi/index.staged.html` — staged static UI / SEO / FAQ / NicheWorks common surfaces
- `tools/unsubscribe-navi/app.js` — base + additions + re-verification merge, local search and rendering
- `tools/unsubscribe-navi/style.css` — responsive hybrid layout
- `tools/unsubscribe-navi/individual-page.css` — staged individual-page responsive layout
- `tools/unsubscribe-navi/individual-page-manifest.staged.json` — first five staged individual-page content records
- `tools/unsubscribe-navi/staged-pages/*.html` — generated noindex individual-page prototypes
- `tools/unsubscribe-navi/data/services.json` — legacy migration snapshot
- `tools/unsubscribe-navi/data/additions/*.json` — Phase 2+ new service waves
- `tools/unsubscribe-navi/data/reverification/*.json` — official-source re-verification overlays
- `tools/unsubscribe-navi/scripts/audit-services.mjs` — effective database / additions / overlay audit and report-only freshness metrics
- `tools/unsubscribe-navi/scripts/generate-individual-pages.mjs` — staged individual-page generator and `--check` stale-output validation
- `tools/unsubscribe-navi/DATA_MODEL.md` — forward data, route and verification contract
- `tools/unsubscribe-navi/ROADMAP.md` — 100–200 service expansion plan and current progress
- `tools/unsubscribe-navi/INDIVIDUAL_PAGE_CANDIDATES.md` — selected 25 individual-page candidates and staged generation order
