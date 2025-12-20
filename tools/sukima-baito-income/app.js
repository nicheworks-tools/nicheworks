//------------------------------------------------------
// 初期設定：テーマ & フォントサイズ（localStorage反映）
//------------------------------------------------------

function applySettings() {
  const theme = localStorage.getItem("nw-theme") || "light";
  const font = localStorage.getItem("nw-font") || "medium";

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-font", font);
}
applySettings();

//------------------------------------------------------
// テーマ切替
//------------------------------------------------------

document.getElementById("themeBtn").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("nw-theme", next);

  document.getElementById("themeBtn").textContent = (next === "light") ? "☀️" : "🌙";
});

// 初期ボタン表示
document.getElementById("themeBtn").textContent =
  (localStorage.getItem("nw-theme") || "light") === "light" ? "☀️" : "🌙";

//------------------------------------------------------
// フォントサイズ切替（small / medium / large / xl）
//------------------------------------------------------

const fontSteps = ["small", "medium", "large", "xl"];

document.getElementById("fontBtn").addEventListener("click", () => {
  const current = localStorage.getItem("nw-font") || "medium";
  const idx = fontSteps.indexOf(current);
  const next = fontSteps[(idx + 1) % fontSteps.length];

  document.documentElement.setAttribute("data-font", next);
  localStorage.setItem("nw-font", next);

  document.getElementById("fontBtn").textContent = "AA";
});

//------------------------------------------------------
// データ管理（就業データと就業先候補）
//------------------------------------------------------

let entries = []; // 入力データ（ページ閉じると消える）

let workplaceDict = JSON.parse(localStorage.getItem("nw-workplaces") || "[]");

//------------------------------------------------------
// 就業先サジェスト更新
//------------------------------------------------------

function updateWorkplaceList() {
  const list = document.getElementById("workplaceList");
  list.innerHTML = "";

  workplaceDict.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w;
    list.appendChild(opt);
  });
}
updateWorkplaceList();

//------------------------------------------------------
// 1件追加
//------------------------------------------------------

document.getElementById("addBtn").addEventListener("click", () => {
  const date = document.getElementById("dateInput").value;
  const workplace = document.getElementById("workplaceInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const amountRaw = document.getElementById("amountInput").value;
  const memo = document.getElementById("memoInput").value.trim();

  if (!date || !workplace || !amountRaw) {
    showError("日付・就業先・金額は必須です。");
    return;
  }

  const amount = cleanAmount(amountRaw);

  entries.push({ date, workplace, category, amount, memo });

  // 就業先辞書に追加
  if (!workplaceDict.includes(workplace)) {
    workplaceDict.push(workplace);
    localStorage.setItem("nw-workplaces", JSON.stringify(workplaceDict));
    updateWorkplaceList();
  }

  renderEntries();
  renderSummary();
  clearForm();
});

//------------------------------------------------------
// 金額補完：数字以外を排除して整数化
//------------------------------------------------------

function cleanAmount(val) {
  return Number(String(val).replace(/[^\d]/g, ""));
}

//------------------------------------------------------
// エラー表示
//------------------------------------------------------

function showError(msg) {
  const box = document.getElementById("errorBox");
  box.style.display = "block";
  box.textContent = msg;
  setTimeout(() => { box.style.display = "none"; }, 5000);
}

//------------------------------------------------------
// フォーム初期化
//------------------------------------------------------

function clearForm() {
  document.getElementById("dateInput").value = "";
  document.getElementById("workplaceInput").value = "";
  document.getElementById("amountInput").value = "";
  document.getElementById("memoInput").value = "";
}

//------------------------------------------------------
// 入力一覧レンダリング
//------------------------------------------------------

function renderEntries() {
  const container = document.getElementById("entriesList");
  container.innerHTML = "";

  entries.forEach((e, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    card.innerHTML = `
      <div class="entry-top">${e.date}　${e.workplace}</div>
      <div class="entry-details">[${e.category}]　¥${e.amount.toLocaleString()}</div>
      ${e.memo ? `<div class="entry-details">メモ：${e.memo}</div>` : ""}
      <button class="delete-btn" data-idx="${idx}">削除</button>
    `;

    container.appendChild(card);
  });

  // 削除イベント
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = Number(e.target.getAttribute("data-idx"));
      entries.splice(idx, 1);
      renderEntries();
      renderSummary();
    });
  });
}

