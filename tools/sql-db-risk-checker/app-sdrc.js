"use strict";

const $ = (id) => document.getElementById(id);

const els = {
  sqlInput: $("sqlInput"),
  envSelect: $("envSelect"),
  dbSelect: $("dbSelect"),
  readOnlyToggle: $("readOnlyToggle"),
  checkBtn: $("checkBtn"),
  clearBtn: $("clearBtn"),
  copyRiskSummaryBtn: $("copyRiskSummaryBtn"),
  copyChecklistBtn: $("copyChecklistBtn"),
  riskBadge: $("riskBadge"),
  warningsList: $("warningsList"),
  sqlPreview: $("sqlPreview"),
  sumStatements: $("sumStatements"),
  sumWrites: $("sumWrites"),
  sumKeywords: $("sumKeywords"),
  sumDb: $("sumDb"),
  sumEnv: $("sumEnv"),
  prodNotice: $("prodNotice"),
  checkAllBtn: $("checkAllBtn"),
  clearAllBtn: $("clearAllBtn"),
  preChecklist: $("preChecklist"),
  toast: $("toast"),
  proFullOutput: $("proFullOutput"),
  copySafePackBtn: $("copySafePackBtn"),
  copyReviewSummaryBtn: $("copyReviewSummaryBtn"),
  copyDbChecklistBtn: $("copyDbChecklistBtn"),
  copyMigrationReviewBtn: $("copyMigrationReviewBtn"),
  copyTeamHandoffBtn: $("copyTeamHandoffBtn"),
  exportMarkdownBtn: $("exportMarkdownBtn"),
  exportJsonBtn: $("exportJsonBtn"),
};

let lastResult = null;

const I18N = {
  ja: {
    title: "SQL実行前チェック・DB事故防止",
    desc: "SQLを実行前に貼り付け、DROP、TRUNCATE、WHEREなしUPDATE/DELETE、危険なDDLなどをブラウザ内で検出します。SQLは送信されません。",
    miniNote: "Browser-only / No data is sent. SQLの自動修正は行いません。",
    freeTitle: "無料でできること",
    freeList: ["DROP / TRUNCATE / ALTER / DROP COLUMN などの危険DDL検出", "WHEREなしUPDATE/DELETEや全件操作の可能性を文単位で警告", "Postgres / MySQL / SQLite の代表的な注意点を追加表示", "結果サマリー・レビュー用テキスト・チェックリストをコピー"],
    howTitle: "簡易的な使い方",
    howSteps: ["SQLを貼り付け（複数文OK）", "対象環境・DB種別・読み取り専用モードを選択", "リスクチェック → 警告理由・確認SQL・プレビューを確認"],
    usageLink: "詳しい使い方（Usage）を見る →",
    howNote: "完璧なSQLパーサーではありません。WHEREなし判定などは“危険の可能性”として扱ってください。",
    checkTitle: "実行前チェックリスト",
    c1: "対象DBが本番か確認した", c2: "バックアップ／ロールバック手段を確認した", c3: "影響行数をSELECT COUNTで確認した", c4: "実行権限が最小限であることを確認した", c5: "必要ならBEGIN / ROLLBACKで事前確認する",
    checkAll: "全部チェック", clearAll: "全部外す",
    sqlInputTitle: "SQL入力",
    sqlPlaceholder: "ここにSQLを貼り付けてください（複数文OK / ; 区切り）\n例:\nDELETE FROM users WHERE id = 123;",
    envLabel: "対象環境", envHelp: "※自己申告です。実際の接続先は判定しません。", dbLabel: "DB種別", roLabel: "読み取り専用モード", roHelp: "ONにするとSELECT以外を強く警告します。",
    checkBtn: "リスクチェック", clearBtn: "クリア", copyRiskSummaryBtn: "結果をコピー", copyChecklistBtn: "チェックリストをコピー", riskLabel: "リスク判定",
    prodNotice: "本番環境としてチェック中です。実行前にバックアップ、影響行数、ロールバック手順、権限を必ず確認してください。",
    sumTitle: "検出サマリー", sumStatements: "文数", sumWrites: "書き込み系操作", sumKeywords: "警告数", sumDb: "DB", sumEnv: "環境",
    warnTitle: "警告一覧", emptyWarn: "まだ結果はありません。SQLを入力して「リスクチェック」を押してください。", previewTitle: "SQLプレビュー", previewEmpty: "ここに解析結果が表示されます",
    disclaimer: "このツールはSQLの安全性を保証しません。本番環境では必ず社内レビュー、バックアップ、権限、トランザクション、ロールバック手順を確認してください。",
    donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると助かります。",
    proTitle: "Pro Preview / Pro Active", proLockedNote: "共通ProでSafe Execution Pack、Review Summary、Markdown Exportを解放します。", proList: ["Safe Execution Pack", "Review Summary", "Markdown Export"],
    faqTitle: "FAQ", relatedTitle: "関連ツール", copied: "コピーしました。", copyFailed: "コピーに失敗しました。", noRisk: "危険なパターンは検出されませんでした（安全性の保証ではありません）。", sqlEmpty: "SQLが空です。入力してからチェックしてください。"
  },
  en: {
    title: "SQL Pre-run Risk Checker",
    desc: "Paste SQL before execution and detect DROP, TRUNCATE, UPDATE/DELETE without WHERE, risky DDL, and other accident-prone patterns in your browser.",
    miniNote: "Browser-only / No data is sent. This tool never modifies your SQL.",
    freeTitle: "Free checks included",
    freeList: ["Detect destructive DDL such as DROP, TRUNCATE, ALTER, DROP COLUMN", "Warn about UPDATE/DELETE without WHERE and possible full-table operations per statement", "Add representative Postgres / MySQL / SQLite cautions", "Copy a review summary and pre-run checklist"],
    howTitle: "Quick Usage", howSteps: ["Paste SQL", "Choose environment, database type, and read-only mode", "Check risk and review reasons, checks, examples, and highlights"], usageLink: "Read Usage →", howNote: "This is not a full SQL parser. Treat findings as risk hints, not guarantees.",
    checkTitle: "Pre-run Checklist", c1: "Confirmed whether this is production", c2: "Confirmed backup / rollback options", c3: "Checked affected rows with SELECT COUNT", c4: "Confirmed least-privilege access", c5: "Use BEGIN / ROLLBACK first if needed", checkAll: "Check all", clearAll: "Uncheck all",
    sqlInputTitle: "SQL Input", sqlPlaceholder: "Paste SQL here (multiple statements allowed, separated by ;)\nExample:\nDELETE FROM users WHERE id = 123;",
    envLabel: "Environment", envHelp: "Self-declared. This tool does not detect your real connection.", dbLabel: "Database Type", roLabel: "Read-only Mode", roHelp: "When ON, non-SELECT statements are strongly flagged.",
    checkBtn: "Check Risk", clearBtn: "Clear", copyRiskSummaryBtn: "Copy result", copyChecklistBtn: "Copy checklist", riskLabel: "Risk Level",
    prodNotice: "Checking as production. Confirm backup, affected rows, rollback steps, and permissions before running anything.",
    sumTitle: "Detection Summary", sumStatements: "Statements", sumWrites: "Write Ops", sumKeywords: "Warnings", sumDb: "DB", sumEnv: "Env",
    warnTitle: "Warnings", emptyWarn: "No results yet. Paste SQL and click Check Risk.", previewTitle: "SQL Preview", previewEmpty: "Analysis result will appear here",
    disclaimer: "This tool does not guarantee SQL safety. In production, always verify review, backups, permissions, transactions, and rollback steps.", donateText: "If this tool helped you, consider supporting ongoing development.",
    proTitle: "Pro Preview / Pro Active", proLockedNote: "Shared Pro unlocks Safe Execution Pack, Review Summary, and Markdown Export.", proList: ["Safe Execution Pack", "Review Summary", "Markdown Export"],
    faqTitle: "FAQ", relatedTitle: "Related tools", copied: "Copied.", copyFailed: "Copy failed.", noRisk: "No risky pattern detected (not a guarantee).", sqlEmpty: "SQL is empty. Paste SQL first."
  }
};

