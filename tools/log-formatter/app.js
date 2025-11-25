// 地味ログ整形屋（LogFormatter）
// 完全クライアントサイド実装。ログ送信なし。

(function () {
  var MAX_LINES = 10000; // 大量ログ対策：上限

  var logInput = document.getElementById("logInput");
  var formatSelect = document.getElementById("formatSelect");
  var statusFilter = document.getElementById("statusFilter");
  var textFilter = document.getElementById("textFilter");
  var excludeFilter = document.getElementById("excludeFilter");
  var onlyMatched = document.getElementById("onlyMatched");
  var formatButton = document.getElementById("formatButton");
  var clearButton = document.getElementById("clearButton");
  var sampleButton = document.getElementById("sampleButton");
  var darkModeToggle = document.getElementById("darkModeToggle");
  var logOutput = document.getElementById("logOutput");
  var lineCountEl = document.getElementById("lineCount");
  var matchedCountEl = document.getElementById("matchedCount");

  var langButtons = document.querySelectorAll(".nw-lang-switch .lang-btn");

  // 存在チェック（致命的に欠けてたら何もしない）
  if (!logInput || !formatButton || !clearButton || !logOutput) {
    console.error("LogFormatter: 必要な要素が見つかりません。HTMLを確認してください。");
    return;
  }

  // ================================
  // i18n（日本語 / 英語）
  // ================================

  var translations = {
    ja: {
      title: "地味ログ整形屋（LogFormatter）",
      subtitle:
        "Nginx / Apache / JSON Lines / プレーンテキストの長いログを、ブラウザ内で整形・色分け・フィルタ表示するための実務ツール。",
      notice_nosend:
        "このツールは JavaScript のみで動作し、入力されたログはネットワーク送信されません。機密ログもブラウザ内でのみ処理されます。",
      og_title: "地味ログ整形屋（LogFormatter） - NicheWorks",
      meta_description:
        "Nginx / Apache / JSON Lines などのテキストログをブラウザ内だけで整形・検索するログビューア。ログは送信されません。",
      ad_preparing: "広告枠（準備中）",
      paste_label: "ログをここにペースト：",
      btn_sample: "サンプルログを入れる",
      toggle_dark: "ダークモード",
      ph_sample_line:
        '例: 192.168.0.1 - - [10/Nov/2025:12:34:56 +0900] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"',
      label_format: "ログ形式:",
      format_nginx: "Nginx",
      format_apache: "Apache",
      format_jsonl: "JSON Lines",
      format_plain: "プレーンテキスト",
      label_status: "ステータス:",
      status_all: "すべて",
      status_2xx: "2xx",
      status_3xx: "3xx",
      status_4xx: "4xx",
      status_5xx: "5xx",
      label_include: "含めるキーワード（スペース区切り可）:",
      ph_include: "例: error timeout /api",
      label_exclude: "除外キーワード（スペース区切り可）:",
      ph_exclude: "例: healthcheck metrics",
      label_onlymatched: "条件に合う行のみ表示",
      btn_format: "整形して表示",
      btn_clear: "クリア",
      output_title: "整形結果",
      lines_count: "{n} 行",
      matched_count: " / {n} 行 該当",
      msg_truncated:
        "※ 行数が多いため先頭 {limit} 行のみ表示しています。必要に応じて分割してください。",
      donate_text:
        "このツールが運用やデバッグに役立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      donate_ofuse: "💌 OFUSE",
      donate_kofi: "☕ Ko-fi",
      footer_copyright:
        "© NicheWorks — Small Web Tools for Boring Tasks",
      footer_disclaimer:
        "当サイトには広告が含まれる場合があります。掲載情報および整形結果の正確性は保証しません。必要に応じて原本ログや公式ドキュメントを確認してください。",
      footer_brand_link_text: "nicheworks.pages.dev",
      sr_skip_to_main: "本文へスキップ"
    },
    en: {
      title: "LogFormatter (Boring Log Beautifier)",
      subtitle:
        "A practical tool to format, colorize, and filter long logs (Nginx / Apache / JSON Lines / Plain text) entirely in your browser.",
      notice_nosend:
        "This tool runs purely in JavaScript and never uploads your logs. Everything is processed locally in your browser.",
      og_title: "LogFormatter - NicheWorks",
      meta_description:
        "A browser-only log viewer to format and search Nginx / Apache / JSON Lines logs. Your logs never leave your machine.",
      ad_preparing: "Ad slot (pending)",
      paste_label: "Paste your logs here:",
      btn_sample: "Insert sample logs",
      toggle_dark: "Dark mode",
      ph_sample_line:
        'e.g. 192.168.0.1 - - [10/Nov/2025:12:34:56 +0900] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"',
      label_format: "Log format:",
      format_nginx: "Nginx",
      format_apache: "Apache",
      format_jsonl: "JSON Lines",
      format_plain: "Plain text",
      label_status: "Status:",
      status_all: "All",
      status_2xx: "2xx",
      status_3xx: "3xx",
      status_4xx: "4xx",
      status_5xx: "5xx",
      label_include: "Include keywords (space-separated):",
      ph_include: "e.g. error timeout /api",
      label_exclude: "Exclude keywords (space-separated):",
      ph_exclude: "e.g. healthcheck metrics",
      label_onlymatched: "Show matched lines only",
      btn_format: "Format & show",
      btn_clear: "Clear",
      output_title: "Result",
      lines_count: "{n} lines",
      matched_count: " / {n} matched",
      msg_truncated:
        "* Only the first {limit} lines are shown due to size. Please split your logs if needed.",
      donate_text:
        "If this tool helped your ops or debugging work, please consider supporting future development.",
      donate_ofuse: "💌 OFUSE",
      donate_kofi: "☕ Ko-fi",
      footer_copyright:
        "© NicheWorks — Small Web Tools for Boring Tasks",
      footer_disclaimer:
        "This site may contain ads. We do not guarantee the accuracy of displayed information or formatting results. Always check original logs or official documentation.",
      footer_brand_link_text: "nicheworks.pages.dev",
      sr_skip_to_main: "Skip to main content"
    }
  };

  var currentLang = "ja";

  function t(key, vars) {
    var dict = translations[currentLang] || {};
    var s = dict[key] || "";
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        var val = String(vars[name]);
        s = s.replace(new RegExp("\\{" + name + "\\}", "g"), val);
      });
    }
    return s;
  }

  function applyI18n() {
    // テキスト
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var val = t(key);
      if (val) {
        el.textContent = val;
      }
    }

    // placeholder
    var pnodes = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < pnodes.length; j++) {
      var pel = pnodes[j];
      var pkey = pel.getAttribute("data-i18n-placeholder");
      var pval = t(pkey);
      if (pval) {
        pel.setAttribute("placeholder", pval);
      }
    }

    // head 部分
    var titleEl = document.querySelector("title");
    if (titleEl) {
      titleEl.textContent = t("og_title");
    }
    var metaDesc = document.getElementById("metaDescription");
    if (metaDesc) {
      metaDesc.setAttribute("content", t("meta_description"));
    }
    var ogTitle = document.getElementById("ogTitle");
    if (ogTitle) {
      ogTitle.setAttribute("content", t("og_title"));
    }
    var ogDesc = document.getElementById("ogDesc");
    if (ogDesc) {
      ogDesc.setAttribute("content", t("meta_description"));
    }

    // lang 属性
    document.documentElement.setAttribute("lang", currentLang);

    // 言語ボタンの active 表示
    for (var k = 0; k < langButtons.length; k++) {
      var btn = langButtons[k];
      var lang = btn.getAttribute("data-lang");
      if (lang === currentLang) {
        btn.classList.add("lang-active");
      } else {
        btn.classList.remove("lang-active");
      }
    }

    // カウンタの再描画（初期化）
    updateCounts(0, 0);
  }

  function detectInitialLang() {
    try {
      var saved = localStorage.getItem("logf_lang");
      if (saved === "ja" || saved === "en") {
        return saved;
      }
    } catch (e) {}
    var nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("ja")) return "ja";
    return "en";
  }

  function setLang(lang) {
    if (!translations[lang]) {
      lang = "ja";
    }
    currentLang = lang;
    try {
      localStorage.setItem("logf_lang", lang);
    } catch (e) {}
    applyI18n();
  }

  function initLanguage() {
    var initial = detectInitialLang();
    currentLang = initial;
    applyI18n();

    for (var i = 0; i < langButtons.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var lang = btn.getAttribute("data-lang") || "ja";
          setLang(lang);
        });
      })(langButtons[i]);
    }
  }

  // ================================
  // ステータス判定などのロジック
  // ================================

  // Nginx / Apache ログ用（シンプル版）
  // 例: 127.0.0.1 - - [10/Nov/2025:12:34:56 +0900] "GET / HTTP/1.1" 200 1234
  var nginxRegex =
    /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)]\s+"(\S+)\s+([^"]+?)\s+(\S+)"\s+(\d{3})\s+(\S+)/;

  // Apache Combined もほぼ同じ形として扱う
  var apacheRegex = nginxRegex;

  function classifyStatus(code) {
    var n = parseInt(code, 10);
    if (isNaN(n)) return "";
    if (n >= 200 && n < 300) return "status-2xx";
    if (n >= 300 && n < 400) return "status-3xx";
    if (n >= 400 && n < 500) return "status-4xx";
    if (n >= 500 && n < 600) return "status-5xx";
    return "";
  }

  function matchStatusFilter(code, filter) {
    if (filter === "all") return true;
    var n = parseInt(code, 10);
    if (isNaN(n)) return false;
    if (filter === "2xx") return n >= 200 && n < 300;
    if (filter === "3xx") return n >= 300 && n < 400;
    if (filter === "4xx") return n >= 400 && n < 500;
    if (filter === "5xx") return n >= 500 && n < 600;
    return true;
  }

  function normalize(str) {
    return (str || "").toLowerCase();
  }

  function parseKeywords(input) {
    return (input || "")
      .split(/\s+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s.length > 0;
      });
  }

  function includeByKeywords(textLower, includeKeywords) {
    if (!includeKeywords.length) return true;
    // すべて含む場合のみOK
    for (var i = 0; i < includeKeywords.length; i++) {
      if (textLower.indexOf(includeKeywords[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function excludeByKeywords(textLower, excludeKeywords) {
    if (!excludeKeywords.length) return false;
    // どれか1つでも含んでいたら「除外対象」
    for (var i = 0; i < excludeKeywords.length; i++) {
      if (textLower.indexOf(excludeKeywords[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  function highlightOnce(text, keyword) {
    if (!keyword) return text;
    var lower = text.toLowerCase();
    var key = keyword.toLowerCase();
    var idx = lower.indexOf(key);
    if (idx === -1) return text;
    var before = text.slice(0, idx);
    var match = text.slice(idx, idx + keyword.length);
    var after = text.slice(idx + keyword.length);
    return before + "<mark>" + match + "</mark>" + after;
  }

  function highlightKeywords(text, keywords) {
    if (!keywords.length) return text;
    // 過剰な入れ子を防ぐため、とりあえず先頭1つだけ
    return highlightOnce(text, keywords[0]);
  }

  function renderParsedLine(params) {
    var ip = params.ip;
    var time = params.time;
    var method = params.method;
    var url = params.url;
    var proto = params.proto;
    var status = params.status;
    var size = params.size;
    var rest = params.rest;
    var includeKeywords = params.includeKeywords || [];

    var statusClass = classifyStatus(status);
    var safeUrl = highlightKeywords(url, includeKeywords);

    var html =
      '<span class="ip">' +
      ip +
      "</span> - - " +
      '<span class="timestamp">[' +
      time +
      ']</span> "' +
      '<span class="method">' +
      method +
      "</span> " +
      '<span class="url">' +
      safeUrl +
      "</span> " +
      proto +
      '" ' +
      '<span class="status ' +
      statusClass +
      '">' +
      status +
      "</span> " +
      '<span class="size">' +
      size +
      "</span>";

    if (rest && rest.trim()) {
      html += " " + highlightKeywords(rest, includeKeywords);
    }

    return html;
  }

  function parseJsonLine(line) {
    try {
      var obj = JSON.parse(line);
      var time =
        obj.time ||
        obj.timestamp ||
        obj["@timestamp"] ||
        obj.date ||
        "";
      var level = obj.level || obj.severity || "";
      var msg = obj.msg || obj.message || "";
      var method = obj.method || "";
      var url = obj.url || obj.path || "";
      var status = obj.status || obj.code || "";
      return {
        obj: obj,
        time: time,
        level: level,
        msg: msg,
        method: method,
        url: url,
        status: status,
      };
    } catch (e) {
      return null;
    }
  }

  function updateCounts(total, matched) {
    if (!lineCountEl || !matchedCountEl) return;
    lineCountEl.textContent = t("lines_count", { n: total });
    matchedCountEl.textContent = " " + t("matched_count", { n: matched });
  }

  function formatLogs() {
    var raw = logInput.value || "";
    var lines = raw.replace(/\r\n/g, "\n").split("\n");

    logOutput.innerHTML = "";
    var total = 0;
    var matched = 0;

    if (!raw.trim()) {
      updateCounts(0, 0);
      return;
    }

    var format = (formatSelect && formatSelect.value) || "nginx";
    var statusOpt = statusFilter ? statusFilter.value : "all";
    var includeKeywords = parseKeywords(textFilter ? textFilter.value : "");
    var excludeKeywords = parseKeywords(excludeFilter ? excludeFilter.value : "");

    // 大量ログ対策
    var truncated = false;
    if (lines.length > MAX_LINES) {
      lines = lines.slice(0, MAX_LINES);
      truncated = true;
    }

    if (truncated) {
      var notice = document.createElement("div");
      notice.className = "log-line system";
      notice.textContent = t("msg_truncated", { limit: MAX_LINES });
      logOutput.appendChild(notice);
    }

    for (var i = 0; i < lines.length; i++) {
      var lineRaw = lines[i];
      var line = lineRaw;
      if (!line && !String(line).trim()) continue;
      total++;

      var lower = normalize(line);
      var isMatch = true;
      var rendered = "";
      var statusCode = "";

      if (format === "nginx" || format === "apache") {
        var regex = format === "nginx" ? nginxRegex : apacheRegex;
        var m = line.match(regex);

        if (m) {
          var ip = m[1];
          var time = m[2];
          var method = m[3];
          var url = m[4];
          var proto = m[5];
          statusCode = m[6];
          var size = m[7];

          if (!matchStatusFilter(statusCode, statusOpt)) {
            isMatch = false;
          }
          if (!includeByKeywords(lower, includeKeywords)) {
            isMatch = false;
          }
          if (excludeByKeywords(lower, excludeKeywords)) {
            isMatch = false;
          }

          if (isMatch) {
            matched++;
          }
          if (!isMatch && onlyMatched && onlyMatched.checked) {
            continue;
          }

          var rest = line.slice(m[0].length);
          rendered = renderParsedLine({
            ip: ip,
            time: time,
            method: method,
            url: url,
            proto: proto,
            status: statusCode,
            size: size,
            rest: rest,
            includeKeywords: includeKeywords,
          });
        } else {
          // パースできない行はプレーン扱い
          if (!includeByKeywords(lower, includeKeywords)) {
            isMatch = false;
          }
          if (excludeByKeywords(lower, excludeKeywords)) {
            isMatch = false;
          }
          if (statusOpt !== "all") {
            isMatch = false;
          }

          if (isMatch) {
            matched++;
          }
          if (!isMatch && onlyMatched && onlyMatched.checked) {
            continue;
          }

          rendered = highlightKeywords(line, includeKeywords);
        }
      } else if (format === "jsonl") {
        var parsed = parseJsonLine(line);
        if (parsed) {
          statusCode = String(parsed.status || "");

          if (statusCode && !matchStatusFilter(statusCode, statusOpt)) {
            isMatch = false;
          }
          if (!includeByKeywords(lower, includeKeywords)) {
            isMatch = false;
          }
          if (excludeByKeywords(lower, excludeKeywords)) {
            isMatch = false;
          }

          if (isMatch) {
            matched++;
          }
          if (!isMatch && onlyMatched && onlyMatched.checked) {
            continue;
          }

          var statusClass = classifyStatus(statusCode);
          var html = "";

          if (parsed.time) {
            html += '<span class="timestamp">[' + parsed.time + "]</span> ";
          }
          if (parsed.level) {
            html += '<span class="size">' + parsed.level + "</span> ";
          }
          if (parsed.method) {
            html += '<span class="method">' + parsed.method + "</span> ";
          }
          if (parsed.url) {
            html +=
              '<span class="url">' +
              highlightKeywords(parsed.url, includeKeywords) +
              "</span> ";
          }
          if (statusCode) {
            html +=
              '<span class="status ' +
              statusClass +
              '">' +
              statusCode +
              "</span> ";
          }
          if (parsed.msg) {
            html += highlightKeywords(String(parsed.msg), includeKeywords);
          }

          rendered = html || highlightKeywords(line, includeKeywords);
        } else {
          // JSONでない行は plain
          if (!includeByKeywords(lower, includeKeywords)) {
            isMatch = false;
          }
          if (excludeByKeywords(lower, excludeKeywords)) {
            isMatch = false;
          }
          if (statusOpt !== "all") {
            isMatch = false;
          }

          if (isMatch) {
            matched++;
          }
          if (!isMatch && onlyMatched && onlyMatched.checked) {
            continue;
          }

          rendered = highlightKeywords(line, includeKeywords);
        }
      } else {
        // plain
        if (!includeByKeywords(lower, includeKeywords)) {
          isMatch = false;
        }
        if (excludeByKeywords(lower, excludeKeywords)) {
          isMatch = false;
        }
        if (statusOpt !== "all") {
          isMatch = false;
        }

        if (isMatch) {
          matched++;
        }
        if (!isMatch && onlyMatched && onlyMatched.checked) {
          continue;
        }

        rendered = highlightKeywords(line, includeKeywords);
      }

      var div = document.createElement("div");
      div.className = "log-line" + (!isMatch ? " dim" : "");
      div.innerHTML = rendered;
      logOutput.appendChild(div);
    }

    updateCounts(total, matched);
  }

  function clearAll() {
    logInput.value = "";
    if (textFilter) textFilter.value = "";
    if (excludeFilter) excludeFilter.value = "";
    if (statusFilter) statusFilter.value = "all";
    if (onlyMatched) onlyMatched.checked = false;
    logOutput.innerHTML = "";
    updateCounts(0, 0);
  }

  // サンプルログ投入
  if (sampleButton) {
    sampleButton.addEventListener("click", function () {
      logInput.value = [
        '127.0.0.1 - - [10/Nov/2025:12:34:56 +0900] "GET / HTTP/1.1" 200 1234 "-" "curl/7.79.1"',
        '127.0.0.1 - - [10/Nov/2025:12:35:01 +0900] "GET /admin HTTP/1.1" 403 321 "-" "Mozilla/5.0"',
        '127.0.0.1 - - [10/Nov/2025:12:35:10 +0900] "GET /healthcheck HTTP/1.1" 200 12 "-" "kube-probe/1.24"',
        '192.168.0.10 - - [10/Nov/2025:12:36:00 +0900] "POST /api/login HTTP/1.1" 500 0 "-" "Mozilla/5.0"',
        '{"time":"2025-11-10T03:36:00Z","level":"error","msg":"DB timeout","path":"/api/order","status":504}'
      ].join("\n");

      if (formatSelect) {
        formatSelect.value = "nginx";
      }
      formatLogs();
    });
  }

  // ダークモード適用（ローカルストレージ使用）
  function applyDarkModeFromStorage() {
    var enabled = false;
    try {
      enabled = localStorage.getItem("logf_dark_mode") === "1";
    } catch (e) {
      enabled = false;
    }
    if (enabled) {
      document.body.classList.add("dark-mode");
      if (darkModeToggle) {
        darkModeToggle.checked = true;
      }
    }
  }

  applyDarkModeFromStorage();

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", function () {
      if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        try {
          localStorage.setItem("logf_dark_mode", "1");
        } catch (e) {}
      } else {
        document.body.classList.remove("dark-mode");
        try {
          localStorage.setItem("logf_dark_mode", "0");
        } catch (e) {}
      }
    });
  }

  // ボタンイベント
  formatButton.addEventListener("click", formatLogs);
  clearButton.addEventListener("click", clearAll);

  // 入力のたびに自動反映（重ければあとで外せる）
  var watchTargets = [
    logInput,
    formatSelect,
    statusFilter,
    textFilter,
    excludeFilter,
    onlyMatched,
  ];

  for (var w = 0; w < watchTargets.length; w++) {
    var el = watchTargets[w];
    if (!el) continue;
    el.addEventListener("input", function () {
      if (!logInput.value.trim()) {
        logOutput.innerHTML = "";
        updateCounts(0, 0);
        return;
      }
      formatLogs();
    });
  }

  // 言語初期化
  initLanguage();
})();
