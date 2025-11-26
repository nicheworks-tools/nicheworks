// ==============================
// i18n データ
// ==============================

const I18N = {
  app_title: {
    ja: "LogFormatter – 地味ログ整形屋",
    en: "LogFormatter – Simple Log Beautifier",
  },
  app_sub: {
    ja: "nginx / アプリログなどの長いテキストログを、ブラウザだけで読みやすく整形するツールです。",
    en: "Paste long Nginx / app logs and instantly reformat them in your browser. No upload, no tracking.",
  },
  toggle_dark: {
    ja: "ダークモード",
    en: "Dark mode",
  },
  panel_input: {
    ja: "ログ入力",
    en: "Log input",
  },
  panel_input_desc: {
    ja: "nginx アクセスログやアプリケーションログをそのまま貼り付けてください。すべてブラウザ内で処理され、サーバーには送信されません。",
    en: "Paste your Nginx access logs or application logs here. Everything is processed locally in your browser and never sent to any server.",
  },
  btn_sample: {
    ja: "サンプルログを入れる",
    en: "Insert sample log",
  },
  btn_clear: {
    ja: "クリア",
    en: "Clear",
  },
  btn_format: {
    ja: "整形する",
    en: "Format logs",
  },
  filters_title: {
    ja: "簡易フィルタ",
    en: "Quick filters",
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
    ja: "ステータスコード（最小）",
    en: "Status code (min)",
  },
  filter_status_to: {
    ja: "ステータスコード（最大）",
    en: "Status code (max)",
  },
  filters_note: {
    ja: "例）「含める」に GET、「除外」に healthcheck など。",
    en: "Example: Include = GET, Exclude = healthcheck.",
  },
  panel_output: {
    ja: "整形結果",
    en: "Formatted output",
  },
  panel_output_desc: {
    ja: "行ごとにパースできたログは色分けされます。うまく判定できなかった行はそのまま表示します。",
    en: "Parsed lines are colorized. Lines that can't be parsed are shown as-is.",
  },
};

// ==============================
// 言語切り替え
// ==============================

const langSelect = document.getElementById("langSelect");
const elementsWithI18n = document.querySelectorAll("[data-i18n]");

function applyLang(lang) {
  elementsWithI18n.forEach((el) => {
    const key = el.dataset.i18n;
    const dict = I18N[key];
    if (!dict) return;
    el.textContent = dict[lang] || dict.ja;
  });
  document.documentElement.lang = lang;
  localStorage.setItem("nw-logformatter-lang", lang);
}

(function initLang() {
  const saved = localStorage.getItem("nw-logformatter-lang");
  const initial = saved === "en" || saved === "ja" ? saved : "ja";
  langSelect.value = initial;
  applyLang(initial);
})();

langSelect.addEventListener("change", () => {
  applyLang(langSelect.value);
});

// ==============================
// ダークモード
// ==============================

const darkToggle = document.getElementById("darkModeToggle");

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  darkToggle.checked = theme === "dark";
  localStorage.setItem("nw-logformatter-theme", theme);
}

(function initTheme() {
  const saved = localStorage.getItem("nw-logformatter-theme");
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else {
    applyTheme("light");
  }
})();

darkToggle.addEventListener("change", () => {
  const theme = darkToggle.checked ? "dark" : "light";
  applyTheme(theme);
});

// ==============================
// ログ整形ロジック
// ==============================

const inputEl = document.getElementById("logInput");
const outputEl = document.getElementById("logOutput");
const summaryEl = document.getElementById("outputSummary");

const filterIncludeEl = document.getElementById("filterInclude");
const filterExcludeEl = document.getElementById("filterExclude");
const statusFromEl = document.getElementById("statusFrom");
const statusToEl = document.getElementById("statusTo");

document.getElementById("btnSample").addEventListener("click", () => {
  inputEl.value = getSampleLog();
});

document.getElementById("btnClear").addEventListener("click", () => {
  inputEl.value = "";
  outputEl.innerHTML = "";
  summaryEl.textContent = "";
});

document.getElementById("btnFormat").addEventListener("click", () => {
  formatLogs();
});