function lang() { return document.documentElement.dataset.lang === "en" ? "en" : "ja"; }
function t(key) { return (I18N[lang()] && I18N[lang()][key]) || I18N.ja[key] || key; }
function escapeHtml(s) { return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function setLang(next) {
  const l = next === "en" ? "en" : "ja";
  document.documentElement.dataset.lang = l;
  document.documentElement.lang = l;
  localStorage.setItem("nw_lang", l);
  document.querySelectorAll("[data-i18n]").forEach((node) => { const key = node.dataset.i18n; if (I18N[l][key]) node.innerHTML = I18N[l][key]; });
  document.querySelectorAll("[data-i18n-list]").forEach((node) => { const items = I18N[l][node.dataset.i18nList]; if (Array.isArray(items)) node.innerHTML = items.map((x) => `<li>${x}</li>`).join(""); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { const value = I18N[l][node.dataset.i18nPlaceholder]; if (value) node.setAttribute("placeholder", value); });
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => btn.classList.toggle("active", btn.dataset.langBtn === l));
  if (!lastResult) resetResultText(); else renderResult(lastResult);
}

document.addEventListener("click", (e) => { const btn = e.target.closest("[data-lang-btn]"); if (btn) setLang(btn.dataset.langBtn); });

function stripSqlComments(sql) {
  let out = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "'" && !inDouble) { out += ch; inSingle = !inSingle; i++; continue; }
    if (ch === '"' && !inSingle) { out += ch; inDouble = !inDouble; i++; continue; }
    if (!inSingle && !inDouble && ch === "-" && next === "-") { while (i < sql.length && sql[i] !== "\n") i++; out += "\n"; continue; }
    if (!inSingle && !inDouble && ch === "/" && next === "*") { i += 2; while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i++; i += 2; out += " "; continue; }
    if (!inSingle && !inDouble && ch === "#") { while (i < sql.length && sql[i] !== "\n") i++; out += "\n"; continue; }
    out += ch; i++;
  }
  return out;
}

