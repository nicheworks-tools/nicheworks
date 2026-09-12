# 解約どこナビ Roadmap — 100–200 service database

## Target

最終的な狙いは、雑なリンク集ではなく、**100〜200サービスの解約・退会・自動更新停止等を公式sourceベースで整理したデータベース**にすること。

収益化はその後段。最優先は「解約したいユーザーを正しいofficial pathへ到達させる」こと。

## Phase 0 — Absorption foundation

Status: implemented.

- standalone repositoryの約40recordをmonorepoへ移す
- 旧6時間HTTP checkerをcanonical updaterとして廃止
- legacy recordを`legacy_review_required`へ統一
- database schema / audit / search / category filterを整備
- current 87-tool quality cycleを壊さないためregistry追加は保留
- repository SEO contractを守るためlandingは`index.staged.html` + `noindex,nofollow`で保持

## Phase 1 — Legacy 40 cleanup

Goal: 旧40件を「使える40件」へ変える。

Status after re-verification wave 1 (2026-09-12):

- effective records: 40
- `verified`: 24
- `retired`: 1（dTV → Lemino）
- `needs_review`: 1（Rakuten TV定額見放題の2026年再編）
- `placeholder`: 3（TVer旧placeholder + 旧generic 2件）
- `legacy_review_required`: 11
- visible records: 37
- visible recordsに占めるverified比率: 約65%

Wave 1では、旧40件を直接破壊的に書き換えず、`data/reverification/*.json`のoverlayでofficial-source review結果を固定した。Phase 1終了時にeffective recordsを新canonical datasetへcompactする。

完了済みの主な修正:

- iCloud+の誤redirect URLを現行Apple公式案内へ修正
- Notion / Slack / Adobe等の旧help URLを現行公式案内へ修正
- ChatGPTの旧`Plus / Team`表記を現行有料プランの扱いへ整理
- dTVを現役subscriptionではなくLemino移行済みhistoryへ変更
- 楽天市場系 / au PAYマーケット系のgeneric rowをplaceholderへ隔離
- carrier 4件で回線解約とMNPを混同しないsummaryへ整理
- App Store / Google Play / direct billing等の主要routeをverified recordへ追加

残る主な再確認対象:

- Amazonプライム
- ディズニープラス
- ABEMAプレミアム
- AWA
- Amazon Music Unlimited
- Box
- ニコニコプレミアム
- 楽天マガジン
- BookLive!旧読み放題項目
- Kindle Unlimited
- DMMブックス旧読み放題項目
- Rakuten TVの存続plan単位への再編

Exit gate:

- legacy_review_requiredを原則0へ近づける
- generic / obsolete recordを具体的service単位またはretired/historyへ整理する
- visible recordの大半がverifiedまたは明示的retired

## Phase 2 — Expand to 100

Phase 1を閉じた後、追加60件程度をresearch waveで収録する。

Priority categories:

1. 動画配信 / streaming
2. 音楽 / audio
3. AI / SaaS / productivity
4. cloud / storage
5. mobile / carrier / SIM
6. gaming memberships
7. ebooks / magazines / learning
8. major shopping / paid memberships

Rule:

- candidate発見とverified公開を分離する
- official sourceが取れない候補は公開数に含めない
- 同一brandの複数planはprocedureが実際に異なる場合のみ分ける

## Phase 3 — Expand to 150

100件時点のsearch query / GSC傾向とcategory gapを見て+50件。

重点:

- 国内固有subscription
- 契約経路が複雑なservice
- 解約/退会/自動更新停止が混同されやすいservice
- competitor pageはあるがofficial pathが見つけづらいservice

この段階からservice-specific static page候補を選定する。

## Phase 4 — Expand to 200

必要性が確認できる場合のみ+50件。

200を目的化しない。150件で主要需要を十分coverできているなら、残り工数は既存recordのfreshnessと個別page品質へ回す。

## Individual service pages

将来例:

- `/tools/unsubscribe-navi/netflix/`
- `/tools/unsubscribe-navi/spotify/`
- `/tools/unsubscribe-navi/adobe-creative-cloud/`

生成条件:

- recordがverified
- direct official procedure sourceがある
- 契約routeや注意点など、一覧card以上の有用情報がある
- thin pageにならない

個別page候補field:

- official cancellation link
- procedure type
- billing / signup route
- steps summary
- cancellation vs account deletion distinction
- availability until / billing implications where officially documented
- important caveats
- official sources
- last verified date
- change history when meaningful

## Freshness and automation

旧版の「6時間ごとにHTTP 200ならok」は採用しない。

将来自動化する場合はsignalを分ける:

- network health: status / timeout / redirect
- source identity: final URL / title / canonical
- semantic drift: expected service/procedure markers
- human/research verification: verified state and date

機械checkが成功しても`verified`を自動付与しない。

## Monetization stage

手続き導線を邪魔しないことが絶対条件。

Potential layers:

1. AdSense
2. 解約完了後に意味がある代替service比較
3. category-specific affiliate offers where appropriate

Examples:

- VODを解約する人向けに、必要な場合だけ別VOD比較への導線
- SaaSを解約する人向けに、代替tool比較への導線
- carrier解約/MNPでは手続き情報と乗り換え情報を明確に分離

「解約させないためのdark pattern」は禁止。

## Registration

本toolはcurrent 87-tool quality cycleの母数を変えないため一時的にunregisteredで保持する。

正式登録は別PR/phaseで行い、その時点のrepository contractに従って同時に:

1. `tools/unsubscribe-navi/index.staged.html` を `index.html` へ昇格し、robotsを通常のindexable設定へ戻す
2. `tools/tools-index.json` を更新
3. `tools/tool-spec-manifest.json` を更新
4. sitemap / mother-site exposureを更新
5. tool count / quality planを必要に応じて更新

これらを一つずつ分離して「indexだけ先に公開」「registryだけ先に増加」といった中間不整合を作らない。
