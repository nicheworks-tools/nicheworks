# 解約どこナビ Data Model

## 1. Core principle

このDBは「URLが開いたか」を記録するlink checkerではなく、**どのserviceについて、どの公式sourceが、どの手続き種別を説明しているか**を管理する。

HTTP 200、page title取得成功、redirect成功だけではverification evidenceにならない。

## 2. Canonical record

必須/主要field:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | stable service identifier |
| `name` | yes | public service / plan name |
| `category` | yes | canonical category |
| `official_site_url` | yes | official service/site URL |
| `procedure_url` | conditional | official procedure/help URL when known |
| `aliases` | no | alternate names / former names |
| `keywords` | no | search helpers |
| `summary` | no | short procedural note |
| `publication_state` | yes | verification/publication state |
| `procedure_type` | recommended for verified | canonical procedure semantics |
| `billing_routes` | recommended for verified | contract / billing routes that materially change the procedure |
| `verification.last_verified_at` | verified only | actual manual/research verification date |
| `verification.source_title` | verified only | title/identity of verified official source |
| `verification.final_url` | no | observed final URL when redirects matter |

Later expansion may add:

- `account_deletion_url`
- `auto_renewal_stop_url`
- `transfer_or_mnp_url`
- `effective_until`
- `refund_notes`
- `cancellation_fee_notes`
- `evidence[]`
- `change_history[]`

These fields must only be added when supported by official evidence.

## 3. Publication states

### `legacy_review_required`

Standalone repositoryから移行したrecord。旧版の自動HTTP checker結果はverificationとして引き継がない。Phase 1終了時点でeffective dataset上は0件。

### `verified`

現在のofficial sourceと手続きの意味を実際に確認済み。最低限`procedure_url`、`last_verified_at`、`source_title`を持つ。

### `needs_review`

一度verifiedだった、またはservice再編等により単一recordのまま公開すると誤解を生む可能性があり、再整理・再確認が必要。

### `retired`

service / planが終了、統合、名称変更等で現行契約対象ではないがhistoryとして残す価値がある。

### `placeholder`

候補管理用。通常のpublic search resultには出さない。旧版generic rowの隔離にも使用できる。

## 4. Procedure semantics

解約関連語を同一視しない。`procedure_type`は少なくとも以下を区別できる設計とする。

- `subscription_cancellation`
- `automatic_renewal_stop`
- `account_deletion`
- `plan_downgrade_or_cancellation`
- `carrier_termination`
- `mnp_transfer_out`
- `app_store_subscription_cancellation`
- `marketplace_or_reseller_cancellation`

同じserviceでも契約経路によってprocedureが異なる場合、`billing_routes`で主要経路を保持し、単一の説明文で無理に統合しない。

現時点で利用してよいroute例:

- `web_direct`
- `app_store`
- `google_play`
- `amazon_appstore`
- `amazon_billing`
- `partner_billing`
- `carrier_billing`
- `credit_card`
- `paypal`
- `account_portal`
- `mnp_transfer`
- operator/account specific route（例: `microsoft_account`, `nintendo_account`）

route名は手続き差分の検索・監査用identifierであり、決済事業者を網羅すること自体を目的にしない。

## 5. Verification rule

verified昇格時に確認する内容:

1. source domain / pageがservice operatorまたは明確なofficial supportか。
2. pageが実際に対象service / planの解約・退会等を説明しているか。
3. 対象地域・対象planが日本利用者に適合するか。
4. billing / contract route差分がある場合に取りこぼしていないか。
5. redirect先が別topicへ変わっていないか。
6. source titleと最終URLを記録する価値がある場合は保存する。
7. 実際に確認した日だけ`last_verified_at`へ入れる。

## 6. Dataset composition

Phase 2以降のeffective datasetは3層で構成する。

### Legacy base

`data/services.json` はstandalone版から持ち込んだ40件のmigration snapshot。Phase 1 provenance保持のため原則として直接書き換えない。

### Additions

`data/additions/*.json` はPhase 2以降に新規収録するservice record。

ルール:

- addition recordの`id`はlegacy baseおよび先行addition waveと衝突してはならない。
- 同一wave file内で同じ`id`を重複させない。
- verified追加はofficial procedure source、verification date/source title、procedure typeを持つ。
- 件数合わせだけのplaceholderはPhase 2追加数として扱わない。
- runtimeとauditはaddition fileをファイル名昇順で読み、legacy baseの後に追加する。

### Re-verification overlays

`data/reverification/*.json` は既存recordの新しい公式確認結果を`id`単位で上書きする。

ルール:

- overlay recordはlegacy baseまたはadditionに既に存在する`id`だけを上書きできる。
- 同一wave file内で同じ`id`を重複させない。
- 後のwaveで同じ`id`を再確認した場合は、**後waveを正とするlast-wins**で上書きできる。
- overlay適用順はファイル名の昇順とし、runtimeの明示listも同じwave順を維持する。
- overlayは「HTTP checker結果」ではなくofficial-source reviewの結果だけを保存する。

Merge orderは常に **legacy base → additions → re-verification overlays** とする。runtimeとauditはこのmerge semanticsを一致させる。

## 7. Database scale

100〜200 servicesを前提とし、raw countではなくqualityで進捗を見る。

Primary metrics:

- total records
- public-visible records
- verified records
- review-required records
- retired records
- records with direct procedure URL
- category coverage
- billing-route coverage
- last-verified freshness
- phase 2 added ids

200件あっても大半がgeneric brand pageなら完成扱いしない。

## 8. Source policy

手続きの一次sourceとして優先:

1. service operator official help / support
2. service operator official account / billing documentation
3. official app-store/provider documentation where the billing route itself is controlled by that provider

第三者blog、SEO記事、affiliate比較記事はservice候補発見や補助調査には使えても、verified procedureの正本にはしない。

## 9. Legacy migration

Standalone版の40recordは、`status: ok/check`や自動取得titleを捨て、元のservice identity / candidate URL / noteだけをmigration seedとして扱う。

Phase 1で全旧recordを再分類し、effective dataset上の`legacy_review_required`は0件になった。旧checkerの6時間自動commitはmonorepoへ移植しない。今後自動checkを入れる場合も、semantic verificationと機械的link healthを別signalとして保持する。