function splitStatements(sql) {
  const result = [];
  let buf = "";
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = sql[i - 1];
    if (ch === "'" && !inDouble && prev !== "\\") inSingle = !inSingle;
    if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
    if (ch === ";" && !inSingle && !inDouble) { if (buf.trim()) result.push(buf.trim()); buf = ""; continue; }
    buf += ch;
  }
  if (buf.trim()) result.push(buf.trim());
  return result;
}

function normalizeStmt(stmt) { return stripSqlComments(stmt).replace(/\s+/g, " ").trim(); }
function startsWithWrite(s) { return /^\s*(insert|update|delete|drop|truncate|alter|create|grant|revoke|replace|vacuum|reindex|lock|set)\b/i.test(s); }
function add(list, sev, titleJa, titleEn, reasonJa, reasonEn, checkJa, checkEn, example) { list.push({ sev, titleJa, titleEn, reasonJa, reasonEn, checkJa, checkEn, example }); }
function hasTopWhere(s) { return /\bwhere\b/i.test(s); }

function classifyStatement(stmt, index, dbType, env, readOnly) {
  const s = normalizeStmt(stmt);
  const warnings = [];
  const isWrite = startsWithWrite(s);

  if (/^delete\b/i.test(s) && !hasTopWhere(s)) add(warnings, "crit", "DELETE文にWHERE句がありません", "DELETE without WHERE", "全件削除の可能性があります。", "May delete every row.", "先にSELECT COUNT(*)で影響行数を確認してください。", "Run SELECT COUNT(*) for the same condition first.", "SELECT COUNT(*) FROM table_name WHERE ...;");
  if (/^update\b/i.test(s) && !hasTopWhere(s)) add(warnings, "crit", "UPDATE文にWHERE句がありません", "UPDATE without WHERE", "全件更新の可能性があります。", "May update every row.", "WHERE句と影響行数を確認してください。", "Confirm WHERE and affected rows first.", "SELECT COUNT(*) FROM table_name WHERE ...;");
  if (/\bdrop\s+database\b/i.test(s)) add(warnings, "crit", "DROP DATABASEを検出", "DROP DATABASE detected", "データベース全体を削除する操作です。", "This can remove an entire database.", "対象DB名・バックアップ・復元手順を確認してください。", "Confirm DB name, backup, and restore steps.", "-- Check backup and restore plan first");
  if (/\bdrop\s+schema\b/i.test(s)) add(warnings, "crit", "DROP SCHEMAを検出", "DROP SCHEMA detected", "スキーマ配下の多数のオブジェクト削除につながります。", "Can remove many objects under a schema.", "CASCADEの有無と依存関係を確認してください。", "Check CASCADE and dependencies.", "-- List dependent objects first");
  if (/\bdrop\s+table\b/i.test(s)) add(warnings, "crit", "DROP TABLEを検出", "DROP TABLE detected", "テーブル削除は復旧困難な事故になり得ます。", "Dropping a table can be hard to recover.", "対象テーブル名とバックアップを確認してください。", "Confirm table name and backup.", "-- Verify table name and backup first");
  if (/\btruncate\s+(table\s+)?\w+/i.test(s)) add(warnings, "crit", "TRUNCATE TABLEを検出", "TRUNCATE TABLE detected", "大量データを高速に削除する操作です。", "Fast bulk deletion operation.", "DELETEとの違い、FK、復旧手順を確認してください。", "Check FK effects and recovery steps.", "SELECT COUNT(*) FROM table_name;");
  if (/\balter\s+table\b[\s\S]*\bdrop\s+(column\s+)?\w+/i.test(s) || /\bdrop\s+column\b/i.test(s)) add(warnings, "crit", "DROP COLUMNを検出", "DROP COLUMN detected", "列とデータを削除する破壊的DDLです。", "Destructive DDL that removes a column and data.", "利用箇所、バックアップ、マイグレーション手順を確認してください。", "Check usages, backup, and migration plan.", "-- Search application references first");
  if (/\bdrop\b/i.test(s) && !/\bdrop\s+(database|schema|table)\b/i.test(s)) add(warnings, "high", "DROPを検出", "DROP detected", "オブジェクト削除につながる可能性があります。", "May remove database objects.", "対象名と復旧手順を確認してください。", "Confirm target and recovery steps.", "-- Confirm object and backup first");
  if (/\balter\s+table\b/i.test(s) && !/\bdrop\s+(column\s+)?\w+/i.test(s)) add(warnings, "high", "ALTER TABLEを検出", "ALTER TABLE detected", "スキーマ変更はアプリやロックに影響します。", "Schema changes may affect app compatibility or locks.", "マイグレーション手順とロールバックを確認してください。", "Confirm migration and rollback plan.", "-- Review migration plan first");
  if (/\binsert\s+into\b/i.test(s) && !/\binsert\s+into\b[\s\S]*\bselect\b/i.test(s)) add(warnings, "med", "INSERTを検出", "INSERT detected", "データ追加により重複や制約違反が起きる可能性があります。", "May create duplicates or constraint errors.", "一意制約と対象件数を確認してください。", "Confirm uniqueness and row count.", "SELECT * FROM table_name WHERE key = ...;");
  if (/\brename\b/i.test(s)) add(warnings, "high", "RENAMEを検出", "RENAME detected", "アプリ参照や依存オブジェクトに影響する可能性があります。", "May break application references or dependencies.", "参照箇所と戻し手順を確認してください。", "Confirm references and rollback steps.", "-- Search application references first");
  if (/\bgrant\b/i.test(s)) add(warnings, "high", "GRANTを検出", "GRANT detected", "権限付与によりアクセス範囲が広がります。", "Expands access privileges.", "最小権限になっているか確認してください。", "Confirm least privilege.", "-- Review granted role and scope");
  if (/\brevoke\b/i.test(s)) add(warnings, "high", "REVOKEを検出", "REVOKE detected", "権限剥奪によりアプリや運用作業が失敗する可能性があります。", "May break applications or operations.", "影響ユーザーとロールバックを確認してください。", "Confirm affected users and rollback.", "-- Confirm dependent users first");
  if (/\bcascade\b/i.test(s)) add(warnings, "high", "CASCADEを検出", "CASCADE detected", "依存オブジェクトまで連鎖削除される可能性があります。", "Dependent objects may be removed as well.", "削除対象一覧を事前に確認してください。", "List affected objects first.", "-- Inspect dependencies before running");
  if (/\bwhere\s+1\s*=\s*1\b/i.test(s)) add(warnings, "high", "WHERE 1=1を検出", "WHERE 1=1 detected", "全件操作の条件として使われることがあります。", "Often indicates a full-table operation.", "意図した全件処理か確認してください。", "Confirm that a full operation is intended.", "SELECT COUNT(*) FROM table_name WHERE 1=1;");
  if (/\b(delete|update)\b[\s\S]*\blimit\s+\d+/i.test(s)) add(warnings, "med", "UPDATE/DELETE + LIMITを検出", "UPDATE/DELETE with LIMIT", "LIMITだけでは対象行が不安定になる場合があります。", "LIMIT alone can target unstable rows.", "ORDER BYとWHERE条件を確認してください。", "Confirm ORDER BY and WHERE.", "SELECT * FROM table_name WHERE ... ORDER BY ... LIMIT 20;");
  if (/\b(update|delete)\b[\s\S]*\bjoin\b/i.test(s)) add(warnings, "high", "JOIN付きUPDATE/DELETEを検出", "UPDATE/DELETE with JOIN", "結合条件ミスで想定外の行を変更する可能性があります。", "Wrong joins can affect unexpected rows.", "同じJOIN条件でSELECT確認してください。", "Preview rows with the same JOIN first.", "SELECT * FROM ... JOIN ... WHERE ... LIMIT 20;");
  if (/\binsert\s+into\b[\s\S]*\bselect\b/i.test(s)) add(warnings, "med", "INSERT INTO ... SELECTを検出", "INSERT INTO ... SELECT detected", "大量挿入や重複挿入の可能性があります。", "May insert many or duplicate rows.", "SELECT側の件数と重複条件を確認してください。", "Check SELECT count and uniqueness.", "SELECT COUNT(*) FROM (... ) AS src;");
  if (/\breplace\s+into\b/i.test(s)) add(warnings, "high", "REPLACE INTOを検出", "REPLACE INTO detected", "MySQLではDELETE+INSERT相当になることがあります。", "In MySQL it may behave like DELETE + INSERT.", "既存行への影響を確認してください。", "Check impact on existing rows.", "SELECT * FROM table_name WHERE key = ...;");
  if (/\bon\s+conflict\b[\s\S]*\bdo\s+update\b/i.test(s)) add(warnings, "med", "UPSERT更新を検出", "UPSERT update detected", "衝突時に既存行が更新されます。", "Existing rows are updated on conflict.", "更新対象列と一意制約を確認してください。", "Check updated columns and unique keys.", "-- Verify conflict target and SET columns");
  if (/\bcreate\s+(unique\s+)?index\b/i.test(s)) add(warnings, "med", "CREATE INDEXを検出", "CREATE INDEX detected", "大きなテーブルではロックや負荷が発生します。", "Can cause locks or load on large tables.", "本番では低負荷時間帯とDB別の安全オプションを確認してください。", "Check off-peak timing and DB-specific safe options.", "-- Postgres: consider CREATE INDEX CONCURRENTLY");
  if (/\bselect\s+\*/i.test(s)) add(warnings, "med", "SELECT *を検出", "SELECT * detected", "不要な列取得や性能低下につながる場合があります。", "Can fetch unnecessary columns and hurt performance.", "必要な列だけを指定できるか確認してください。", "Select only needed columns if possible.", "SELECT id, name FROM table_name WHERE ... LIMIT 20;");
  if (/\blike\s+['\"]%[^'\"]*%['\"]/i.test(s)) add(warnings, "med", "LIKE '%...%'を検出", "LIKE '%...%' detected", "インデックスが効きにくくフルスキャンになりがちです。", "Often prevents index usage and causes scans.", "件数・実行計画を確認してください。", "Check row count and query plan.", "EXPLAIN SELECT ...;");
  if (/^select\b/i.test(s) && /\border\s+by\b/i.test(s) && !/\blimit\b/i.test(s)) add(warnings, "med", "ORDER BY + LIMIT無しを検出", "ORDER BY without LIMIT", "大量ソートで重いクエリになる場合があります。", "May cause heavy sorting.", "LIMITやWHERE条件を付けられるか確認してください。", "Consider LIMIT or narrower WHERE.", "SELECT ... ORDER BY ... LIMIT 100;");

  if (dbType === "postgres") {
    if (/\bvacuum\s+full\b/i.test(s)) add(warnings, "high", "Postgres: VACUUM FULLを検出", "Postgres: VACUUM FULL", "強いロックが発生します。", "Requires heavy locking.", "メンテナンス時間帯で実行してください。", "Run only in a maintenance window.", "-- Check lock impact first");
    if (/\breindex\b/i.test(s)) add(warnings, "high", "Postgres: REINDEXを検出", "Postgres: REINDEX", "ロックや負荷に注意が必要です。", "May lock or load the DB.", "CONCURRENTLY可否を確認してください。", "Check CONCURRENTLY options.", "REINDEX INDEX CONCURRENTLY index_name;");
    if (/\block\s+table\b/i.test(s)) add(warnings, "high", "Postgres: LOCK TABLEを検出", "Postgres: LOCK TABLE", "他の処理を止める可能性があります。", "May block other sessions.", "ロック範囲と待機時間を確認してください。", "Check lock scope and timeout.", "SET lock_timeout = '5s';");
    if (/\bdisable\s+trigger\b/i.test(s)) add(warnings, "high", "Postgres: DISABLE TRIGGERを検出", "Postgres: DISABLE TRIGGER", "制約・監査・同期処理を壊す可能性があります。", "May bypass constraints, audits, or sync logic.", "再有効化手順を確認してください。", "Confirm re-enable steps.", "ALTER TABLE table_name ENABLE TRIGGER ALL;");
    if (/\bcreate\s+(unique\s+)?index\b/i.test(s) && !/\bconcurrently\b/i.test(s)) add(warnings, "med", "Postgres: CONCURRENTLYなしCREATE INDEX", "Postgres: CREATE INDEX without CONCURRENTLY", "本番で書き込みをブロックする可能性があります。", "May block writes in production.", "CONCURRENTLYが使えるか確認してください。", "Consider CONCURRENTLY if possible.", "CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);");
  }
  if (dbType === "mysql") {
    if (/\bset\s+foreign_key_checks\s*=\s*0\b/i.test(s)) add(warnings, "high", "MySQL: FOREIGN_KEY_CHECKS=0を検出", "MySQL: FOREIGN_KEY_CHECKS=0", "外部キー制約を一時的に無効化します。", "Disables foreign key checks.", "戻し忘れとデータ不整合を確認してください。", "Confirm re-enable and data consistency.", "SET FOREIGN_KEY_CHECKS=1;");
    if (/\bset\s+sql_safe_updates\s*=\s*0\b/i.test(s)) add(warnings, "high", "MySQL: SQL_SAFE_UPDATES=0を検出", "MySQL: SQL_SAFE_UPDATES=0", "安全更新制限を無効化します。", "Disables safe update protection.", "実行後に戻す手順を確認してください。", "Confirm re-enable steps.", "SET SQL_SAFE_UPDATES=1;");
  }
  if (dbType === "sqlite") {
    if (/^vacuum\b/i.test(s)) add(warnings, "med", "SQLite: VACUUMを検出", "SQLite: VACUUM", "DBファイル全体に影響するメンテナンス操作です。", "Database-wide maintenance operation.", "DBファイルのバックアップを確認してください。", "Back up the database file first.", "-- Copy the .sqlite file first");
  }

  if (readOnly && /\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|vacuum|reindex|lock|replace|set)\b/i.test(s)) add(warnings, "high", "読み取り専用モードで非SELECTを検出", "Non-SELECT in read-only mode", "読み取り専用想定では実行すべきではありません。", "Should not run in read-only review mode.", "SELECTだけに分けて確認してください。", "Review with SELECT-only statements.", "SELECT ... LIMIT 20;");
  if (env === "prod" && isWrite) add(warnings, "high", "Prod環境で書き込み系SQLを検出", "Write operation in production", "本番データに直接影響する可能性があります。", "May directly affect production data.", "バックアップ、影響行数、ロールバック手順を確認してください。", "Confirm backup, affected rows, and rollback.", "BEGIN; -- verify; ROLLBACK;");

  let risk = warnings.reduce((acc, w) => Math.max(acc, { low: 0, med: 1, high: 2, crit: 3 }[w.sev] || 0), 0);
  const labels = ["low", "med", "high", "crit"];
  return { index, raw: stmt, cleaned: s, warnings, risk: labels[risk], isWrite };
}

function analyze(sql) {
  const env = els.envSelect.value;
  const dbType = els.dbSelect.value;
  const readOnly = els.readOnlyToggle.checked;
  const statements = splitStatements(sql);
  const perStatement = statements.map((stmt, index) => classifyStatement(stmt, index + 1, dbType, env, readOnly));
  const riskRank = { low: 0, med: 1, high: 2, crit: 3 };
  const overall = perStatement.reduce((max, item) => riskRank[item.risk] > riskRank[max] ? item.risk : max, "low");
  return { sql, env, dbType, readOnly, statements, perStatement, overall, warnings: perStatement.flatMap((r) => r.warnings.map((w) => ({ ...w, stmt: r.index }))) };
}

function riskText(risk) { const ja = { low: "Low（低）", med: "Medium（注意）", high: "High（危険）", crit: "Critical（致命的）" }; const en = { low: "Low", med: "Medium", high: "High", crit: "Critical" }; return (lang() === "en" ? en : ja)[risk] || risk; }
function setBadge(risk) { els.riskBadge.textContent = riskText(risk); els.riskBadge.className = `risk-badge risk-${risk}`; }

function renderWarnings(result) {
  els.warningsList.innerHTML = "";
  if (!result.warnings.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = t("noRisk"); els.warningsList.appendChild(li); return; }
  const order = { crit: 3, high: 2, med: 1, low: 0 };
  [...result.warnings].sort((a, b) => order[b.sev] - order[a.sev]).forEach((w) => {
    const li = document.createElement("li");
    li.className = `nw-warn ${w.sev}`;
    li.innerHTML = `<div class="warn-head"><span class="warn-sev">${escapeHtml(w.sev.toUpperCase())}</span><strong>${escapeHtml(lang() === "en" ? w.titleEn : w.titleJa)}</strong><span class="warn-stmt">stmt #${w.stmt}</span></div><p><b>${lang() === "en" ? "Reason" : "理由"}:</b> ${escapeHtml(lang() === "en" ? w.reasonEn : w.reasonJa)}</p><p><b>${lang() === "en" ? "Check" : "確認"}:</b> ${escapeHtml(lang() === "en" ? w.checkEn : w.checkJa)}</p><pre><code>${escapeHtml(w.example || "")}</code></pre>`;
    els.warningsList.appendChild(li);
  });
}

function highlightSql(sql) {
  let safe = escapeHtml(sql);
  const rules = [
    { re: /\b(drop\s+database|drop\s+schema|drop\s+table|truncate\s+table|drop\s+column)\b/gi, cls: "hl-crit" },
    { re: /\b(drop|truncate|alter|grant|revoke)\b/gi, cls: "hl-crit" },
    { re: /\b(delete|update|replace\s+into|foreign_key_checks\s*=\s*0|sql_safe_updates\s*=\s*0|lock\s+table|disable\s+trigger)\b/gi, cls: "hl-high" },
    { re: /\b(select\s+\*|create\s+(unique\s+)?index|like|order\s+by|limit|on\s+conflict)\b/gi, cls: "hl-med" },
    { re: /\bwhere\s+1\s*=\s*1\b/gi, cls: "hl-high" },
    { re: /\bcascade\b/gi, cls: "hl-high" }
  ];
  rules.forEach((r) => { safe = safe.replace(r.re, (m) => `<mark class="${r.cls}">${m}</mark>`); });
  return safe;
}

function renderResult(result) {
  setBadge(result.overall);
  els.sumStatements.textContent = String(result.statements.length);
  els.sumWrites.textContent = String(result.perStatement.filter((x) => x.isWrite).length);
  els.sumKeywords.textContent = String(result.warnings.length);
  els.sumDb.textContent = result.dbType;
  els.sumEnv.textContent = result.env + (result.readOnly ? " / read-only" : "");
  els.prodNotice.hidden = result.env !== "prod";
  renderWarnings(result);
  els.sqlPreview.innerHTML = `<code>${highlightSql(result.sql)}</code>`;
  renderProOutput();
}

function resetResultText() {
  setBadge("low");
  els.sumStatements.textContent = "0"; els.sumWrites.textContent = "0"; els.sumKeywords.textContent = "0"; els.sumDb.textContent = "-"; els.sumEnv.textContent = "-";
  els.prodNotice.hidden = true;
  els.warningsList.innerHTML = `<li class="empty">${escapeHtml(t("emptyWarn"))}</li>`;
  els.sqlPreview.innerHTML = `<code>${escapeHtml(t("previewEmpty"))}</code>`;
}

function onCheck() {
  const sql = els.sqlInput.value.trim();
  if (!sql) { resetResultText(); els.warningsList.innerHTML = `<li class="empty">${escapeHtml(t("sqlEmpty"))}</li>`; return; }
  lastResult = analyze(sql);
  renderResult(lastResult);
}

function buildSummary(result) {
  const lines = ["SQL DB Risk Checker result", `Risk: ${riskText(result.overall)}`, `Environment: ${result.env}`, `DB: ${result.dbType}`, `Read-only mode: ${result.readOnly ? "ON" : "OFF"}`, `Statements: ${result.statements.length}`, `Write ops: ${result.perStatement.filter((x) => x.isWrite).length}`, `Warnings: ${result.warnings.length}`];
  result.warnings.forEach((w) => { lines.push(`- ${w.sev.toUpperCase()} stmt #${w.stmt}: ${lang() === "en" ? w.titleEn : w.titleJa}`); lines.push(`  Reason: ${lang() === "en" ? w.reasonEn : w.reasonJa}`); lines.push(`  Check: ${lang() === "en" ? w.checkEn : w.checkJa}`); });
  return lines.join("\n");
}

function checklistText() { return Array.from(els.preChecklist.querySelectorAll("li")).map((li) => `- [ ] ${li.innerText.trim()}`).join("\n"); }
async function copyText(text) { try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch (_) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(t("copied")); } catch (e) { toast(t("copyFailed")); } ta.remove(); } }
function toast(message) { if (!els.toast) return; els.toast.textContent = message; els.toast.hidden = false; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { els.toast.hidden = true; }, 1800); }
function setAllChecklist(checked) { els.preChecklist.querySelectorAll("input[type='checkbox']").forEach((box) => box.checked = checked); }

