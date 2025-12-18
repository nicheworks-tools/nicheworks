"use strict";

/**
 * SQL / DB Risk Checker (MVP)
 * - browser-only, no storage (except language + Pro unlock flag)
 * - regex-based, lightweight (no SQL parsing)
 *
 * ✅ Pro方針（MVP）
 * - Buy Pro は外部決済リンクへ遷移するだけ（Stripe Payment Link想定）
 * - success_url 等で ?pro=1 を付けて戻せるなら自動復元（localStorage unlock）
 * - 本物の支払い検証は次フェーズ（Cloudflare Functions等）
 */

const $ = (id) => document.getElementById(id);

const els = {
  sqlInput: $("sqlInput"),
  envSelect: $("envSelect"),
  dbSelect: $("dbSelect"),
  readOnlyToggle: $("readOnlyToggle"),
  checkBtn: $("checkBtn"),
  clearBtn: $("clearBtn"),
  riskBadge: $("riskBadge"),
  warningsList: $("warningsList"),
  sqlPreview: $("sqlPreview"),
  sumStatements: $("sumStatements"),
  sumWrites: $("sumWrites"),
  sumKeywords: $("sumKeywords"),
  checkAllBtn: $("checkAllBtn"),
  clearAllBtn: $("clearAllBtn"),
  preChecklist: $("preChecklist"),
};

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripSqlComments(sql) {
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/--.*$/gm, " ");
  s = s.replace(/^\s*#.*$/gm, " ");
  return s;
}