function getSampleLog() {
  return [
    '192.168.0.1 - - [10/Nov/2025:10:10:10 +0900] "GET / HTTP/1.1" 200 123 "-" "curl/7.79.1"',
    '203.0.113.12 - - [10/Nov/2025:10:10:11 +0900] "GET /healthcheck HTTP/1.1" 200 45 "-" "kube-probe/1.22"',
    '203.0.113.12 - - [10/Nov/2025:10:10:12 +0900] "POST /api/login HTTP/1.1" 302 0 "-" "Mozilla/5.0"',
    '203.0.113.21 - - [10/Nov/2025:10:10:15 +0900] "GET /admin HTTP/1.1" 403 321 "-" "Mozilla/5.0"',
    '198.51.100.9 - - [10/Nov/2025:10:10:20 +0900] "GET /index.html HTTP/1.1" 500 0 "-" "Mozilla/5.0"',
  ].join("\n");
}

function formatLogs() {
  const raw = inputEl.value || "";
  const lines = raw.split(/\r?\n/);

  const includeStr = filterIncludeEl.value.trim();
  const excludeStr = filterExcludeEl.value.trim();
  const statusFrom = parseInt(statusFromEl.value, 10);
  const statusTo = parseInt(statusToEl.value, 10);

  let parsedCount = 0;
  let totalCount = 0;

  const frag = document.createDocumentFragment();

  lines.forEach((line) => {
    if (!line.trim()) return;
    totalCount++;

    if (includeStr && !line.includes(includeStr)) {
      return;
    }

    if (excludeStr && line.includes(excludeStr)) {
      return;
    }

    const parsed = parseNginx(line);
    const div = document.createElement("div");
    div.className = "log-line";

    if (!parsed) {
      // パースできない行
      div.textContent = line;
      frag.appendChild(div);
      return;
    }

    // ステータスフィルタ
    if (!Number.isNaN(statusFrom) && parsed.status < statusFrom) return;
    if (!Number.isNaN(statusTo) && parsed.status > statusTo) return;

    parsedCount++;

    const statusClass =
      parsed.status >= 500
        ? "status-5xx"
        : parsed.status >= 400
        ? "status-4xx"
        : parsed.status >= 300
        ? "status-3xx"
        : "status-2xx";

    div.innerHTML =
      `<span class="log-ip">${parsed.ip}</span> ` +
      `- - ` +
      `<span class="log-time">[${parsed.time}]</span> ` +
      `" <span class="log-method">${parsed.method}</span> ` +
      `<span class="log-path">${parsed.path}</span> ${parsed.proto}" ` +
      `<span class="log-status ${statusClass}">${parsed.status}</span> ` +
      `<span class="log-size">${parsed.size}</span> ` +
      `" <span class="log-referer">${parsed.referer}</span> "` +
      `<span class="log-agent">${parsed.agent}</span>`;

    frag.appendChild(div);
  });

  outputEl.innerHTML = "";
  outputEl.appendChild(frag);

  summaryEl.textContent =
    totalCount === 0
      ? ""
      : `${parsedCount} / ${totalCount} lines parsed (after filters).`;
}

function parseNginx(line) {
  // かなり単純化した Nginx combined log 形式
  const regex =
    /^(\S+) (\S+) (\S+) \[([^\]]+)] "([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"$/;
  const m = line.match(regex);
  if (!m) return null;

  const ip = m[1];
  const time = m[4];
  const request = m[5];
  const status = parseInt(m[6], 10);
  const size = m[7];
  const referer = m[8];
  const agent = m[9];

  let method = "";
  let path = "";
  let proto = "";

  const reqMatch = request.match(/^(\S+)\s+(\S+)(?:\s+(\S+))?/);
  if (reqMatch) {
    method = reqMatch[1];
    path = reqMatch[2];
    proto = reqMatch[3] || "";
  } else {
    path = request;
  }

  return { ip, time, request, status, size, referer, agent, method, path, proto };
}

// 初期状態でサンプルログを入れておく
if (!inputEl.value.trim()) {
  inputEl.value = getSampleLog();
  formatLogs();
}