function criticalWarnings(result) { return result.warnings.filter((w) => w.sev === "crit"); }
function highWarnings(result) { return result.warnings.filter((w) => w.sev === "high"); }
function mediumWarnings(result) { return result.warnings.filter((w) => w.sev === "med"); }
function resultOrCurrent() { return lastResult || analyze(els.sqlInput.value || ""); }

function buildSafeExecutionPack() {
  return `BEGIN;

-- 1) 影響行数の事前確認
SELECT COUNT(*) FROM your_table WHERE ...;

-- 2) 対象行のサンプル確認
SELECT * FROM your_table WHERE ... LIMIT 20;

-- 3) 実行SQL
-- UPDATE/DELETE ... WHERE ...;

-- 4) まずはROLLBACKで確認
ROLLBACK;

-- 問題なければCOMMIT
-- COMMIT;`;
}

function warningLines(items) {
  if (!items.length) return "- None";
  return items.map((w) => `- ${w.sev.toUpperCase()} stmt #${w.stmt}: ${lang() === "en" ? w.titleEn : w.titleJa}`).join("\n");
}

function buildReviewSummary(result) {
  return `SQL DB Risk Checker Review

Risk: ${riskText(result.overall)}
Environment: ${result.env}
DB: ${result.dbType}
Read-only: ${result.readOnly ? "ON" : "OFF"}
Statements: ${result.statements.length}
Write operations: ${result.perStatement.filter((x) => x.isWrite).length}
Warnings: ${result.warnings.length}

Critical items:
${warningLines(criticalWarnings(result))}
High items:
${warningLines(highWarnings(result))}
Medium items:
${warningLines(mediumWarnings(result))}

Before running:
- Confirm affected rows
- Confirm backup
- Confirm rollback plan
- Confirm least privilege
- Confirm production approval`;
}