function splitStatements(sql) {
  const out = [];
  let buf = "";
  let inS = false;
  let inD = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = sql[i - 1];

    if (ch === "'" && !inD && prev !== "\\") inS = !inS;
    if (ch === '"' && !inS && prev !== "\\") inD = !inD;

    if (ch === ";" && !inS && !inD) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/* ===== i18n ===== */
const I18N = {
  ja: {
    title: "SQL / DB 実行前リスクチェッカー",
    desc: "実行する前に「事故るSQL」を止めるだけ。<strong>SQLは修正しません</strong>（判定と理由の提示のみ）。",
    miniNote: "Browser-only / No data is sent.（ブラウザ完結・送信なし）",

    howTitle: "簡易的な使い方",
    howSteps: [
      "SQLを貼り付け（複数文OK）",
      "必要なら「対象環境」「DB種別」「読み取り専用」を選択",
      "<strong>リスクチェック</strong> → 危険度／警告／ハイライトを確認",
    ],
    usageLink: "詳しい使い方（Usage）を見る →",
    howNote: "※このツールは実行結果や安全性を保証しません。最終判断はあなたが行ってください。",

    checkTitle: "実行前チェックリスト",
    c1: "対象DBは本番ですか？（Prodなら慎重に）",
    c2: "バックアップ／ロールバック手段はありますか？",
    c3: "影響行数を事前に確認しましたか？（SELECT COUNTなど）",
    c4: "権限は最小限ですか？（必要なロールのみ）",
    c5: "トランザクションで囲むべきですか？（BEGIN/ROLLBACK/COMMIT）",
    checkAll: "全部チェック",
    clearAll: "全部外す",

    sqlInputTitle: "SQL入力",
    sqlPlaceholder:
`ここにSQLを貼り付けてください（複数文OK / ; 区切り）
例:
DELETE FROM users WHERE id = 123;`,
    envLabel: "対象環境（自己申告）",
    envHelp: "※実際の接続先を判定するものではありません",
    dbLabel: "DB種別",
    roLabel: "読み取り専用モード",
    roHelp: "ONにするとSELECT以外を強く警告します",
    checkBtn: "リスクチェック",
    clearBtn: "クリア",
    riskLabel: "リスク判定",

    sumTitle: "検出サマリー",
    sumStatements: "文数",
    sumWrites: "書き込み系操作",
    sumKeywords: "危険キーワード数",

    warnTitle: "警告一覧",
    emptyWarn: "まだ結果はありません。SQLを入力して「リスクチェック」を押してください。",
    previewTitle: "SQLプレビュー（危険箇所を強調表示）",
    previewEmpty: "ここに解析結果が表示されます",

    proTitle: "Pro機能（買い切り）",
    proLockedNote: "Proを購入すると、より安全な「実行手順テンプレ」やプリセット表示が使えます。",
    proPriceSub: "買い切り / このブラウザで解放",
    proBuyBtn: "Proを購入",
    proRestoreBtn: "購入済みを復元",
    proUnlockedNote: "Proが解放されています。下のテンプレを「手順」として使ってください（自動修正はしません）。",
    proTemplateTitle: "安全実行テンプレ（例）",
    proCopyBtn: "テンプレをコピー",
    proLockBtn: "Proをロック（テスト用）",
    proUnlockedHint: "※将来：DB種別プリセット、Migrationモード、より厳密な検出ルールを追加予定。",

    proList: [
      "安全実行テンプレの提示（トランザクション手順）",
      "DB種別ごとの注意点表示",
      "ルールプリセット（Read-only強制 / Migrationモード）",
    ],
    noFix: "※SQLの自動修正は行いません",

    disclaimer: "このツールはSQLの実行結果や安全性を保証するものではありません。本番環境では必ずバックアップ・権限・トランザクションを確認してください。",
    donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると助かります。",

    proLinkNotSet: "決済リンクがまだ設定されていません。app.js の PRO_PAYMENT_URL を設定してください。",
    proGoingToPay: "決済ページに移動します。",
    proCopied: "コピーしました。",
    sqlEmpty: "SQLが空です。入力してからチェックしてください。",
    noRisk: "危険なパターンは検出されませんでした（ただし安全性を保証しません）。",
    noResultYet: "まだ結果はありません。SQLを入力して「リスクチェック」を押してください。",
    proAutoRestored: "Proを復元しました。",
  },

  en: {
    title: "SQL / DB Query Risk Checker",
    desc: "Paste SQL before you run it. It flags risky patterns. <strong>This tool does not modify your SQL</strong> (it only warns).",
    miniNote: "Browser-only / No data is sent.",

    howTitle: "Quick Usage",
    howSteps: [
      "Paste SQL (multiple statements allowed)",
      "Optionally choose Environment / DB Type / Read-only",
      "<strong>Check Risk</strong> → review risk level, warnings, highlights",
    ],
    usageLink: "Read Usage →",
    howNote: "This tool does not guarantee safety. You are responsible for the final decision.",

    checkTitle: "Pre-run Checklist",
    c1: "Is this production? (Be extra careful for Prod)",
    c2: "Do you have backup / rollback options?",
    c3: "Did you verify affected rows? (e.g., SELECT COUNT)",
    c4: "Are privileges minimized (least privilege)?",
    c5: "Should this be wrapped in a transaction? (BEGIN/ROLLBACK/COMMIT)",
    checkAll: "Check all",
    clearAll: "Uncheck all",

    sqlInputTitle: "SQL Input",
    sqlPlaceholder:
`Paste your SQL here (multiple statements allowed, separated by ;)
Example:
DELETE FROM users WHERE id = 123;`,
    envLabel: "Target Environment (Self-declared)",
    envHelp: "This does not detect your actual database",
    dbLabel: "Database Type",
    roLabel: "Read-only Mode",
    roHelp: "When ON, non-SELECT statements are strongly flagged",
    checkBtn: "Check Risk",
    clearBtn: "Clear",
    riskLabel: "Risk Level",

    sumTitle: "Detection Summary",
    sumStatements: "Statements",
    sumWrites: "Write Ops",
    sumKeywords: "Risky Keywords",

    warnTitle: "Warnings",
    emptyWarn: "No results yet. Paste SQL and click “Check Risk”.",
    previewTitle: "SQL Preview (Highlights)",
    previewEmpty: "Analysis result will appear here",

    proTitle: "Pro Features (One-time)",
    proLockedNote: "Unlock safe execution templates and presets.",
    proPriceSub: "One-time / unlocked in this browser",
    proBuyBtn: "Buy Pro",
    proRestoreBtn: "Restore purchase",
    proUnlockedNote: "Pro is unlocked. Use the template as a checklist (this tool never edits your SQL).",
    proTemplateTitle: "Safe Execution Template (example)",
    proCopyBtn: "Copy template",
    proLockBtn: "Lock Pro (test)",
    proUnlockedHint: "Later: DB presets, Migration mode, stricter rules.",

    proList: [
      "Safe execution templates (transaction steps)",
      "Database-specific cautions",
      "Rule presets (Read-only enforced / Migration mode)",
    ],
    noFix: "This tool never modifies your SQL.",

    disclaimer: "This tool does not guarantee execution safety or results. Always verify backups, privileges, and transactions before running SQL in production.",
    donateText: "If this tool helped you, consider supporting ongoing development.",

    proLinkNotSet: "Payment link is not set yet. Set PRO_PAYMENT_URL in app.js.",
    proGoingToPay: "Redirecting to payment page.",
    proCopied: "Copied.",
    sqlEmpty: "SQL is empty. Paste SQL then run the check.",
    noRisk: "No risky patterns detected (not a guarantee).",
    noResultYet: "No results yet. Paste SQL and click “Check Risk”.",
    proAutoRestored: "Pro restored.",
  },
};

function setLang(lang) {
  const l = (lang === "en") ? "en" : "ja";
  document.documentElement.setAttribute("data-lang", l);
  document.documentElement.lang = l;
  localStorage.setItem("nw_lang", l);

  const dict = I18N[l];

  // text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!dict[key]) return;
    el.innerHTML = dict[key];
  });

  // list nodes
  document.querySelectorAll("[data-i18n-list]").forEach((el) => {
    const key = el.getAttribute("data-i18n-list");
    const items = dict[key];
    if (!Array.isArray(items)) return;
    el.innerHTML = items.map((x) => `<li>${x}</li>`).join("");
  });

  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!dict[key]) return;
    el.setAttribute("placeholder", dict[key]);
  });

  // update empty texts
  const emptyWarn = document.querySelector(".warnings .empty");
  if (emptyWarn) emptyWarn.textContent = dict.emptyWarn;

  const prev = document.querySelector("#sqlPreview code");
  if (prev) {
    const t = prev.textContent || "";
    if (t.includes("解析結果") || t.includes("Analysis")) {
      prev.textContent = dict.previewEmpty;
    }
  }

  // Pro UI labels too
  renderPro();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-lang-btn]");
  if (!btn) return;
  setLang(btn.getAttribute("data-lang-btn"));
});

