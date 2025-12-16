const grid = document.getElementById("symbolGrid");
const result = document.getElementById("result");
const summary = document.getElementById("resultSummary");
const detail = document.getElementById("resultDetail");

let currentLang = (navigator.language || "").startsWith("ja") ? "ja" : "en";

function applyLang(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.style.display = el.dataset.i18n === currentLang ? "" : "none";
  });

  document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === currentLang);
  });

  // 結果が表示中なら、言語切替時に内容も更新（最後に選んだものがあれば）
  if (result && !result.classList.contains("hidden") && window.__lastSymbol) {
    summary.textContent = window.__lastSymbol[currentLang].summary;
    detail.textContent = window.__lastSymbol[currentLang].detail;
  }
}

function showResult(sym) {
  window.__lastSymbol = sym;
  summary.textContent = sym[currentLang].summary;
  detail.textContent = sym[currentLang].detail;
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth" });
}

function renderSymbols() {
  // data.js が読めてない・SYMBOLSが無い場合に即わかるようにする
  if (!Array.isArray(window.SYMBOLS) || window.SYMBOLS.length === 0) {
    grid.innerHTML = `
      <div class="nw-error">
        <p><b>データ読み込み失敗</b>：SYMBOLS が見つかりません。</p>
        <p>data.js が同じフォルダにあり、index.html の <code>&lt;script src="data.js"&gt;</code> が app.js より上にあるか確認してください。</p>
      </div>
    `;
    return;
  }

  window.SYMBOLS.forEach((sym) => {
    const btn = document.createElement("button");
    btn.className = "symbol-btn";
    btn.type = "button";
    btn.textContent = sym.icon;
    btn.title = sym[currentLang]?.summary || sym.en?.summary || sym.ja?.summary || "";
    btn.addEventListener("click", () => showResult(sym));
    grid.appendChild(btn);
  });
}

document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});

document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);
  renderSymbols();
});
