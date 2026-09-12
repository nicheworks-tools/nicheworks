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
- current legacy shared NicheWorks Pro active時はSafe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown export、JSON exportの実装済み出力を利用できる。
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
- current legacy ProのSafe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown、JSON。

## State and persistence

- SQL本文、解析結果、チェックリスト状態は基本的に現在ページのメモリ上で扱い、SQL本文の永続保存を仕様としない。
- UI languageは`nw_lang`をlocalStorageへ保存する。
- current live Pro状態は共通legacy NicheWorks Pro bridge / entitlement側の契約に従う。

## Paid-operation boundary

現行runtimeとSPECから、product-scoped migrationでpaid operationとして扱う境界は次の7つとする。

1. **Safe Execution Pack** — 実行前の安全確認パックをコピーする。
2. **Review Summary** — レビュー用summaryをコピーする。
3. **DB-specific Checklist** — 選択DB向けのチェックリストをコピーする。
4. **Migration Review** — migration向けレビュー文をコピーする。
5. **Team Handoff** — チーム引き継ぎ文をコピーする。
6. **Markdown export** — review Markdownを保存する。
7. **JSON export** — review JSONを保存する。

Freeのrisk checker本体、warning/reason/check guidance、SQL preview、risk-summary copy、pre-run checklist copyは移行時にもFreeのまま維持する。

## Product-scoped migration staging

`tools/sql-db-risk-checker/product-scoped-controller.mjs`は**non-live staging wrapper**であり、共通`assets/nw-product-scoped-controller.mjs`へentitlement state machineを委譲する。現在の公開`pro-bridge.js`を置き換えていない。

staging contractは次を要求する。

- explicit future `productId`。default productは持たない。
- 上記7 paid operationsに対するcomplete / unique feature-ID mapping。
- common server-backed entitlement clientによる`refreshProState({ productId })`。
- exact product match。
- `active: true`。
- `source: "server"`。
- `reason: "verified_entitlement"`。
- verified server responseのfeature listに含まれるoperationだけを解放する。

wrong-product、local/browser-only、unverified、missing/duplicate mapping、refresh failureは共通coreでfail closedする。

過去のbypass修正を維持し、legacy bridgeでも`entitlement === "nicheworks_pro"`という名称だけではactive扱いにしない。current legacy bridgeはmatching entitlementに加え、`active` / `pro` / `unlocked` / `status === "active"`の明示的active signalを要求する。このhardeningをproduct-scoped移行の途中で弱めてはならない。

また、current runtimeの`hasTopLevelWhere` safety guardを保持する。product-scoped migration作業はSQL解析ルールを置換してはならず、UPDATE/DELETE内のネストしたsubqueryの`WHERE`だけを理由に全件操作警告を抑止してはならない。

historical shared Payment Linkや既存legacy価格表記はfuture SQL DB Risk productの価格・product ID・billing modelの根拠ではない。

## Privacy and network behavior

- SQL解析はブラウザ内で実行し、入力SQLを解析APIへ送信しない。
- ページ表示時にはGoogle Analytics / AdSense等の外部タグが読み込まれ得る。
- current legacy Pro entitlement確認は共通NicheWorks Pro基盤の通信・保存契約に従う。
- 機密SQLにはテーブル名・列名・業務ロジック等が含まれ得るため、利用者は組織の情報管理ルールを優先する。
- staged product-scoped controllerが扱うのは固定product/feature entitlement metadataだけとし、SQL本文、parsed statement、warning、table/column name、generated review/export contentをbilling/entitlement requestへ追加しない。

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
- staged product-scoped contractはproduct ID、price、Stripe Price ID、production feature namespace、live checkoutを承認しない。

## Acceptance criteria

- [ ] トップレベルWHERE句のないDELETEまたはUPDATEを入力すると重大警告として検出され、影響行確認を促す。
- [ ] UPDATE/DELETE内のネストしたサブクエリにだけWHEREが存在する場合、それだけを理由に全件操作警告を抑止しない。
- [ ] DROP / TRUNCATE等の破壊的SQLを入力すると危険操作として警告される。
- [ ] read-only modeで非SELECT文を入力すると通常より強い警告が出る。
- [ ] Environment / DB typeの選択がsummaryと該当する注意表示へ反映される。
- [ ] 入力SQLを実DBへ送信・実行せず、Free結果とpre-run checklistをコピーできる。
- [ ] current legacy Proの7出力はFree checkerから独立したgateのまま維持される。
- [ ] JA/EN切替が機能し、SQL本文そのものは翻訳されない。
- [ ] staged product-scoped wrapperは7 paid operationsをexactly once定義し、entitlement state machineをshared coreへ委譲する。
- [ ] entitlement nameだけではpaid stateをactiveにできないhardeningを維持する。
- [ ] `hasTopLevelWhere` safety guardを保持し、nested WHERE regressionを起こさない。
- [ ] staged wrapperはcommercial configurationが承認されるまでpublic runtimeへ接続しない。

## Implementation evidence

- `tools/sql-db-risk-checker/index.html` — inputs、Free/Pro UI、privacy/disclaimer、共通Pro表示。
- `tools/sql-db-risk-checker/app-sdrc.js` — statement split、comment stripping、risk rules、DB/environment/read-only handling、Free copy、Pro copy/export、language state。
- `tools/sql-db-risk-checker/pro-bridge.js` — current legacy shared gate、explicit active-state hardening、nested WHERE runtime safety guard。
- `tools/sql-db-risk-checker/product-scoped-controller.mjs` — staged shared-core wrapper。
- `tools/sql-db-risk-checker/app.js` — legacy entryが空で、実処理が`app-sdrc.js`へ移行済みであることを明示。
- `scripts/check-sql-db-risk-product-scoped-staging.mjs`。
- `docs/billing/pro-product-contracts-wave2.md`。