(function initLang(){
  const saved = localStorage.getItem("nw_lang");
  setLang(saved || "ja");
})();

/* ===== detection rules ===== */
const RULES = {
  critical: [
    { re: /\bdrop\b/i, ja: "DROP が検出されました（致命的）", en: "DROP detected (critical)", hl: "hl-crit" },
    { re: /\btruncate\b/i, ja: "TRUNCATE が検出されました（致命的）", en: "TRUNCATE detected (critical)", hl: "hl-crit" },
    { re: /\balter\s+table\b/i, ja: "ALTER TABLE が検出されました（致命的）", en: "ALTER TABLE detected (critical)", hl: "hl-crit" },
    { re: /\brename\b/i, ja: "RENAME が検出されました（致命的）", en: "RENAME detected (critical)", hl: "hl-crit" },
    { re: /\bgrant\b/i, ja: "GRANT が検出されました（致命的）", en: "GRANT detected (critical)", hl: "hl-crit" },
    { re: /\brevoke\b/i, ja: "REVOKE detected (critical)", en: "REVOKE detected (critical)", hl: "hl-crit" },
  ],
  high: [
    { re: /\bcascade\b/i, ja: "CASCADE が検出されました（危険）", en: "CASCADE detected (high)", hl: "hl-high" },
    { re: /\bwhere\s+1\s*=\s*1\b/i, ja: "WHERE 1=1 が検出されました（全件操作の可能性）", en: "WHERE 1=1 detected (possible full-table operation)", hl: "hl-high" },
  ],
  medium: [
    { re: /\bselect\s+\*\b/i, ja: "SELECT * が検出されました（注意）", en: "SELECT * detected (medium)", hl: "hl-med" },
    { re: /\blike\s+'%[^']*%'\b/i, ja: "LIKE '%...%' が検出されました（フルスキャン注意）", en: "LIKE '%...%' detected (possible full scan)", hl: "hl-med" },
  ],
};

function detectMissingWhere(stmt, kind) {
  const s = stmt.toLowerCase();
  if (kind === "update") {
    if (!/\bupdate\b/.test(s)) return false;
    if (/\bset\b/.test(s) && !/\bwhere\b/.test(s)) return true;
  }
  if (kind === "delete") {
    if (!/\bdelete\b/.test(s)) return false;
    if (!/\bwhere\b/.test(s)) return true;
  }
  return false;
}