function buildDbChecklist(result) {
  const common = {
    postgres: ["CREATE INDEX CONCURRENTLY を検討", "VACUUM FULL はロック影響確認", "REINDEX は CONCURRENTLY 可否確認", "LOCK TABLE は lock_timeout 確認", "DISABLE TRIGGER は再有効化手順確認", "DROP SCHEMA CASCADE は依存関係確認"],
    mysql: ["FOREIGN_KEY_CHECKS=0 の戻し忘れ確認", "SQL_SAFE_UPDATES=0 の戻し忘れ確認", "REPLACE INTO のDELETE+INSERT影響確認", "DROP DATABASE は対象DB名確認", "ALTER TABLE DROP COLUMN はアプリ参照確認"],
    sqlite: ["DBファイルバックアップ", "VACUUM 前のファイルサイズ確認", "DROP TABLE 前のエクスポート確認", "DELETE / UPDATE 前の対象件数確認"],
    generic: ["影響行数確認", "バックアップ確認", "ロールバック手順確認", "権限確認"]
  };
  const items = common[result.dbType] || common.generic;
  return `DB-specific Pro Checklist (${result.dbType})\n\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function buildMigrationReview(result) {
  return `Migration Review

Operation: ${result.perStatement.map((x) => x.cleaned.split(" ")[0] || "SQL").join(", ") || "SQL"}
Risk: ${riskText(result.overall)}
Rollback difficulty:
Possible lock:
Data loss risk:
App compatibility risk:
Pre-check:
Rollback plan:
Post-check:`;
}

function buildTeamHandoff(result) {
  return `Please review this SQL before execution.

Risk: ${riskText(result.overall)}
DB: ${result.dbType}
Environment: ${result.env}
Detected issues: ${result.warnings.length}
Expected impact:
Rollback plan:
Requested approval:`;
}

function buildMarkdownExport(result) {
  return `# SQL DB Risk Review

## Summary

${buildReviewSummary(result)}

## Detected Risks

${warningLines(result.warnings)}

## Statement Review

${result.perStatement.map((item) => `### Statement #${item.index}\n\nRisk: ${riskText(item.risk)}\n\n\`\`\`sql\n${item.cleaned}\n\`\`\``).join("\n\n") || "No statements."}

## DB-specific Notes

${buildDbChecklist(result)}

## Execution Checklist

${checklistText()}

## Safe Execution Template

\`\`\`sql
${buildSafeExecutionPack()}
\`\`\`

## Approval Notes

- Reviewer:
- Approval:
- Date:`;
}

