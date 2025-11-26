// ======================
// Worker API Endpoint
// ======================
const WORKER_URL = "https://floral-voice-bfc0.nicheworks-tools.workers.dev";

// ======================
// 言語切替
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  let current = navigator.language.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    current = lang;
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
  applyLang(current);
});

// ======================
// メイン処理
// ======================
const fetchBtn = document.getElementById("fetchBtn");
const urlInput = document.getElementById("urlInput");
const resultsDiv = document.getElementById("results");
const copyArea = document.getElementById("copyArea");

fetchBtn.addEventListener("click", async () => {
  const urls = urlInput.value
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  if (urls.length === 0) {
    alert("No URLs provided.");
    return;
  }

  resultsDiv.innerHTML = "<p>Loading…</p>";

  const tasks = urls.map(async (url) => {
    try {
      const res = await fetch(`${WORKER_URL}?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return { url, title: data.title || "", status: data.status };
    } catch {
      return { url, title: "", status: "error" };
    }
  });

  const results = await Promise.all(tasks);
  renderResults(results);
});

// ======================
// 結果表示
// ======================
function renderResults(rows) {
  let html = `
    <table>
      <thead>
        <tr><th>URL</th><th>Title</th><th>Status</th></tr>
      </thead>
      <tbody>
  `;

  for (const r of rows) {
    html += `
      <tr>
        <td>${escape(r.url)}</td>
        <td>${escape(r.title)}</td>
        <td class="${r.status === "success" ? "status-ok" : "status-fail"}">${r.status}</td>
      </tr>
    `;
  }

  html += "</tbody></table>";
  resultsDiv.innerHTML = html;
  copyArea.style.display = "block";

  window._rows = rows;
}

// ======================
// CSV / TSV コピー
// ======================
document.getElementById("copyCsvBtn").addEventListener("click", () => copyData(","));
document.getElementById("copyTsvBtn").addEventListener("click", () => copyData("\t"));

function copyData(separator) {
  const rows = window._rows || [];
  const text = rows
    .map(r => [r.url, r.title, r.status].map(v => `"${v.replace(/"/g, '""')}"`).join(separator))
    .join("\n");

  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
}

// ======================
// エスケープ
// ======================
function escape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