function classify(stmt) {
  const cleaned = stripSqlComments(stmt);

  const warnings = [];
  let keywordHits = 0;

  const hasUpdate = /\bupdate\b/i.test(cleaned);
  const hasDelete = /\bdelete\b/i.test(cleaned);
  const hasInsert = /\binsert\b/i.test(cleaned);
  const hasDDL = /\b(drop|truncate|alter|create|rename)\b/i.test(cleaned);
  const hasWrite = hasUpdate || hasDelete || hasInsert || hasDDL;

  const lang = document.documentElement.getAttribute("data-lang") || "ja";

  if (detectMissingWhere(cleaned, "delete")) {
    warnings.push({
      sev: "crit",
      title: (lang === "en") ? "DELETE without WHERE" : "DELETE文にWHERE句がありません",
      detail: (lang === "en") ? "May delete all rows" : "全件削除の可能性があります",
    });
    keywordHits++;
  }
  if (detectMissingWhere(cleaned, "update")) {
    warnings.push({
      sev: "crit",
      title: (lang === "en") ? "UPDATE without WHERE" : "UPDATE文にWHERE句がありません",
      detail: (lang === "en") ? "May update all rows" : "全件更新の可能性があります",
    });
    keywordHits++;
  }

  const applyRules = (arr, sev) => {
    for (const r of arr) {
      if (r.re.test(cleaned)) {
        warnings.push({
          sev,
          title: (lang === "en") ? r.en : r.ja,
          detail: "stmt",
        });
        keywordHits++;
      }
    }
  };

  applyRules(RULES.critical, "crit");
  applyRules(RULES.high, "high");
  applyRules(RULES.medium, "med");

  if (/\border\s+by\b/i.test(cleaned) && !/\blimit\b/i.test(cleaned) && /\bselect\b/i.test(cleaned)) {
    warnings.push({
      sev: "med",
      title: (lang === "en") ? "ORDER BY without LIMIT" : "ORDER BY + LIMIT無しの可能性",
      detail: (lang === "en") ? "Could be heavy query" : "重いクエリになる場合があります",
    });
    keywordHits++;
  }

  const readOnly = els.readOnlyToggle.checked;
  if (readOnly && hasWrite) {
    warnings.push({
      sev: "high",
      title: (lang === "en") ? "Write ops detected in Read-only mode" : "読み取り専用モードで書き込み系が検出されました",
      detail: (lang === "en") ? "Avoid non-SELECT statements" : "SELECT以外は避けてください",
    });
    keywordHits++;
  }

  const env = els.envSelect.value;
  const envBump = env === "prod";

  const order = { low: 0, med: 1, high: 2, crit: 3 };
  let risk = "low";

  for (const w of warnings) {
    const r = w.sev === "crit" ? "crit" : w.sev === "high" ? "high" : w.sev === "med" ? "med" : "low";
    if (order[r] > order[risk]) risk = r;
  }

  if (envBump && risk !== "crit" && warnings.length > 0) {
    risk = risk === "high" ? "crit" : risk === "med" ? "high" : "med";
  }

  if (warnings.length === 0) {
    if (/^\s*select\b/i.test(cleaned)) risk = "low";
    else if (cleaned.trim().length > 0) risk = "med";
  }

  return { cleaned, warnings, risk, keywordHits, hasWrite };
}

function riskLabel(risk) {
  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  if (lang === "en") {
    if (risk === "crit") return "Critical";
    if (risk === "high") return "High";
    if (risk === "med") return "Medium";
    return "Low";
  }
  if (risk === "crit") return "Critical（致命的）";
  if (risk === "high") return "High（危険）";
  if (risk === "med") return "Medium（注意）";
  return "Low（低）";
}

function setBadge(risk) {
  const b = els.riskBadge;
  b.textContent = riskLabel(risk);
  b.classList.remove("risk-low", "risk-med", "risk-high", "risk-crit");
  if (risk === "crit") b.classList.add("risk-crit");
  else if (risk === "high") b.classList.add("risk-high");
  else if (risk === "med") b.classList.add("risk-med");
  else b.classList.add("risk-low");
}

