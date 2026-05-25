// ============================
// LogFormatter app.js v0.2
// ============================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const I18N = {
    app_title: { ja: "LogFormatter – 地味ログ整形屋", en: "LogFormatter – Simple Log Beautifier" },
    app_sub: { ja: "Nginxアクセスログやアプリケーションログなど、長くて読みにくいテキストログをブラウザだけで整形します。", en: "Format long Nginx and application logs directly in your browser." },
    notice: { ja: "ログはすべてブラウザ内で処理され、サーバーには送信されません。", en: "All logs are processed locally in your browser and never sent to any server." },
    intro_title: { ja: "このツールでできること", en: "What this tool does" },
    intro_body: { ja: "Nginxアクセスログなどのテキストログを貼り付けると、ステータスコードやURLを見やすく色分けします。キーワード、除外語、ステータス範囲で絞り込みできます。", en: "Paste Nginx access logs or plain text logs to highlight status codes, URLs, and key fields. You can filter by keywords, exclusions, and status ranges." },
    intro_privacy: { ja: "ログはブラウザ内で処理されます。IP、Cookie、Authorizationヘッダー、メールアドレス、トークンなどを共有・保存する前に必ず確認してください。", en: "Logs are processed in your browser. Before sharing or saving, check for IP addresses, cookies, Authorization headers, emails, tokens, and other sensitive data." },
    intro_mobile: { ja: "大量ログの確認はPC表示を推奨します。スマホでは短いログの確認・コピー用途に向いています。", en: "For large logs, desktop view is recommended. Mobile is best for short checks and quick copy/export tasks." },
    input_label: { ja: "ログを貼り付け", en: "Paste your logs" },
    sample_label: { ja: "サンプル", en: "Sample" },
    sample_nginx: { ja: "Nginx通常", en: "Nginx standard" },
    sample_errors: { ja: "エラー多め", en: "Error-heavy" },
    sample_api: { ja: "APIアクセス", en: "API access" },
    sample_mixed: { ja: "未解析混在", en: "Mixed / unparsed" },
    btn_sample: { ja: "サンプル挿入", en: "Insert sample" },
    btn_clear: { ja: "クリア", en: "Clear" },
    btn_format: { ja: "整形する", en: "Format" },
    filter_include: { ja: "含めるキーワード", en: "Include keyword" },
    filter_exclude: { ja: "除外キーワード", en: "Exclude keyword" },
    filter_status_from: { ja: "ステータス最小", en: "Status min" },
    filter_status_to: { ja: "ステータス最大", en: "Status max" },
    status_quick: { ja: "ステータス抽出", en: "Status shortcuts" },
    lang_label: { ja: "表示言語", en: "Language" },
    output_title: { ja: "整形結果", en: "Formatted output" },
    btn_copy_visible: { ja: "表示中の結果をコピー", en: "Copy visible results" },
    btn_copy_errors: { ja: "4xx/5xxだけコピー", en: "Copy 4xx/5xx only" },
    btn_download_txt: { ja: "TXT保存", en: "Download TXT" },
    regex_mode: { ja: "Regex mode（Pro）", en: "Regex mode (Pro)" },
    include_regex: { ja: "Include regex", en: "Include regex" },
    exclude_regex: { ja: "Exclude regex", en: "Exclude regex" },
    pro_title: { ja: "構造化出力・詳細分析・レポート化", en: "Structured exports, deep analysis, and reports" },
    pro_buy: { ja: "NicheWorks Proを購入 — $2.99", en: "Buy NicheWorks Pro — $2.99" },
    pro_after_purchase: { ja: "購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。", en: "After purchase, NicheWorks Pro becomes active in this browser. It usually remains active after closing tabs or the browser, but another device, another browser, private mode, or cleared site data requires activation again." },
    pro_preview_title: { ja: "Pro Preview", en: "Pro Preview" },
    pro_unlocked_title: { ja: "Pro詳細分析", en: "Pro detail analysis" },
    btn_csv: { ja: "CSV保存", en: "Export CSV" },
    btn_error_csv: { ja: "4xx/5xx CSV保存", en: "Export 4xx/5xx CSV" },
    btn_json: { ja: "JSON保存", en: "Export JSON" },
    btn_copy_md: { ja: "レポートコピー", en: "Copy report" },
    btn_save_md: { ja: "レポート保存", en: "Save report" },
    empty_copy: { ja: "コピーできる表示中のログがありません。", en: "There are no visible log lines to copy." },
    empty_errors: { ja: "コピーできる4xx/5xxログがありません。", en: "There are no 4xx/5xx lines to copy." },
    pro_locked: { ja: "Pro機能です。Previewを確認し、NicheWorks Proを有効化してください。", en: "This is a Pro feature. Review the preview and activate NicheWorks Pro." },
    regex_locked: { ja: "Regex modeはPro機能です。Previewモードでは通常キーワードフィルタを使います。", en: "Regex mode is a Pro feature. Preview mode keeps using the normal keyword filters." },
    regex_invalid: { ja: "正規表現が無効です。通常フィルタを維持します: ", en: "Invalid regex. Normal filters stay available: " },
    copy_ok: { ja: "コピーしました。", en: "Copied." },
    copy_fail: { ja: "コピーに失敗しました。ブラウザの権限を確認してください。", en: "Copy failed. Check your browser permissions." },
    download_ok: { ja: "保存しました。", en: "Downloaded." },
    no_match: { ja: "現在のフィルタに一致する行はありません。", en: "No lines matched the current filters." },
    unparsed_badge: { ja: "未解析", en: "UNPARSED" },
    json_badge: { ja: "JSON", en: "JSON" },
    unparsed_reason: { ja: "Nginx combined形式または1行JSONとして解析できませんでした。フィルタ・コピー対象には含まれます。", en: "This line could not be parsed as Nginx combined format or one-line JSON. It is still included in filters and copy/export output." },
  };

  const state = { lang: "ja", lastVisibleLines: [], lastRows: [], lastParsedRows: [], lastErrorLines: [], lastStats: null, ipSort: "error", urlSort: "error" };
  const $ = (id) => document.getElementById(id);

  const langSelect = $("langSelect");
  let i18nNodes = document.querySelectorAll("[data-i18n]");
  const inputEl = $("logInput");
  const outputEl = $("logOutput");
  const metaEl = $("outputMeta");
  const summaryGridEl = $("summaryGrid");
  const summaryListsEl = $("summaryLists");
  const messageEl = $("copyMessage");
  const includeEl = $("filterInclude");
  const excludeEl = $("filterExclude");
  const statusFromEl = $("statusFrom");
  const statusToEl = $("statusTo");
  const regexModeEl = $("regexMode");
  const includeRegexEl = $("includeRegex");
  const excludeRegexEl = $("excludeRegex");
  const regexMessageEl = $("regexMessage");
  const sampleSelect = $("sampleSelect");
  const statusPresetButtons = Array.from(document.querySelectorAll("[data-status-preset]"));

  const els = {
    langJa: $("langJa"), langEn: $("langEn"), btnSample: $("btnSample"), btnClear: $("btnClear"), btnFormat: $("btnFormat"),
    btnCopyVisible: $("btnCopyVisible"), btnCopyErrors: $("btnCopyErrors"), btnDownloadTxt: $("btnDownloadTxt"), darkBtn: $("darkToggleBtn"),
    btnDownloadCsv: $("btnDownloadCsv"), btnDownloadErrorCsv: $("btnDownloadErrorCsv"), btnDownloadJson: $("btnDownloadJson"), btnCopyMarkdown: $("btnCopyMarkdown"), btnDownloadMarkdown: $("btnDownloadMarkdown"),
    proSummaryPack: $("proSummaryPack"), uaSummary: $("uaSummary"), botSummary: $("botSummary"), ipDetailTable: $("ipDetailTable"), urlDetailTable: $("urlDetailTable"), sensitiveDetails: $("sensitiveDetails"), markdownPreview: $("markdownPreview"),
    sortIpDetail: $("sortIpDetail"), sortUrlDetail: $("sortUrlDetail"),
  };

  const SAMPLES = {
    nginx: [
      '192.168.0.1 - - [10/Nov/2025:10:10:10 +0900] "GET / HTTP/1.1" 200 123 "-" "curl/7.79.1"',
      '203.0.113.12 - - [10/Nov/2025:10:10:11 +0900] "GET /healthcheck HTTP/1.1" 200 45 "-" "kube-probe/1.22"',
      '203.0.113.12 - - [10/Nov/2025:10:10:12 +0900] "POST /api/login HTTP/1.1" 302 0 "-" "Mozilla/5.0"',
      '203.0.113.21 - - [10/Nov/2025:10:10:15 +0900] "GET /admin HTTP/1.1" 403 321 "-" "Mozilla/5.0"',
      '198.51.100.9 - - [10/Nov/2025:10:10:20 +0900] "GET /index.html HTTP/1.1" 500 0 "-" "Mozilla/5.0"',
    ],
    errors: [
      '198.51.100.20 - - [10/Nov/2025:11:01:00 +0900] "GET /login HTTP/1.1" 200 2048 "-" "Mozilla/5.0"',
      '203.0.113.55 - - [10/Nov/2025:11:01:02 +0900] "POST /wp-login.php HTTP/1.1" 401 512 "-" "bot/1.0"',
      '203.0.113.55 - - [10/Nov/2025:11:01:04 +0900] "GET /.env HTTP/1.1" 404 128 "-" "bot/1.0"',
      '192.0.2.44 - - [10/Nov/2025:11:01:09 +0900] "GET /api/orders HTTP/1.1" 502 0 "-" "Mozilla/5.0"',
    ],
    api: [
      '10.0.0.10 - - [10/Nov/2025:12:00:01 +0900] "GET /api/v1/users HTTP/1.1" 200 870 "-" "axios/1.6"',
      '10.0.0.11 - - [10/Nov/2025:12:00:02 +0900] "POST /api/v1/orders HTTP/1.1" 201 640 "-" "axios/1.6"',
      '10.0.0.12 - - [10/Nov/2025:12:00:04 +0900] "GET /api/v1/orders/999 HTTP/1.1" 404 120 "-" "python-requests/2.31"',
      '{"level":"error","status":500,"path":"/api/orders","method":"POST","message":"upstream failed token=abc123","time":"2025-11-10T12:00:05+09:00"}',
    ],
    mixed: [
      'malformed line without fields Authorization: Bearer sample@example.com',
      '198.51.100.77 - - [10/Nov/2025:13:00:00 +0900] "GET /products HTTP/1.1" 200 4096 "-" "Mozilla/5.0"',
      '{"level":"warn","status":429,"path":"/api/search","message":"rate limited","time":"2025-11-10T13:01:00+09:00"}',
      'just a plain app log message secret=demo',
    ],
  };

  function t(key) { return I18N[key]?.[state.lang] || I18N[key]?.ja || key; }
  function isProActive() { return document.documentElement.dataset.proActive === "true"; }
  function setText(node, text) { if (node) node.textContent = text; }

  function applyLang(lang) {
    state.lang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = state.lang;
    if (langSelect) langSelect.value = state.lang;
    els.langJa?.classList.toggle("active", state.lang === "ja");
    els.langEn?.classList.toggle("active", state.lang === "en");
    i18nNodes = document.querySelectorAll("[data-i18n]");
    i18nNodes.forEach((node) => { node.textContent = t(node.dataset.i18n); });
    localStorage.setItem("nw-logformatter-lang", state.lang);
    window.dispatchEvent(new CustomEvent("nw-language-change", { detail: { lang: state.lang } }));
    updateDarkButtonText();
    formatLogs();
  }

  function updateDarkButtonText() { if (els.darkBtn) els.darkBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light" : "🌙 Dark"; }
  function loadInitialTheme() { if (localStorage.getItem("nw-logformatter-theme") === "dark") document.body.classList.add("dark-mode"); updateDarkButtonText(); }

  function parseNginx(line) {
    const re = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+([^\"]*?)\s+([^\"]+)"\s+(\d{3})\s+(\S+)\s+"([^\"]*)"\s+"([^\"]*)"/;
    const m = line.match(re);
    if (!m) return null;
    return { type: "nginx", source: "nginx-combined", ip: m[1], time: m[2], method: m[3], path: m[4], protocol: m[5], status: Number(m[6]), size: m[7], referer: m[8], agent: m[9], level: "", message: "", raw: line, parsed: true };
  }

  function parseJsonLog(line) {
    if (!isProActive()) return null;
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
    const data = JSON.parse(trimmed);
    if (!data || Array.isArray(data) || typeof data !== "object") return null;
    return { type: "json", source: "json-line", ip: String(data.ip || data.remote_addr || ""), time: String(data.time || data.timestamp || data.datetime || ""), method: String(data.method || ""), path: String(data.path || data.url || data.route || ""), status: Number(data.status || data.statusCode || 0) || "", size: data.size ? String(data.size) : "", referer: "", agent: String(data.agent || data.userAgent || data.ua || ""), level: String(data.level || data.severity || ""), message: String(data.message || data.msg || data.error || ""), raw: line, parsed: true };
  }

  function parseLine(line) {
    const nginx = parseNginx(line);
    if (nginx) return nginx;
    try { return parseJsonLog(line); } catch (error) { return null; }
  }

  function rowIsError(row) {
    if (!row || !row.parsed) return false;
    const status = Number(row.status || 0);
    const level = String(row.level || "").toLowerCase();
    return status >= 400 || level === "error" || level === "warn" || level === "warning";
  }

  function getFilters() {
    return { include: (includeEl?.value || "").trim().toLowerCase(), exclude: (excludeEl?.value || "").trim().toLowerCase(), from: Number(statusFromEl?.value || 0), to: Number(statusToEl?.value || 0), includeRegex: (includeRegexEl?.value || "").trim(), excludeRegex: (excludeRegexEl?.value || "").trim(), regexMode: Boolean(regexModeEl?.checked && isProActive()) };
  }

  function matchesTextFilters(line, filters) {
    const lower = line.toLowerCase();
    if (filters.regexMode) {
      if (filters.includeRegex && !(new RegExp(filters.includeRegex).test(line))) return false;
      if (filters.excludeRegex && new RegExp(filters.excludeRegex).test(line)) return false;
      return true;
    }
    if (filters.include && !lower.includes(filters.include)) return false;
    if (filters.exclude && lower.includes(filters.exclude)) return false;
    return true;
  }

  function matchesStatusFilter(parsed, filters) {
    if (!filters.from && !filters.to) return true;
    if (!parsed || !Number(parsed.status)) return false;
    const status = Number(parsed.status);
    if (filters.from && status < filters.from) return false;
    if (filters.to && status > filters.to) return false;
    return true;
  }

  function increment(map, key) { if (key) map.set(key, (map.get(key) || 0) + 1); }
  function topEntries(map, limit = 3) { return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count })); }
  function bucket(status) { const n = Number(status || 0); if (n >= 500) return "s5"; if (n >= 400) return "s4"; if (n >= 300) return "s3"; if (n >= 200) return "s2"; return "other"; }
  function errorRate(total, errors) { return total > 0 ? Math.round((errors / total) * 1000) / 10 : 0; }

  function classifyAgent(agent) {
    const ua = String(agent || "");
    if (!ua) return "unknown";
    if (/(bot|crawler|spider|kube-probe)/i.test(ua)) return "bot";
    if (/(curl|python|axios|okhttp|Go-http-client)/i.test(ua)) return "script";
    if (/(mozilla|chrome|safari|firefox|edge)/i.test(ua)) return "browser";
    return "unknown";
  }

  function sensitiveMatches(line, lineNumber) {
    const patterns = [
      ["Authorization", /Authorization/i], ["Bearer", /Bearer\s+[A-Za-z0-9._~+\/-]+/i], ["Cookie", /\bCookie\b/i], ["Set-Cookie", /Set-Cookie/i],
      ["api_key", /api_key/i], ["apikey", /apikey/i], ["secret", /secret/i], ["token", /token/i], ["email", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i],
    ];
    return patterns.filter(([, re]) => re.test(line)).map(([type]) => ({ type, lineNumber }));
  }

  function buildAnalysis(rows, rawTotal) {
    const ip = new Map(), url = new Map(), ua = new Map(), sensitive = new Map();
    const botCounts = { bot: 0, browser: 0, script: 0, unknown: 0 };
    let parsedCount = 0, unparsedCount = 0;
    const statusBuckets = { s2: 0, s3: 0, s4: 0, s5: 0 };

    rows.forEach((row) => {
      sensitiveMatches(row.raw, row.lineNumber).forEach((m) => {
        const item = sensitive.get(m.type) || { type: m.type, count: 0, lines: [] };
        item.count += 1;
        item.lines.push(m.lineNumber);
        sensitive.set(m.type, item);
      });
      if (!row.parsed) { unparsedCount += 1; return; }
      parsedCount += 1;
      const b = bucket(row.status);
      if (statusBuckets[b] !== undefined) statusBuckets[b] += 1;
      if (row.ip) addDetail(ip, row.ip, row.path || "", b, rowIsError(row), "paths");
      if (row.path) addDetail(url, row.path, row.ip || "", b, rowIsError(row), "ips");
      if (row.agent) { increment(ua, row.agent); botCounts[classifyAgent(row.agent)] += 1; }
    });

    const ipDetails = detailsFromMap(ip, "paths", "topPath");
    const urlDetails = detailsFromMap(url, "ips", "topIP");
    const errors = rows.filter(rowIsError);
    return { total: rawTotal, shown: rows.length, parsedCount, unparsedCount, statusBuckets, errorRate: errorRate(parsedCount, statusBuckets.s4 + statusBuckets.s5), topIps: topEntries(new Map(ipDetails.map((r) => [r.key, r.total]))), topUrls: topEntries(new Map(urlDetails.map((r) => [r.key, r.total]))), topUserAgents: topEntries(ua, 10), botCounts, ipDetails, urlDetails, sensitive: Array.from(sensitive.values()), errors };
  }

  function addDetail(map, key, related, b, isError, relatedKey) {
    const item = map.get(key) || { key, total: 0, s2: 0, s3: 0, s4: 0, s5: 0, errors: 0, [relatedKey]: new Map() };
    item.total += 1;
    if (item[b] !== undefined) item[b] += 1;
    if (isError) item.errors += 1;
    if (related) increment(item[relatedKey], related);
    map.set(key, item);
  }

  function detailsFromMap(map, relatedKey, outKey) {
    return Array.from(map.values()).map((item) => ({ ...item, errorRate: errorRate(item.total, item.errors), [outKey]: topEntries(item[relatedKey], 1)[0]?.label || "-" })).sort((a, b) => b.errorRate - a.errorRate || b.total - a.total);
  }

  function createParsedLine(parsed) {
    const div = document.createElement("div");
    div.className = `log-line parsed ${parsed.type === "json" ? "json-line" : ""}`;
    if (parsed.type === "json") {
      const badge = document.createElement("span"); badge.className = "badge-unparsed badge-json"; badge.textContent = t("json_badge"); div.appendChild(badge); appendText(div, null, " ");
    }
    appendText(div, "ip", parsed.ip || "-"); appendText(div, null, " ");
    appendText(div, "timestamp", parsed.time || "-"); appendText(div, null, " ");
    appendText(div, "method", parsed.method || parsed.level || "-"); appendText(div, null, " ");
    appendText(div, "url", parsed.path || parsed.message || "-"); appendText(div, null, " ");
    if (parsed.status) appendText(div, `status status-${bucket(parsed.status).replace("s", "")}xx`, String(parsed.status));
    appendText(div, null, parsed.size ? ` ${parsed.size}` : "");
    return div;
  }
  function appendText(parent, cls, text) { const span = document.createElement("span"); if (cls) span.className = cls; span.textContent = text; parent.appendChild(span); }
  function createUnparsedLine(raw) { const div = document.createElement("div"); div.className = "log-line unparsed"; div.title = t("unparsed_reason"); const badge = document.createElement("span"); badge.className = "badge-unparsed"; badge.textContent = t("unparsed_badge"); div.appendChild(badge); appendText(div, null, " "); appendText(div, "unparsed-text", raw); return div; }
  function createSystemLine(message) { const div = document.createElement("div"); div.className = "log-line system"; div.textContent = message; return div; }

  function updateOutputMeta(stats) { if (!metaEl) return; metaEl.textContent = stats && stats.total ? (state.lang === "ja" ? `${stats.shown}/${stats.total} 行表示、解析成功 ${stats.parsedCount} 行、未解析 ${stats.unparsedCount} 行` : `${stats.shown}/${stats.total} shown, ${stats.parsedCount} parsed, ${stats.unparsedCount} unparsed`) : ""; }

  function renderSummary(stats) {
    if (!summaryGridEl || !summaryListsEl) return;
    summaryGridEl.textContent = ""; summaryListsEl.textContent = ""; if (!stats || stats.total === 0) return;
    const labels = state.lang === "ja" ? { total: "総行数", shown: "表示中", parsed: "解析成功", unparsed: "未解析", s2: "2xx", s3: "3xx", s4: "4xx", s5: "5xx", errorRate: "エラー率", topIp: "上位IP", topUrl: "上位URL", none: "なし", sensitive: "機密警告" } : { total: "Total", shown: "Shown", parsed: "Parsed", unparsed: "Unparsed", s2: "2xx", s3: "3xx", s4: "4xx", s5: "5xx", errorRate: "Error rate", topIp: "Top IPs", topUrl: "Top URLs", none: "None", sensitive: "Sensitive warning" };
    [[labels.total, stats.total], [labels.shown, stats.shown], [labels.parsed, stats.parsedCount], [labels.unparsed, stats.unparsedCount], [labels.s2, stats.statusBuckets.s2], [labels.s3, stats.statusBuckets.s3], [labels.s4, stats.statusBuckets.s4], [labels.s5, stats.statusBuckets.s5], [labels.errorRate, `${stats.errorRate}%`]].forEach(([label, value]) => {
      const item = document.createElement("div"); item.className = "summary-item"; const small = document.createElement("span"); small.textContent = label; const strong = document.createElement("strong"); strong.textContent = String(value); item.append(small, strong); summaryGridEl.appendChild(item);
    });
    [[labels.topIp, stats.topIps], [labels.topUrl, stats.topUrls], [labels.sensitive, stats.sensitive.map((x) => ({ label: x.type, count: x.count })).slice(0, 3)]].forEach(([title, entries]) => {
      const box = document.createElement("div"); box.className = "summary-list"; const heading = document.createElement("strong"); heading.textContent = title; const text = document.createElement("span"); text.textContent = entries.length ? entries.map((entry) => `${entry.label} (${entry.count})`).join(" / ") : labels.none; box.append(heading, text); summaryListsEl.appendChild(box);
    });
  }

  function renderProAnalysis() {
    const stats = state.lastStats;
    if (!stats) return;
    setText(els.proSummaryPack, `Pro summary pack: rows ${stats.shown}, parsed ${stats.parsedCount}, errors ${stats.errors.length}, sensitive warning types ${stats.sensitive.length}`);
    renderList(els.uaSummary, stats.topUserAgents.map((x) => `${x.label} (${x.count})`));
    renderList(els.botSummary, [`bot-like ${stats.botCounts.bot}`, `browser-like ${stats.botCounts.browser}`, `script/client ${stats.botCounts.script}`, `unknown ${stats.botCounts.unknown}`]);
    renderDetailTable(els.ipDetailTable, stats.ipDetails, "IP", "topPath", state.ipSort);
    renderDetailTable(els.urlDetailTable, stats.urlDetails, "path", "topIP", state.urlSort);
    renderSensitive();
    setText(els.markdownPreview, buildMarkdownReport());
  }

  function renderList(el, values) { if (!el) return; el.innerHTML = values.length ? `<ul>${values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>` : "<p>None</p>"; }
  function renderDetailTable(el, rows, firstLabel, relatedLabel, sortMode) {
    if (!el) return;
    const sorted = [...rows].sort((a, b) => sortMode === "total" ? b.total - a.total || b.errorRate - a.errorRate : b.errorRate - a.errorRate || b.total - a.total);
    el.innerHTML = `<table class="pro-table"><thead><tr><th>${firstLabel}</th><th>total</th><th>2xx</th><th>3xx</th><th>4xx</th><th>5xx</th><th>errorRate</th><th>${relatedLabel}</th></tr></thead><tbody>${sorted.map((r) => `<tr><td>${escapeHtml(r.key)}</td><td>${r.total}</td><td>${r.s2}</td><td>${r.s3}</td><td>${r.s4}</td><td>${r.s5}</td><td>${r.errorRate}%</td><td>${escapeHtml(r[relatedLabel])}</td></tr>`).join("")}</tbody></table>`;
  }
  function renderSensitive() {
    if (!els.sensitiveDetails || !state.lastStats) return;
    const rows = state.lastStats.sensitive;
    els.sensitiveDetails.innerHTML = rows.length ? `<table class="pro-table"><thead><tr><th>type</th><th>count</th><th>lines</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${escapeHtml(r.type)}</td><td>${r.count}</td><td>${escapeHtml(r.lines.join(", "))}</td></tr>`).join("")}</tbody></table>` : `<p>${state.lang === "ja" ? "詳細警告はありません。" : "No detailed warnings."}</p>`;
  }

  function showMessage(message, type = "ok") { if (!messageEl) return; messageEl.textContent = message; messageEl.className = `copy-message ${type}`; if (message) { window.clearTimeout(showMessage.timer); showMessage.timer = window.setTimeout(() => { messageEl.textContent = ""; messageEl.className = "copy-message"; }, 3200); } }
  function setRegexMessage(message, type = "ok") { if (!regexMessageEl) return; regexMessageEl.textContent = message; regexMessageEl.className = `copy-message ${type}`; }

  function validateRegexFilters() {
    if (!regexModeEl?.checked || !isProActive()) return true;
    try { if (includeRegexEl?.value.trim()) new RegExp(includeRegexEl.value.trim()); if (excludeRegexEl?.value.trim()) new RegExp(excludeRegexEl.value.trim()); setRegexMessage(""); return true; }
    catch (error) { setRegexMessage(t("regex_invalid") + error.message, "error"); return false; }
  }

  function formatLogs() {
    if (!inputEl || !outputEl) return;
    if (regexModeEl?.checked && !isProActive()) { regexModeEl.checked = false; setRegexMessage(t("regex_locked"), "error"); }
    const regexOk = validateRegexFilters();
    const filters = getFilters();
    if (!regexOk) filters.regexMode = false;
    const rawLines = (inputEl.value || "").split(/\r?\n/).filter((line) => line.trim());
    const rowsForDisplay = [];
    state.lastVisibleLines = []; state.lastRows = []; state.lastParsedRows = []; state.lastErrorLines = [];
    rawLines.forEach((line, idx) => {
      if (!matchesTextFilters(line, filters)) return;
      const parsed = parseLine(line);
      const row = parsed ? { ...parsed, lineNumber: idx + 1 } : { type: "unparsed", source: "raw", raw: line, parsed: false, lineNumber: idx + 1 };
      if (!matchesStatusFilter(row.parsed ? row : null, filters)) return;
      rowsForDisplay.push(row); state.lastRows.push(row); state.lastVisibleLines.push(line); if (row.parsed) state.lastParsedRows.push(row); if (rowIsError(row)) state.lastErrorLines.push(line);
    });
    const frag = document.createDocumentFragment(); rowsForDisplay.forEach((row) => frag.appendChild(row.parsed ? createParsedLine(row) : createUnparsedLine(row.raw)));
    outputEl.textContent = ""; if (rowsForDisplay.length === 0 && rawLines.length > 0) frag.appendChild(createSystemLine(t("no_match"))); outputEl.appendChild(frag);
    state.lastStats = buildAnalysis(rowsForDisplay, rawLines.length);
    updateOutputMeta(state.lastStats); renderSummary(state.lastStats); updateStatusPresetActive(); renderProAnalysis();
  }

  function updateStatusPresetActive() { const from = (statusFromEl?.value || "").trim(); const to = (statusToEl?.value || "").trim(); const key = `${from}-${to}`; statusPresetButtons.forEach((button) => { const preset = button.dataset.statusPreset; const active = (preset === "all" && from === "" && to === "") || (preset === "2xx" && key === "200-299") || (preset === "3xx" && key === "300-399") || (preset === "4xx" && key === "400-499") || (preset === "5xx" && key === "500-599") || (preset === "errors" && key === "400-599"); button.classList.toggle("active", active); }); }
  function setStatusPreset(preset) { const ranges = { all: ["", ""], "2xx": ["200", "299"], "3xx": ["300", "399"], "4xx": ["400", "499"], "5xx": ["500", "599"], errors: ["400", "599"] }; const range = ranges[preset] || ranges.all; if (statusFromEl) statusFromEl.value = range[0]; if (statusToEl) statusToEl.value = range[1]; formatLogs(); }
  function insertSample() { if (!inputEl) return; const key = sampleSelect?.value || "nginx"; inputEl.value = (SAMPLES[key] || SAMPLES.nginx).join("\n"); formatLogs(); }

  async function copyLines(lines, emptyKey) { if (!lines.length) { showMessage(t(emptyKey), "error"); return; } try { await navigator.clipboard.writeText(lines.join("\n")); showMessage(t("copy_ok"), "ok"); } catch (error) { showMessage(t("copy_fail"), "error"); } }
  async function copyMarkdown() { if (!requirePro()) return; try { await navigator.clipboard.writeText(buildMarkdownReport()); showMessage(t("copy_ok"), "ok"); } catch (error) { showMessage(t("copy_fail"), "error"); } }
  function requirePro() { if (isProActive()) return true; showMessage(t("pro_locked"), "error"); return false; }
  function stamp() { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0"), String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join(""); }
  function downloadFile(name, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); showMessage(t("download_ok"), "ok"); }
  function downloadVisibleTxt() { if (!state.lastVisibleLines.length) { showMessage(t("empty_copy"), "error"); return; } downloadFile(`logformatter-${stamp()}.txt`, state.lastVisibleLines.join("\n"), "text/plain;charset=utf-8"); }

  function csvEscape(value) { const s = String(value ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
  function rowToExport(row) { return { type: row.type, source: row.source, ip: row.ip || "", time: row.time || "", method: row.method || "", path: row.path || "", status: row.status || "", size: row.size || "", referer: row.referer || "", agent: row.agent || "", level: row.level || "", message: row.message || "", raw: row.raw || "", parsed: Boolean(row.parsed) }; }
  function buildCsv(rows) { const cols = ["type", "source", "ip", "time", "method", "path", "status", "size", "referer", "agent", "level", "message", "raw", "parsed"]; return [cols.join(","), ...rows.map((row) => { const out = rowToExport(row); return cols.map((col) => csvEscape(out[col])).join(","); })].join("\n"); }
  function exportCsv(errorsOnly = false) { if (!requirePro()) return; const rows = errorsOnly ? state.lastRows.filter(rowIsError) : state.lastRows; downloadFile(`logformatter-${errorsOnly ? "errors-" : ""}${stamp()}.csv`, buildCsv(rows), "text/csv;charset=utf-8"); }
  function exportJson() { if (!requirePro()) return; const payload = { tool: "log-formatter", version: "0.2", generatedAt: new Date().toISOString(), summary: state.lastStats || {}, rows: state.lastRows.map(rowToExport) }; downloadFile(`logformatter-${stamp()}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8"); }

  function buildMarkdownReport() {
    const stats = state.lastStats || buildAnalysis([], 0);
    const lines = ["# LogFormatter Report", "", "## Summary", `- Total lines: ${stats.total}`, `- Parsed lines: ${stats.parsedCount}`, `- Unparsed lines: ${stats.unparsedCount}`, `- Error rate: ${stats.errorRate}%`, `- 2xx / 3xx / 4xx / 5xx: ${stats.statusBuckets.s2} / ${stats.statusBuckets.s3} / ${stats.statusBuckets.s4} / ${stats.statusBuckets.s5}`, "", "## Top IPs", ...mdEntries(stats.topIps), "", "## Top URLs", ...mdEntries(stats.topUrls), "", "## Top User-Agents", ...mdEntries(stats.topUserAgents), "", "## Bot-like Summary", `- bot-like: ${stats.botCounts.bot}`, `- browser-like: ${stats.botCounts.browser}`, `- script/client: ${stats.botCounts.script}`, `- unknown: ${stats.botCounts.unknown}`, "", "## IP Detail", ...stats.ipDetails.map((r) => `- ${r.key}: total ${r.total}, 2xx ${r.s2}, 3xx ${r.s3}, 4xx ${r.s4}, 5xx ${r.s5}, errorRate ${r.errorRate}%, topPath ${r.topPath}`), "", "## URL Detail", ...stats.urlDetails.map((r) => `- ${r.key}: total ${r.total}, 2xx ${r.s2}, 3xx ${r.s3}, 4xx ${r.s4}, 5xx ${r.s5}, errorRate ${r.errorRate}%, topIP ${r.topIP}`), "", "## Error Lines", ...stats.errors.map((r) => `- line ${r.lineNumber}: ${r.raw}`), "", "## Sensitive String Warning", ...(stats.sensitive.length ? stats.sensitive.map((r) => `- ${r.type}: ${r.count} hit(s), lines ${r.lines.join(", ")}`) : ["- No detailed warnings."]), "", "## Notes", "Logs may contain sensitive information. Review before sharing."];
    return lines.join("\n");
  }
  function mdEntries(entries) { return entries.length ? entries.map((entry) => `- ${entry.label}: ${entry.count}`) : ["- None"]; }

  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch])); }

  const savedLang = localStorage.getItem("nw-logformatter-lang");
  loadInitialTheme();
  applyLang(savedLang === "en" || savedLang === "ja" ? savedLang : "ja");

  langSelect?.addEventListener("change", () => applyLang(langSelect.value));
  els.langJa?.addEventListener("click", () => applyLang("ja"));
  els.langEn?.addEventListener("click", () => applyLang("en"));
  els.darkBtn?.addEventListener("click", () => { document.body.classList.toggle("dark-mode"); localStorage.setItem("nw-logformatter-theme", document.body.classList.contains("dark-mode") ? "dark" : "light"); updateDarkButtonText(); });
  els.btnSample?.addEventListener("click", insertSample);
  els.btnClear?.addEventListener("click", () => { if (!inputEl || !outputEl || !metaEl) return; inputEl.value = ""; outputEl.textContent = ""; metaEl.textContent = ""; summaryGridEl.textContent = ""; summaryListsEl.textContent = ""; state.lastVisibleLines = []; state.lastRows = []; state.lastParsedRows = []; state.lastErrorLines = []; state.lastStats = null; renderProAnalysis(); showMessage("", "ok"); });
  els.btnFormat?.addEventListener("click", formatLogs);
  els.btnCopyVisible?.addEventListener("click", () => copyLines(state.lastVisibleLines, "empty_copy"));
  els.btnCopyErrors?.addEventListener("click", () => copyLines(state.lastErrorLines, "empty_errors"));
  els.btnDownloadTxt?.addEventListener("click", downloadVisibleTxt);
  els.btnDownloadCsv?.addEventListener("click", () => exportCsv(false));
  els.btnDownloadErrorCsv?.addEventListener("click", () => exportCsv(true));
  els.btnDownloadJson?.addEventListener("click", exportJson);
  els.btnCopyMarkdown?.addEventListener("click", copyMarkdown);
  els.btnDownloadMarkdown?.addEventListener("click", () => { if (requirePro()) downloadFile(`logformatter-report-${stamp()}.md`, buildMarkdownReport(), "text/markdown;charset=utf-8"); });
  els.sortIpDetail?.addEventListener("click", () => { state.ipSort = state.ipSort === "error" ? "total" : "error"; renderProAnalysis(); });
  els.sortUrlDetail?.addEventListener("click", () => { state.urlSort = state.urlSort === "error" ? "total" : "error"; renderProAnalysis(); });
  [includeEl, excludeEl, statusFromEl, statusToEl, includeRegexEl, excludeRegexEl].forEach((el) => el?.addEventListener("input", formatLogs));
  regexModeEl?.addEventListener("change", () => { if (regexModeEl.checked && !isProActive()) { regexModeEl.checked = false; setRegexMessage(t("regex_locked"), "error"); } formatLogs(); });
  statusPresetButtons.forEach((button) => button.addEventListener("click", () => setStatusPreset(button.dataset.statusPreset)));
  window.addEventListener("nw-pro-status-change", formatLogs);

  if (inputEl && !inputEl.value.trim()) inputEl.value = SAMPLES.nginx.join("\n");
  formatLogs();
});
