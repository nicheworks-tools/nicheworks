# 解約どこナビ Roadmap — 100–200 service database

## Target

最終的な狙いは、雑なリンク集ではなく、**100〜200サービスの解約・退会・自動更新停止等を公式sourceベースで整理したデータベース**にすること。

収益化はその後段。最優先は「解約したいユーザーを正しいofficial pathへ到達させる」こと。

## Phase 0 — Absorption foundation

Status: implemented.

- standalone repositoryの約40recordをmonorepoへ移す
- 旧6時間HTTP checkerをcanonical updaterとして廃止
- database schema / audit / search / category filterを整備
- current 87-tool quality cycleを壊さないためregistry追加は保留
- repository SEO contractを守るためlandingは`index.staged.html` + `noindex,nofollow`で保持

## Phase 1 — Legacy 40 cleanup

Status: **complete (2026-09-12)**.

最終状態:

- effective records: 40
- `verified`: 33
- `retired`: 1（dTV → Lemino）
- `needs_review`: 2（Amazonプライム / ディズニープラス）
- `placeholder`: 4
- `legacy_review_required`: **0**
- public-visible: 36
- verified比率: 約92%

主な是正:

- iCloud+の誤redirect、Notion / Slack / Adobe等の旧help URLを現行official sourceへ修正
- dTVをLemino移行済みhistoryへ変更
- generic / 架空 / 実体不一致rowをplaceholderへ隔離
- carrierの解約とMNP、subscription cancellationとaccount deletionを分離
- Amazon Music Unlimited / Kindle Unlimited / ニコニコ / Rakuten TV / 楽天マガジン等を現行official sourceで再確認

旧40件は`data/services.json`をmigration snapshotとして保持し、`data/reverification/*.json`をlast-wins overlayとして適用する。

## Phase 2 — Expand to 100

Status: **active**.

100件というraw countではなく、**100 public-visible / verified中心**を目標にする。Phase 1のplaceholder 4件は公開数に含めないため、開始時点36 public-visibleから+64以上の有効recordが必要。

Phase 2では新規serviceを`data/additions/*.json`へwave単位で追加し、legacy migration snapshotを直接増築しない。merge順は legacy base → additions → re-verification overlays。

### Wave 1 — 2026-09-12

Official-source verified 10件:

- DAZN
- FODプレミアム
- TELASA 見放題プラン
- Audible 会員プラン
- Zoom 有料プラン
- Evernote 有料プラン
- Claude Pro / Max
- mineo
- UQ mobile
- IIJmio

Wave 1反映後:

- effective records: 50
- public-visible: 46
- verified: 43
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: **46%**

### Wave 2 — 2026-09-12

Official-source verified 7件:

- WOWOW
- GitHub Copilot Pro / Pro+ / Max
- Perplexity Pro
- LinkedIn Premium
- Microsoft Copilot Pro
- Apple One
- Google Workspace Individual

Wave 2反映後:

- effective records: 57
- public-visible: 53
- verified: 50
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: **53%**

Wave 2では件数を10へ揃えることを優先せず、公式のキャンセル/解約手順を十分に固定できた7件だけを追加した。Canva等、公式情報はあるが直接手続きsourceの確定が弱い候補はverified追加を見送る。

### Wave 3 — 2026-09-12

Official-source verified 11件:

- X Premium
- Discord Nitro / Nitro Basic
- 1Password
- Grammarly 有料プラン
- Strava サブスクリプション
- Todoist Pro
- Miro Starter / Business
- Figma Professional
- Google Play Pass
- NordVPN
- Skillshare

Wave 3反映後:

- effective records: 68
- public-visible: 64
- verified: 61
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: **64%**

Wave 3でも件数優先にはせず、公式の解約・自動更新停止sourceと契約経路を固定できたserviceだけを追加する。Amazonプライム / ディズニープラスは日本向けの安定した公式procedure URLをまだ固定できていないため、`needs_review`のまま維持する。

### Wave 4 — 2026-09-12

Official-source verified 11件:

- Y!mobile
- BIGLOBEモバイル
- radikoプレミアム
- マネーフォワード ME プレミアムサービス
- Chatwork 有料プラン
- Udemy 個人向け定額プラン
- Medium Membership
- Proton 有料プラン
- Asana 有料プラン
- Trello Standard / Premium
- Dropbox Sign

Wave 4反映後:

- effective records: 79
- public-visible: 75
- verified: 72
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: **75%**

Wave 4では国内通信・音声・家計簿・業務SaaS・学習を厚くした。解約とMNP、サブスクリプション停止とアカウント削除、ストア課金とWeb課金を同一視せず、公式source上の手続き差をrecordへ反映する。

### Next waves

Priority:

1. 動画配信 / streaming
2. 音楽 / audio
3. AI / SaaS / productivity
4. cloud / storage
5. mobile / carrier / SIM
6. gaming memberships
7. ebooks / magazines / learning
8. major shopping / paid memberships

候補例としてLemino、追加MVNO、Canva、学習subscription等を調査するが、official procedure sourceを確認できるまでverified追加しない。

Rule:

- candidate発見とverified公開を分離する
- official sourceが取れない候補は公開数に含めない
- 同一brandの複数planはprocedureが実際に異なる場合のみ分ける
- 新規addition `id`は既存base/additionと衝突不可
- Amazonプライム / ディズニープラスの`needs_review` 2件も並行して閉じる

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
