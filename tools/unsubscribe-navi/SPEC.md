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

Phase 1はmonorepoへ吸収済みだが、既存87ツールの品質改善母数を変えないため正式公開前のstaged stateとする。production-intent landingは`index.staged.html`に保持し、正式登録時に`index.html`へ昇格させる。

- `data/services.json` をブラウザから読み込む静的ツール。
- サービス名、alias、keyword、category、summaryを検索対象にする。
- category filterを提供する。
- `placeholder` recordは通常検索結果に表示しない。
- `verified` と旧版移行データをUI上で明確に区別する。
- `procedure_url` がある場合のみ手続き候補/公式手続き情報へのlinkを表示し、無い場合はofficial siteのみ表示する。
- legacy recordをHTTP 200だけでverifiedへ昇格させない。

## Inputs

ユーザー入力は以下のみ。

- 任意の検索語
- category filter

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

## State and persistence

ユーザー入力や検索状態を永続保存しない。localStorage、cookie、account DBは使用しない。データベース本体はrepository内のstatic JSONを正本とする。

## Privacy and network behavior

検索語は外部送信しない。runtime network accessは同一site上の`data/services.json`取得と、ユーザーが明示的にofficial linkを開いた場合に限る。GA4 / AdSenseはNicheWorks共通仕様に従う。

解約先サービスのlogin情報、契約情報、決済情報をNicheWorksへ入力させてはならない。

## Language mode

`Japanese-only`

本ツールは日本居住者・日本語検索を主対象とするためPhase 1は日本語のみとする。海外サービスも日本から利用されるsubscriptionとして収録できる。

## Layout class

`hybrid`

検索・filterはmobileで1columnへ変形し、結果はdesktopで2column、狭幅で1columnとする。100〜200recordでも一覧性を保つ。

## Limits and non-goals

- NicheWorks上で直接解約しない。
- login credentialや決済情報を収集しない。
- HTTP statusのみで手続きの正しさを断定しない。
- officialでないblogやaffiliate記事を手続きの一次sourceとして扱わない。
- verifiedでないrecordへ架空のverification dateを入れない。
- countを増やすためだけのplaceholderやgeneric brand entryを公開しない。
- cancellationを妨害する収益導線を設置しない。
- staged stateの間はpublic `index.html` を作らない。

## Acceptance criteria

- [x] 単独repository由来のservice setをmonorepoへmigration-safeに吸収している。
- [x] legacy dataとverified dataを明示的に区別するdata contractを持つ。
- [x] 検索とcategory filterが100〜200record規模へそのまま拡張できる。
- [x] schema / duplicate / state / target progressをnetworkなしで確認できるaudit scriptを持つ。
- [x] 100→150→200 serviceへの拡張方針がrepository内ROADMAPに固定されている。
- [x] current 87-tool registryを変えずにstaged sourceを保持する。
- [ ] legacy recordのofficial-source再検証が完了している。
- [ ] 100 service以上がverifiedまたは適切なretired historyとして整理されている。

## Implementation evidence

- `tools/unsubscribe-navi/index.staged.html` — staged static UI / SEO / FAQ / NicheWorks common surfaces
- `tools/unsubscribe-navi/app.js` — local database search and rendering
- `tools/unsubscribe-navi/style.css` — responsive hybrid layout
- `tools/unsubscribe-navi/data/services.json` — canonical service records
- `tools/unsubscribe-navi/scripts/audit-services.mjs` — repository-local database audit
- `tools/unsubscribe-navi/DATA_MODEL.md` — forward data and verification contract
- `tools/unsubscribe-navi/ROADMAP.md` — 100–200 service expansion plan
