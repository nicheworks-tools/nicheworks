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

Status: **legacy migration cleanup complete (2026-09-12)**.

旧40件を直接破壊的に書き換えず、`data/reverification/*.json`のoverlayでofficial-source review結果を固定した。後waveの再確認はlast-winsで前waveの暫定判断を上書きできる。Phase 2で新規serviceを追加する前に、必要に応じてeffective recordsを新canonical datasetへcompactする。

### Final Phase 1 state after wave 3

- effective records: 40
- `verified`: 33
- `retired`: 1（dTV → Lemino）
- `needs_review`: 2（Amazonプライム / ディズニープラス）
- `placeholder`: 4（TVer旧placeholder + 旧generic 2件 + DMMブックス旧「読み放題」誤項目）
- `legacy_review_required`: **0**
- visible records: 36
- visible recordsに占めるverified比率: 約92%

### Wave 1 completed

- iCloud+の誤redirect URLを現行Apple公式案内へ修正
- Notion / Slack / Adobe等の旧help URLを現行公式案内へ修正
- ChatGPTの旧`Plus / Team`表記を現行有料プランの扱いへ整理
- dTVを現役subscriptionではなくLemino移行済みhistoryへ変更
- 楽天市場系 / au PAYマーケット系のgeneric rowをplaceholderへ隔離
- carrier 4件で回線解約とMNPを混同しないsummaryへ整理
- App Store / Google Play / direct billing等の主要routeをverified recordへ追加

### Wave 2 completed

- ABEMAの現行有料視聴プラン解約ページを確認し、決済経路別の解約を記録
- AWA StandardプランのApp Store / Google Play / Web / partner経由の自動更新停止を確認
- Boxの旧誤リンクを現行「アカウント/サブスクリプションのキャンセル方法」へ修正し、Personal ProとBusiness/Enterpriseの差を記録
- BookLive旧「読み放題」項目を実在する「月額ポイントコース」へ是正。2025-09-24に新規登録終了済みで、解除後は再登録不可という公式注意点を記録
- DMMブックス旧「読み放題」は現行公式helpで月額読み放題としての実体を確認できないためplaceholderへ隔離
- 楽天マガジンをdirect procedure URL確定待ちの`needs_review`へ整理

### Wave 3 completed

- Amazon Music UnlimitedをAmazon公式キャンセル案内でverified化。Amazon直契約とApp Store / Google Play / carrier等の第三者請求を分離
- Kindle UnlimitedをAmazon公式キャンセル案内でverified化。解約後も次回請求日までは利用可能という公式挙動を記録
- ニコニコプレミアムを現行ニコニコヘルプの解約導線でverified化
- Rakuten TVを2026年2月の大規模plan終了後の状態へ更新し、存続定額見放題planの購入履歴からの解約をverified化
- 楽天マガジンを楽天公式サポートの「ご契約内容の確認・変更」導線でverified化
- Amazonプライムは解約経路自体は確認できるが、日本向けの安定した公開help直リンクを正式公開前に再確認するため`needs_review`
- ディズニープラスはdirect billing / third-party billing / account deletionの違いは公式確認できるが、日本向け個別解約記事URLを正式公開前に確定するため`needs_review`

Phase 1の目的だった「旧版由来の未判定データを残さない」は達成。残る2件は具体的な公式導線の最終固定問題であり、legacy migration debtではない。

## Phase 2 — Expand to 100

Status: **next**.

現在の40 seedを土台に、追加60件程度をresearch waveで収録する。ただしplaceholder 4件は公開数に含めないため、100 public-visibleを目標にする場合は実質64件以上の有効record追加が必要。

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
- まず100件候補を作るのではなく、**100 public-visible / verified中心**を目標に追加waveを組む
- Amazonプライム / ディズニープラスの`needs_review` 2件はPhase 2初期に並行して閉じる

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