function renderWarnings(allWarnings) {
  const ul = els.warningsList;
  ul.innerHTML = "";

  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  if (allWarnings.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = (lang === "en")
      ? I18N.en.noRisk
      : I18N.ja.noRisk;
    ul.appendChild(li);
    return;
  }

  const order = { crit: 3, high: 2, med: 1, low: 0 };
  allWarnings.sort((a, b) => (order[b.sev] ?? 0) - (order[a.sev] ?? 0));

  for (const w of allWarnings) {
    const li = document.createElement("li");
    li.className = `nw-warn ${w.sev}`;
    li.innerHTML = `
      <div><strong>${escapeHtml(w.title)}</strong></div>
      <small>${escapeHtml(w.detail || "")}</small>
    `;
    ul.appendChild(li);
  }
}

function highlightSql(sql, highlights) {
  let safe = escapeHtml(sql);
  for (const h of highlights) {
    safe = safe.replace(h.re, (m) => `<mark class="${h.cls}">${m}</mark>`);
  }
  return safe;
}

function buildHighlightRules() {
  return [
    { re: /\b(drop|truncate|alter|grant|revoke)\b/gi, cls: "hl-crit" },
    { re: /\b(delete|update)\b/gi, cls: "hl-high" },
    { re: /\bwhere\s+1\s*=\s*1\b/gi, cls: "hl-high" },
    { re: /\bselect\s+\*\b/gi, cls: "hl-med" },
    { re: /\bcascade\b/gi, cls: "hl-high" },
    { re: /\border\s+by\b/gi, cls: "hl-med" },
    { re: /\blike\b/gi, cls: "hl-med" },
  ];
}

function computeOverallRisk(perStmt) {
  const order = { low: 0, med: 1, high: 2, crit: 3 };
  let risk = "low";
  for (const r of perStmt.map((x) => x.risk)) {
    if (order[r] > order[risk]) risk = r;
  }
  return risk;
}

function onCheck() {
  const input = (els.sqlInput.value || "").trim();
  const lang = document.documentElement.getAttribute("data-lang") || "ja";

  if (!input) {
    setBadge("low");
    els.sumStatements.textContent = "0";
    els.sumWrites.textContent = "0";
    els.sumKeywords.textContent = "0";
    els.warningsList.innerHTML = `<li class="empty">${(lang === "en") ? I18N.en.sqlEmpty : I18N.ja.sqlEmpty}</li>`;
    els.sqlPreview.innerHTML = `<code>${(lang === "en") ? I18N.en.previewEmpty : I18N.ja.previewEmpty}</code>`;
    return;
  }

  const stmts = splitStatements(input);
  const results = stmts.map((s) => classify(s));

  const overall = computeOverallRisk(results);
  setBadge(overall);

  els.sumStatements.textContent = String(stmts.length);
  els.sumWrites.textContent = String(results.filter((r) => r.hasWrite).length);
  els.sumKeywords.textContent = String(results.reduce((a, r) => a + (r.keywordHits || 0), 0));

  const allWarnings = [];
  results.forEach((r, idx) => {
    r.warnings.forEach((w) => {
      allWarnings.push({ ...w, detail: `${w.detail || ""} (stmt #${idx + 1})` });
    });
  });
  renderWarnings(allWarnings);

  const previewHtml = highlightSql(input, buildHighlightRules());
  els.sqlPreview.innerHTML = `<code>${previewHtml}</code>`;
}

function onClear() {
  els.sqlInput.value = "";
  els.envSelect.value = "unknown";
  els.dbSelect.value = "generic";
  els.readOnlyToggle.checked = false;

  setBadge("low");
  els.sumStatements.textContent = "0";
  els.sumWrites.textContent = "0";
  els.sumKeywords.textContent = "0";

  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  els.warningsList.innerHTML = `<li class="empty">${(lang === "en") ? I18N.en.noResultYet : I18N.ja.noResultYet}</li>`;
  els.sqlPreview.innerHTML = `<code>${(lang === "en") ? I18N.en.previewEmpty : I18N.ja.previewEmpty}</code>`;
}

function setAllChecklist(checked) {
  const boxes = els.preChecklist.querySelectorAll("input[type='checkbox']");
  boxes.forEach((b) => (b.checked = checked));
}

