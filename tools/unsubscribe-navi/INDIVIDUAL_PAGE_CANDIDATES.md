# 解約どこナビ — Individual Page Candidates

Status: selected for staged page design; **not yet published**.

Selection date: 2026-09-12

## Purpose

100 public-visible recordsから、一覧cardだけでは情報を圧縮しすぎるserviceを個別page候補として選ぶ。

個別pageは単なるservice名 + 公式linkのthin pageにしない。契約経路、解約と退会・MNP・ダウングレードの違い、利用終了タイミング等、repository内のverified evidenceから一覧以上の説明を構成できる場合だけ生成対象にする。

## Selection rules

必須:

1. effective recordが`verified`
2. direct official procedure URLがある
3. `verification.last_verified_at`と`source_title`がある
4. 一覧card以上の説明要素がある

優先度を上げる条件:

- billing routeが複数あり、購入元によって解約先が変わる
- `subscription_cancellation` / `automatic_renewal_stop` / `carrier_termination` / account deletion等を混同しやすい
- MNP、アカウント削除、無料プランへのdowngrade等を別手続きとして説明する必要がある
- 解約後の利用期間など、official sourceに基づく重要な注意点がある

優先度を下げる条件:

- 単一routeかつ一覧cardだけで十分に説明できる
- sourceはverifiedでも個別pageに増やせる情報が乏しい
- service identityや契約単位が再編中

## P0 — first staged page prototypes (10)

| record id | service | route / semantic reason | page focus |
| --- | --- | --- | --- |
| `fod-premium` | FODプレミアム | Web / App Store / Google Play / Amazon / carrier / partner | 購入経路ごとの解約先を明示 |
| `telasa` | TELASA 見放題プラン | Web / Apple / Google / carrier / Amazon | 契約ID・決済経路の判別 |
| `dmm-tv` | DMM TV / DMMプレミアム | Web / Apple / Google / Amazon / partner | DMMプレミアム契約と動画見放題の関係 |
| `line-music` | LINE MUSIC | Google / Apple / carrier / card / LINE STORE / partner | 購入元判定、自動更新停止、アカウント退会との差 |
| `adobe-cc` | Adobe Creative Cloud | Adobe / Apple / Google / Microsoft / partner | Adobe直接契約と第三者購入を分離 |
| `lemino-premium` | Leminoプレミアム | Web / dアカウント / Apple / Google / store / phone | My docomo系とアプリ課金を分離 |
| `pixiv-premium` | pixivプレミアム | Web / PayPal / carrier / Apple / Google | 支払方法別の解約導線 |
| `wowow` | WOWOW | WOWOW直接 / partner / Amazon / Apple | 放送・配信系の契約元判定 |
| `ymobile` | Y!mobile | account portal / MNP / store / phone | 回線解約とMNP転出を明確に分離 |
| `uq-mobile` | UQ mobile | account portal / store / MNP | 解約・MNP・契約解除条件を分離 |

P0は最初のstaged page generator / template検証対象とする。10件すべてを一度に公開する意味ではない。

## P1 — second staged wave (10)

| record id | service | route / semantic reason | page focus |
| --- | --- | --- | --- |
| `disney-plus` | ディズニープラス | direct / Apple / Google / partner | subscription解約とMyDisney account削除を分離 |
| `hulu-jp` | Hulu（日本） | Web / Apple / partner | 支払い元ごとの解約先 |
| `youtube-premium` | YouTube Premium | Web / Google Play / Apple | 購入経路ごとの管理先 |
| `d-anime` | dアニメストア | docomo / Apple / Google | ドコモ契約とストア課金を分離 |
| `chatgpt-plus` | ChatGPT 有料プラン | Web / Apple / Google | 購入経路別のキャンセル |
| `evernote` | Evernote 有料プラン | Web / Apple / Google / PayPal | 購入元ごとの解約 |
| `claude-paid` | Claude Pro / Max | Web / Apple / Google | platform別解約と請求前の注意 |
| `nordvpn` | NordVPN | Web / Apple / Google / Amazon | subscription cancellationではなく自動更新停止を明示 |
| `radiko-premium` | radikoプレミアム | Web / Apple / Google | 無料プランへの変更とaccount退会を分離 |
| `moneyforward-me-premium` | マネーフォワード ME プレミアム | Web / Apple / Google | 決済経路別の更新停止と利用期限 |

## P2 — coverage / template diversity (5)

| record id | service | route / semantic reason | page focus |
| --- | --- | --- | --- |
| `audible` | Audible 会員プラン | Web / Apple / Google | 退会とアプリ削除を混同しない |
| `bookwalker-yomihodai` | BOOK☆WALKER 読み放題 | Web / Apple / Google | 読み放題契約だけを解約する経路 |
| `onedrive` | Microsoft 365 / OneDrive | Microsoft / Apple / Google / partner | Microsoft直接購入と購入元管理を分離 |
| `google-one` | Google One | Web / Google Play / Apple | OS・購入経路別の解約 |
| `mineo` | mineo | account portal / MNP | 通常解約とMNP転出を分離 |

## Selected total

- P0: 10
- P1: 10
- P2: 5
- total: **25 candidates**

これは公開順の永久固定リストではない。正式公開後にGSC等の需要signalが取れるようになった場合は、verified qualityを下げずに優先順位だけを入れ替えられる。

## Explicit exclusions for the first individual-page wave

### Amazonプライム

`needs_review`のため対象外。安定した日本向けofficial procedure sourceを固定するまで個別pageを生成しない。

### `retired` / `placeholder`

現役service向けの解約pageとして生成しない。履歴用途が必要になった場合は別templateとする。

### simple single-route records

verifiedでも一覧card以上の情報量を作れないserviceは初期候補から外す。SEO目的だけでthin pageを量産しない。

## Individual page minimum contract

各pageは最低限以下を持つ。

- service / plan identity
- verification state and last verified date
- official procedure link
- procedure type
- 契約・billing routeの判別
- route別の手続き先
- 解約とaccount deletion / MNP / downgrade等の違い（該当時）
- 解約後の利用期間・更新停止タイミング等（official sourceに根拠がある場合のみ）
- official sources
- 「NicheWorks上では解約しない」明示

根拠がないfee、refund、利用期限等を推測で補完しない。

## Staging order

1. P0から構造の異なる5件を選び、共通templateでstaged generationを試す
   - `fod-premium`
   - `line-music`
   - `adobe-cc`
   - `ymobile`
   - `lemino-premium`
2. 5件でroute表現、mobile layout、FAQ、internal navigation、source表示を検証
3. 問題がなければP0残り5件へ拡張
4. P1 / P2は同じcontractで生成可能なことを確認してから追加
5. tool自体がunregisteredの間は個別pageもpublic sitemap / mother-siteへ露出しない
