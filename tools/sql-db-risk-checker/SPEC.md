# Tool Specification — SQL DB Risk Checker

- Slug: `sql-db-risk-checker`
- Public URL: `https://nicheworks.app/tools/sql-db-risk-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

SQLを実行する前に文字列として解析し、破壊的DDL、WHERE句のないUPDATE/DELETE、読み取り専用方針への違反など、DB事故につながりやすいパターンをブラウザ内で警告する。実DBへ接続したりSQLを実行・自動修正したりするツールではない。

## Current functional contract

- セミコロン区切りの複数SQL文を受け付け、コメントを除外しながら文単位へ分割してルールベースで解析する。
- DROP / TRUNCATE / ALTER / DROP COLUMN等の危険DDL、トップレベルWHEREのないUPDATE/DELETE、書き込み系操作などを検出し、警告理由・確認案・サマリー・risk levelを表示する。
- UPDATE/DELETE内のサブクエリにだけ`WHERE`がある場合、それを対象行制限のトップレベルWHEREとして扱わず、全件操作の可能性を警告する。
- 対象環境はUnknown / Dev / Staging / Prod、DB種別はGeneric / Postgres / MySQL / SQLiteを自己申告で選択できる。実際の接続先やDB種別を自動検出しない。
- read-only modeではSELECT以外を強く警告する。
- Freeではrisk summaryとpre-run checklistをコピーできる。
- 共通NicheWorks Proが有効な場合、Safe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown export、JSON exportの実装済み出力を利用できる。
- 入力SQL自体を変更・実行・送信しない。

## Inputs

- SQL text。複数文は`;`で区切れる。
- Environment: Unknown / Dev / Staging / Prod。
- Database type: Generic / Postgres / MySQL / SQLite。
- Read-only mode toggle。
- 実行前チェックリストの手動チェック状態。

## Outputs

- Low / Medium / High等のrisk badge。
- statement count、write-operation count、warning count、選択DB、選択environmentのsummary。
- 警告一覧、理由、事前確認案、SQL preview。
- Freeのcopyable risk summaryとpre-run checklist。
- ProのSafe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown、JSON。

## State and persistence

- SQL本文、解析結果、チェックリスト状態は基本的に現在ページのメモリ上で扱い、SQL本文の永続保存を仕様としない。
- UI languageは`nw_lang`をlocalStorageへ保存する。
- Pro状態は共通NicheWorks Pro bridge / entitlement側の契約に従う。

## Privacy and network behavior

- SQL解析はブラウザ内で実行し、入力SQLを解析APIへ送信しない。
- ページ表示時にはGoogle Analytics / AdSense等の外部タグが読み込まれ得る。
- Pro entitlement確認は共通NicheWorks Pro基盤の通信・保存契約に従う。
- 機密SQLにはテーブル名・列名・業務ロジック等が含まれ得るため、利用者は組織の情報管理ルールを優先する。

## Language mode

`bilingual single-page`

JA/ENのUIを同一ページで切り替える。入力SQLは翻訳しない。

## Layout class

`hybrid`

入力・結果・Pro previewを複数カードで構成し、デスクトップでは横並び、狭い画面では縦方向へ縮退する。

## Limits and non-goals

- 完全なSQL parserではなく、正規表現・ルールベースの事故予防チェックである。
- SQLの意味的安全性、実際の対象行数、実DBのschema、権限、lock、transaction状態を検証しない。
- environment選択は自己申告であり、本番接続を自動検知しない。
- 警告が0でも安全を保証しない。
- SQLを実行、自動修正、rollback、backupしない。
- セキュリティ監査、DB設計監査、法令・コンプライアンス監査の代替ではない。

## Acceptance criteria

- [ ] トップレベルWHERE句のないDELETEまたはUPDATEを入力すると重大警告として検出され、影響行確認を促す。
- [ ] UPDATE/DELETE内のネストしたサブクエリにだけWHEREが存在する場合、それだけを理由に全件操作警告を抑止しない。
- [ ] DROP / TRUNCATE等の破壊的SQLを入力すると危険操作として警告される。
- [ ] read-only modeで非SELECT文を入力すると通常より強い警告が出る。
- [ ] Environment / DB typeの選択がsummaryと該当する注意表示へ反映される。
- [ ] 入力SQLを実DBへ送信・実行せず、Free結果をコピーできる。
- [ ] JA/EN切替が機能し、SQL本文そのものは翻訳されない。

## Implementation evidence

- `tools/sql-db-risk-checker/index.html` — inputs、Free/Pro UI、privacy/disclaimer、共通Pro表示。
- `tools/sql-db-risk-checker/app-sdrc.js` — statement split、comment stripping、risk rules、DB/environment/read-only handling、copy/export、language state。
- `tools/sql-db-risk-checker/pro-bridge.js` — shared Pro entitlement gateと、ネストしたWHEREをトップレベルWHEREと誤認しないruntime safety guard。
- `tools/sql-db-risk-checker/app.js` — legacy entryが空で、実処理が`app-sdrc.js`へ移行済みであることを明示。