els.checkBtn.addEventListener("click", onCheck);
els.clearBtn.addEventListener("click", onClear);
els.checkAllBtn.addEventListener("click", () => setAllChecklist(true));
els.clearAllBtn.addEventListener("click", () => setAllChecklist(false));

/* ===== Pro unlock (Payment link jump + return param restore) ===== */
const PRO_KEY = "nw_sql_pro";

/**
 * ✅ Stripe Payment Link をここに入れる（後で差し替え）
 * 例: "https://buy.stripe.com/xxxxxx"
 */
const PRO_PAYMENT_URL = ""; // TODO: set Stripe Payment Link

/**
 * ✅ success_url等で ?pro=1 を付けて戻すなら自動復元する（MVP）
 * 将来はサーバ検証に置換する
 */
const PRO_RETURN_PARAM = "pro"; // ?pro=1

function isPro() {
  return localStorage.getItem(PRO_KEY) === "1";
}

function setPro(v) {
  if (v) localStorage.setItem(PRO_KEY, "1");
  else localStorage.removeItem(PRO_KEY);
  renderPro();
}

function renderPro() {
  const tag = $("proStateTag");
  const locked = $("proLocked");
  const unlocked = $("proUnlocked");
  if (!tag || !locked || !unlocked) return;

  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  const dict = I18N[lang] || I18N.ja;

  const pro = isPro();
  if (pro) {
    tag.textContent = "Unlocked";
    locked.hidden = true;
    unlocked.hidden = false;
  } else {
    tag.textContent = "Locked";
    locked.hidden = false;
    unlocked.hidden = true;
  }

  const buy = $("buyProBtn");
  const restore = $("restoreProBtn");
  const copy = $("copyTemplateBtn");
  const lock = $("lockProBtn");

  if (buy) buy.textContent = dict.proBuyBtn || (lang === "en" ? "Buy Pro" : "Proを購入");
  if (restore) restore.textContent = dict.proRestoreBtn || (lang === "en" ? "Restore purchase" : "購入済みを復元");
  if (copy) copy.textContent = dict.proCopyBtn || (lang === "en" ? "Copy template" : "テンプレをコピー");
  if (lock) lock.textContent = dict.proLockBtn || (lang === "en" ? "Lock Pro (test)" : "Proをロック（テスト用）");
}

function maybeAutoRestoreFromReturnParam() {
  const url = new URL(window.location.href);
  const v = url.searchParams.get(PRO_RETURN_PARAM);
  if (v === "1") {
    setPro(true);

    // URLをきれいにする（履歴を汚さない）
    url.searchParams.delete(PRO_RETURN_PARAM);
    window.history.replaceState({}, "", url.toString());

    // 任意：復元したことを知らせる（うるさければ消してOK）
    const lang = document.documentElement.getAttribute("data-lang") || "ja";
    // alert(lang === "en" ? I18N.en.proAutoRestored : I18N.ja.proAutoRestored);
  }
}

$("buyProBtn")?.addEventListener("click", () => {
  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  const dict = I18N[lang] || I18N.ja;

  if (!PRO_PAYMENT_URL) {
    alert(dict.proLinkNotSet || (lang === "en"
      ? "Payment link is not set yet."
      : "決済リンクがまだ設定されていません。"));
    return;
  }

  // 決済へ移動（MVPは外部リンクへ飛ばすだけ）
  window.location.href = PRO_PAYMENT_URL;
});

$("restoreProBtn")?.addEventListener("click", () => {
  // MVP: 手動復元（将来は決済検証へ）
  setPro(true);
});

$("lockProBtn")?.addEventListener("click", () => {
  setPro(false);
});

$("copyTemplateBtn")?.addEventListener("click", async () => {
  const code = $("proTemplateCode")?.textContent || "";
  const lang = document.documentElement.getAttribute("data-lang") || "ja";
  const dict = I18N[lang] || I18N.ja;

  try {
    await navigator.clipboard.writeText(code.trim());
    alert(dict.proCopied || (lang === "en" ? "Copied." : "コピーしました。"));
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = code.trim();
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert(dict.proCopied || (lang === "en" ? "Copied." : "コピーしました。"));
  }
});

onClear();
maybeAutoRestoreFromReturnParam();
renderPro();
