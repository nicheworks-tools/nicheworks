// 言語切替
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

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


// --- タイトル取得ロジック（iframe sandbox + srcdoc） ---
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

  const rows = [];
  for (const url of urls) {
    try {
      const title = await fetchTitleViaIframe(url);
      rows.push({ url, title, status: "success" });
    } catch (err) {
      rows.push({ url, title: "", status: "fail" });
    }
  }

  renderResults(rows);
});


// iframe技術でCORS回避しつつ<title>取得
function fetchTitleViaIframe(url) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");

    iframe.sandbox = "allow-same-origin allow-scripts allow-forms";
    iframe.style.display = "none";

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const title = doc.querySelector("title");
        const text = title ? title.innerText : "";
        document.body.removeChild(iframe);
        if (text) resolve(text);
        else reject();
      } catch {
        document.body.removeChild(iframe);
        reject();
      }
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject();
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}


// 結果表示
function renderResults(rows) {
  let html = `
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Title</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(r => {
    html += `
      <tr>
        <td>${escapeHtml(r.url)}</td>
        <td>${escapeHtml(r.title)}</td>
        <td class="${r.status === "success" ? "status-ok" : "status-fail"}">
          ${r.status}
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  resultsDiv.innerHTML = html;
  copyArea.style.display = "block";

  // 保存用
  window.__utc_rows = rows;
}


// CSV / TSV コピー
document.getElementById("copyCsvBtn").addEventListener("click", () => copyData(","));
document.getElementById("copyTsvBtn").addEventListener("click", () => copyData("\t"));

function copyData(separator) {
  const rows = window.__utc_rows || [];
  const text = rows
    .map(r => [r.url, r.title, r.status].map(v => `"${v.replace(/"/g, '""')}"`).join(separator))
    .join("\n");

  navigator.clipboard.writeText(text).then(() => {
    alert("Copied!");
  });
}


// HTMLエスケープ
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
