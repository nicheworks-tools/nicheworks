// ===============================
// URL Title Collector - app.js
// ===============================

const fetchBtn = document.getElementById("fetchBtn");
const urlInput = document.getElementById("urlInput");
const resultsDiv = document.getElementById("results");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");

const countArea = document.getElementById("countArea");
const countTotal = document.getElementById("countTotal");
const countSuccess = document.getElementById("countSuccess");
const countFail = document.getElementById("countFail");

const exportArea = document.getElementById("exportArea");
const resetBtn = document.getElementById("resetBtn");
const copyCsvBtn = document.getElementById("copyCsvBtn");
const copyTsvBtn = document.getElementById("copyTsvBtn");

// Worker（CORS回避）URL
const WORKER_URL = "https://floral-voice-bfc0.nicheworks-tools.workers.dev/?url=";


// ===============================
// メイン処理
// ===============================
fetchBtn.addEventListener("click", async () => {
  const urls = urlInput.value
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  if (urls.length === 0) {
    alert("URLを入力してください。");
    return;
  }

  // 初期化
  resultsDiv.innerHTML = "";
  progressWrap.classList.remove("hidden");
  countArea.classList.remove("hidden");
  exportArea.classList.add("hidden");

  progressBar.style.width = "0%";

  countTotal.textContent = `合計: ${urls.length}`;
  let successCount = 0;
  let failCount = 0;

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const res = await fetchTitle(url);
    results.push(res);

    if (res.status === "success") successCount++;
    else failCount++;

    // update counts
    countSuccess.textContent = `成功: ${successCount}`;
    countFail.textContent = `失敗: ${failCount}`;

    // update progress
    const percent = Math.round(((i + 1) / urls.length) * 100);
    progressBar.style.width = percent + "%";
  }

  // 結果テーブル表示
  renderResults(results);

  // エクスポートエリア表示
  exportArea.classList.remove("hidden");
});


// ===============================
// タイトル取得ロジック
// status: success / no-title / http-error / network-error
// ===============================
async function fetchTitle(url) {
  try {
    const encoded = WORKER_URL + encodeURIComponent(url);
    const response = await fetch(encoded);

    // fetch OK 判定（HTTP 2xx）
    let httpOk = response.ok;

    const text = await response.text();

    // HTTP エラー系
    if (!httpOk) {
      // 404, 500 など
      const title = extractTitle(text);
      return {
        url,
        title: title || "",
        status: "http-error"
      };
    }

    // 2xx の場合、タイトル抽出
    const title = extractTitle(text);

    if (!title) {
      return {
        url,
        title: "",
        status: "no-title"
      };
    }

    return {
      url,
      title,
      status: "success"
    };

  } catch (e) {
    // ネットワークエラー（CORS / DNS / 接続不可）
    return {
      url,
      title: "",
      status: "network-error"
    };
  }
}


// ===============================
// HTMLから<title>抽出
// ===============================
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  return match[1].trim();
}


// ===============================
// 結果レンダリング
// ===============================
function renderResults(results) {
  let html = `
    <table>
      <tr>
        <th>URL</th>
        <th>Title</th>
        <th>Status</th>
      </tr>
  `;

  results.forEach(r => {
    const cls = statusClass(r.status);

    html += `
      <tr>
        <td>${escapeHtml(r.url)}</td>
        <td>${escapeHtml(r.title)}</td>
        <td class="${cls}">${r.status}</td>
      </tr>
    `;
  });

  html += `</table>`;
  resultsDiv.innerHTML = html;
}


// ステータス → CSSクラス
function statusClass(status) {
  switch (status) {
    case "success": return "status-success";
    case "no-title": return "status-no-title";
    case "http-error": return "status-http-error";
    case "network-error": return "status-network-error";
    default: return "";
  }
}


// HTMLエスケープ
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}


// ===============================
// CSV・TSVコピー
// ===============================
copyCsvBtn.addEventListener("click", () => {
  copyTable("csv");
});
copyTsvBtn.addEventListener("click", () => {
  copyTable("tsv");
});

function copyTable(type) {
  const rows = [...resultsDiv.querySelectorAll("table tr")];
  const sep = type === "csv" ? "," : "\t";

  const lines = rows.map(tr => {
    const cells = [...tr.querySelectorAll("td, th")];
    return cells.map(td => `"${td.innerText.replace(/"/g, '""')}"`).join(sep);
  });

  const text = lines.join("\n");
  navigator.clipboard.writeText(text);

  alert(type.toUpperCase() + " をコピーしました。");
}


// ===============================
// リセットボタン
// ===============================
resetBtn.addEventListener("click", () => {
  urlInput.value = "";
  resultsDiv.innerHTML = "";
  progressWrap.classList.add("hidden");
  countArea.classList.add("hidden");
  exportArea.classList.add("hidden");
  progressBar.style.width = "0%";
  countTotal.textContent = "合計: 0";
  countSuccess.textContent = "成功: 0";
  countFail.textContent = "失敗: 0";
});
