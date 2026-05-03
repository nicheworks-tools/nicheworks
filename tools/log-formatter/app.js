// ============================
// LogFormatter app.js
// ============================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const I18N = {
    app_title: { ja: "LogFormatter – 地味ログ整形屋", en: "LogFormatter – Simple Log Beautifier" },
    app_sub: {
      ja: "Nginxアクセスログやアプリケーションログなど、長くて読みにくいテキストログをブラウザだけで整形します。",
      en: "Format long Nginx and application logs directly in your browser.",
    },
    notice: {
      ja: "ログはすべてブラウザ内で処理され、サーバーには送信されません。",
      en: "All logs are processed locally in your browser and never sent to any server.",
    },
    intro_title: { ja: "このツールでできること", en: "What this tool does" },
    intro_body: {
      ja: "Nginxアクセスログなどのテキストログを貼り付けると、ステータスコードやURLを見やすく色分けします。キーワード、除外語、ステータス範囲で絞り込みできます。",
      en: "Paste Nginx access logs or plain text logs to highlight status codes, URLs, and key fields. You can filter by keywords, exclusions, and status ranges.",
    },
    intro_privacy: {
      ja: "ログはブラウザ内で処理されます。IP、Cookie、Authorizationヘッダー、メールアドレス、トークンなどを共有・保存する前に必ず確認してください。",
      en: "Logs are processed in your browser. Before sharing or saving, check for IP addresses, cookies, Authorization headers, emails, tokens, and other sensitive data.",
    },
    intro_mobile: {
      ja: "大量ログの確認はPC表示を推奨します。スマホでは短いログの確認・コピー用途に向いています。",
      en: "For large logs, desktop view is recommended. Mobile is best for short checks and quick copy/export tasks.",
    },
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
    empty_copy: { ja: "コピーできる表示中のログがありません。", en: "There are no visible log lines to copy." },
    empty_errors: { ja: "コピーできる4xx/5xxログがありません。", en: "There are no 4xx/5xx lines to copy." },
    copy_ok: { ja: "コピーしました。", en: "Copied." },
    copy_fail: { ja: "コピーに失敗しました。ブラウザの権限を確認してください。", en: "Copy failed. Check your browser permissions." },
    download_ok: { ja: "TXTを保存しました。", en: "TXT downloaded." },
    no_match: { ja: "現在のフィルタに一致する行はありません。", en: "No lines matched the current filters." },
    unparsed_badge: { ja: "未解析", en: "UNPARSED" },
    unparsed_reason: {
      ja: "Nginx combined形式として解析できませんでした。対応形式外、または形式が崩れている可能性があります。フィルタ・コピー対象には含まれます。",
      en: "This line could not be parsed as Nginx combined format. It may be unsupported or malformed. It is still included in filters and copy/export output.",
    },
  };

  const state = {
    lang: "ja",
    lastVisibleLines: [],
    lastParsedRows: [],
    lastErrorLines: [],
    lastStats: null,
  };

  const $ = (id) => document.getElementById(id);

  const langSelect = $("langSelect");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const langJaBtn = $("langJa");
  const langEnBtn = $("langEn");

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
  const sampleSelect = $("sampleSelect");

  const btnSample = $("btnSample");
  const btnClear = $("btnClear");
  const btnFormat = $("btnFormat");
  const btnCopyVisible = $("btnCopyVisible");
  const btnCopyErrors = $("btnCopyErrors");
  const btnDownloadTxt = $("btnDownloadTxt");
  const darkBtn = $("darkToggleBtn");
  const statusPresetButtons = Array.from(document.querySelectorAll("[data-status-preset]"));

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
      '203.0.113.55 - - [10/Nov/2025:11:01:05 +0900] "GET /admin HTTP/1.1" 403 256 "-" "bot/1.0"',
      '192.0.2.44 - - [10/Nov/2025:11:01:09 +0900] "GET /api/orders HTTP/1.1" 502 0 "-" "Mozilla/5.0"',
      '192.0.2.45 - - [10/Nov/2025:11:01:12 +0900] "GET /api/orders HTTP/1.1" 504 0 "-" "Mozilla/5.0"',
    ],
    api: [
      '10.0.0.10 - - [10/Nov/2025:12:00:01 +0900] "GET /api/v1/users HTTP/1.1" 200 870 "-" "axios/1.7"',
      '10.0.0.11 - - [10/Nov/2025:12:00:02 +0900] "POST /api/v1/sessions HTTP/1.1" 201 240 "-" "PostmanRuntime/7.39"',
      '10.0.0.10 - - [10/Nov/2025:12:00:04 +0900] "GET /api/v1/users?page=2 HTTP/1.1" 200 920 "-" "axios/1.7"',
      '10.0.0.12 - - [10/Nov/2025:12:00:07 +0900] "PATCH /api/v1/profile HTTP/1.1" 422 180 "-" "Mozilla/5.0"',
      '10.0.0.13 - - [10/Nov/2025:12:00:10 +0900] "DELETE /api/v1/items/99 HTTP/1.1" 500 0 "-" "internal-client/0.1"',
    ],
    mixed: [
      '192.168.0.1 - - [10/Nov/2025:10:10:10 +0900] "GET / HTTP/1.1" 200 123 "-" "curl/7.79.1"',
      'INFO 2025-11-10T10:10:11Z worker started job=nightly-sync',
      '{"level":"warn","message":"retrying upstream","status":503}',
      '203.0.113.21 - - [10/Nov/2025:10:10:15 +0900] "GET /admin HTTP/1.1" 403 321 "-" "Mozilla/5.0"',
      'WARN malformed upstream response from payment gateway',
      '198.51.100.9 - - [10/Nov/2025:10:10:20 +0900] "GET /index.html HTTP/1.1" 500 0 "-" "Mozilla/5.0"',
    ],
  };

  function t(key) {
    return (I18N[key] && (I18N[key][state.lang] || I18N[key].ja)) || key;
  }

  function applyLang(lang) {
    state.lang = lang === "en" ? "en" : "ja";
    i18nNodes.forEach((el) => {
      const key = el.dataset.i18n;
      const dict = I18N[key];
      if (!dict) return;
      el.textContent = dict[state.lang] || dict.ja;
    });
    document.documentElement.lang = state.lang;
    if (langSelect) langSelect.value = state.lang;
    if (langJaBtn) langJaBtn.classList.toggle("active", state.lang === "ja");
    if (langEnBtn) langEnBtn.classList.toggle("active", state.lang === "en");
    if (inputEl) {
      inputEl.placeholder = state.lang === "ja"
        ? "Nginxアクセスログなどをそのまま貼り付けてください。"
        : "Paste Nginx access logs or plain text logs here.";
    }
    localStorage.setItem("nw-logformatter-lang", state.lang);
    renderSummary(state.lastStats);
    updateOutputMeta(state.lastStats);
  }

  function updateDarkButtonText() {
    if (!darkBtn) return;
    const isDark = document.body.classList.contains("dark-mode");
    darkBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  }

  function loadInitialTheme() {
    const saved = localStorage.getItem("nw-logformatter-theme");
    document.body.classList.toggle("dark-mode", saved === "dark");
    updateDarkButtonText();
  }

  function parseNginx(line) {
    const regex = /^(\S+) (\S+) (\S+) \[([^\]]+)] "([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"$/;
    const m = line.match(regex);
    if (!m) return null;

    const req = m[5];
    const rm = req.match(/^(\S+)\s+(\S+)(?:\s+(\S+))?/);

    return {
      raw: line,
      ip: m[1],
      ident: m[2],
      user: m[3],
      time: m[4],
      request: req,
      method: rm ? rm[1] : "",
      path: rm ? rm[2] : req,
      proto: rm ? rm[3] || "" : "",
      status: parseInt(m[6], 10),
      size: m[7],
      referer: m[8],
      agent: m[9],
    };
  }

  function getStatusClass(status) {
    if (status >= 500) return "status-5xx";
    if (status >= 400) return "status-4xx";
    if (status >= 300) return "status-3xx";
    return "status-2xx";
  }

  function increment(map, key) {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  }

  function topEntries(map, limit = 3) {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([label, count]) => ({ label, count }));
  }

  function getFilters() {
    const fromRaw = (statusFromEl?.value || "").trim();
    const toRaw = (statusToEl?.value || "").trim();
    const statusFrom = fromRaw === "" ? null : parseInt(fromRaw, 10);
    const statusTo = toRaw === "" ? null : parseInt(toRaw, 10);
    return {
      include: (includeEl?.value || "").trim(),
      exclude: (excludeEl?.value || "").trim(),
      statusFrom: Number.isNaN(statusFrom) ? null : statusFrom,
      statusTo: Number.isNaN(statusTo) ? null : statusTo,
    };
  }

  function matchesTextFilters(line, filters) {
    if (filters.include && !line.includes(filters.include)) return false;
    if (filters.exclude && line.includes(filters.exclude)) return false;
    return true;
  }

  function matchesStatusFilter(parsed, filters) {
    if (!parsed) return filters.statusFrom === null && filters.statusTo === null;
    if (filters.statusFrom !== null && parsed.status < filters.statusFrom) return false;
    if (filters.statusTo !== null && parsed.status > filters.statusTo) return false;
    return true;
  }

  function appendText(parent, className, text) {
    const span = document.createElement("span");
    if (className) span.className = className;
    span.textContent = text;
    parent.appendChild(span);
    return span;
  }

  function createParsedLine(row) {
    const div = document.createElement("div");
    div.className = "log-line";

    appendText(div, "ip", row.ip);
    appendText(div, null, ` ${row.ident} ${row.user} `);
    appendText(div, "timestamp", `[${row.time}]`);
    appendText(div, null, " \"");
    appendText(div, "method", row.method);
    appendText(div, null, " ");
    appendText(div, "url", row.path);
    appendText(div, null, row.proto ? ` ${row.proto}\" ` : "\" ");
    appendText(div, `status ${getStatusClass(row.status)}`, String(row.status));
    appendText(div, null, " ");
    appendText(div, "size", row.size);
    appendText(div, null, ` \"${row.referer}\" \"${row.agent}\"`);

    return div;
  }

  function createUnparsedLine(raw) {
    const div = document.createElement("div");
    div.className = "log-line unparsed";
    div.title = t("unparsed_reason");

    const badge = document.createElement("span");
    badge.className = "badge-unparsed";
    badge.textContent = t("unparsed_badge");
    div.appendChild(badge);

    appendText(div, null, " ");
    appendText(div, "unparsed-text", raw);
    return div;
  }

  function createSystemLine(message) {
    const div = document.createElement("div");
    div.className = "log-line system";
    div.textContent = message;
    return div;
  }

  function updateOutputMeta(stats) {
    if (!metaEl) return;
    if (!stats || stats.total === 0) {
      metaEl.textContent = "";
      return;
    }
    metaEl.textContent = state.lang === "ja"
      ? `${stats.shown}/${stats.total} 行表示、解析成功 ${stats.parsedCount} 行、未解析 ${stats.unparsedCount} 行`
      : `${stats.shown}/${stats.total} shown, ${stats.parsedCount} parsed, ${stats.unparsedCount} unparsed`;
  }

  function renderSummary(stats) {
    if (!summaryGridEl || !summaryListsEl) return;
    summaryGridEl.textContent = "";
    summaryListsEl.textContent = "";

    if (!stats || stats.total === 0) return;

    const labels = state.lang === "ja"
      ? {
          total: "総行数", shown: "表示中", parsed: "解析成功", unparsed: "未解析",
          s2: "2xx", s3: "3xx", s4: "4xx", s5: "5xx", errorRate: "エラー率",
          topIp: "上位IP", topUrl: "上位URL", none: "なし",
        }
      : {
          total: "Total", shown: "Shown", parsed: "Parsed", unparsed: "Unparsed",
          s2: "2xx", s3: "3xx", s4: "4xx", s5: "5xx", errorRate: "Error rate",
          topIp: "Top IPs", topUrl: "Top URLs", none: "None",
        };

    const items = [
      [labels.total, stats.total],
      [labels.shown, stats.shown],
      [labels.parsed, stats.parsedCount],
      [labels.unparsed, stats.unparsedCount],
      [labels.s2, stats.statusBuckets.s2],
      [labels.s3, stats.statusBuckets.s3],
      [labels.s4, stats.statusBuckets.s4],
      [labels.s5, stats.statusBuckets.s5],
      [labels.errorRate, `${stats.errorRate}%`],
    ];

    items.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      const small = document.createElement("span");
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = String(value);
      item.appendChild(small);
      item.appendChild(strong);
      summaryGridEl.appendChild(item);
    });

    const lists = [
      [labels.topIp, stats.topIps],
      [labels.topUrl, stats.topUrls],
    ];

    lists.forEach(([title, entries]) => {
      const box = document.createElement("div");
      box.className = "summary-list";
      const heading = document.createElement("strong");
      heading.textContent = title;
      box.appendChild(heading);
      const text = document.createElement("span");
      text.textContent = entries.length
        ? entries.map((entry) => `${entry.label} (${entry.count})`).join(" / ")
        : labels.none;
      box.appendChild(text);
      summaryListsEl.appendChild(box);
    });
  }

  function showMessage(message, type = "ok") {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.className = `copy-message ${type}`;
    if (message) {
      window.clearTimeout(showMessage.timer);
      showMessage.timer = window.setTimeout(() => {
        messageEl.textContent = "";
        messageEl.className = "copy-message";
      }, 3200);
    }
  }

  function updateStatusPresetActive() {
    const from = (statusFromEl?.value || "").trim();
    const to = (statusToEl?.value || "").trim();
    const key = `${from}-${to}`;
    statusPresetButtons.forEach((button) => {
      const preset = button.dataset.statusPreset;
      const active =
        (preset === "all" && from === "" && to === "") ||
        (preset === "2xx" && key === "200-299") ||
        (preset === "3xx" && key === "300-399") ||
        (preset === "4xx" && key === "400-499") ||
        (preset === "5xx" && key === "500-599") ||
        (preset === "errors" && key === "400-599");
      button.classList.toggle("active", active);
    });
  }

  function formatLogs() {
    if (!inputEl || !outputEl) return;

    const filters = getFilters();
    const rawLines = (inputEl.value || "").split(/\r?\n/).filter((line) => line.trim());
    const ipCounts = new Map();
    const urlCounts = new Map();
    const statusBuckets = { s2: 0, s3: 0, s4: 0, s5: 0 };
    const rowsForDisplay = [];

    let parsedCount = 0;
    let unparsedCount = 0;
    let textFilteredTotal = 0;

    state.lastVisibleLines = [];
    state.lastParsedRows = [];
    state.lastErrorLines = [];

    rawLines.forEach((line) => {
      if (!matchesTextFilters(line, filters)) return;
      textFilteredTotal += 1;

      const parsed = parseNginx(line);
      if (parsed) {
        parsedCount += 1;
        state.lastParsedRows.push(parsed);
        increment(ipCounts, parsed.ip);
        increment(urlCounts, parsed.path);

        if (parsed.status >= 500) statusBuckets.s5 += 1;
        else if (parsed.status >= 400) statusBuckets.s4 += 1;
        else if (parsed.status >= 300) statusBuckets.s3 += 1;
        else if (parsed.status >= 200) statusBuckets.s2 += 1;
      } else {
        unparsedCount += 1;
      }

      if (!matchesStatusFilter(parsed, filters)) return;
      rowsForDisplay.push({ raw: line, parsed });
      state.lastVisibleLines.push(line);
      if (parsed && parsed.status >= 400) state.lastErrorLines.push(line);
    });

    const frag = document.createDocumentFragment();
    rowsForDisplay.forEach((row) => {
      frag.appendChild(row.parsed ? createParsedLine(row.parsed) : createUnparsedLine(row.raw));
    });

    outputEl.textContent = "";
    if (rowsForDisplay.length === 0 && rawLines.length > 0) {
      frag.appendChild(createSystemLine(t("no_match")));
    }
    outputEl.appendChild(frag);

    const errorCount = statusBuckets.s4 + statusBuckets.s5;
    const errorRate = parsedCount > 0 ? Math.round((errorCount / parsedCount) * 1000) / 10 : 0;

    state.lastStats = {
      total: rawLines.length,
      textFilteredTotal,
      shown: rowsForDisplay.length,
      parsedCount,
      unparsedCount,
      statusBuckets,
      errorRate,
      topIps: topEntries(ipCounts),
      topUrls: topEntries(urlCounts),
    };

    updateOutputMeta(state.lastStats);
    renderSummary(state.lastStats);
    updateStatusPresetActive();
  }

  async function copyLines(lines, emptyKey) {
    if (!lines.length) {
      showMessage(t(emptyKey), "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showMessage(t("copy_ok"), "ok");
    } catch (error) {
      showMessage(t("copy_fail"), "error");
    }
  }

  function downloadVisibleTxt() {
    if (!state.lastVisibleLines.length) {
      showMessage(t("empty_copy"), "error");
      return;
    }
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
    ].join("");
    const blob = new Blob([state.lastVisibleLines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logformatter-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMessage(t("download_ok"), "ok");
  }

  function setStatusPreset(preset) {
    const ranges = {
      all: ["", ""],
      "2xx": ["200", "299"],
      "3xx": ["300", "399"],
      "4xx": ["400", "499"],
      "5xx": ["500", "599"],
      errors: ["400", "599"],
    };
    const range = ranges[preset] || ranges.all;
    if (statusFromEl) statusFromEl.value = range[0];
    if (statusToEl) statusToEl.value = range[1];
    formatLogs();
  }

  function insertSample() {
    if (!inputEl) return;
    const key = sampleSelect?.value || "nginx";
    inputEl.value = (SAMPLES[key] || SAMPLES.nginx).join("\n");
    formatLogs();
  }

  const savedLang = localStorage.getItem("nw-logformatter-lang");
  const initialLang = savedLang === "en" || savedLang === "ja" ? savedLang : "ja";
  applyLang(initialLang);
  loadInitialTheme();

  if (langSelect) langSelect.addEventListener("change", () => applyLang(langSelect.value));
  if (langJaBtn) langJaBtn.addEventListener("click", () => applyLang("ja"));
  if (langEnBtn) langEnBtn.addEventListener("click", () => applyLang("en"));

  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("nw-logformatter-theme", isDark ? "dark" : "light");
      updateDarkButtonText();
    });
  }

  if (btnSample) btnSample.addEventListener("click", insertSample);
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (!inputEl || !outputEl || !metaEl) return;
      inputEl.value = "";
      outputEl.textContent = "";
      metaEl.textContent = "";
      if (summaryGridEl) summaryGridEl.textContent = "";
      if (summaryListsEl) summaryListsEl.textContent = "";
      state.lastVisibleLines = [];
      state.lastParsedRows = [];
      state.lastErrorLines = [];
      state.lastStats = null;
      showMessage("", "ok");
    });
  }
  if (btnFormat) btnFormat.addEventListener("click", formatLogs);
  if (btnCopyVisible) btnCopyVisible.addEventListener("click", () => copyLines(state.lastVisibleLines, "empty_copy"));
  if (btnCopyErrors) btnCopyErrors.addEventListener("click", () => copyLines(state.lastErrorLines, "empty_errors"));
  if (btnDownloadTxt) btnDownloadTxt.addEventListener("click", downloadVisibleTxt);

  [includeEl, excludeEl, statusFromEl, statusToEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", formatLogs);
  });

  statusPresetButtons.forEach((button) => {
    button.addEventListener("click", () => setStatusPreset(button.dataset.statusPreset));
  });

  if (inputEl && !inputEl.value.trim()) {
    inputEl.value = SAMPLES.nginx.join("\n");
  }
  formatLogs();
});
