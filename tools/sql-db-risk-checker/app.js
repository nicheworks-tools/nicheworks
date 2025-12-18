"use strict";

/**
 * SQL / DB Risk Checker (MVP)
 * - browser-only, no storage
 * - regex-based, lightweight (no SQL parsing)
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
  // remove /* */ and -- ... and # ... (mysql style)
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/--.*$/gm, " ");
  s = s.replace(/^\s*#.*$/gm, " ");
  return s;
}

function splitStatements(sql) {
  // naive split by ';' but avoid splitting inside single/double quotes
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

const RULES = {
  critical: [
    { key: "drop", re: /\bdrop\b/i, msg: "DROP が検出されました（致命的）", en: "DROP detected (critical)", hl: "hl-crit" },
    { key: "truncate", re: /\btruncate\b/i, msg: "TRUNCATE が検出されました（致命的）", en: "TRUNCATE detected (critical)", hl: "hl-crit" },
    { key: "alter", re: /\balter\s+table\b/i, msg: "ALTER TABLE が検出されました（致命的）", en: "ALTER TABLE detected (critical)", hl: "hl-crit" },
    { key: "rename", re: /\brename\b/i, msg: "RENAME が検出されました（致命的）", en: "RENAME detected (critical)", hl: "hl-crit" },
    { key: "grant", re: /\bgrant\b/i, msg: "GRANT が検出されました（致命的）", en: "GRANT detected (critical)", hl: "hl-crit" },
    { key: "revoke", re: /\brevoke\b/i, msg: "REVOKE が検出されました（致命的）", en: "REVOKE detected (critical)", hl: "hl-crit" },
  ],
  high: [
    { key: "cascade", re: /\bcascade\b/i, msg: "CASCADE が検出されました（危険）", en: "CASCADE detected (high)", hl: "hl-high" },
    { key: "where1eq1", re: /\bwhere\s+1\s*=\s*1\b/i, msg: "WHERE 1=1 が検出されました（全件操作の可能性）", en: "WHERE 1=1 detected (possible full-table operation)", hl: "hl-high" },
  ],
  medium: [
    { key: "select_star", re: /\bselect\s+\*\b/i, msg: "SELECT * が検出されました（注意）", en: "SELECT * detected (medium)", hl: "hl-med" },
    { key: "like_any", re: /\blike\s+'%[^']*%'\b/i, msg: "LIKE '%...%' が検出されました（フルスキャン注意）", en: "LIKE '%...%' detected (possible full scan)", hl: "hl-med" },
  ],
};

function detectMissingWhere(stmt, kind) {
  // kind: "update" | "delete"
  const s = stmt.toLowerCase();
  if (kind === "update") {
    if (!/\bupdate\b/.test(s)) return false;
    // must have SET; if UPDATE exists but no WHERE => missing
    if (/\bset\b/.test(s) && !/\bwhere\b/.test(s)) return true;
  }
  if (kind === "delete") {
    if (!/\bdelete\b/.test(s)) return false;
    if (!/\bwhere\b/.test(s)) return true;
  }
  return false;
}

function classify(stmt) {
  const raw = stmt;
  const cleaned = stripSqlComments(raw);
  const lower = cleaned.toLowerCase();

  const warnings = [];
  let keywordHits = 0;

  // destructive write checks
  const hasUpdate = /\bupdate\b/i.test(cleaned);
  const hasDelete = /\bdelete\b/i.test(cleaned);
  const hasInsert = /\binsert\b/i.test(cleaned);
  const hasDDL = /\b(drop|truncate|alter|create|rename)\b/i.test(cleaned);
  const hasWrite = hasUpdate || hasDelete || hasInsert || hasDDL;

  // missing WHERE checks (Critical)
  if (detectMissingWhere(cleaned, "delete")) {
    warnings.push({ sev: "crit", title: "DELETE文にWHERE句がありません", detail: "全件削除の可能性があります", hl: "hl-crit" });
    keywordHits++;
  }
  if (detectMissingWhere(cleaned, "update")) {
    warnings.push({ sev: "crit", title: "UPDATE文にWHERE句がありません", detail: "全件更新の可能性があります", hl: "hl-crit" });
    keywordHits++;
  }

  // rule matches
  const applyRules = (arr, sev, defaultDetail) => {
    for (const r of arr) {
      if (r.re.test(cleaned)) {
        warnings.push({
          sev,
          title: r.msg,
          detail: defaultDetail || r.en,
          hl: r.hl,
        });
        keywordHits++;
      }
    }
  };

  applyRules(RULES.critical, "crit");
  applyRules(RULES.high, "high");
  applyRules(RULES.medium, "med");

  // medium: ORDER BY without LIMIT (rough)
  if (/\border\s+by\b/i.test(cleaned) && !/\blimit\b/i.test(cleaned) && /\bselect\b/i.test(cleaned)) {
    warnings.push({ sev: "med", title: "ORDER BY + LIMIT無しの可能性", detail: "重いクエリになる場合があります", hl: "hl-med" });
    keywordHits++;
  }

  // read-only mode: any write is High/Critical
  const readOnly = els.readOnlyToggle.checked;
  if (readOnly && hasWrite) {
    warnings.push({ sev: "high", title: "読み取り専用モードで書き込み系が検出されました", detail: "SELECT以外は避けてください", hl: "hl-high" });
    keywordHits++;
  }

  // environment prod increases severity by one step (cap at crit)
  const env = els.envSelect.value;
  let envBump = env === "prod";

  // determine risk by worst warning
  const order = { low: 0, med: 1, high: 2, crit: 3 };
  let risk = "low";

  for (const w of warnings) {
    const r = w.sev === "crit" ? "crit" : w.sev === "high" ? "high" : w.sev === "med" ? "med" : "low";
    if (order[r] > order[risk]) risk = r;
  }

  if (envBump && risk !== "crit" && warnings.length > 0) {
    // bump one step
    risk = risk === "high" ? "crit" : risk === "med" ? "high" : "med";
  }

  // if nothing detected but it is pure SELECT => low; otherwise medium
  if (warnings.length === 0) {
    if (/^\s*select\b/i.test(cleaned)) risk = "low";
    else if (cleaned.trim().length > 0) risk = "med";
  }

  return { cleaned, lower, warnings, risk, keywordHits, hasWrite };
}

function riskLabel(risk) {
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

  if (allWarnings.length === 0) {
    const li = document.createElement("li");
    li.className = "nw-empty";
    li.textContent = "危険なパターンは検出されませんでした（ただし安全性を保証しません）。";
    ul.appendChild(li);
    return;
  }

  // sort by severity desc
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
  // highlights: array of {re, cls}
  let safe = escapeHtml(sql);

  // apply in order (critical first)
  for (const h of highlights) {
    safe = safe.replace(h.re, (m) => `<mark class="${h.cls}">${m}</mark>`);
  }
  return safe;
}

function buildHighlightRules() {
  // critical -> high -> medium
  const rules = [];

  // missing where (we just highlight keywords)
  rules.push({ re: /\b(drop|truncate|alter|grant|revoke)\b/gi, cls: "hl-crit" });
  rules.push({ re: /\b(delete|update)\b/gi, cls: "hl-high" });
  rules.push({ re: /\bwhere\s+1\s*=\s*1\b/gi, cls: "hl-high" });
  rules.push({ re: /\bselect\s+\*\b/gi, cls: "hl-med" });
  rules.push({ re: /\bcascade\b/gi, cls: "hl-high" });
  rules.push({ re: /\border\s+by\b/gi, cls: "hl-med" });
  rules.push({ re: /\blike\b/gi, cls: "hl-med" });

  return rules;
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
  if (!input) {
    setBadge("low");
    els.sumStatements.textContent = "0";
    els.sumWrites.textContent = "0";
    els.sumKeywords.textContent = "0";
    els.warningsList.innerHTML = `<li class="nw-empty">SQLが空です。入力してからチェックしてください。</li>`;
    els.sqlPreview.innerHTML = `<code>ここに解析結果が表示されます</code>`;
    return;
  }

  const stmts = splitStatements(input);
  const results = stmts.map((s) => classify(s));

  const overall = computeOverallRisk(results);
  setBadge(overall);

  // summary
  const statements = stmts.length;
  const writes = results.filter((r) => r.hasWrite).length;
  const keywordHits = results.reduce((a, r) => a + (r.keywordHits || 0), 0);

  els.sumStatements.textContent = String(statements);
  els.sumWrites.textContent = String(writes);
  els.sumKeywords.textContent = String(keywordHits);

  // warnings flatten
  const allWarnings = [];
  results.forEach((r, idx) => {
    r.warnings.forEach((w) => {
      allWarnings.push({
        ...w,
        detail: (w.detail ? w.detail + " / " : "") + `stmt #${idx + 1}`,
      });
    });
  });
  renderWarnings(allWarnings);

  // preview with highlight
  const hlRules = buildHighlightRules();
  const previewHtml = highlightSql(input, hlRules);
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
  els.warningsList.innerHTML = `<li class="nw-empty">まだ結果はありません。SQLを入力して「リスクチェック」を押してください。</li>`;
  els.sqlPreview.innerHTML = `<code>ここに解析結果が表示されます</code>`;
}

function setAllChecklist(checked) {
  const boxes = els.preChecklist.querySelectorAll("input[type='checkbox']");
  boxes.forEach((b) => (b.checked = checked));
}

els.checkBtn.addEventListener("click", onCheck);
els.clearBtn.addEventListener("click", onClear);
els.checkAllBtn.addEventListener("click", () => setAllChecklist(true));
els.clearAllBtn.addEventListener("click", () => setAllChecklist(false));

// initial
onClear();
