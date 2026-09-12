# SQL DB Risk Checker — canonical tool specification

- **Slug:** `sql-db-risk-checker`
- **Display name (JA):** SQL・DBリスク確認
- **Display name (EN):** SQL DB Risk Checker
- **Implementation:** `tools/sql-db-risk-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** sql, database, risk, developer
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `sql-db-risk-checker` implementation at `/tools/sql-db-risk-checker/`. It does not authorize a production rewrite.

## 2. Purpose

SQLを実行する前に文字列として解析し、破壊的DDL、WHERE句のないUPDATE/DELETE、読み取り専用方針への違反など、DB事故につながりやすいパターンをブラウザ内で警告する。実DBへ接続したりSQLを実行・自動修正したりするツールではない。

## 3. Inputs

- SQL text。複数文は`;`で区切れる。
- Environment: Unknown / Dev / Staging / Prod。
- Database type: Generic / Postgres / MySQL / SQLite。
- Read-only mode toggle。
- 実行前チェックリストの手動チェック状態。

## 4. Processing behavior

- セミコロン区切りの複数SQL文を受け付け、コメントを除外しながら文単位へ分割してルールベースで解析する。
- DROP / TRUNCATE / ALTER / DROP COLUMN等の危険DDL、トップレベルWHEREのないUPDATE/DELETE、書き込み系操作などを検出し、警告理由・確認案・サマリー・risk levelを表示する。
- UPDATE/DELETE内のサブクエリにだけ`WHERE`がある場合、それを対象行制限のトップレベルWHEREとして扱わず、全件操作の可能性を警告する。
- 対象環境はUnknown / Dev / Staging / Prod、DB種別はGeneric / Postgres / MySQL / SQLiteを自己申告で選択できる。実際の接続先やDB種別を自動検出しない。
- read-only modeではSELECT以外を強く警告する。
- Freeではrisk summaryとpre-run checklistをコピーできる。
- current legacy shared NicheWorks Pro active時はSafe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown export、JSON exportの実装済み出力を利用できる。
- 入力SQL自体を変更・実行・送信しない。

## 5. Outputs

- Low / Medium / High等のrisk badge。
- statement count、write-operation count、warning count、選択DB、選択environmentのsummary。
- 警告一覧、理由、事前確認案、SQL preview。
- Freeのcopyable risk summaryとpre-run checklist。
- current legacy ProのSafe Execution Pack、Review Summary、DB-specific Checklist、Migration Review、Team Handoff、Markdown、JSON。

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/sql-db-risk-checker/app-sdrc.js`, `tools/sql-db-risk-checker/app.js`, `tools/sql-db-risk-checker/howto/en/index.html`, `tools/sql-db-risk-checker/howto/index.html`, `tools/sql-db-risk-checker/index.html`.

## 7. Privacy/data handling

- SQL解析はブラウザ内で実行し、入力SQLを解析APIへ送信しない。
- ページ表示時にはGoogle Analytics / AdSense等の外部タグが読み込まれ得る。
- current legacy Pro entitlement確認は共通NicheWorks Pro基盤の通信・保存契約に従う。
- 機密SQLにはテーブル名・列名・業務ロジック等が含まれ得るため、利用者は組織の情報管理ルールを優先する。
- staged product-scoped controllerが扱うのは固定product/feature entitlement metadataだけとし、SQL本文、parsed statement、warning、table/column name、generated review/export contentをbilling/entitlement requestへ追加しない。

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- 入力・結果・Pro previewを複数カードで構成し、デスクトップでは横並び、狭い画面では縦方向へ縮退する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JA/ENのUIを同一ページで切り替える。入力SQLは翻訳しない。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/sql-db-risk-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/sql-db-risk-checker/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

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

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (behavior test). Behavior-level status: **behavior-test-present**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/sql-db-risk-checker/index.html`
- `tools/sql-db-risk-checker/app-sdrc.js`
- `tools/sql-db-risk-checker/app.js`
- `tools/sql-db-risk-checker/style.css`
- `tools/sql-db-risk-checker/usage.html`
