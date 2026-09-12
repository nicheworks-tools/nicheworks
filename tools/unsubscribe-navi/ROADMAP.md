# 解約どこナビ Roadmap — 100–200 service database

## Target

最終的な狙いは、雑なリンク集ではなく、**100〜200サービスの解約・退会・自動更新停止等を公式sourceベースで整理したデータベース**にすること。

収益化はその後段。最優先は「解約したいユーザーを正しいofficial pathへ到達させる」こと。

## Phase 0 — Absorption foundation

Status: implemented on the absorption branch.

- standalone repositoryの約40recordをmonorepoへ移す
- 旧6時間HTTP checkerをcanonical updaterとして廃止
- legacy recordを`legacy_review_required`へ統一
- database schema / audit / search / category filterを整備
- current 87-tool quality cycleを壊さないためregistry追加は保留

## Phase 1 — Legacy 40 cleanup

Goal: 旧40件を「使える40件」へ変える。

- 40件全件をofficial sourceで再確認
- dead / renamed / migrated serviceを`retired`または現行identityへ整理
- generic entry（例: 「○○系サブスク」）をactual service単位へ分解または削除
- missing procedure URLを補う
- App Store / Google Play / direct billing等のroute差を記録
- 誤redirect / irrelevant pageを除去

Exit gate:

- legacy_review_requiredを原則0へ近づける
- visible recordの大半がverifiedまたは明示的retired

## Phase 2 — Expand to 100

追加60件程度をresearch waveで収録する。

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

正式登録は別PR/phaseで行い、その時点のrepository contractに従って以下を更新する:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- sitemap / mother-site exposure
- tool count / quality plan as necessary