function buildJsonExport(result) {
  return JSON.stringify({
    tool_id: "sql-db-risk-checker",
    risk: result.overall,
    environment: result.env,
    db: result.dbType,
    read_only: result.readOnly,
    statements: result.perStatement.map((item) => ({ index: item.index, risk: item.risk, sql: item.cleaned })),
    warnings: result.warnings.map((w) => ({ severity: w.sev, statement: w.stmt, title: lang() === "en" ? w.titleEn : w.titleJa })),
    packs: {
      safe_execution: buildSafeExecutionPack(),
      review_summary: buildReviewSummary(result),
      db_checklist: buildDbChecklist(result),
      migration_review: buildMigrationReview(result),
      team_handoff: buildTeamHandoff(result),
      markdown: buildMarkdownExport(result)
    }
  }, null, 2);
}

function buildFullProOutput(result) {
  return [buildSafeExecutionPack(), buildReviewSummary(result), buildDbChecklist(result), buildMigrationReview(result), buildTeamHandoff(result), buildMarkdownExport(result)].join("\n\n---\n\n");
}

function renderProOutput() {
  if (!els.proFullOutput) return;
  const result = resultOrCurrent();
  els.proFullOutput.innerHTML = `<code>${escapeHtml(buildFullProOutput(result))}</code>`;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isSharedProActive() { return document.documentElement.dataset.proActive === "true"; }
function requirePro() { if (isSharedProActive()) return true; toast("Previewモードです。Pro機能はNicheWorks Proで利用できます。"); return false; }
function copyProText(builder) { if (!requirePro()) return; const result = resultOrCurrent(); copyText(builder(result)); renderProOutput(); }

els.checkBtn.addEventListener("click", onCheck);
els.clearBtn.addEventListener("click", () => { els.sqlInput.value = ""; lastResult = null; resetResultText(); });
els.copyRiskSummaryBtn.addEventListener("click", () => copyText(buildSummary(lastResult || analyze(els.sqlInput.value || ""))));
els.copyChecklistBtn.addEventListener("click", () => copyText(checklistText()));
els.checkAllBtn.addEventListener("click", () => setAllChecklist(true));
els.clearAllBtn.addEventListener("click", () => setAllChecklist(false));
els.envSelect.addEventListener("change", () => { if (lastResult) onCheck(); else els.prodNotice.hidden = els.envSelect.value !== "prod"; });
els.dbSelect.addEventListener("change", () => { if (lastResult) onCheck(); });
els.readOnlyToggle.addEventListener("change", () => { if (lastResult) onCheck(); });
if (els.copySafePackBtn) els.copySafePackBtn.addEventListener("click", () => copyProText(() => buildSafeExecutionPack()));
if (els.copyReviewSummaryBtn) els.copyReviewSummaryBtn.addEventListener("click", () => copyProText(buildReviewSummary));
if (els.copyDbChecklistBtn) els.copyDbChecklistBtn.addEventListener("click", () => copyProText(buildDbChecklist));
if (els.copyMigrationReviewBtn) els.copyMigrationReviewBtn.addEventListener("click", () => copyProText(buildMigrationReview));
if (els.copyTeamHandoffBtn) els.copyTeamHandoffBtn.addEventListener("click", () => copyProText(buildTeamHandoff));
if (els.exportMarkdownBtn) els.exportMarkdownBtn.addEventListener("click", () => { if (!requirePro()) return; const result = resultOrCurrent(); downloadText("sql-db-risk-review.md", buildMarkdownExport(result), "text/markdown"); renderProOutput(); });
if (els.exportJsonBtn) els.exportJsonBtn.addEventListener("click", () => { if (!requirePro()) return; const result = resultOrCurrent(); downloadText("sql-db-risk-review.json", buildJsonExport(result), "application/json"); renderProOutput(); });
window.addEventListener("nw-pro-status", renderProOutput);

(function init() { setLang(localStorage.getItem("nw_lang") || ((navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en")); resetResultText(); })();
