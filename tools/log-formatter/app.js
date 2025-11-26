// ============================
// LogFormatter app.js
// ============================

document.addEventListener("DOMContentLoaded", () => {
  // ============= i18n =============
  const I18N = {
    app_title: {
      ja: "LogFormatter – 地味ログ整形屋",
      en: "LogFormatter – Simple Log Beautifier",
    },
    app_sub: {
      ja: "nginxアクセスログやアプリケーションログなど、長くて読みにくいテキストログをブラウザだけで整形します。",
      en: "Beautify long Nginx / application logs directly in your browser.",
    },
    notice: {
      ja: "ログはすべてブラウザ内で処理され、サーバーには送信されません。",
      en: "All logs are processed locally in your browser and never sent to any server.",
    },
    input_label: {
      ja: "ログを貼り付け",
      en: "Paste your logs",
    },
    btn_sample: {
      ja: "サンプルログ",
      en: "Sample log",
    },
    btn_clear: {
      ja: "クリア",
      en: "Clear",
    },
    btn_format: {
      ja: "整形する",
      en: "Format",
    },
    filter_include: {
      ja: "含めるキーワード",
      en: "Include keyword",
    },
    filter_exclude: {
      ja: "除外キーワード",
      en: "Exclude keyword",
    },
    filter_status_from: {
      ja: "ステータス最小",
      en: "Status min",
    },
    filter_status_to: {
      ja: "ステータス最大",
      en: "Status max",
    },
    lang_label: {
      ja: "表示言語",
      en: "Language",
    },
    output_title: {
      ja: "整形結果",
      en: "Formatted output",
    },
  };

  const langSelect = document.getElementById("langSelect");
  const i18nNodes = document.querySelectorAll("[data-i18n]");

  function applyLang(lang) {
    i18nNodes.forEach((el) => {
      const key = el.dataset.i18n;
      const dict = I18N[key];
      if (!dict) return;
      el.textContent = dict[lang] || dict.ja;
    });
    document.documentElement.lang = lang;
    localStorage.setItem("nw-logformatter-lang", lang);
  }

  // 言語初期化
  (() => {
    if (!langSelect) return;
    const saved = localStorage.getItem("nw-logformatter-lang");
    const lang = saved === "en" || saved === "ja" ? saved : "ja";
    langSelect.value = lang;
    applyLang(lang);
  })();

  if (langSelect) {
    langSelect.addEventListener("change", () => {
      applyLang(langSelect.value);
    });
  }

  // ============= ダークモード（ボタンで ON/OFF） =============
  const darkBtn = document.getElementById("darkToggleBtn");

  function updateDarkButtonText() {
    if (!darkBtn) return;
    const isDark = document.body.classList.contains("dark-mode");
    darkBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  }

  function loadInitialTheme() {
    const saved = localStorage.getItem("nw-logformatter-theme");
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    updateDarkButtonText();
  }

  loadInitialTheme();

  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("nw-logformatter-theme", isDark ? "dark" : "light");
      updateDarkButtonText();
    });
  }

  // ============= ログ整形 & フィルタ =============
  const inputEl = document.getElementById("logInput");
  const outputEl = document.getElementById("logOutput");
  const metaEl = document.getElementById("outputMeta");

  const includeEl = document.getElementById("filterInclude");
  const excludeEl = document.getElementById("filterExclude");
  const statusFromEl = document.getElementById("statusFrom");
  const statusToEl = document.getElementById("statusTo");

  const btnSample = document.getElementById("btnSample");
  const btnClear = document.getElementById("btnClear");
  const btnFormat = document.getElementById("btnFormat");

  function getSampleLog() {
    return [
      '192.168.0.1 - - [10/Nov/2025:10:10:10 +0900] "GET / HTTP/1.1" 200 123 "-" "curl/7.79.1"',
      '203.0.113.12 - - [10/Nov/2025:10:10:11 +0900] "GET /healthcheck HTTP/1.1" 200 45 "-" "kube-probe/1.22"',
      '203.0.113.12 - - [10/Nov/2025:10:10:12 +0900] "POST /api/login HTTP/1.1" 302 0 "-" "Mozilla/5.0"',
      '203.0.113.21 - - [10/Nov/2025:10:10:15 +0900] "GET /admin HTTP/1.1" 403 321 "-" "Mozilla/5.0"',
      '198.51.100.9 - - [10/Nov/2025:10:10:20 +0900] "GET /index.html HTTP/1.1" 500 0 "-" "Mozilla/5.0"',
    ].join("\n");
  }

  function parseNginx(line) {
    const regex =
      /^(\S+) (\S+) (\S+) \[([^\]]+)] "([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"$/;
    const m = line.match(regex);
    if (!m) return null;

    const ip = m[1];
    const time = m[4];
    const req = m[5];
    const status = parseInt(m[6], 10);
    const size = m[7];
    const referer = m[8];
    const agent = m[9];

    let method = "";
    let path = "";
    let proto = "";

    const rm = req.match(/^(\S+)\s+(\S+)(?:\s+(\S+))?/);
    if (rm) {
      method = rm[1];
      path = rm[2];
      proto = rm[3] || "";
    } else {
      path = req;
    }

    return { ip, time, method, path, proto, status, size, referer, agent };
  }

  function formatLogs() {
    if (!inputEl || !outputEl || !metaEl) return;

    const lines = (inputEl.value || "").split(/\r?\n/);

    const include = (includeEl?.value || "").trim();
    const exclude = (excludeEl?.value || "").trim();
    const statusFrom = parseInt(statusFromEl?.value || "", 10);
    const statusTo = parseInt(statusToEl?.value || "", 10);

    const frag = document.createDocumentFragment();
    let total = 0;
    let shown = 0;
    let parsedCount = 0;

    lines.forEach((line) => {
      if (!line.trim()) return;
      total++;

      if (include && !line.includes(include)) return;
      if (exclude && line.includes(exclude)) return;

      const parsed = parseNginx(line);

      if (!parsed) {
        const div = document.createElement("div");
        div.className = "log-line dim";
        div.textContent = line;
        frag.appendChild(div);
        shown++;
        return;
      }

      if (!Number.isNaN(statusFrom) && parsed.status < statusFrom) return;
      if (!Number.isNaN(statusTo) && parsed.status > statusTo) return;

      parsedCount++;

      let statusClass = "status-2xx";
      if (parsed.status >= 500) statusClass = "status-5xx";
      else if (parsed.status >= 400) statusClass = "status-4xx";
      else if (parsed.status >= 300) statusClass = "status-3xx";

      const div = document.createElement("div");
      div.className = "log-line";
      div.innerHTML =
        `<span class="ip">${parsed.ip}</span> ` +
        `- - ` +
        `<span class="timestamp">[${parsed.time}]</span> ` +
        `" <span class="method">${parsed.method}</span> ` +
        `<span class="url">${parsed.path}</span> ${parsed.proto}" ` +
        `<span class="status ${statusClass}">${parsed.status}</span> ` +
        `<span class="size">${parsed.size}</span> ` +
        `"${parsed.referer}" "${parsed.agent}"`;

      frag.appendChild(div);
      shown++;
    });

    outputEl.innerHTML = "";
    if (shown === 0 && total > 0) {
      const div = document.createElement("div");
      div.className = "log-line system";
      div.textContent = "No lines matched the current filters.";
      frag.appendChild(div);
    }
    outputEl.appendChild(frag);

    if (total === 0) {
      metaEl.textContent = "";
    } else {
      metaEl.textContent = `${shown}/${total} lines shown, ${parsedCount} parsed.`;
    }
  }

  // ボタンイベント
  if (btnSample) {
    btnSample.addEventListener("click", () => {
      if (!inputEl) return;
      inputEl.value = getSampleLog();
      formatLogs();
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (!inputEl || !outputEl || !metaEl) return;
      inputEl.value = "";
      outputEl.textContent = "";
      metaEl.textContent = "";
    });
  }

  if (btnFormat) {
    btnFormat.addEventListener("click", () => {
      formatLogs();
    });
  }

  // 初期表示：サンプルログ＋整形
  if (inputEl && !inputEl.value.trim()) {
    inputEl.value = getSampleLog();
    formatLogs();
  }
});