//------------------------------------------------------
// 集計（年間・月別）
//------------------------------------------------------

function renderSummary() {
  if (entries.length === 0) {
    document.getElementById("totalSummary").innerHTML = "";
    document.getElementById("monthlySummary").innerHTML = "";
    return;
  }

  let total = 0;
  const monthly = {};

  entries.forEach(e => {
    total += e.amount;

    const ym = e.date.slice(0, 7); // YYYY-MM
    if (!monthly[ym]) {
      monthly[ym] = {
        報酬: 0,
        交通費: 0,
        手当: 0,
        その他: 0,
        合計: 0
      };
    }
    monthly[ym][e.category] += e.amount;
    monthly[ym].合計 += e.amount;
  });

  // 年間集計
  document.getElementById("totalSummary").innerHTML =
    `<strong>年間合計：¥${total.toLocaleString()}</strong>`;

  // 月別集計
  const monthlyBox = document.getElementById("monthlySummary");
  monthlyBox.innerHTML = "";

  const sortedMonths = Object.keys(monthly).sort().reverse();

  sortedMonths.forEach(m => {
    const block = document.createElement("div");
    block.className = "month-block";

    block.innerHTML = `
      <div class="month-title">${m}</div>
      <div>報酬：¥${monthly[m]["報酬"].toLocaleString()}</div>
      <div>交通費：¥${monthly[m]["交通費"].toLocaleString()}</div>
      <div>手当：¥${monthly[m]["手当"].toLocaleString()}</div>
      <div>その他：¥${monthly[m]["その他"].toLocaleString()}</div>
      <div><strong>合計：¥${monthly[m]["合計"].toLocaleString()}</strong></div>
    `;

    monthlyBox.appendChild(block);
  });
}

//------------------------------------------------------
// CSV エクスポート
//------------------------------------------------------

document.getElementById("csvExportBtn").addEventListener("click", () => {
  if (entries.length === 0) {
    showError("出力できるデータがありません。");
    return;
  }

  let csv = "date,workplace,category,amount,memo\n";

  entries.forEach(e => {
    csv += `${e.date},${e.workplace},${e.category},${e.amount},${e.memo || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sukima-income-data.csv";
  a.click();

  URL.revokeObjectURL(url);
});

//------------------------------------------------------
// CSV インポート
//------------------------------------------------------

document.getElementById("csvInput").addEventListener("change", (ev) => {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split(/\r?\n/);

    let errors = [];
    lines.slice(1).forEach((line, idx) => {
      if (!line.trim()) return;

      const cols = line.split(",");
      if (cols.length < 5) {
        errors.push(`${idx + 2}行目：列数不正`);
        return;
      }

      let [date, workplace, category, amountRaw, memo] = cols;

      // 日付チェック
      if (!/^\d{4}[-\/\.]\d{2}[-\/\.]\d{2}$/.test(date)) {
        errors.push(`${idx + 2}行目：日付形式不正`);
        return;
      }
      date = date.replace(/\./g, "-").replace(/\//g, "-");

      // カテゴリチェック
      const validCats = ["報酬", "交通費", "手当", "その他"];
      if (!validCats.includes(category)) {
        errors.push(`${idx + 2}行目：カテゴリ不正`);
        return;
      }

      // 金額
      const amount = cleanAmount(amountRaw);
      if (isNaN(amount)) {
        errors.push(`${idx + 2}行目：金額不正`);
        return;
      }

      // データ追加
      entries.push({ date, workplace, category, amount, memo });
    });

    if (errors.length > 0) {
      showError(errors.join("\n"));
    }

    renderEntries();
    renderSummary();
  };

  reader.readAsText(file, "utf-8");
});
